'use client';

import { Scale, TrendingUp, Plus } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { formatMeasurement, calculateBMI, getBMICategory } from '@/lib/calculations';
import { WeightGoalComponent } from '@/components/goals/WeightGoal';

interface DashboardContentProps {
  onAddMeasurement: () => void;
}

export function DashboardContent({ onAddMeasurement }: DashboardContentProps) {
  const { userProfile, measurements } = useAuth();

  // Sort measurements by date (newest first)
  const sortedMeasurements = [...measurements].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  // Get latest measurements from actual data
  const latestMeasurement = sortedMeasurements[0];
  const previousMeasurement = sortedMeasurements[1];

  const recentProgress = latestMeasurement && previousMeasurement ? [
    { 
      metric: 'Weight', 
      value: (latestMeasurement.weight || 0) - (previousMeasurement.weight || 0), 
      unit: userProfile?.unit_preference === 'metric' ? 'kg' : 'lbs', 
      trend: (latestMeasurement.weight || 0) > (previousMeasurement.weight || 0) ? 'up' : 'down' 
    },
    { 
      metric: 'Waist', 
      value: (latestMeasurement.waist && previousMeasurement.waist) ?
        (latestMeasurement.waist - previousMeasurement.waist) : 0, 
      unit: userProfile?.unit_preference === 'metric' ? 'cm' : 'in', 
      trend: (latestMeasurement.waist && previousMeasurement.waist) &&
        latestMeasurement.waist > previousMeasurement.waist ? 'up' : 'down' 
    },
    { 
      metric: 'Chest', 
      value: (latestMeasurement.chest && previousMeasurement.chest) ?
        (latestMeasurement.chest - previousMeasurement.chest) : 0, 
      unit: userProfile?.unit_preference === 'metric' ? 'cm' : 'in', 
      trend: (latestMeasurement.chest && previousMeasurement.chest) &&
        latestMeasurement.chest > previousMeasurement.chest ? 'up' : 'down' 
    },
  ] : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400">Track your fitness progress</p>
        </div>
        <button
          onClick={onAddMeasurement}
          className="btn-primary flex items-center space-x-2"
          data-tour="add-measurement"
        >
          <Plus className="w-4 h-4" />
          <span>Add Measurement</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Current Weight</h3>
            <div className="bg-primary-100 dark:bg-primary-900/20 p-2 rounded-lg">
              <Scale className="w-5 h-5 text-primary-600 dark:text-primary-400" />
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {latestMeasurement && latestMeasurement.weight ? 
                formatMeasurement(latestMeasurement.weight, userProfile?.unit_preference || 'metric', 'weight') :
                'No data'
              }
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {latestMeasurement ? 
                `Last measured: ${new Date(latestMeasurement.date).toLocaleDateString()}` :
                'Add your first measurement'
              }
            </p>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">BMI</h3>
            <div className="bg-green-100 dark:bg-green-900/20 p-2 rounded-lg">
              <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <div className="space-y-2">
            {latestMeasurement?.weight && latestMeasurement?.height ? (
              <>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {calculateBMI(latestMeasurement.weight, latestMeasurement.height)}
                </p>
                <p className={`text-sm font-medium ${getBMICategory(calculateBMI(latestMeasurement.weight, latestMeasurement.height)).color}`}>
                  {getBMICategory(calculateBMI(latestMeasurement.weight, latestMeasurement.height)).category}
                </p>
              </>
            ) : (
              <>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">N/A</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                  Add weight & height
                </p>
              </>
            )}
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Total Entries</h3>
            <div className="bg-blue-100 dark:bg-blue-900/20 p-2 rounded-lg">
              <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {measurements.length}
            </p>
            <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">
              {measurements.length > 0 ? 'Keep it up!' : 'Start tracking'}
            </p>
          </div>
        </div>
      </div>

      {/* Weight Goal */}
      <WeightGoalComponent />

      {/* Recent Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Progress</h3>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {measurements.length > 1 ? 'Latest vs Previous' : 'Need more data'}
            </span>
          </div>
          <div className="space-y-3">
            {recentProgress.length > 0 ? recentProgress.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-[#262626] rounded-lg">
                <span className="font-medium text-gray-900 dark:text-white">{item.metric}</span>
                <div className="flex items-center space-x-2">
                  <span className={`text-sm font-medium ${
                    item.trend === 'up' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                  }`}>
                    {item.trend === 'up' ? '+' : ''}{item.value.toFixed(1)} {item.unit}
                  </span>
                  <TrendingUp className={`w-4 h-4 ${
                    item.trend === 'up' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400 transform rotate-180'
                  }`} />
                </div>
              </div>
            )) : (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <TrendingUp className="w-8 h-8 mx-auto mb-2 text-gray-300 dark:text-gray-600" />
                <p>Add more measurements to see progress</p>
              </div>
            )}
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Quick Stats</h3>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-[#262626] rounded-lg">
              <span className="text-gray-600 dark:text-gray-300">Average Weight</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {measurements.length > 0 ? 
                  formatMeasurement(
                    measurements.reduce((sum, m) => sum + (m.weight || 0), 0) / measurements.length,
                    userProfile?.unit_preference || 'metric',
                    'weight'
                  ) : 'N/A'
                }
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-[#262626] rounded-lg">
              <span className="text-gray-600 dark:text-gray-300">Measurement Streak</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {measurements.length > 0 ? `${measurements.length} entries` : '0 entries'}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-[#262626] rounded-lg">
              <span className="text-gray-600 dark:text-gray-300">Days Since Last</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {latestMeasurement ? 
                  Math.floor((Date.now() - new Date(latestMeasurement.date).getTime()) / (1000 * 60 * 60 * 24))
                  : 'N/A'
                } days
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Measurements */}
      {measurements.length > 0 && (
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Measurements</h3>
          <div className="space-y-3">
            {sortedMeasurements.slice(0, 3).map((measurement) => (
              <div key={measurement.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-[#262626] rounded-lg">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {new Date(measurement.date).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Weight: {measurement.weight ? formatMeasurement(measurement.weight, userProfile?.unit_preference || 'metric', 'weight') : 'N/A'}
                    {measurement.waist && ` • Waist: ${formatMeasurement(measurement.waist, userProfile?.unit_preference || 'metric', 'length')}`}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    Height: {measurement.height ? formatMeasurement(measurement.height, userProfile?.unit_preference || 'metric', 'length') : 'N/A'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}