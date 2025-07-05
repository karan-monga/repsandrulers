'use client';

import { useState } from 'react';
import { Calendar, Save, Camera } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { BodyDiagram } from './BodyDiagram';


interface AddMeasurementProps {
  onComplete: () => void;
}

export function AddMeasurement({ onComplete }: AddMeasurementProps) {
  const { userProfile, addMeasurement } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [measurements, setMeasurements] = useState({
    weight: '',
    height: '',
    chest: '',
    waist: '',
    hips: '',
    biceps: '',
    forearms: '',
    thighs: '',
    calves: '',
    left_thigh: '',
    right_thigh: '',
    left_calf: '',
    right_calf: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    setLoading(true);
    setError(null);
    try {
      const measurementData: any = {
        date: selectedDate,
        weight: Number(measurements.weight) || null,
        height: Number(measurements.height) || null,
        chest: Number(measurements.chest) || null,
        waist: Number(measurements.waist) || null,
        hips: Number(measurements.hips) || null,
        biceps: Number(measurements.biceps) || null,
        forearms: Number(measurements.forearms) || null,
        thighs: Number(measurements.thighs) || null,
        calves: Number(measurements.calves) || null,
        left_thigh: Number(measurements.left_thigh) || null,
        right_thigh: Number(measurements.right_thigh) || null,
        left_calf: Number(measurements.left_calf) || null,
        right_calf: Number(measurements.right_calf) || null,
      };

      await addMeasurement(measurementData);
      onComplete();
    } catch (error) {
      console.error('Error saving measurement:', error);
      setError(error instanceof Error ? error.message : 'Failed to save measurement');
    } finally {
      setLoading(false);
    }
  };

  const isStepComplete = (step: number) => {
    if (step === 1) {
      return measurements.weight !== '';
    }
    if (step === 2) {
      return Object.values(measurements).some(value => value !== '');
    }
    return true;
  };

  const steps = [
    { id: 1, title: 'Basic Info', description: 'Weight and date' },
    { id: 2, title: 'Body Measurements', description: 'Tape measurements' },
    { id: 3, title: 'Photos', description: 'Progress photos (optional)' },
  ];

  const getUnitLabel = (type: 'weight' | 'length') => {
    const unit = userProfile?.unit_preference || 'metric';
    return type === 'weight' ? (unit === 'metric' ? 'kg' : 'lbs') : (unit === 'metric' ? 'cm' : 'in');
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Add New Measurement</h1>
        <p className="text-gray-600 dark:text-gray-400">Track your progress with detailed body measurements</p>
      </div>

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
                currentStep >= step.id
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300'
              }`}>
                {step.id}
              </div>
              <div className="ml-3">
                <p className={`text-sm font-medium ${
                  currentStep >= step.id ? 'text-primary-600 dark:text-primary-400' : 'text-gray-500 dark:text-gray-400'
                }`}>
                  {step.title}
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500">{step.description}</p>
              </div>
              {index < steps.length - 1 && (
                <div className={`w-16 h-0.5 mx-4 ${
                  currentStep > step.id ? 'bg-primary-600' : 'bg-gray-200 dark:bg-gray-600'
                }`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg">
          <p className="text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left side - Form */}
        <div className="space-y-6">
          {currentStep === 1 && (
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Basic Information</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Measurement Date
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="input pl-10"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Weight ({getUnitLabel('weight')})
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={measurements.weight}
                    onChange={(e) => setMeasurements(prev => ({ ...prev, weight: e.target.value }))}
                    className="input"
                    placeholder={`Enter your weight in ${getUnitLabel('weight')}`}
                  />
                </div>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Body Measurements</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Height ({getUnitLabel('length')})
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={measurements.height}
                    onChange={(e) => setMeasurements(prev => ({ ...prev, height: e.target.value }))}
                    className="input"
                    placeholder="170"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Chest ({getUnitLabel('length')})
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={measurements.chest}
                    onChange={(e) => setMeasurements(prev => ({ ...prev, chest: e.target.value }))}
                    className="input"
                    placeholder="100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Waist ({getUnitLabel('length')})
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={measurements.waist}
                    onChange={(e) => setMeasurements(prev => ({ ...prev, waist: e.target.value }))}
                    className="input"
                    placeholder="80"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Hips ({getUnitLabel('length')})
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={measurements.hips}
                    onChange={(e) => setMeasurements(prev => ({ ...prev, hips: e.target.value }))}
                    className="input"
                    placeholder="95"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Biceps ({getUnitLabel('length')})
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={measurements.biceps}
                    onChange={(e) => setMeasurements(prev => ({ ...prev, biceps: e.target.value }))}
                    className="input"
                    placeholder="30"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Forearms ({getUnitLabel('length')})
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={measurements.forearms}
                    onChange={(e) => setMeasurements(prev => ({ ...prev, forearms: e.target.value }))}
                    className="input"
                    placeholder="25"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Thighs ({getUnitLabel('length')})
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={measurements.thighs}
                    onChange={(e) => setMeasurements(prev => ({ ...prev, thighs: e.target.value }))}
                    className="input"
                    placeholder="55"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Calves ({getUnitLabel('length')})
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={measurements.calves}
                    onChange={(e) => setMeasurements(prev => ({ ...prev, calves: e.target.value }))}
                    className="input"
                    placeholder="35"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Left Thigh ({getUnitLabel('length')})
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={measurements.left_thigh}
                    onChange={(e) => setMeasurements(prev => ({ ...prev, left_thigh: e.target.value }))}
                    className="input"
                    placeholder="55"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Right Thigh ({getUnitLabel('length')})
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={measurements.right_thigh}
                    onChange={(e) => setMeasurements(prev => ({ ...prev, right_thigh: e.target.value }))}
                    className="input"
                    placeholder="55"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Left Calf ({getUnitLabel('length')})
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={measurements.left_calf}
                    onChange={(e) => setMeasurements(prev => ({ ...prev, left_calf: e.target.value }))}
                    className="input"
                    placeholder="35"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Right Calf ({getUnitLabel('length')})
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={measurements.right_calf}
                    onChange={(e) => setMeasurements(prev => ({ ...prev, right_calf: e.target.value }))}
                    className="input"
                    placeholder="35"
                  />
                </div>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Progress Photos (Optional)</h3>
              <div className="text-center py-8">
                <Camera className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400">Photo capture feature coming soon!</p>
              </div>
            </div>
          )}

          <div className="flex justify-between">
            <button
              onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
              disabled={currentStep === 1}
              className="btn-secondary disabled:opacity-50"
            >
              Previous
            </button>
            
            <div className="flex space-x-3">
              {currentStep < 3 ? (
                <button
                  onClick={() => setCurrentStep(currentStep + 1)}
                  disabled={!isStepComplete(currentStep)}
                  className="btn-primary disabled:opacity-50"
                >
                  Next
                </button>
              ) : (
                <button
                  onClick={handleSave}
                  disabled={loading || !measurements.weight}
                  className="btn-primary disabled:opacity-50 flex items-center space-x-2"
                >
                  <Save className="w-4 h-4" />
                  <span>{loading ? 'Saving...' : 'Save Measurement'}</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Right side - Body Diagram */}
        <div className="lg:sticky lg:top-6">
          <BodyDiagram
            measurements={measurements}
            unitPreference={userProfile?.unit_preference || 'metric'}
          />
        </div>
      </div>
    </div>
  );
}