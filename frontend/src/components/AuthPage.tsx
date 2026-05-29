/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  User as UserIcon, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ShieldCheck, 
  Zap, 
  Sparkles, 
  Layout, 
  Check, 
  ArrowRight
} from 'lucide-react';
import { MOCK_USERS } from '../data';
import { User } from '../types';
import { AuthCredentials } from '../api';

interface AuthPageProps {
  initialMode: 'signup' | 'signin';
  onAuthenticate: (credentials: AuthCredentials) => Promise<void>;
  onDemoSignIn: (user: User) => Promise<void>;
}

export default function AuthPage({ initialMode, onAuthenticate, onDemoSignIn }: AuthPageProps) {
  const [isSignUp, setIsSignUp] = useState(initialMode === 'signup');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const getErrorMessage = (err: unknown) => {
    return err instanceof Error ? err.message : 'Unable to authenticate. Please try again.';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please fill in all required fields.');
      return;
    }
    if (isSignUp && !fullName) {
      setError('Please enter your full name.');
      return;
    }

    setLoading(true);

    try {
      await onAuthenticate({
        mode: isSignUp ? 'signup' : 'signin',
        name: fullName,
        email,
        password
      });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  // Skip / Auto Sign in triggers to bypass typing
  const handleQuickSignIn = async (userIndex: number) => {
    setLoading(true);
    setError('');

    try {
      await onDemoSignIn(MOCK_USERS[userIndex]);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-[#030712] text-slate-100 flex flex-col justify-center select-none overflow-y-auto overflow-x-hidden font-sans">
      
      {/* Glow shapes */}
      <div className="absolute top-[-250px] right-[-200px] w-[500px] h-[500px] bg-indigo-900/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-150px] left-[-200px] w-[600px] h-[600px] bg-cyan-950/20 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(115deg,transparent_0%,transparent_48%,rgba(6,182,212,0.07)_48%,rgba(139,92,246,0.08)_68%,transparent_68%)] pointer-events-none" />

      {/* Main Grid: Split View */}
      <div className="max-w-7xl mx-auto w-full px-6 sm:px-12 py-24 sm:py-16 lg:py-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center flex-1">
        
        {/* LEFT COLUMN: Graphic Presentation (Matches Image 2) */}
        <div className="lg:col-span-5 text-left space-y-6 lg:pr-8">
          
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-400 to-indigo-500 p-0.5">
              <div className="w-full h-full bg-[#030712] rounded-[10px] flex items-center justify-center">
                <Check className="w-4.5 h-4.5 text-cyan-400" />
              </div>
            </div>
            <span className="text-xl font-display font-semibold text-white">
              TaskFlow
            </span>
          </div>

          {/* Majestic graphic layout of a base secure card */}
          <div className="relative h-[300px] p-6 rounded-3xl bg-[#090d16]/75 border border-slate-800/60 shadow-xl overflow-hidden hidden sm:flex items-center justify-center">
            {/* Ambient circle glow */}
            <div className="absolute -bottom-10 -left-10 w-44 h-44 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-8 left-1/2 h-14 w-72 -translate-x-1/2 rounded-full border border-cyan-400/50 bg-cyan-400/10 shadow-[0_0_55px_rgba(6,182,212,0.35)]" />
            <div className="absolute bottom-14 left-1/2 h-16 w-80 -translate-x-1/2 rounded-full border border-violet-400/45 bg-violet-500/10 shadow-[0_0_60px_rgba(139,92,246,0.28)]" />

            {/* Graphical account card, shaped to match the reference illustration without external assets. */}
            <div className="relative h-48 w-64 -rotate-2 rounded-[28px] border border-cyan-300/30 bg-gradient-to-br from-slate-800/80 via-slate-900/70 to-indigo-950/80 shadow-[0_0_45px_rgba(14,165,233,0.18)]">
              <div className="absolute left-1/2 top-12 h-12 w-12 -translate-x-1/2 rounded-full bg-gradient-to-br from-cyan-300 to-cyan-600 shadow-[0_0_25px_rgba(34,211,238,0.5)]" />
              <div className="absolute left-1/2 top-28 h-12 w-24 -translate-x-1/2 rounded-t-full bg-gradient-to-br from-cyan-300 to-cyan-700" />
              <div className="absolute bottom-16 left-20 h-3 w-28 rounded-full bg-cyan-400/45" />
              <div className="absolute bottom-11 left-20 h-3 w-36 rounded-full bg-indigo-400/20" />
            </div>

            {/* Simulated Floating Icons in glass panels on Left Column */}
            <div className="absolute top-8 left-8 p-4 rounded-2xl bg-violet-500/15 border border-violet-400/40 shadow-[0_0_30px_rgba(139,92,246,0.3)] anim-float">
              <ShieldCheck className="w-5 h-5 text-cyan-400" />
            </div>
            <div className="absolute bottom-16 left-6 p-4 rounded-2xl bg-cyan-500/15 border border-cyan-400/40 shadow-[0_0_30px_rgba(6,182,212,0.3)] anim-float-delayed">
              <Lock className="w-5 h-5 text-cyan-400" />
            </div>
            <div className="absolute right-8 top-32 p-4 rounded-2xl bg-indigo-500/15 border border-indigo-400/40 shadow-[0_0_30px_rgba(99,102,241,0.3)] anim-float">
              <Layout className="w-5 h-5 text-indigo-400" />
            </div>
          </div>

          {/* Three checklist points matching the screenshot bottom left */}
          <div className="space-y-4 pt-4 border-t border-slate-900/60">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-cyan-950/40 border border-cyan-800/40 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5 text-cyan-400" />
              </div>
              <div>
                <h4 className="text-sm font-medium text-white">Secure & Private</h4>
                <p className="text-xs text-slate-400 mt-1">Your data is protected by authenticated workspace access.</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-purple-950/40 border border-purple-800/40 flex items-center justify-center shrink-0">
                <Zap className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <h4 className="text-sm font-medium text-white">Fast & Simple</h4>
                <p className="text-xs text-slate-400 mt-1">Create your workspace account in less than ten seconds.</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-indigo-950/40 border border-indigo-800/40 flex items-center justify-center shrink-0">
                <Layout className="w-5 h-5 text-indigo-400" />
              </div>
              <div>
                <h4 className="text-sm font-medium text-white">Stay Organized</h4>
                <p className="text-xs text-slate-400 mt-1">Kanban, lists, stats, and calendar views perfectly synced together.</p>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Signup / Login panel (Matches Image 2 right pane) */}
        <div className="lg:col-span-7 flex justify-center lg:justify-end">
          
          <div className="w-full max-w-lg rounded-3xl border border-slate-800/80 p-6 lg:p-7 bg-[#090d16]/85 backdrop-blur-2xl shadow-2xl shadow-indigo-950/20 text-center relative">
            
            {/* Header Lock Icon container */}
            <div className="mx-auto w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-4">
              <UserIcon className="w-6 h-6 text-indigo-400" />
            </div>

            <h2 className="text-2xl font-display font-semibold tracking-tight text-white">
              {isSignUp ? 'Create your account' : 'Welcome Back'}
            </h2>
            <p className="text-xs text-slate-400 mt-1.5 mb-6">
              {isSignUp ? 'Join TaskFlow and boost your productivity' : 'Access your premium productivity deck'}
            </p>

            {error && (
              <div className="mb-4 text-xs font-medium text-rose-400 bg-rose-500/10 border border-rose-500/25 rounded-lg py-2.5 px-4 text-left">
                {error}
              </div>
            )}

            {/* Core Form */}
            <form onSubmit={handleSubmit} className="space-y-4.5 text-left">
              {isSignUp && (
                <div className="space-y-1">
                  <label className="text-xs font-mono uppercase tracking-wider text-slate-400">Full Name</label>
                  <div className="relative">
                    <UserIcon className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
                    <input
                      type="text"
                      name="name"
                      autoComplete="name"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Enter your full name"
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#030712]/70 border border-slate-800 text-sm placeholder:text-slate-600 outline-none focus:border-cyan-500/80 transition-all text-white"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-1">
                <label className="text-xs font-mono uppercase tracking-wider text-slate-400">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
                  <input
                    type="email"
                    name="email"
                    required
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address"
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#030712]/70 border border-slate-800 text-sm placeholder:text-slate-600 outline-none focus:border-cyan-500/80 transition-all text-white"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-mono uppercase tracking-wider text-slate-400">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    required
                    autoComplete={isSignUp ? 'new-password' : 'current-password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={isSignUp ? 'Create a strong password' : 'Enter your password'}
                    className="w-full pl-10 pr-11 py-3 rounded-xl bg-[#030712]/70 border border-slate-800 text-sm placeholder:text-slate-600 outline-none focus:border-cyan-500/80 transition-all text-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3.5 p-0.5 text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Action Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 mt-6 rounded-xl font-semibold text-sm bg-gradient-to-r from-cyan-400 via-sky-500 to-indigo-600 text-white shadow-xl shadow-cyan-500/10 hover:shadow-cyan-400/20 active:scale-[0.99] hover:opacity-95 disabled:opacity-40 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>{loading ? 'Authenticating...' : isSignUp ? 'Create account' : 'Sign in'}</span>
                {!loading && <ArrowRight className="w-4 h-4" />}
              </button>
            </form>


            {/* Quick Demo Assist Banner */}
            <div className="mt-5 p-3 rounded-xl bg-cyan-950/15 border border-cyan-800/30 text-left">
              <p className="text-[10px] text-slate-400 leading-relaxed">
                🚀 <strong className="text-cyan-400">Developer Assist:</strong> Click <strong>Google</strong> to sign-in instantly as Lead Designer <strong>Alex Morgan</strong> or <strong>GitHub</strong> to sign-in as Frontend Engineer <strong>Sophia Chen</strong>!
              </p>
            </div>

            {/* Switch Mode footer */}
            <div className="mt-6 text-xs text-slate-400">
              {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
              <button
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-cyan-400 hover:underline font-semibold cursor-pointer"
              >
                {isSignUp ? 'Sign in' : 'Sign up'}
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
