"use client";
import { interview_sessions } from '@/utils/schema';
import { eq } from 'drizzle-orm';
import React, { useEffect } from 'react';
import {db} from 'utils/db';
import QuestionsList from './_components/QuestionsList';
import LiveInterviewEngine from './_components/LiveInterviewEngine';
import { MetricsProvider } from '@/context/MetricsContext';
import { Button } from '@/components/ui/button';
import EndInterviewButton from './_components/EndInterviewButton';

function StartInterview({params}) {


    const [interviewdata, setInterviewdata] = React.useState();
    const[mockinterviewquestions,setMockinterviewquestions] = React.useState([]);

    const[activequestionindex,setActivequestionindex] = React.useState(0);
    useEffect(() => {
        console.log(params);
        dbdata();
    }, []);
     

    const dbdata = async () => {
        try {
          console.log("Interview ID:", params.interviewid);
          const result = await db
            .select()
            .from(interview_sessions)
            .where(eq(interview_sessions.mockId, params.interviewid));
          
          if (result.length === 0) {
            console.error("No interview data found for the given interview ID:", params.interviewid);
            return;
          }
          
          console.log("Interview Data:", result);
          
          const questions = JSON.parse(result[0].generatedQuestions);
          setMockinterviewquestions(questions);
          setInterviewdata(result[0]);
          
        } catch (error) {
          console.error("Error fetching interview details:", error);
        }
      };


  return (
    <MetricsProvider>
      <div className="p-6 md:p-10 max-w-7xl mx-auto min-h-screen bg-gray-50/30">
        <div className="mb-8">
            <h2 className="text-3xl font-extrabold text-gray-900">Live Mock Interview</h2>
            <p className="text-gray-500 font-medium">Please ensure your camera and microphone are working correctly.</p>
        </div>

        <div className='grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12'>
            <QuestionsList mockinterviewquestions={mockinterviewquestions} activequestionindex={activequestionindex}/>

            <LiveInterviewEngine 
              mockinterviewquestions={mockinterviewquestions} 
              activequestionindex={activequestionindex} 
              interviewdata={interviewdata}
              onNextQuestion={() => {
                if (activequestionindex < mockinterviewquestions?.length - 1) {
                  setActivequestionindex(activequestionindex + 1);
                }
              }}
            />
        </div>
        
        <div className='flex justify-end gap-4 mt-12 pt-6 border-t border-gray-200'>
          {activequestionindex > 0 &&
          <Button 
            variant="outline" 
            className="px-6 py-6 border-2 border-gray-200 text-gray-700 hover:bg-gray-100 font-bold rounded-xl transition-all"
            onClick={() => setActivequestionindex(activequestionindex - 1)} 
          >
            Previous Question
          </Button>}
          
          {activequestionindex != mockinterviewquestions?.length - 1 && 
          <Button 
            className="px-8 py-6 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-200 transition-all hover:-translate-y-0.5"
            onClick={() => setActivequestionindex(activequestionindex + 1)}
          >
            Next Question
          </Button>}
          
          {activequestionindex === mockinterviewquestions?.length - 1 && 
            <EndInterviewButton mockId={params.interviewid} />
          }
        </div>
      </div>
    </MetricsProvider>
  )
}

export default StartInterview