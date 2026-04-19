'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { LoaderCircle, Lock, Mail, UserPlus, CheckCircle2, User, KeyRound, ArrowRight } from 'lucide-react';

export default function SignUpPage() {
  const router = useRouter();

  // Step Management
  const [step, setStep] = useState(1); // 1 = Details, 2 = OTP

  // Form State
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Handle Step 1 Submission
  const handleRequestOtp = (e) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (!name || !username || !email || !password) {
      setError('Please fill in all fields');
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
      // Call API with all details
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, username, email, password, action: 'signup' }),
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

  return (
    <div className="min-h-screen flex bg-gray-50 font-sans selection:bg-blue-100 selection:text-blue-900">
      {/* Left Panel - Sign Up Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 lg:p-16 bg-white relative overflow-y-auto">
        <div className="w-full max-w-md my-auto">
          {/* Mobile Header */}
          <div className="lg:hidden mb-12 flex justify-center items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shadow-md">
              <span className="text-white font-bold text-xl leading-none">I</span>
            </div>
            <span className="font-extrabold text-2xl tracking-tight text-gray-900">SENTIENCE</span>
          </div>

          <div className="mb-10 text-center lg:text-left">
            <h2 className="text-3xl font-extrabold text-gray-900 mb-2">
              {step === 1 ? 'Create an account' : 'Verify your email'}
            </h2>
            <p className="text-gray-500 font-medium">
              {step === 1 ? 'Start your journey to interview success today.' : `We sent a 6-digit code to ${email}`}
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-r-md text-sm font-medium animate-in fade-in slide-in-from-top-2">
              {error}
            </div>
          )}

          {step === 1 ? (
            <form onSubmit={handleRequestOtp} className="space-y-5">

              {/* Full Name & Username Row */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-sm font-bold text-gray-700">Full Name</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                    </div>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="block w-full pl-10 pr-3 py-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-blue-600 sm:text-sm transition-all bg-gray-50 focus:bg-white"
                      placeholder="John Doe"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-bold text-gray-700">Username</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-400 font-bold group-focus-within:text-blue-500 transition-colors">@</span>
                    </div>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="block w-full pl-10 pr-3 py-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-blue-600 sm:text-sm transition-all bg-gray-50 focus:bg-white"
                      placeholder="johndoe123"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Email Address */}
              <div className="space-y-2">
                <label className="block text-sm font-bold text-gray-700">Email Address</label>
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

              {/* Password */}
              <div className="space-y-2">
                <label className="block text-sm font-bold text-gray-700">Password</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-10 pr-3 py-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-blue-600 sm:text-sm transition-all bg-gray-50 focus:bg-white"
                    placeholder="•••••••• (Min 6 chars)"
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
                  <><LoaderCircle className="w-5 h-5 animate-spin" /> Sending Code...</>
                ) : (
                  <>Send OTP <ArrowRight className="w-5 h-5" /></>
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyAndSignUp} className="space-y-6 animate-in fade-in slide-in-from-right-4">
              <div className="space-y-4">
                <label className="block text-sm font-bold text-gray-700 text-center">
                  Enter 6-digit OTP
                </label>
                <div className="flex justify-between gap-2 px-2">
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      id={`otp-${index}`}
                      type="text"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      className="w-12 h-14 text-center text-2xl font-bold border-2 border-gray-200 rounded-xl focus:border-blue-600 focus:ring-0 bg-gray-50 focus:bg-white transition-all"
                    />
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center gap-2 bg-blue-600 text-white py-4 px-4 rounded-xl hover:bg-blue-700 disabled:opacity-70 disabled:cursor-not-allowed font-bold text-base shadow-lg shadow-blue-200 transition-all hover:-translate-y-0.5 active:translate-y-0 mt-8"
              >
                {loading ? (
                  <><LoaderCircle className="w-5 h-5 animate-spin" /> Verifying...</>
                ) : (
                  <><UserPlus className="w-5 h-5" /> Verify & Create Account</>
                )}
              </button>

              <button
                type="button"
                onClick={() => setStep(1)}
                className="w-full text-sm font-bold text-gray-500 hover:text-gray-800 transition-colors"
              >
                Go back
              </button>
            </form>
          )}

          {step === 1 && (
            <p className="mt-8 text-center text-sm font-medium text-gray-600">
              Already have an account?{' '}
              <Link href="/signin" className="text-blue-600 hover:text-blue-700 font-bold transition-all border-b-2 border-transparent hover:border-blue-600 pb-0.5">
                Sign in here
              </Link>
            </p>
          )}
        </div>
      </div>

      {/* Right Panel - Hero Graphic */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gray-50 overflow-hidden border-l border-gray-200">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-30 mix-blend-multiply"></div>
        <div className="absolute bottom-0 right-0 w-[800px] h-[800px] bg-blue-100 rounded-full blur-[150px] opacity-50 pointer-events-none"></div>
        <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-cyan-50 rounded-full blur-[120px] opacity-50 pointer-events-none"></div>

        <div className="relative z-10 flex flex-col justify-center h-full px-16 xl:px-24">
          <Link href="/" className="absolute top-10 right-16 flex items-center gap-2 hover:opacity-80 transition-opacity cursor-pointer">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shadow-md">
              <span className="text-white font-bold text-xl leading-none">I</span>
            </div>
            <span className="font-extrabold text-2xl tracking-tight text-gray-900">IPSUM</span>
          </Link>

          <div className="flex flex-col items-start max-w-lg">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-100 text-blue-700 font-bold text-xs uppercase tracking-wider mb-6">
              Join for Free
            </div>
            <h1 className="text-5xl xl:text-6xl font-extrabold text-gray-900 leading-tight mb-6">
              Unlock Your <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">True Potential</span>
            </h1>
            <p className="text-lg text-gray-600 leading-relaxed max-w-md">
              Get access to unlimited mock interviews, real-time behavioral tracking, and instant feedback. Prep smarter, not harder.
            </p>

            {/* Feature snippet */}
            <div className="mt-12 space-y-6 w-full">
              <div className="flex items-start gap-4 p-5 rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-gray-900 font-bold text-lg">100% Free Forever</h4>
                  <p className="text-gray-500 text-sm mt-1">No credit card required. Start practicing instantly.</p>
                </div>
              </div>
              <div className="flex items-start gap-4 p-5 rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-12 h-12 rounded-full bg-cyan-50 flex items-center justify-center text-cyan-600 shrink-0">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-gray-900 font-bold text-lg">Smart AI Engine</h4>
                  <p className="text-gray-500 text-sm mt-1">Adapts to your role and gives hyper-specific feedback.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
