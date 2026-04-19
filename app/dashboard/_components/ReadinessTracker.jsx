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

  if (loading) {
    return <div className="p-4 border rounded-lg bg-gray-50 flex items-center justify-center"><LoaderCircle className="animate-spin text-primary" /></div>;
  }

  return (
    <div className="bg-white border rounded-lg p-6 shadow-sm mb-8 flex flex-col md:flex-row gap-6 items-center justify-between">
      <div>
        <h3 className="text-xl font-bold flex items-center gap-2"><TrendingUp className="text-primary" /> Readiness Tracker</h3>
        <p className="text-gray-500 mt-2">Track your interview preparation progress dynamically.</p>
        
        <div className="flex gap-8 mt-4">
          <div>
            <p className="text-sm font-semibold text-gray-500">Overall Readiness</p>
            <p className="text-2xl font-bold text-primary">{data?.readinessScore}%</p>
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-500">Active Weak Areas</p>
            <p className="text-2xl font-bold text-red-500">{data?.activeItems}</p>
          </div>
        </div>
      </div>
      
      <div className="flex flex-col gap-3 min-w-[200px]">
        <Link href="/dashboard/roadmap">
          <Button variant="outline" className="w-full">View Roadmap</Button>
        </Link>
        <Link href="/dashboard/cv-upload">
          <Button variant="secondary" className="w-full">Update CV Planner</Button>
        </Link>
      </div>
    </div>
  );
}
