"use client";
import React, { useEffect, useState } from 'react';
import { LoaderCircle, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function ReadinessTracker() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Actually, we could fetch roadmap items to count them
    // and maybe the latest session score for readiness.
    // For now, doing a basic fetch to the roadmap to show pending items count.
    fetchRoadmapData();
  }, []);

  const fetchRoadmapData = async () => {
    try {
      const res = await fetch('/api/roadmap');
      const roadmapData = await res.json();
      
      setData({
        activeItems: roadmapData.items ? roadmapData.items.length : 0,
        // Mocking readiness score for now
        readinessScore: 65,
      });
    } catch (error) {
      console.error("Failed to load readiness tracker data", error);
    }
    setLoading(false);
  };

  const [activeTab, setActiveTab] = useState('planner');

  if (loading) {
    return (
      <div className="h-48 border border-gray-100 rounded-2xl bg-white flex flex-col items-center justify-center shadow-sm">
        <LoaderCircle className="animate-spin text-blue-600 w-8 h-8 mb-4" />
        <p className="text-gray-500 font-medium">Loading your readiness data...</p>
      </div>
    );
  }

  const hasData = data?.activeItems > 0;

  return (
    <div className="mb-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {!hasData && (
        <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl p-8 shadow-lg shadow-blue-200 mb-8 flex flex-col md:flex-row items-center justify-between text-white">
          <div>
            <h3 className="text-2xl font-extrabold mb-2">No Preparation Planner Found</h3>
            <p className="text-blue-100 max-w-lg leading-relaxed">
              Upload your CV to instantly generate a personalized preparation roadmap based on your target job description. This will help you track your readiness score effectively.
            </p>
          </div>
          <Link href="/dashboard/cv-upload" className="mt-6 md:mt-0 shrink-0">
            <Button className="bg-white text-blue-700 hover:bg-gray-50 font-bold px-8 py-6 rounded-xl shadow-xl transition-transform hover:-translate-y-1">
              Upload CV Now
            </Button>
          </Link>
        </div>
      )}

      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
        {/* Tabs */}
        <div className="flex border-b border-gray-100 bg-gray-50/50">
          <button 
            onClick={() => setActiveTab('planner')}
            className={`flex-1 py-4 text-sm font-bold text-center transition-all border-b-2 ${activeTab === 'planner' ? 'border-blue-600 text-blue-700 bg-white' : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
          >
            Preparation Planner
          </button>
          <button 
            onClick={() => setActiveTab('roadmap')}
            className={`flex-1 py-4 text-sm font-bold text-center transition-all border-b-2 ${activeTab === 'roadmap' ? 'border-blue-600 text-blue-700 bg-white' : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
          >
            Improvement Roadmap
          </button>
        </div>

        {/* Content */}
        <div className="p-6 md:p-8">
          <div className="flex flex-col md:flex-row gap-8 items-center justify-between">
            <div className="flex-1">
              <h3 className="text-2xl font-extrabold text-gray-900 flex items-center gap-3 mb-2">
                <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                  <TrendingUp className="w-6 h-6" />
                </div>
                {activeTab === 'planner' ? 'CV Preparation Planner' : 'Mock Interview Roadmap'}
              </h3>
              <p className="text-gray-500 font-medium">
                {activeTab === 'planner' 
                  ? 'Track the actionable items generated from your CV analysis.' 
                  : 'Review the areas of improvement identified from your latest mock interviews.'}
              </p>
              
              {hasData ? (
                <div className="flex flex-wrap gap-8 mt-8">
                  <div className="bg-gray-50 px-6 py-4 rounded-xl border border-gray-100 flex-1 min-w-[150px]">
                    <p className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-1">Overall Readiness</p>
                    <p className="text-4xl font-black text-blue-600">{data?.readinessScore}%</p>
                  </div>
                  <div className="bg-gray-50 px-6 py-4 rounded-xl border border-gray-100 flex-1 min-w-[150px]">
                    <p className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-1">Active Areas</p>
                    <p className="text-4xl font-black text-amber-500">{data?.activeItems}</p>
                  </div>
                </div>
              ) : (
                <div className="mt-8 p-6 bg-gray-50 border border-gray-100 rounded-xl text-center">
                  <p className="text-gray-500 italic font-medium">No active items found for this view.</p>
                </div>
              )}
            </div>
            
            <div className="flex flex-col gap-3 min-w-[200px] w-full md:w-auto shrink-0">
              <Link href="/dashboard/roadmap">
                <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-6 rounded-xl shadow-lg shadow-blue-100 transition-transform hover:-translate-y-1">
                  View Full Roadmap
                </Button>
              </Link>
              <Link href="/dashboard/cv-upload">
                <Button variant="outline" className="w-full border-2 border-gray-200 text-gray-700 hover:bg-gray-50 font-bold py-6 rounded-xl transition-all">
                  Update CV Planner
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
