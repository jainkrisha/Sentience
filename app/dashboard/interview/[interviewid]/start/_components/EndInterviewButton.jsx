"use client";
import React, { useState } from 'react';
import { useMetrics } from '@/context/MetricsContext';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { db } from '@/utils/db';
import { session_metrics } from '@/utils/schema';
import { toast } from 'sonner';

export default function EndInterviewButton({ mockId }) {
  const { metrics } = useMetrics();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleEnd = async () => {
    if (!mockId) return;
    setLoading(true);
    try {
      // Basic heuristic for eye contact score if not perfectly tracked by duration
      const eyeScore = Math.max(0, 100 - (metrics.notFacingCounter * 5));
      
      await db.insert(session_metrics).values({
        sessionId: mockId,
        eyeContactScore: eyeScore,
        handGestureCount: metrics.handDetectionCounter,
        badPostureCount: metrics.badPostureDetectionCounter,
      });
      router.push(`/dashboard/interview/${mockId}/feedback`);
    } catch (e) {
      console.error(e);
      toast.error('Failed to save session metrics, but continuing to feedback...');
      router.push(`/dashboard/interview/${mockId}/feedback`);
    }
  };

  return (
    <Button 
      onClick={handleEnd} 
      disabled={loading}
      className="px-8 py-6 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-lg shadow-red-200 transition-all hover:-translate-y-0.5"
    >
      {loading ? 'Saving...' : 'End Review'}
    </Button>
  );
}
