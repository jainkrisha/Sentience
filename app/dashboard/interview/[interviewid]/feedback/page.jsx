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
    <div className='p-6 md:p-10 max-w-5xl mx-auto min-h-screen'>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4 animate-in fade-in slide-in-from-top-4 duration-500">
        <div>
          <div className="inline-block px-3 py-1 mb-2 text-xs font-bold uppercase tracking-wider text-green-700 bg-green-100 rounded-full">
            Interview Completed
          </div>
          <h2 className='font-extrabold text-3xl text-gray-900 tracking-tight'>Your Interview Feedback</h2>
          <p className="text-gray-500 font-medium mt-1">Review your performance and identify areas for improvement.</p>
        </div>
        <Button onClick={handleDownloadPdf} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-6 rounded-xl shadow-md shadow-blue-200 transition-all hover:-translate-y-0.5">
          <Download className="w-5 h-5" /> Download PDF Report
        </Button>
      </div>

      <div id="pdf-content" className="bg-white rounded-2xl animate-in fade-in slide-in-from-bottom-8 duration-700">
        {feedbackData.length === 0 ? (
          <div className="p-10 border border-gray-100 rounded-2xl bg-gray-50 text-center">
            <h2 className='text-red-500 font-bold text-xl'>No feedback Found</h2>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
              <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6 flex flex-col justify-center items-center text-center shadow-sm">
                <p className="text-sm font-bold text-blue-600 uppercase tracking-wider mb-2">Overall Rating</p>
                <div className="text-6xl font-black text-blue-700">
                  {averageRating}<span className="text-2xl text-blue-400 font-bold">/10</span>
                </div>
              </div>
              
              {sessionMetrics ? (
                <div className="border border-gray-100 rounded-2xl p-6 bg-white shadow-sm flex flex-col justify-center">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    Body Language Analytics
                  </h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Eye Contact</p>
                      <p className={`text-xl font-black ${sessionMetrics.eyeContactScore > 70 ? 'text-green-600' : 'text-amber-500'}`}>
                        {sessionMetrics.eyeContactScore}%
                      </p>
                    </div>
                    <div className="text-center border-l border-r border-gray-100">
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Gestures</p>
                      <p className="text-xl font-black text-blue-600">
                        {sessionMetrics.handGestureCount}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Bad Posture</p>
                      <p className={`text-xl font-black ${sessionMetrics.badPostureCount === 0 ? 'text-green-600' : 'text-red-500'}`}>
                        {sessionMetrics.badPostureCount}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="border border-gray-100 rounded-2xl p-6 bg-gray-50 flex items-center justify-center text-gray-400 font-medium">
                  Body language metrics not recorded.
                </div>
              )}
            </div>

            <div className="mb-6">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Detailed Response Analysis</h3>
              <p className='text-sm font-medium text-gray-500'>
                Expand each question to see the correct answer, your answer, and specific feedback.
              </p>
            </div>

          {feedbackData && feedbackData.map((data, index) => (
            <div key={index} className="mb-4">
              <Collapsible className='bg-white border border-gray-100 rounded-xl shadow-sm hover:border-blue-100 transition-colors'>
                <CollapsibleTrigger className='p-5 font-bold text-gray-900 text-left w-full flex justify-between items-center gap-4 hover:bg-gray-50 rounded-xl transition-colors'>
                  <span className="flex-1">{data.question}</span> 
                  <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                    <ChevronDown className="w-5 h-5" />
                  </div>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className='flex flex-col gap-4 p-5 pt-0 border-t border-gray-50 mt-4'>
                    <div className='inline-flex items-center bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 w-fit'>
                      <strong className="text-gray-700 mr-2">Rating:</strong> 
                      <span className={`font-black ${data.rating >= 7 ? 'text-green-600' : data.rating >= 5 ? 'text-amber-500' : 'text-red-600'}`}>{data.rating}/10</span>
                    </div>
                    <div className='p-4 border border-red-100 bg-red-50/50 rounded-xl'>
                      <strong className="text-red-900 block mb-1 text-sm uppercase tracking-wider">Your Answer</strong>
                      <p className="text-red-800 leading-relaxed font-medium">{data.userAnswer}</p>
                    </div>
                    <div className='p-4 border border-green-100 bg-green-50/50 rounded-xl'>
                      <strong className="text-green-900 block mb-1 text-sm uppercase tracking-wider">Ideal Answer</strong>
                      <p className="text-green-800 leading-relaxed font-medium">{data.correctAnswer}</p>
                    </div>
                    <div className='p-4 border border-blue-100 bg-blue-50/50 rounded-xl'>
                      <strong className="text-blue-900 block mb-1 text-sm uppercase tracking-wider">Actionable Feedback</strong>
                      <p className="text-blue-800 leading-relaxed font-medium">{data.feedback}</p>
                    </div>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </div>
          ))}
        </>
      )}
      </div>

      <div className="mt-10 pt-6 border-t border-gray-200 text-right">
        <Button 
          className="px-8 py-6 bg-white border-2 border-gray-200 text-gray-700 hover:bg-gray-50 font-bold rounded-xl shadow-sm transition-all" 
          onClick={() => router.replace('/dashboard')}
        >
          Return to Dashboard
        </Button>
      </div>
    </div>
  );
}

export default Feedback;
