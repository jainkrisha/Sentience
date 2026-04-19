"use client";
import { db } from '@/utils/db';
import { interview_sessions } from '@/utils/schema';
import { desc, eq } from 'drizzle-orm';
import React, { useEffect } from 'react'
import InterviewcardList from './InterviewcardList';


function InterviewList() {
    const [userEmail, setUserEmail] = React.useState("");
    const[interviewList, setInterviewList] = React.useState([]);

    useEffect(() => {
        // Get user email from cookies
        const getCookie = (name) => {
            const value = `; ${document.cookie}`;
            const parts = value.split(`; ${name}=`);
            if (parts.length === 2) return parts.pop().split(';').shift();
        };
        const email = getCookie('user_email');
        if (email) {
            setUserEmail(decodeURIComponent(email));
        }
    }, []);

    useEffect(() => { 
        userEmail && GetInterviewList();
     }, [userEmail]) 

    const GetInterviewList = async () => {
        const response = await db.select()
        .from(interview_sessions)
        .where(eq(interview_sessions.createdBy, userEmail))
        .orderBy(desc(interview_sessions.id));

        console.log(response);

        setInterviewList(response);
    }
  return (
    <div className="mt-10">
        <div className="flex items-center justify-between mb-6">
            <div>
                <h2 className='font-extrabold text-2xl text-gray-900 tracking-tight'>Previous Mock Interviews</h2>
                <p className="text-gray-500 text-sm font-medium mt-1">{interviewList.length} session{interviewList.length !== 1 ? 's' : ''} recorded</p>
            </div>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5'>
            {interviewList && interviewList.map((interview,index) => (
                <InterviewcardList key={index} interview={interview} />
            ))}
        </div>
    </div>
  )
}

export default InterviewList