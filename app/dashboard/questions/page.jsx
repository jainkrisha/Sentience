"use client";
import React from 'react';

const Questions = () => {

    const faqsList = [
        {
            q: "What is the AI Interview Taker?",
            a: "The AI Interview Taker is an advanced platform that uses artificial intelligence to simulate real-life job interviews. It provides instant feedback on your responses, helping you prepare for actual interviews by improving your communication and critical thinking skills."
        },
        {
            q: "How does the AI evaluate my answers?",
            a: "The AI evaluates your responses based on various factors like relevance, clarity, communication style, and domain knowledge. It uses natural language processing (NLP) algorithms to assess your answers and provide constructive feedback."
        },
        {
            q: "Can the AI Interview Taker simulate interviews for different job roles?",
            a: "Yes! The platform offers tailored interview simulations for a variety of industries and job roles, ranging from technical positions to managerial and creative roles. Simply choose your target role, and the AI will ask relevant questions."
        },
        {
            q: "Is my personal data and interview performance secure?",
            a: "Absolutely. We prioritize your privacy and ensure that all personal data and interview recordings are encrypted and stored securely. Your information will never be shared with third parties without your consent."
        },
        {
            q: "How can I improve my interview performance using this platform?",
            a: "After each simulated interview, the AI will provide detailed feedback on your performance. This includes areas for improvement, such as communication style, technical knowledge, and body language (if applicable). You can track your progress over time and practice accordingly."
        },
        {
            q: "Can I access the platform on mobile devices?",
            a: "Yes, the AI Interview Taker is fully responsive and works on both desktop and mobile devices. You can practice your interview skills anywhere, anytime, with just an internet connection."
        },
    ]

    return (
        <div className="leading-relaxed py-12 px-4 md:px-8 max-w-4xl mx-auto min-h-screen">
            <div className="text-center space-y-4 mb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <h1 className="block text-gray-900 text-4xl font-extrabold tracking-tight">
                    Frequently Asked Questions
                </h1>
                <p className="text-gray-500 max-w-2xl mx-auto text-lg font-medium">
                    Everything you need to know about the product and billing. Can’t find the answer you’re looking for? Feel free to contact us.
                </p>
            </div>

            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-6 duration-700">
                {faqsList.map((item, idx) => (
                    <details 
                        key={idx} 
                        className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-blue-100 transition-all [&_summary::-webkit-details-marker]:hidden"
                    >
                        <summary className="flex items-center justify-between p-6 cursor-pointer text-gray-900 font-bold text-lg select-none">
                            {item.q}
                            <span className="relative flex-shrink-0 ml-4 w-6 h-6 flex items-center justify-center text-blue-600 bg-blue-50 rounded-full group-open:bg-blue-600 group-open:text-white transition-colors">
                                <svg className="absolute w-4 h-4 transition-transform group-open:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                                </svg>
                            </span>
                        </summary>
                        <div className="px-6 pb-6 text-gray-500 font-medium leading-relaxed border-t border-gray-50 pt-4 group-open:animate-in group-open:fade-in group-open:slide-in-from-top-2">
                            {item.a}
                        </div>
                    </details>
                ))}
            </div>
        </div>
    )
}

export default Questions;
