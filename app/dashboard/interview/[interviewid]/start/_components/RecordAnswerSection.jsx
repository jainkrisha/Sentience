"use client";
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import React, { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { Mic, MicOff, Loader2, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { chatSession } from '@/utils/Geminimodel';
import { db } from '@/utils/db';
import moment from 'moment';
import { interview_answers } from '@/utils/schema';
import { useMetrics } from '@/context/MetricsContext';

// Removed react-webcam dynamic import since the external Camera handles video

function RecordAnswerSection({ mockinterviewquestions, activequestionindex, interviewdata, onNextQuestion }) {
  const [userAnswer, setUserAnswer] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [webcamError, setWebcamError] = useState('');

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const streamRef = useRef(null);

  const { metrics } = useMetrics();
  const [startMetrics, setStartMetrics] = useState(null);

  // Get user email from cookies
  useEffect(() => {
    const getCookie = (name) => {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop().split(';').shift();
    };
    const email = getCookie('user_email');
    if (email) setUserEmail(decodeURIComponent(email));
  }, []);

  // ─── Recording Controls ────────────────────────────────────────────────────

  const startRecording = async () => {
    try {
      setStartMetrics({ ...metrics });
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : 'audio/webm';

      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        // Stop all tracks so mic light turns off
        stream.getTracks().forEach((t) => t.stop());

        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        const techStack = `${interviewdata?.jobRole || ''} ${interviewdata?.jobDesc || ''}`;
        await transcribeAudio(audioBlob, mimeType, techStack);
      };

      mediaRecorder.start(); // collect all audio as a single chunk at the end
      setIsRecording(true);
      toast.info('Recording started — speak clearly');
    } catch (err) {
      console.error('Microphone error:', err);
      toast.error('Could not access microphone. Please allow microphone permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      setUserAnswer(''); // clear previous answer before new recording
      startRecording();
    }
  };

  // ─── Whisper Transcription ─────────────────────────────────────────────────

  const transcribeAudio = async (audioBlob, mimeType, techStack = '') => {
    setIsTranscribing(true);
    toast.info('Transcribing your audio...');

    try {
      const ext = mimeType.includes('webm') ? '.webm' : '.wav';
      const file = new File([audioBlob], `recording${ext}`, { type: mimeType });
      const formData = new FormData();
      formData.append('audio', file);
      
      if (techStack) {
        formData.append('tech_stack', techStack);
      }

      const res = await fetch('/api/transcribe', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Transcription failed');
      }

      const data = await res.json();
      const transcript = data.transcript?.trim();

      if (transcript) {
        setUserAnswer((prev) => (prev ? prev + ' ' + transcript : transcript));
        toast.success('Transcription complete!');
      } else {
        toast.warning('No speech detected. Please try again or type your answer below.');
      }
    } catch (err) {
      console.error('Transcription error:', err);
      toast.error(`Transcription failed: ${err.message}`);
    } finally {
      setIsTranscribing(false);
    }
  };

  // ─── Submit Answer to DB ───────────────────────────────────────────────────

  const updateUserAnswerInDb = async () => {
    if (!interviewdata?.mockId) {
      toast.error('Interview data not available. Please try again.');
      return;
    }
    if (userAnswer.trim().length < 10) {
      toast.error('Answer is too short. Please record or type a longer answer.');
      return;
    }

    setLoading(true);

    try {
      // Calculate how many times posture/eye contact failed during THIS specific answer
      const qBadPosture = metrics.badPostureDetectionCounter - (startMetrics?.badPostureDetectionCounter || 0);
      const qNotFacing = metrics.notFacingCounter - (startMetrics?.notFacingCounter || 0);

      const feedbackPrompt = `You are a professional interviewer. Evaluate the following interview answer strictly and return ONLY valid JSON, no markdown, no explanation.

Question: ${mockinterviewquestions[activequestionindex]?.question}
Candidate Answer: ${userAnswer}
Behavioral Analytics during answer: Bad Posture warnings: ${qBadPosture}, Eye contact lost warnings: ${qNotFacing}.

Evaluate the answer technically, but ALSO include 1-2 lines of feedback about their body language based on the Behavioral Analytics provided.
Return ONLY this JSON:
{"rating": <number 1-10>, "feedback": "<detailed constructive technical and behavioral feedback>"}`;

      const result = await chatSession.sendMessage(feedbackPrompt);
      let responseText = await result.response.text();

      // Sanitize
      responseText = responseText
        .trim()
        .replace(/```json/g, '')
        .replace(/```/g, '')
        .replace(/[\u0000-\u001F]+/g, ' ');

      let jsonResponse;
      try {
        jsonResponse = JSON.parse(responseText);
      } catch {
        toast.error('Error parsing AI feedback. Please try again.');
        setLoading(false);
        return;
      }

      await db.insert(interview_answers).values({
        sessionId: String(interviewdata.mockId),
        question: String(mockinterviewquestions[activequestionindex]?.question),
        correctAnswer: String(mockinterviewquestions[activequestionindex]?.answer),
        userAnswer: String(userAnswer),
        feedback: String(jsonResponse?.feedback),
        rating: Number(jsonResponse?.rating),
        userEmail: String(userEmail || 'anonymous'),
      });

      toast.success('Answer submitted! Click Next Question to continue.');
      setUserAnswer('');
      if (onNextQuestion) {
        onNextQuestion();
      }
    } catch (err) {
      console.error('Submit error:', err);
      toast.error('Failed to submit answer: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleWebcamError = (error) => {
    console.error('Webcam error:', error);
    setWebcamError('Could not access webcam. Check permissions.');
    toast.error('Webcam unavailable — audio recording still works!');
  };

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col items-center justify-center w-full">
      {/* Controls */}
      <div className="w-full max-w-lg flex flex-col items-center gap-4 mt-8">
        {/* Record Button */}
        <Button
          variant="outline"
          className={`w-full flex items-center gap-3 text-base font-semibold py-6 border-2 transition-all rounded-xl ${
            isRecording
              ? 'border-red-500 text-red-600 animate-pulse bg-red-50'
              : 'border-blue-200 text-blue-700 hover:bg-blue-50 hover:border-blue-300'
          }`}
          onClick={toggleRecording}
          disabled={isTranscribing || loading}
        >
          {isRecording ? (
            <><MicOff className="w-5 h-5" /> Stop Recording</>
          ) : isTranscribing ? (
            <><Loader2 className="w-5 h-5 animate-spin" /> Transcribing...</>
          ) : (
            <><Mic className="w-5 h-5" /> Start Recording</>
          )}
        </Button>

        {/* Live transcript / manual typing box */}
        <div className="w-full">
          <p className="text-xs text-gray-500 mb-1">
            Live Transcript — you can also edit or type your answer below:
          </p>
          <textarea
            className="w-full min-h-[120px] bg-gray-50 border border-gray-200 rounded-xl p-4 text-gray-800 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all resize-y"
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
            placeholder="Your transcribed answer will appear here. You can also type manually..."
            disabled={isRecording || isTranscribing}
          />
        </div>

        {/* Submit Button */}
        <Button
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-6 text-base font-bold flex items-center justify-center gap-2 rounded-xl shadow-lg shadow-blue-200 transition-all hover:-translate-y-0.5"
          disabled={loading || isRecording || isTranscribing || userAnswer.trim().length < 10}
          onClick={updateUserAnswerInDb}
        >
          {loading ? (
            <><Loader2 className="w-5 h-5 animate-spin" /> Generating Feedback...</>
          ) : (
            <><CheckCircle className="w-5 h-5" /> Submit Answer</>
          )}
        </Button>

        <p className="text-xs text-gray-400 text-center">
          💡 Tip: If the microphone doesn&apos;t work, just type your answer in the box above.
        </p>
      </div>
    </div>
  );
}

export default RecordAnswerSection;
