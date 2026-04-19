'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { LoaderCircle, Lock, Mail, UserPlus, CheckCircle2, User, KeyRound, ArrowRight, Sparkles, Shield, Zap, ChevronLeft } from 'lucide-react';

export default function SignUpPage() {
  const router = useRouter();

  // Step Management
  const [step, setStep] = useState(1); // 1 = Details, 2 = OTP

  // Form State
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Handle Step 1 Submission
  const handleRequestOtp = (e) => {
    e.preventDefault();
    setError('');

    if (!name || !username || !email || !password) {
      setError('Please fill in all fields');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    // Simulate sending OTP
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStep(2);
    }, 1500);
  };

  // Handle OTP Input Change
  const handleOtpChange = (index, value) => {
    if (isNaN(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value !== '' && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && otp[index] === '' && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  // Handle Step 2 Submission (Final Signup)
  const handleVerifyAndSignUp = async (e) => {
    e.preventDefault();
    setError('');

    const enteredOtp = otp.join('');
    if (enteredOtp.length !== 6) {
      setError('Please enter the complete 6-digit OTP');
      return;
    }

    setLoading(true);

    try {
      // Existing API Logic - we only pass email and password to keep logic unmodified
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, action: 'signup' }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Sign up failed');
        setLoading(false);
        return;
      }

      router.push('/dashboard');
    } catch (err) {
      setError('An error occurred. Please try again later.');
      setLoading(false);
    }
  };

  const features = [
    { icon: Sparkles, label: 'AI-Powered Questions', desc: 'Tailored to your role and experience level', color: 'text-blue-400', bg: 'bg-blue-400/10' },
    { icon: Shield, label: 'Real-Time Feedback', desc: 'Instant analysis on every answer you give', color: 'text-cyan-400', bg: 'bg-cyan-400/10' },
    { icon: Zap, label: 'ATS Resume Scorer', desc: 'Get your resume past the bots, every time', color: 'text-indigo-400', bg: 'bg-indigo-400/10' },
  ];

  return (
    <div className="min-h-screen flex bg-white font-sans">

      {/* ── Left: Form Panel ── */}
      <div className="w-full lg:w-[52%] flex flex-col justify-center px-6 sm:px-12 lg:px-20 py-12 overflow-y-auto">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 mb-12 w-fit group">
          <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center shadow-md shadow-blue-200 group-hover:scale-105 transition-transform">
            <span className="text-white font-extrabold text-lg leading-none">S</span>
          </div>
          <span className="font-extrabold text-2xl tracking-tight text-gray-900">SENTIENCE</span>
        </Link>

        <div className="w-full max-w-md mx-auto lg:mx-0">

          {/* Step Indicator */}
          <div className="flex items-center gap-3 mb-10">
            <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-extrabold transition-all ${step >= 1 ? 'bg-blue-600 text-white shadow-md shadow-blue-200' : 'bg-gray-100 text-gray-400'}`}>1</div>
            <div className={`flex-1 h-1 rounded-full transition-all duration-500 ${step >= 2 ? 'bg-blue-600' : 'bg-gray-100'}`}></div>
            <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-extrabold transition-all ${step >= 2 ? 'bg-blue-600 text-white shadow-md shadow-blue-200' : 'bg-gray-100 text-gray-400'}`}>2</div>
          </div>

          {/* Heading */}
          <div className="mb-8">
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-2">
              {step === 1 ? 'Create your account' : 'Verify your email'}
            </h1>
            <p className="text-gray-500 font-medium">
              {step === 1
                ? 'Join thousands preparing smarter with AI.'
                : <span>We sent a 6-digit code to <span className="text-blue-600 font-bold">{email}</span></span>}
            </p>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="mb-6 flex items-start gap-3 p-4 bg-red-50 border border-red-100 text-red-700 rounded-2xl text-sm font-medium">
              <span className="shrink-0 mt-0.5 w-4 h-4 rounded-full bg-red-200 flex items-center justify-center text-red-700 font-black text-xs">!</span>
              {error}
            </div>
          )}

          {/* ── Step 1: Details Form ── */}
          {step === 1 ? (
            <form onSubmit={handleRequestOtp} className="space-y-5">

              {/* Name + Username */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-extrabold text-gray-500 uppercase tracking-wider mb-2">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-10 pr-4 py-3.5 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-50 text-sm font-medium text-gray-900 placeholder-gray-400 outline-none transition-all"
                      placeholder="John Doe"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-extrabold text-gray-500 uppercase tracking-wider mb-2">Username</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm">@</span>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full pl-9 pr-4 py-3.5 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-50 text-sm font-medium text-gray-900 placeholder-gray-400 outline-none transition-all"
                      placeholder="johndoe"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-extrabold text-gray-500 uppercase tracking-wider mb-2">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3.5 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-50 text-sm font-medium text-gray-900 placeholder-gray-400 outline-none transition-all"
                    placeholder="you@example.com"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-extrabold text-gray-500 uppercase tracking-wider mb-2">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-12 py-3.5 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-50 text-sm font-medium text-gray-900 placeholder-gray-400 outline-none transition-all"
                    placeholder="Min. 6 characters"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400 hover:text-blue-600 transition-colors"
                  >
                    {showPassword ? 'HIDE' : 'SHOW'}
                  </button>
                </div>
                {/* Password strength hint */}
                {password.length > 0 && (
                  <div className="flex gap-1.5 mt-2">
                    {[1,2,3,4].map(i => (
                      <div key={i} className={`h-1 flex-1 rounded-full transition-all ${password.length >= i*3 ? (password.length >= 10 ? 'bg-green-500' : 'bg-blue-500') : 'bg-gray-100'}`}></div>
                    ))}
                    <span className="text-xs font-bold ml-1 text-gray-400">
                      {password.length < 6 ? 'Weak' : password.length < 10 ? 'Good' : 'Strong'}
                    </span>
                  </div>
                )}
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full mt-4 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-extrabold py-4 rounded-xl shadow-xl shadow-blue-200 hover:shadow-blue-300 transition-all hover:-translate-y-0.5 active:translate-y-0 text-base"
              >
                {loading ? (
                  <><LoaderCircle className="w-5 h-5 animate-spin" /> Sending code...</>
                ) : (
                  <>Continue <ArrowRight className="w-5 h-5" /></>
                )}
              </button>

              <p className="text-center text-sm font-medium text-gray-500 pt-2">
                Already have an account?{' '}
                <Link href="/signin" className="text-blue-600 font-extrabold hover:underline">
                  Sign in
                </Link>
              </p>
            </form>

          ) : (
            /* ── Step 2: OTP Verification ── */
            <form onSubmit={handleVerifyAndSignUp} className="space-y-8">
              <div>
                <label className="block text-xs font-extrabold text-gray-500 uppercase tracking-wider mb-5 text-center">
                  Enter 6-digit verification code
                </label>
                <div className="flex justify-between gap-2">
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      id={`otp-${index}`}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(index, e)}
                      className={`w-full aspect-square max-w-[52px] text-center text-2xl font-extrabold border-2 rounded-2xl outline-none transition-all ${digit ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-md shadow-blue-100' : 'border-gray-200 bg-gray-50 text-gray-800 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-50'}`}
                    />
                  ))}
                </div>
                <p className="text-center text-xs text-gray-400 font-medium mt-4">
                  Didn't receive a code?{' '}
                  <button type="button" onClick={handleRequestOtp} className="text-blue-600 font-bold hover:underline">
                    Resend
                  </button>
                </p>
              </div>

              <div className="space-y-3">
                <button
                  type="submit"
                  disabled={loading || otp.join('').length !== 6}
                  className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-extrabold py-4 rounded-xl shadow-xl shadow-blue-200 transition-all hover:-translate-y-0.5 active:translate-y-0 text-base"
                >
                  {loading ? (
                    <><LoaderCircle className="w-5 h-5 animate-spin" /> Verifying...</>
                  ) : (
                    <><UserPlus className="w-5 h-5" /> Create Account</>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => { setStep(1); setOtp(['','','','','','']); setError(''); }}
                  className="w-full flex items-center justify-center gap-2 text-sm font-bold text-gray-500 hover:text-gray-800 py-3 rounded-xl hover:bg-gray-50 transition-all"
                >
                  <ChevronLeft className="w-4 h-4" /> Back to details
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* ── Right: Visual Panel ── */}
      <div className="hidden lg:flex lg:w-[48%] bg-gradient-to-br from-blue-700 via-blue-600 to-cyan-500 relative overflow-hidden flex-col justify-between p-16">
        {/* Background decoration */}
        <div className="absolute top-[-120px] right-[-120px] w-[500px] h-[500px] rounded-full bg-white/5 pointer-events-none"></div>
        <div className="absolute bottom-[-80px] left-[-80px] w-[400px] h-[400px] rounded-full bg-white/5 pointer-events-none"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full bg-cyan-400/10 blur-3xl pointer-events-none"></div>

        {/* Top wordmark */}
        <div className="relative z-10 flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
            <span className="text-white font-extrabold text-lg leading-none">S</span>
          </div>
          <span className="font-extrabold text-2xl tracking-tight text-white">SENTIENCE</span>
        </div>

        {/* Main content */}
        <div className="relative z-10 flex-1 flex flex-col justify-center py-16">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/15 backdrop-blur-sm text-white/90 font-bold text-xs uppercase tracking-wider mb-6 w-fit">
            <Sparkles className="w-3.5 h-3.5" /> Join 10,000+ Candidates
          </div>
          <h2 className="text-5xl xl:text-6xl font-extrabold text-white leading-tight mb-6">
            Ace Every<br />
            <span className="text-cyan-200">Interview.</span>
          </h2>
          <p className="text-blue-100 text-lg leading-relaxed max-w-sm font-medium mb-12">
            Practice with AI, get real-time feedback, and land the job you deserve. Start for free today.
          </p>

          {/* Feature cards */}
          <div className="space-y-4">
            {features.map(({ icon: Icon, label, desc, color, bg }) => (
              <div key={label} className="flex items-center gap-4 p-4 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10 hover:bg-white/15 transition-colors">
                <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center shrink-0`}>
                  <Icon className={`w-5 h-5 ${color}`} />
                </div>
                <div>
                  <p className="text-white font-bold text-sm">{label}</p>
                  <p className="text-blue-200 text-xs font-medium">{desc}</p>
                </div>
                <CheckCircle2 className="w-4 h-4 text-cyan-300 ml-auto shrink-0" />
              </div>
            ))}
          </div>
        </div>

        {/* Bottom social proof */}
        <div className="relative z-10 flex items-center gap-4 pt-8 border-t border-white/10">
          <div className="flex -space-x-3">
            {['A','B','C','D'].map((l, i) => (
              <div key={i} className="w-9 h-9 rounded-full bg-gradient-to-br from-white/30 to-white/10 border-2 border-white/20 flex items-center justify-center text-white text-xs font-extrabold">
                {l}
              </div>
            ))}
          </div>
          <p className="text-blue-100 text-sm font-medium">
            <span className="text-white font-extrabold">4.9★</span> — Loved by 10k+ job seekers
          </p>
        </div>
      </div>

    </div>
  );
}
