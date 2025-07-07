'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Mail, Lock, Chrome } from 'lucide-react';

interface SignUpFormProps {
  onSwitchToSignIn: () => void;
}

export function SignUpForm({ onSwitchToSignIn }: SignUpFormProps) {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    unitPreference: 'metric' as 'metric' | 'imperial',
    height: '',
    weight: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [signupEmail, setSignupEmail] = useState('');
  const { signUp, signInWithGoogle } = useAuth();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      await signUp(formData.email, formData.password, formData.unitPreference);
      setSignupEmail(formData.email);
      setShowConfirmation(true);
    } catch (err: any) {
      setError(err.message || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError('');

    try {
      await signInWithGoogle();
    } catch (err: any) {
      setError(err.message || 'Failed to sign in with Google');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Create account</h2>
        <p className="text-gray-600 mt-1">Start your fitness journey today</p>
      </div>

      {showConfirmation ? (
        <div className="text-center space-y-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-green-800 mb-2">Check your email!</h3>
            <p className="text-green-700 mb-4">
              We've sent a confirmation link to <strong>{signupEmail}</strong>
            </p>
            <p className="text-sm text-green-600">
              Click the link in your email to verify your account and start tracking your fitness journey.
            </p>
          </div>
          
          <div className="space-y-3">
            <p className="text-sm text-gray-600">
              Didn't receive the email? Check your spam folder or try signing up again.
            </p>
            <div className="flex flex-col space-y-2">
              <button
                onClick={() => {
                  setShowConfirmation(false);
                  setFormData({
                    email: '',
                    password: '',
                    confirmPassword: '',
                    unitPreference: 'metric',
                    height: '',
                    weight: '',
                  });
                }}
                className="text-sm text-primary-600 hover:text-primary-700 font-medium"
              >
                Try again with a different email
              </button>
              <button
                onClick={onSwitchToSignIn}
                className="text-sm text-gray-600 hover:text-gray-700 font-medium"
              >
                Back to sign in
              </button>
            </div>
          </div>
        </div>
      ) : (
        <>
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="unitPreference" className="block text-sm font-medium text-gray-700 mb-1">
            Unit Preference
          </label>
          <select
            id="unitPreference"
            name="unitPreference"
            value={formData.unitPreference}
            onChange={handleInputChange}
            className="input"
            required
          >
            <option value="metric">Metric (kg, cm)</option>
            <option value="imperial">Imperial (lbs, feet)</option>
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="height" className="block text-sm font-medium text-gray-700 mb-1">
              Height ({formData.unitPreference === 'metric' ? 'cm' : 'in'}) (Optional)
            </label>
            <input
              id="height"
              name="height"
              type="number"
              step="0.1"
              value={formData.height}
              onChange={handleInputChange}
              className="input"
              placeholder={formData.unitPreference === 'metric' ? '170' : '67'}
            />
          </div>

          <div>
            <label htmlFor="weight" className="block text-sm font-medium text-gray-700 mb-1">
              Weight ({formData.unitPreference === 'metric' ? 'kg' : 'lbs'}) (Optional)
            </label>
            <input
              id="weight"
              name="weight"
              type="number"
              step="0.1"
              value={formData.weight}
              onChange={handleInputChange}
              className="input"
              placeholder={formData.unitPreference === 'metric' ? '70' : '154'}
            />
          </div>
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              className="input pl-10"
              placeholder="Enter your email"
              required
            />
          </div>
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
            Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleInputChange}
              className="input pl-10"
              placeholder="Create a password"
              required
            />
          </div>
        </div>

        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
            Confirm Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              className="input pl-10"
              placeholder="Confirm your password"
              required
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full"
        >
          {loading ? <LoadingSpinner size="sm" /> : 'Create Account'}
        </button>
      </form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-gray-500">Or continue with</span>
        </div>
      </div>

          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="btn-secondary w-full flex items-center justify-center space-x-2"
          >
            <Chrome className="w-4 h-4" />
            <span>Google</span>
          </button>
        </>
      )}
    </div>
  );
}