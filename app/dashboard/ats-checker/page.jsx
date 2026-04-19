"use client";
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { LoaderCircle, FileText, UploadCloud, Search, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';

export default function ATSCheckerPage() {
  const [file, setFile] = useState(null);
  const [jobDescription, setJobDescription] = useState('');
  const [analysisOption, setAnalysisOption] = useState('Quick Scan');
  const [loading, setLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState('');
  
  // Q&A State
  const [pdfText, setPdfText] = useState('');
  const [userQuestion, setUserQuestion] = useState('');
  const [qaLoading, setQaLoading] = useState(false);
  const [qaResult, setQaResult] = useState('');

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
    } else {
      toast.error('Please upload a valid PDF file');
      setFile(null);
    }
  };

  const handleAnalyze = async () => {
    if (!file) {
      toast.error('Please upload a resume first');
      return;
    }
    
    if (analysisOption === 'ATS Optimization' && !jobDescription.trim()) {
      toast.warning('Job description is highly recommended for ATS Optimization');
    }

    setLoading(true);
    setAnalysisResult('');
    setQaResult('');
    setPdfText('');

    const formData = new FormData();
    formData.append('resume', file);
    formData.append('job_description', jobDescription);
    formData.append('analysis_option', analysisOption);

    try {
      const res = await fetch('/api/ats-checker', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      
      if (data.success) {
        toast.success('Resume analyzed successfully!');
        setAnalysisResult(data.analysis);
        setPdfText(data.pdfText);
      } else {
        toast.error(data.error || 'Failed to analyze resume');
      }
    } catch (error) {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAskQuestion = async () => {
    if (!userQuestion.trim()) return;
    setQaLoading(true);

    try {
      const prompt = `Based on the resume and analysis below, answer the following question:
      Question: ${userQuestion}
      
      Resume Text: ${pdfText}
      Previous Analysis: ${analysisResult}`;
      
      // We can use the existing gemini proxy or just write a quick local fetch
      // Re-using the /api/proxy-gemini route
      const res = await fetch('/api/proxy-gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
      });
      const data = await res.json();
      if (data.response) {
        setQaResult(data.response);
      } else {
        toast.error('Failed to get answer');
      }
    } catch (e) {
      toast.error('Error asking question');
    } finally {
      setQaLoading(false);
    }
  };

  return (
    <div className="p-10 max-w-5xl mx-auto">
      <div className="flex items-center gap-3 mb-2">
        <Search className="w-8 h-8 text-indigo-600" />
        <h2 className="text-3xl font-bold text-gray-900">ResumeATS Pro</h2>
      </div>
      <p className="text-gray-500 mb-8 text-lg">Optimize Your Resume for ATS and Land Your Dream Job</p>
      
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        
        {/* Left Column: Input Form */}
        <div className="md:col-span-4 flex flex-col gap-6 bg-white p-6 rounded-xl border shadow-sm h-fit">
          
          <div>
            <label className="block text-sm font-semibold mb-2">Upload your resume (PDF)</label>
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:bg-gray-50 transition-colors">
              <UploadCloud className="w-8 h-8 mx-auto text-gray-400 mb-2" />
              <input 
                type="file" 
                accept="application/pdf"
                className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer"
                onChange={handleFileChange}
              />
              {file && <p className="text-sm text-green-600 mt-2 font-medium">✓ {file.name}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Job description (optional)</label>
            <Textarea 
              placeholder="Paste the target job description here..."
              className="min-h-[120px]"
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Choose analysis type:</label>
            <div className="flex flex-col gap-3">
              {['Quick Scan', 'Detailed Analysis', 'ATS Optimization'].map((option) => (
                <label key={option} className="flex items-center gap-2 cursor-pointer p-2 border rounded-lg hover:bg-gray-50 transition-colors">
                  <input 
                    type="radio" 
                    name="analysis_option" 
                    value={option}
                    checked={analysisOption === option}
                    onChange={(e) => setAnalysisOption(e.target.value)}
                    className="w-4 h-4 text-indigo-600"
                  />
                  <span className="text-sm font-medium">{option}</span>
                </label>
              ))}
            </div>
          </div>

          <Button 
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-6 text-lg"
            onClick={handleAnalyze}
            disabled={loading}
          >
            {loading ? <><LoaderCircle className="animate-spin mr-2" /> Analyzing...</> : 'Analyze Resume'}
          </Button>
        </div>

        {/* Right Column: Results */}
        <div className="md:col-span-8">
          <div className="bg-white p-8 rounded-xl border shadow-sm min-h-[500px]">
            <h3 className="text-xl font-bold flex items-center gap-2 mb-6 border-b pb-4">
              <FileText className="w-6 h-6 text-indigo-600" />
              Analysis Results
            </h3>
            
            {!analysisResult && !loading && (
              <div className="flex flex-col items-center justify-center h-full text-gray-400 py-20">
                <FileText className="w-16 h-16 mb-4 opacity-20" />
                <p>Upload a resume and click analyze to see your results here.</p>
              </div>
            )}

            {loading && (
              <div className="flex flex-col items-center justify-center h-full text-indigo-600 py-20">
                <LoaderCircle className="w-12 h-12 animate-spin mb-4" />
                <p className="font-medium animate-pulse">Running advanced ATS algorithms...</p>
              </div>
            )}

            {analysisResult && (
              <div className="prose prose-indigo max-w-none text-gray-800 whitespace-pre-wrap">
                {analysisResult}
              </div>
            )}

            {/* Q&A Section */}
            {analysisResult && (
              <div className="mt-12 pt-8 border-t border-gray-200">
                <h4 className="text-lg font-bold flex items-center gap-2 mb-4">
                  <MessageSquare className="w-5 h-5 text-indigo-600" />
                  Have questions about your resume?
                </h4>
                <div className="flex gap-2">
                  <Input 
                    placeholder="E.g. What skills am I missing for a Frontend Developer role?" 
                    value={userQuestion}
                    onChange={(e) => setUserQuestion(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAskQuestion()}
                  />
                  <Button onClick={handleAskQuestion} disabled={qaLoading || !userQuestion.trim()}>
                    {qaLoading ? <LoaderCircle className="w-4 h-4 animate-spin" /> : 'Ask'}
                  </Button>
                </div>
                
                {qaResult && (
                  <div className="mt-4 p-4 bg-indigo-50 border border-indigo-100 rounded-lg whitespace-pre-wrap text-sm text-indigo-900">
                    <span className="font-bold block mb-2">Answer:</span>
                    {qaResult}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
