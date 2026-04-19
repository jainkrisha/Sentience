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
    <div className="p-6 md:p-10 max-w-7xl mx-auto min-h-screen">
      <div className="mb-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-3 bg-blue-100 rounded-xl">
            <Search className="w-8 h-8 text-blue-600" />
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">ResumeATS Pro</h2>
        </div>
        <p className="text-gray-500 text-lg font-medium">Optimize Your Resume for ATS and Land Your Dream Job</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        
        {/* Left Column: Input Form */}
        <div className="md:col-span-4 flex flex-col gap-6 bg-white p-8 rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg hover:shadow-blue-50 transition-all h-fit animate-in fade-in slide-in-from-bottom-6 duration-700">
          
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-3">Upload your resume (PDF)</label>
            <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center hover:bg-blue-50 hover:border-blue-300 transition-colors group cursor-pointer relative overflow-hidden">
              <UploadCloud className="w-10 h-10 mx-auto text-gray-400 group-hover:text-blue-500 mb-3 transition-colors" />
              <input 
                type="file" 
                accept="application/pdf"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                onChange={handleFileChange}
              />
              <span className="text-sm font-bold text-blue-600 group-hover:text-blue-700">Click to upload</span>
              <span className="text-sm text-gray-500 block mt-1">or drag and drop</span>
              {file && <p className="text-sm text-green-600 mt-4 font-bold bg-green-50 py-2 px-3 rounded-lg inline-block">✓ {file.name}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-900 mb-3">Job description (optional)</label>
            <Textarea 
              placeholder="Paste the target job description here..."
              className="min-h-[120px] bg-gray-50 border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 transition-all resize-y"
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-900 mb-3">Choose analysis type:</label>
            <div className="flex flex-col gap-3">
              {['Quick Scan', 'Detailed Analysis', 'ATS Optimization'].map((option) => (
                <label key={option} className={`flex items-center gap-3 cursor-pointer p-4 border rounded-xl transition-all ${analysisOption === option ? 'bg-blue-50 border-blue-200 shadow-sm' : 'hover:bg-gray-50 border-gray-100'}`}>
                  <input 
                    type="radio" 
                    name="analysis_option" 
                    value={option}
                    checked={analysisOption === option}
                    onChange={(e) => setAnalysisOption(e.target.value)}
                    className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <span className={`text-sm font-bold ${analysisOption === option ? 'text-blue-900' : 'text-gray-700'}`}>{option}</span>
                </label>
              ))}
            </div>
          </div>

          <Button 
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-6 text-lg rounded-xl shadow-lg shadow-blue-200 transition-transform hover:-translate-y-0.5 mt-2"
            onClick={handleAnalyze}
            disabled={loading}
          >
            {loading ? <><LoaderCircle className="animate-spin mr-2" /> Analyzing...</> : 'Analyze Resume'}
          </Button>
        </div>

        {/* Right Column: Results */}
        <div className="md:col-span-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
          <div className="bg-white p-8 md:p-10 rounded-2xl border border-gray-100 shadow-sm min-h-[600px] hover:shadow-lg hover:shadow-blue-50 transition-all">
            <h3 className="text-2xl font-extrabold flex items-center gap-3 mb-8 border-b border-gray-100 pb-6 text-gray-900">
              <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                <FileText className="w-6 h-6" />
              </div>
              Analysis Results
            </h3>
            
            {!analysisResult && !loading && (
              <div className="flex flex-col items-center justify-center h-full text-gray-400 py-32">
                <FileText className="w-20 h-20 mb-6 opacity-20" />
                <p className="font-medium text-lg">Upload a resume and click analyze to see your results here.</p>
              </div>
            )}

            {loading && (
              <div className="flex flex-col items-center justify-center h-full text-blue-600 py-32">
                <LoaderCircle className="w-16 h-16 animate-spin mb-6" />
                <p className="font-bold text-lg animate-pulse text-blue-800">Running advanced ATS algorithms...</p>
              </div>
            )}

            {analysisResult && (
              <div className="prose prose-blue max-w-none text-gray-700 whitespace-pre-wrap leading-relaxed font-medium">
                {analysisResult}
              </div>
            )}

            {/* Q&A Section */}
            {analysisResult && (
              <div className="mt-16 pt-10 border-t border-gray-100">
                <div className="bg-gray-50 rounded-2xl p-8 border border-gray-100">
                  <h4 className="text-xl font-bold flex items-center gap-3 mb-6 text-gray-900">
                    <div className="p-2 bg-white rounded-lg text-blue-600 shadow-sm border border-gray-100">
                      <MessageSquare className="w-5 h-5" />
                    </div>
                    Have questions about your resume?
                  </h4>
                  <div className="flex gap-3">
                    <Input 
                      placeholder="E.g. What skills am I missing for a Frontend Developer role?" 
                      value={userQuestion}
                      onChange={(e) => setUserQuestion(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAskQuestion()}
                      className="py-6 rounded-xl border-gray-200 focus:ring-blue-500 focus:border-blue-500 bg-white"
                    />
                    <Button 
                      onClick={handleAskQuestion} 
                      disabled={qaLoading || !userQuestion.trim()}
                      className="py-6 px-8 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-md shadow-blue-200 transition-all hover:-translate-y-0.5"
                    >
                      {qaLoading ? <LoaderCircle className="w-5 h-5 animate-spin" /> : 'Ask'}
                    </Button>
                  </div>
                  
                  {qaResult && (
                    <div className="mt-6 p-6 bg-white border border-blue-100 rounded-xl whitespace-pre-wrap text-sm text-gray-700 shadow-sm font-medium leading-relaxed">
                      <span className="font-bold text-blue-900 block mb-3 text-base flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-blue-600"></div> Answer
                      </span>
                      {qaResult}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
