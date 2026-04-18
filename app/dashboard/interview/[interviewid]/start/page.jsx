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
      <div>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-10'>
            <QuestionsList  mockinterviewquestions ={mockinterviewquestions} activequestionindex={activequestionindex}/>

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
        <div className='flex justify-end gap-6'>
          {activequestionindex > 0 &&
          <Button onClick={()=>setActivequestionindex(activequestionindex-1)} >Previous Question</Button>}
          {activequestionindex!= mockinterviewquestions?.length-1 && 
          <Button onClick={()=>setActivequestionindex(activequestionindex+1)}>Next Question</Button>}
          {activequestionindex === mockinterviewquestions?.length-1 && 
            <EndInterviewButton mockId={params.interviewid} />
          }
        </div>
      </div>
    </MetricsProvider>
  )
}

export default StartInterview