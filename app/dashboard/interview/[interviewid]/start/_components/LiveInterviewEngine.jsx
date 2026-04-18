"use client";

import React from 'react';
import dynamic from 'next/dynamic';
const Camera = dynamic(() => import('@/components/Camera/Camera'), { ssr: false });
const RecordAnswerSection = dynamic(() => import('./RecordAnswerSection'), { ssr: false });
const LiveInterviewEngine = ({ mockinterviewquestions, activequestionindex, interviewdata, onNextQuestion }) => {
  const [userEmail, setUserEmail] = React.useState('');

  React.useEffect(() => {
    const getCookie = (name) => {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop()?.split(';').shift();
    };
    const email = getCookie('user_email');
    if (email) setUserEmail(decodeURIComponent(email));
  }, []);

  return (
    <div className="flex flex-col gap-6 w-full rounded-2xl bg-black border border-slate-800 shadow-2xl overflow-hidden">
      {/* Top: The MediaPipe Camera */}
      <div className="w-full bg-slate-900 border-b border-slate-800">
        <Camera />
      </div>
      
      {/* Bottom: The Record Answer Section (Transcription & Audio) */}
      <div className="w-full bg-black/50 overflow-hidden pb-10">
        <RecordAnswerSection 
          mockinterviewquestions={mockinterviewquestions} 
          activequestionindex={activequestionindex} 
          interviewdata={interviewdata} 
          onNextQuestion={onNextQuestion}
        />
      </div>
    </div>
  );
};

export default LiveInterviewEngine;
