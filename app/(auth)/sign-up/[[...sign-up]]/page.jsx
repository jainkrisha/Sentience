'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { LoaderCircle, Lock, Mail, ArrowRight } from 'lucide-react';

export default function Page() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, action: 'signup' }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Sign up failed');
        console.error('Sign up error:', data);
        return;
      }

      router.push('/dashboard');
    } catch (err) {
      const errorMsg = 'An error occurred. Please try again.';
      setError(errorMsg);
      console.error('Sign up error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-50 font-sans selection:bg-blue-100 selection:text-blue-900">
      {/* Left Panel - Hero Graphic */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-blue-600 overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-cyan-400 rounded-full blur-[150px] opacity-20 mix-blend-screen pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-400 rounded-full blur-[120px] opacity-30 mix-blend-screen pointer-events-none"></div>
        
        <div className="relative z-10 flex flex-col justify-center h-full px-16 xl:px-24">
          <Link href="/" className="absolute top-10 left-16 flex items-center gap-2 hover:opacity-80 transition-opacity cursor-pointer">
            <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shadow-md">
              <span className="text-blue-600 font-bold text-xl leading-none">I</span>
            </div>
            <span className="font-extrabold text-2xl tracking-tight text-white">IPSUM</span>
          </Link>

          <h1 className="text-5xl xl:text-6xl font-extrabold text-white leading-tight mb-6">
            Start your journey <br/>
            <span className="text-cyan-200">with AI Coaching</span>
          </h1>
          <p className="text-lg text-blue-100 leading-relaxed max-w-xl">
            Create an account to access unlimited mock interviews, track your readiness, and improve your skills with real-time feedback.
          </p>
          
          {/* Testimonial snippet */}
          <div className="mt-16 p-6 rounded-2xl bg-white/10 border border-white/20 backdrop-blur-md max-w-lg shadow-xl shadow-blue-900/20">
            <div className="flex gap-1 mb-3 text-amber-300">
              ★★★★★
            </div>
            <p className="text-white italic mb-4 font-medium leading-relaxed">"IPSUM completely changed the way I prepare for interviews. The tailored feedback gave me the confidence to ace my final rounds."</p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-cyan-100 flex items-center justify-center text-cyan-700 font-bold">MK</div>
              <div>
                <p className="text-white font-bold text-sm">Michael Kim</p>
                <p className="text-blue-200 text-xs font-medium">Product Manager at Google</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Sign Up Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 lg:p-16 bg-white">
        <div className="w-full max-w-md">
          {/* Mobile Header */}
          <div className="lg:hidden mb-12 text-center flex justify-center items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
              <span className="text-white font-bold text-xl leading-none">I</span>
            </div>
            <span className="font-extrabold text-2xl tracking-tight text-gray-900">IPSUM</span>
          </div>

          <div className="mb-10 text-center lg:text-left">
            <h2 className="text-3xl font-extrabold text-gray-900 mb-2">Sign Up</h2>
            <p className="text-gray-500 font-medium">Please enter your details to create an account.</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-r-md text-sm font-medium animate-in fade-in slide-in-from-top-2">
              {error}
            </div>
          )}

          <form onSubmit={handleSignUp} className="space-y-5">
            <div className="space-y-2">
              <label className="block text-sm font-bold text-gray-700">
                Email Address
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-blue-600 sm:text-sm transition-all bg-gray-50 focus:bg-white"
                  placeholder="you@example.com"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-bold text-gray-700">
                Password
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-blue-600 sm:text-sm transition-all bg-gray-50 focus:bg-white"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-bold text-gray-700">
                Confirm Password
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                </div>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-blue-600 sm:text-sm transition-all bg-gray-50 focus:bg-white"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center gap-2 bg-blue-600 text-white py-4 px-4 rounded-xl hover:bg-blue-700 disabled:opacity-70 disabled:cursor-not-allowed font-bold text-base shadow-lg shadow-blue-200 transition-all hover:-translate-y-0.5 active:translate-y-0 mt-8"
            >
              {loading ? (
                <><LoaderCircle className="w-5 h-5 animate-spin" /> Creating Account...</>
              ) : (
                <>Sign Up <ArrowRight className="w-5 h-5" /></>
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-sm font-medium text-gray-600">
            Already have an account?{' '}
            <Link href="/signin" className="text-blue-600 hover:text-blue-700 font-bold transition-all border-b-2 border-transparent hover:border-blue-600 pb-0.5">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}