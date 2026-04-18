'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lightbulb } from 'lucide-react';
import Link from 'next/link';

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
    <section className="bg-white">
      <div className="lg:grid lg:min-h-screen lg:grid-cols-12">
        <section className="relative flex h-32 items-end bg-gray-900 lg:col-span-5 lg:h-full xl:col-span-6">
          <img
            alt=""
            src="https://images.unsplash.com/photo-1617195737496-bc30194e3a19?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=870&q=80"
            className="absolute inset-0 h-full w-full object-cover opacity-80"
          />

          <div className="hidden lg:relative lg:block lg:p-12">
            <a className="block text-white" href="/">
              <span className="sr-only">Home</span>
              <Lightbulb className="h-8 w-8" />
            </a>

            <h2 className="mt-6 text-2xl font-bold text-white sm:text-3xl md:text-4xl">
              Welcome to AI Interview Coach 🤖
            </h2>

            <p className="mt-4 leading-relaxed text-white/90">
              The AI Interview Coach is a virtual platform designed to simulate real interview scenarios, offering personalized feedback and performance analysis. It uses AI to assess responses, improve communication skills, and provide expert-level tips. Ideal for job seekers to practice and refine their interview techniques.
            </p>
          </div>
        </section>

        <main className="flex items-center justify-center px-8 py-8 sm:px-12 lg:col-span-7 lg:px-16 lg:py-12 xl:col-span-6">
          <div className="max-w-xl lg:max-w-3xl">
            <div className="relative -mt-16 block lg:hidden">
              <a className="inline-flex size-16 items-center justify-center rounded-full bg-white text-blue-600 sm:size-20" href="/">
                <span className="sr-only">Home</span>
                <Lightbulb className="h-8 w-8" />
              </a>

              <h1 className="mt-2 text-2xl font-bold text-gray-900 sm:text-3xl md:text-4xl">
                Welcome to AI Interview Coach 🤖
              </h1>

              <p className="mt-4 leading-relaxed text-gray-500">
                The AI Interview Coach is a virtual platform designed to simulate real interview scenarios, offering personalized feedback and performance analysis.
              </p>
            </div>

            <form onSubmit={handleSignUp} className="mt-8 grid grid-cols-6 gap-6">
              <h1 className="col-span-6 text-2xl font-bold text-gray-900">Sign Up</h1>

              {error && (
                <div className="col-span-6 rounded-md bg-red-50 p-4 text-sm text-red-700">
                  {error}
                </div>
              )}

              <div className="col-span-6">
                <label htmlFor="Email" className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  type="email"
                  id="Email"
                  name="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 w-full rounded-md border-gray-200 bg-white p-2.5 text-gray-700 shadow-sm border"
                  required
                />
              </div>

              <div className="col-span-6">
                <label htmlFor="Password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <input
                  type="password"
                  id="Password"
                  name="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1 w-full rounded-md border-gray-200 bg-white p-2.5 text-gray-700 shadow-sm border"
                  required
                />
              </div>

              <div className="col-span-6">
                <label htmlFor="PasswordConfirm" className="block text-sm font-medium text-gray-700">
                  Confirm Password
                </label>
                <input
                  type="password"
                  id="PasswordConfirm"
                  name="password_confirmation"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="mt-1 w-full rounded-md border-gray-200 bg-white p-2.5 text-gray-700 shadow-sm border"
                  required
                />
              </div>

              <div className="col-span-6 sm:flex sm:items-center sm:gap-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-block shrink-0 rounded-md bg-blue-600 px-12 py-3 text-sm font-medium text-white transition hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? 'Creating Account...' : 'Create Account'}
                </button>
              </div>

              <div className="col-span-6 text-center text-sm">
                Already have an account?{' '}
                <Link href="/sign-in" className="text-blue-600 hover:underline">
                  Sign in
                </Link>
              </div>
            </form>
          </div>
        </main>
      </div>
    </section>
  );
}