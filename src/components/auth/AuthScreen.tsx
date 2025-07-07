'use client';

import { useState } from 'react';
import { SignInForm } from './SignInForm';
import { SignUpForm } from './SignUpForm';

export function AuthScreen() {
  const [isSignUp, setIsSignUp] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-[#171717] dark:to-[#1a1a1a] flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex items-center justify-center mb-4">
            <img src="/logo.jpg" alt="Reps & Rulers Logo" className="w-12 h-12 rounded-lg" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Reps & Rulers</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Measure every rep, rule every change</p>
        </div>

        {/* Auth Forms */}
        <div className="bg-white dark:bg-[#171717] rounded-xl shadow-lg p-8 border border-gray-200 dark:border-[#2e2e2e]">
          {isSignUp ? <SignUpForm onSwitchToSignIn={() => setIsSignUp(false)} /> : <SignInForm />}
          
          <div className="mt-6 text-center">
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-sm text-primary-600 hover:text-primary-700 font-medium"
            >
              {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
            </button>
          </div>
        </div>

        {/* Features */}
        <div className="text-center text-sm text-gray-500 dark:text-gray-400 space-y-2">
          <p>✓ Track measurements & progress</p>
          <p>✓ Visual progress charts</p>
          <p>✓ Photo comparison</p>
          <p>✓ Export your data</p>
        </div>
      </div>
    </div>
  );
}