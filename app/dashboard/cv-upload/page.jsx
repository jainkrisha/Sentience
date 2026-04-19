"use client";
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { LoaderCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export default function CvUploadPage() {
  const [cvText, setCvText] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleUpload = async () => {
    if (!cvText.trim()) {
      toast.error('Please paste your CV text');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/cv-upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cvText })
      });
      const data = await res.json();
      if (data.success) {
        toast.success('CV Processed Successfully!');
        router.push('/dashboard/planner');
      } else {
        toast.error(data.error || 'Failed to process CV');
      }
    } catch (error) {
      toast.error('Something went wrong');
    }
    setLoading(false);
  };

  return (
    <div className="p-10">
      <h2 className="text-2xl font-bold mb-4">Upload Your CV</h2>
      <p className="text-gray-500 mb-6">Paste the text of your CV below to generate a personalized preparation planner.</p>
      
      <Textarea 
        placeholder="Paste your resume/CV text here..." 
        className="min-h-[300px] mb-6"
        value={cvText}
        onChange={(e) => setCvText(e.target.value)}
      />
      
      <Button disabled={loading} onClick={handleUpload}>
        {loading ? <><LoaderCircle className="animate-spin mr-2" /> Processing...</> : 'Generate Preparation Planner'}
      </Button>
    </div>
  );
}
