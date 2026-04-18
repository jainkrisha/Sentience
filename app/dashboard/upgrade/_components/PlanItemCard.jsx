"use client"
import React, { useState, useEffect } from 'react'

function PlanItemCard({plan}) {
  const [userEmail, setUserEmail] = React.useState('');

  useEffect(() => {
    // Get user email from cookies
    const getCookie = (name) => {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop().split(';').shift();
    };
    const email = getCookie('user_email');
    if (email) setUserEmail(decodeURIComponent(email));
  }, []);
  return (
    <div className="rounded-2xl border border-gray-200 p-6 shadow-sm sm:px-8 lg:p-12">
    <div className="text-center">

      <h2 className="text-lg font-medium text-gray-900">
        {plan.name}
        <span className="sr-only">Plan</span>
      </h2>

      <p className="mt-2 sm:mt-4">
        <strong className="text-3xl font-bold text-gray-900 sm:text-4xl"> {plan.cost}$ </strong>

        <span className="text-sm font-medium text-gray-700">/month</span>
      </p>
    </div>

    <ul className="mt-6 space-y-2">
        {plan.offering.map((item,index)=>(
             <li className="flex items-center gap-1 mb-2">
                <h2 className="text-gray-700">{item.value}</h2>
             </li>
        ))}
     

  
    </ul>

    <a
      href={plan.paymentLink+'?prefilled_email='+userEmail}
      target='_blank'
      className="mt-8 block rounded-full border border-indigo-600 bg-white px-12 py-3 text-center text-sm font-medium text-indigo-600 hover:ring-1 hover:ring-indigo-600 focus:outline-none focus:ring active:text-indigo-500"
    >
      Get Started
    </a>
  </div>
  )
}

export default PlanItemCard