"use client";
import { db } from '@/utils/db';
import { interview_answers, session_metrics } from '@/utils/schema';
import { eq } from 'drizzle-orm';
import React, { useEffect, useState } from 'react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDown, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import html2pdf from 'html2pdf.js';

function Feedback({ params }) {
  const [feedbackData, setFeedbackData] = useState([]);
  const [sessionMetrics, setSessionMetrics] = useState(null);
  const [averageRating, setAverageRating] = useState(0);
  const [roadmapUpdated, setRoadmapUpdated] = useState(false);
  const router = useRouter();

  useEffect(() => {
    GetInterviewData();
  }, []);

  useEffect(() => {
    if (feedbackData.length > 0 && !roadmapUpdated) {
      updateRoadmap(feedbackData);
    }
  }, [feedbackData, roadmapUpdated]);

  const updateRoadmap = async (data) => {
    try {
      const res = await fetch('/api/roadmap/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ feedbackData: data, sessionId: params.interviewid })
      });
      const result = await res.json();
      if (result.success && result.items && result.items.length > 0) {
        toast.success(`Roadmap updated with ${result.items.length} new improvement areas!`);
      }
      setRoadmapUpdated(true);
    } catch (e) {
      console.error(e);
    }
  };

  const GetInterviewData = async () => {
    const result = await db.select()
      .from(interview_answers)
      .where(eq(interview_answers.sessionId, params.interviewid))
      .orderBy(interview_answers.id);

    console.log(result);
    setFeedbackData(result);
    calculateAverageRating(result);

    const metricsResult = await db.select()
      .from(session_metrics)
      .where(eq(session_metrics.sessionId, params.interviewid));
    
    if (metricsResult.length > 0) {
      setSessionMetrics(metricsResult[0]);
    }
  };

  const handleDownloadPdf = () => {
    const element = document.getElementById('pdf-content');
    const opt = {
      margin:       0.5,
      filename:     'AI_Interview_Report.pdf',
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2 },
      jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
    };

    html2pdf().set(opt).from(element).save();
    toast.success('Downloading PDF Report...');
  };

  const calculateAverageRating = (data) => {
    if (data.length > 0) {
      const totalRating = data.reduce((sum, item) => {
        const rating = parseFloat(item.rating) || 0;
        return sum + rating;
      }, 0);
  
      const average = totalRating / data.length;
      setAverageRating(average.toFixed(1)); 
    }
  };

  return (
    <div className='p-10'>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className='text-3xl font-bold text-green-500'>Congratulations!</h2>
          <h2 className='font-bold text-2xl mt-1'>Here is your Interview Feedback!</h2>
        </div>
        <Button onClick={handleDownloadPdf} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white">
          <Download className="w-4 h-4" /> Download PDF Report
        </Button>
      </div>

      <div id="pdf-content" className="bg-white p-4 rounded-lg">
        {feedbackData.length === 0 ? (
          <h2 className='text-red-500'>No feedback Found</h2>
        ) : (
          <>
            <h2 className='text-primary text-lg my-3'>
              Your Overall interview rating: <strong>{averageRating}/10</strong>
            </h2>

          <h2 className='text-sm text-gray-500'>
            Find below interview questions with the correct answer, your answer, and feedback for improvement
          </h2>

          {sessionMetrics && (
            <div className="my-6 p-6 border rounded-xl bg-slate-900 text-white shadow-lg">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                Body Language Analytics
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-slate-800 rounded-lg text-center">
                  <p className="text-sm text-slate-400">Eye Contact Score</p>
                  <p className={`text-2xl font-bold ${sessionMetrics.eyeContactScore > 70 ? 'text-green-400' : 'text-amber-400'}`}>
                    {sessionMetrics.eyeContactScore}%
                  </p>
                </div>
                <div className="p-4 bg-slate-800 rounded-lg text-center">
                  <p className="text-sm text-slate-400">Hand Gestures Used</p>
                  <p className="text-2xl font-bold text-blue-400">
                    {sessionMetrics.handGestureCount}
                  </p>
                </div>
                <div className="p-4 bg-slate-800 rounded-lg text-center">
                  <p className="text-sm text-slate-400">Bad Posture Alerts</p>
                  <p className={`text-2xl font-bold ${sessionMetrics.badPostureCount === 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {sessionMetrics.badPostureCount}
                  </p>
                </div>
              </div>
            </div>
          )}

          {feedbackData && feedbackData.map((data, index) => (
            <div key={index}>
              <Collapsible className='mt-6'>
                <CollapsibleTrigger className='p-2 bg-secondary rounded-lg my-2 text-left gap-7 w-full flex justify-between'>
                  {data.question} <ChevronDown />
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className='flex flex-col gap-2'>
                    <h2 className='text-red-500 p-2 border rounded-lg'>
                      <strong>Rating:</strong> {data.rating}
                    </h2>
                    <h2 className='p-2 border bg-red-50 text-sm rounded-lg text-red-900'>
                      <strong>Your Answer: </strong> {data.userAnswer}
                    </h2>
                    <h2 className='p-2 border bg-green-50 text-sm rounded-lg text-green-900 text-justify'>
                      <strong>Correct Answer: </strong> {data.correctAnswer}
                    </h2>
                    <h2 className='p-2 border bg-blue-50 text-sm rounded-lg text-primary text-justify'>
                      <strong>Feedback: </strong> {data.feedback}
                    </h2>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </div>
          ))}
        </>
      )}
      </div>

      <Button className="mt-6" onClick={() => router.replace('/dashboard')}>Go Home</Button>
    </div>
  );
}

export default Feedback;
