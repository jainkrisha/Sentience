"use client";
import { db } from '@/utils/db';
import { interview_sessions, cv_uploads } from '@/utils/schema';
import { desc, eq } from 'drizzle-orm';
import React, { useEffect, useState } from 'react'
import { FileText, FileBarChart, LoaderCircle, Download, FileUp, Calendar, ChevronRight } from 'lucide-react';
import Link from 'next/link';

function UserProfile() {
    const [userEmail, setUserEmail] = useState("");
    const [mockInterviews, setMockInterviews] = useState([]);
    const [cvUploadsList, setCvUploadsList] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const getCookie = (name) => {
            const value = `; ${document.cookie}`;
            const parts = value.split(`; ${name}=`);
            if (parts.length === 2) return parts.pop().split(';').shift();
        };
        const email = getCookie('user_email');
        if (email) {
            setUserEmail(decodeURIComponent(email));
        } else {
            setLoading(false);
        }
    }, []);

    useEffect(() => { 
        if (userEmail) {
            fetchData();
        }
    }, [userEmail]);

    const fetchData = async () => {
        try {
            // Fetch mock interviews
            const mockResponse = await db.select()
                .from(interview_sessions)
                .where(eq(interview_sessions.createdBy, userEmail))
                .orderBy(desc(interview_sessions.id));
            setMockInterviews(mockResponse);

            // Fetch CV uploads
            const cvResponse = await db.select()
                .from(cv_uploads)
                .where(eq(cv_uploads.userEmail, userEmail))
                .orderBy(desc(cv_uploads.id));
            setCvUploadsList(cvResponse);
        } catch (error) {
            console.error("Failed to fetch user data", error);
        } finally {
            setLoading(false);
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[60vh]">
                <LoaderCircle className="animate-spin text-blue-600 w-10 h-10" />
            </div>
        );
    }

    return (
        <div className='p-6 md:p-10 max-w-7xl mx-auto'>
            <div className="mb-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <h2 className='font-extrabold text-3xl text-gray-900 mb-2'>User Profile</h2>
                <p className='text-gray-500 text-lg font-medium'>View your uploaded resumes and past interview reports.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Resume & ATS Card */}
                <div className="bg-white border border-gray-100 rounded-2xl p-8 shadow-sm hover:shadow-lg hover:shadow-blue-50 transition-all animate-in fade-in slide-in-from-bottom-6 duration-700">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-12 h-12 rounded-xl bg-cyan-50 flex items-center justify-center text-cyan-600">
                            <FileText className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-gray-900">Resume & ATS Reports</h3>
                            <p className="text-gray-500 text-sm font-medium">Your recently uploaded CVs</p>
                        </div>
                    </div>

                    {cvUploadsList.length > 0 ? (
                        <div className="space-y-4">
                            {cvUploadsList.map((cv, idx) => (
                                <div key={idx} className="flex items-center justify-between p-5 bg-gray-50 rounded-xl border border-gray-100 group hover:border-cyan-200 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center border border-gray-200 text-cyan-600 shrink-0">
                                            <FileText className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-900">CV Report #{cv.id}</p>
                                            <div className="flex items-center gap-2 mt-1 text-xs text-gray-500 font-medium">
                                                <Calendar className="w-3 h-3" />
                                                {new Date(cv.createdAt).toLocaleDateString()}
                                            </div>
                                        </div>
                                    </div>
                                    <Link href="/dashboard/ats-checker">
                                        <button className="px-4 py-2 text-sm font-bold text-cyan-700 bg-cyan-50 hover:bg-cyan-100 rounded-lg transition-colors flex items-center gap-2">
                                            View <ChevronRight className="w-4 h-4" />
                                        </button>
                                    </Link>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-10 bg-gray-50 rounded-xl border border-gray-100 border-dashed">
                            <FileUp className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                            <p className="text-gray-500 font-medium mb-4">No resumes uploaded yet.</p>
                            <Link href="/dashboard/ats-checker">
                                <button className="px-6 py-2.5 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-md transition-all hover:-translate-y-0.5">
                                    Upload CV
                                </button>
                            </Link>
                        </div>
                    )}
                </div>

                {/* Mock Interview Reports Card */}
                <div className="bg-white border border-gray-100 rounded-2xl p-8 shadow-sm hover:shadow-lg hover:shadow-blue-50 transition-all animate-in fade-in slide-in-from-bottom-8 duration-700">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                            <FileBarChart className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-gray-900">Mock Interview Reports</h3>
                            <p className="text-gray-500 text-sm font-medium">Your past session performance</p>
                        </div>
                    </div>

                    {mockInterviews.length > 0 ? (
                        <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                            {mockInterviews.map((interview, idx) => (
                                <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between p-5 bg-gray-50 rounded-xl border border-gray-100 group hover:border-blue-200 transition-colors gap-4">
                                    <div>
                                        <h4 className="font-bold text-gray-900 text-lg">{interview.jobPosition}</h4>
                                        <p className="text-sm font-medium text-gray-500">{interview.jobExperience} Experience</p>
                                        <div className="flex items-center gap-2 mt-2 text-xs text-gray-400 font-semibold">
                                            <Calendar className="w-3 h-3" />
                                            {interview.createdAt}
                                        </div>
                                    </div>
                                    <Link href={`/dashboard/interview/${interview.mockId}/feedback`} className="shrink-0">
                                        <button className="w-full sm:w-auto px-5 py-2.5 text-sm font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors flex items-center justify-center gap-2">
                                            View Report <ChevronRight className="w-4 h-4" />
                                        </button>
                                    </Link>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-10 bg-gray-50 rounded-xl border border-gray-100 border-dashed">
                            <FileBarChart className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                            <p className="text-gray-500 font-medium mb-4">No mock interviews completed.</p>
                            <Link href="/dashboard">
                                <button className="px-6 py-2.5 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-md transition-all hover:-translate-y-0.5">
                                    Start Interview
                                </button>
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default UserProfile;
