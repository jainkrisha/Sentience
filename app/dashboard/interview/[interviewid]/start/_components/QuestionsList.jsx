"use client";
import { Lightbulb, Volume2 } from 'lucide-react'
import React from 'react'

function QuestionsList({mockinterviewquestions,activequestionindex}) {
    const texttoSpeech = (text) => {
        if('speechSynthesis' in window){
            // Cancel any ongoing speech to prevent overlapping/looping
            window.speechSynthesis.cancel();
            
            const speech = new SpeechSynthesisUtterance(text);

            const voices = window.speechSynthesis.getVoices();
            const femaleVoice = voices.find(voice => voice.name.includes('Female') || voice.gender === 'female');

            // Use the selected female voice if found
            if (femaleVoice) {
                speech.voice = femaleVoice;
            }

            window.speechSynthesis.speak(speech);
        }
        else{
            alert('Your browser does not support text to speech');
        }
    }

    React.useEffect(() => {
        const questionText = mockinterviewquestions?.[activequestionindex]?.question;
        if (!questionText) return;

        // Auto-read the question after 3.5 seconds
        const timer = setTimeout(() => {
            texttoSpeech(questionText);
        }, 3500);

        // Cleanup: clear timeout if user navigates to next question before 3.5s
        return () => {
            clearTimeout(timer);
        };
    }, [activequestionindex, mockinterviewquestions]);
  return mockinterviewquestions &&(
    <div className='p-5 border rounded-lg my-10'>
        <div className='grid grid-cols-2 md:grid-cols-3  lg:grid-cols-4 gap-5'>
            {mockinterviewquestions.map((question, index) => (
                <h2 key={index} className={`p-2 rounded-full text-xs md:text-sm text-center cursor-pointer ${activequestionindex === index ? 'bg-blue-500 text-white' : 'bg-secondary text-black'}`}>
                Question #{index+1}
              </h2>
            ))}
        </div>
        <h2 className='my-5 text-md md:text-lg'>{mockinterviewquestions[activequestionindex]?.question}</h2>
        <Volume2 onClick={()=>texttoSpeech(mockinterviewquestions[activequestionindex]?.question)} className='cursor-pointer'/>
        <div className='border rounded-lg p-5 bg-blue-100 mt-20 '>
            <h2 className='flex gap-5 items-center text-blue-800'>
                <Lightbulb />
                <strong>Note:</strong>
            </h2>
            <h2 className='text-sm text-primary my-2'>{process.env.NEXT_PUBLIC_INFO2}</h2>
        </div>
    </div>
  )
}

export default QuestionsList