"use client";
import AddNewInterview from './_components/AddNewInterview';
import React from 'react'
import InterviewList from './_components/InterviewList';
import ReadinessTracker from './_components/ReadinessTracker';

function Dashboard() {
  return (
    <div className='p-10'>
      <h2 className='font-bold text-2xl mb-2'>Dashboard</h2>
      <h2 className='text-gray-500 mb-6'>Create and start your AI Mockup Interview</h2>

      <ReadinessTracker />

      <div className='grid grid-cols-1 md:grid-cols-3 my-5'>
        <AddNewInterview />
      </div>

      <InterviewList />
    </div>
  )
}

export default Dashboard