'use client';

import { useState, useEffect } from 'react';
import Joyride, { Step, CallBackProps, STATUS } from 'react-joyride';

interface OnboardingProps {
  isFirstTime: boolean;
  onComplete: () => void;
}

const ONBOARDING_STORAGE_KEY = 'reps-rulers-onboarding-completed';

export function Onboarding({ isFirstTime, onComplete }: OnboardingProps) {
  const [run, setRun] = useState(false);

  useEffect(() => {
    if (isFirstTime) {
      setRun(true);
    }
  }, [isFirstTime]);

  const steps: Step[] = [
    {
      target: '[data-tour="add-measurement"]',
      content: (
        <div className="space-y-2">
          <h3 className="font-semibold text-gray-900">Add Your First Measurement</h3>
          <p className="text-sm text-gray-600">
            Start tracking your fitness journey by adding your first measurement. 
            Click this button to begin recording your weight and body measurements.
          </p>
        </div>
      ),
      placement: 'bottom',
      disableBeacon: true,
    },
    {
      target: '[data-tour="timeline-tab"]',
      content: (
        <div className="space-y-2">
          <h3 className="font-semibold text-gray-900">View Your Timeline</h3>
          <p className="text-sm text-gray-600">
            Track your progress over time in the Timeline tab. 
            See all your measurements, search through entries, and edit past data.
          </p>
        </div>
      ),
      placement: 'bottom',
    },
    {
      target: '[data-tour="charts-tab"]',
      content: (
        <div className="space-y-2">
          <h3 className="font-semibold text-gray-900">Visualize Progress</h3>
          <p className="text-sm text-gray-600">
            View your progress with interactive charts. 
            Switch between different metrics and time ranges to see your fitness journey.
          </p>
        </div>
      ),
      placement: 'bottom',
    },
  ];

  const handleCallback = (data: CallBackProps) => {
    const { status } = data;
    
    if (status === STATUS.FINISHED || status === STATUS.SKIPPED) {
      setRun(false);
      localStorage.setItem(ONBOARDING_STORAGE_KEY, 'true');
      onComplete();
    }
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      setRun(false);
      localStorage.setItem(ONBOARDING_STORAGE_KEY, 'true');
      onComplete();
    }
  };

  useEffect(() => {
    if (run) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [run]);

  if (!isFirstTime) {
    return null;
  }

  return (
    <Joyride
      steps={steps}
      run={run}
      continuous
      showProgress
      showSkipButton
      callback={handleCallback}
      styles={{
        options: {
          primaryColor: '#14b8a6', // primary-500
          backgroundColor: '#ffffff',
          textColor: '#374151',
          arrowColor: '#ffffff',
          overlayColor: 'rgba(0, 0, 0, 0.5)',
        },
        tooltip: {
          borderRadius: '8px',
          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)',
        },
        tooltipTitle: {
          fontSize: '16px',
          fontWeight: '600',
        },
        tooltipContent: {
          fontSize: '14px',
        },
        buttonNext: {
          backgroundColor: '#14b8a6',
          borderRadius: '6px',
          fontSize: '14px',
          fontWeight: '500',
          padding: '8px 16px',
        },
        buttonBack: {
          color: '#6b7280',
          fontSize: '14px',
          fontWeight: '500',
        },
        buttonSkip: {
          color: '#6b7280',
          fontSize: '14px',
          fontWeight: '500',
        },
        buttonClose: {
          display: 'none',
        },
      }}
      locale={{
        back: 'Back',
        close: 'Close',
        last: 'Finish',
        next: 'Next',
        skip: 'Skip Tour',
      }}
    />
  );
}

// Helper function to check if onboarding has been completed
export function isOnboardingCompleted(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(ONBOARDING_STORAGE_KEY) === 'true';
}

// Helper function to reset onboarding (for testing)
export function resetOnboarding(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(ONBOARDING_STORAGE_KEY);
} 