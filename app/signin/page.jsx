'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { LoaderCircle, Lock, Mail, ArrowRight } from 'lucide-react';

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignIn = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, action: 'signin' }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Sign in failed. Please check your credentials.');
        return;
      }

      router.push('/dashboard');
    } catch (err) {
      setError('An error occurred. Please try again later.');
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
            Welcome back to your <br/>
            <span className="text-cyan-200">Personal AI Coach</span>
          </h1>
          <p className="text-lg text-blue-100 leading-relaxed max-w-xl">
            Log in to track your interview readiness, review your latest mock sessions, and continue your journey towards your dream job.
          </p>
          
          {/* Testimonial snippet */}
          <div className="mt-16 p-6 rounded-2xl bg-white/10 border border-white/20 backdrop-blur-md max-w-lg shadow-xl shadow-blue-900/20">
            <div className="flex gap-1 mb-3 text-amber-300">
              ★★★★★
            </div>
            <p className="text-white italic mb-4 font-medium leading-relaxed">"IPSUM's behavioral feedback helped me fix my eye-contact issues. I landed my Microsoft offer exactly two weeks later."</p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-cyan-100 flex items-center justify-center text-cyan-700 font-bold">SJ</div>
              <div>
                <p className="text-white font-bold text-sm">Sarah Jenkins</p>
                <p className="text-blue-200 text-xs font-medium">Software Engineer at Microsoft</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
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
            <h2 className="text-3xl font-extrabold text-gray-900 mb-2">Sign In</h2>
            <p className="text-gray-500 font-medium">Please enter your details to continue.</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-r-md text-sm font-medium animate-in fade-in slide-in-from-top-2">
              {error}
            </div>
          )}

          <form onSubmit={handleSignIn} className="space-y-5">
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
              <div className="flex justify-end mt-2">
                <a href="#" className="text-sm font-bold text-blue-600 hover:text-blue-500 transition-colors">
                  Forgot password?
                </a>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center gap-2 bg-blue-600 text-white py-4 px-4 rounded-xl hover:bg-blue-700 disabled:opacity-70 disabled:cursor-not-allowed font-bold text-base shadow-lg shadow-blue-200 transition-all hover:-translate-y-0.5 active:translate-y-0 mt-8"
            >
              {loading ? (
                <><LoaderCircle className="w-5 h-5 animate-spin" /> Signing In...</>
              ) : (
                <>Sign In <ArrowRight className="w-5 h-5" /></>
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-sm font-medium text-gray-600">
            Don't have an account?{' '}
            <Link href="/auth-signup" className="text-blue-600 hover:text-blue-700 font-bold transition-all border-b-2 border-transparent hover:border-blue-600 pb-0.5">
              Sign up for free
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
