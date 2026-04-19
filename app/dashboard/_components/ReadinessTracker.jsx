"use client";
import React, { useEffect, useState } from 'react';
import { LoaderCircle, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function ReadinessTracker() {
  const [roadmapItems, setRoadmapItems] = useState(0);
  const [plannerData, setPlannerData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('planner');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [roadmapRes, plannerRes] = await Promise.all([
        fetch('/api/roadmap'),
        fetch('/api/planner')
      ]);
      
      const roadmapData = await roadmapRes.json();
      const plannerJson = await plannerRes.json();
      
      setRoadmapItems(roadmapData.items ? roadmapData.items.length : 0);
      if (plannerJson.planner) {
        setPlannerData(plannerJson);
      }
    } catch (error) {
      console.error("Failed to load readiness tracker data", error);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="h-48 border border-gray-100 rounded-2xl bg-white flex flex-col items-center justify-center shadow-sm">
        <LoaderCircle className="animate-spin text-blue-600 w-8 h-8 mb-4" />
        <p className="text-gray-500 font-medium">Loading your readiness data...</p>
      </div>
    );
  }

  const hasPlanner = !!plannerData;
  const hasRoadmap = roadmapItems > 0;

  // Decide what to show based on the active tab
  const hasDataForTab = activeTab === 'planner' ? hasPlanner : hasRoadmap;

  return (
    <div className="mb-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {!hasPlanner && (
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
              
              {hasDataForTab ? (
                <div className="flex flex-wrap gap-8 mt-8">
                  <div className="bg-gray-50 px-6 py-4 rounded-xl border border-gray-100 flex-1 min-w-[150px]">
                    <p className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-1">
                      {activeTab === 'planner' ? 'Readiness Baseline' : 'Latest Average Score'}
                    </p>
                    <p className="text-4xl font-black text-blue-600">
                      {activeTab === 'planner' ? `${plannerData.readinessBaseline}%` : 'Needs Mock Data'}
                    </p>
                  </div>
                  <div className="bg-gray-50 px-6 py-4 rounded-xl border border-gray-100 flex-1 min-w-[150px]">
                    <p className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-1">Active Areas</p>
                    <p className="text-4xl font-black text-amber-500">
                      {activeTab === 'planner' ? Object.keys(plannerData.planner).length : roadmapItems}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="mt-8 p-6 bg-gray-50 border border-gray-100 rounded-xl text-center">
                  <p className="text-gray-500 italic font-medium">No active items found for this view.</p>
                </div>
              )}
            </div>
            
            <div className="flex flex-col gap-3 min-w-[200px] w-full md:w-auto shrink-0">
              <Link href={activeTab === 'planner' ? "/dashboard/planner" : "/dashboard/roadmap"}>
                <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-6 rounded-xl shadow-lg shadow-blue-100 transition-transform hover:-translate-y-1">
                  {activeTab === 'planner' ? 'View Full Planner' : 'View Full Roadmap'}
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
