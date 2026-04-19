import { Button } from '@/components/ui/button'
import React from 'react'
import { useRouter } from 'next/navigation'
import { Briefcase, Calendar, ChevronRight, BarChart2 } from 'lucide-react'

function InterviewcardList({interview}) {
    const router = useRouter();

  return (
    <div className='group relative bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-xl hover:shadow-blue-100/60 hover:-translate-y-1 transition-all duration-300 overflow-hidden'>
        {/* Subtle top accent bar */}
        <div className='absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-t-2xl'></div>

        {/* Role icon + title */}
        <div className='flex items-start gap-3 mb-4'>
            <div className='w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 shrink-0 group-hover:bg-blue-100 transition-colors'>
                <Briefcase className='w-5 h-5' />
            </div>
            <div>
                <h2 className='font-extrabold text-gray-900 text-base leading-tight capitalize'>{interview?.jobPosition}</h2>
                <span className='inline-flex items-center gap-1 mt-1 text-xs font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full'>
                    <BarChart2 className='w-3 h-3' />
                    {interview?.jobExperience} yrs exp
                </span>
            </div>
        </div>

        {/* Date */}
        <div className='flex items-center gap-1.5 text-xs text-gray-400 font-medium mb-5'>
            <Calendar className='w-3.5 h-3.5' />
            {interview?.createdAt?.slice(0,10)}
        </div>

        {/* Actions */}
        <div className='flex gap-3'>
            <Button
                size="sm"
                variant="outline"
                className="flex-1 border-2 border-gray-100 text-gray-600 hover:border-blue-200 hover:text-blue-700 hover:bg-blue-50 font-bold rounded-xl transition-all py-5"
                onClick={() => router.push(`/dashboard/interview/${interview?.mockId}/feedback`)}
            >
                <BarChart2 className='w-4 h-4 mr-1.5' /> Feedback
            </Button>
            <Button
                size="sm"
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md shadow-blue-200 transition-all py-5 hover:-translate-y-0.5 flex items-center justify-center gap-1"
                onClick={() => router.push(`/dashboard/interview/${interview?.mockId}/start`)}
            >
                Start <ChevronRight className='w-4 h-4' />
            </Button>
        </div>
    </div>
  )
}

export default InterviewcardList