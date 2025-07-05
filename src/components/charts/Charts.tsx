'use client';

import { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { TrendingUp, BarChart3, LineChart as LineChartIcon } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { subDays, subMonths, subYears, isAfter } from 'date-fns';

const metrics = [
  { id: 'weight', label: 'Weight', color: '#14b8a6', unit: 'kg', path: 'weight' },
  { id: 'waist', label: 'Waist', color: '#f59e0b', unit: 'cm', path: 'measurements.waist' },
  { id: 'chest', label: 'Chest', color: '#8b5cf6', unit: 'cm', path: 'measurements.chest' },
  { id: 'neck', label: 'Neck', color: '#06b6d4', unit: 'cm', path: 'measurements.neck' },
];

const dateRanges = [
  { id: '15d', label: '15 days' },
  { id: '1m', label: '1 month' },
  { id: '1y', label: '1 year' },
  { id: 'all', label: 'All time' },
];

export function Charts() {
  const { measurements, userProfile } = useAuth();
  const [selectedMetric, setSelectedMetric] = useState('weight');
  const [chartType, setChartType] = useState<'line' | 'bar'>('line');
  const [dateRange, setDateRange] = useState('1m');

  // Sort measurements by date (newest first)
  const sortedMeasurements = [...measurements].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  // Filter data based on date range
  const getFilteredData = () => {
    if (!sortedMeasurements.length) return [];

    let cutoffDate: Date;
    const now = new Date();

    switch (dateRange) {
      case '15d':
        cutoffDate = subDays(now, 15);
        break;
      case '1m':
        cutoffDate = subMonths(now, 1);
        break;
      case '1y':
        cutoffDate = subYears(now, 1);
        break;
      default:
        return sortedMeasurements;
    }

    return sortedMeasurements.filter(measurement => 
      isAfter(new Date(measurement.date), cutoffDate)
    );
  };

  const filteredData = getFilteredData();
  const currentMetric = metrics.find(m => m.id === selectedMetric);
  
  // Get value from nested path
  const getValue = (obj: any, path: string) => {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  };

  const latestValue = filteredData.length > 0 ? getValue(filteredData[0], currentMetric?.path || '') : null;
  const previousValue = filteredData.length > 1 ? getValue(filteredData[1], currentMetric?.path || '') : null;
  const change = latestValue && previousValue ? Number(latestValue) - Number(previousValue) : 0;
  const changePercentage = previousValue ? Math.abs((change / Number(previousValue)) * 100) : 0;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // Prepare chart data
  const chartData = filteredData
    .slice()
    .reverse()
    .map(measurement => ({
      date: measurement.date,
      [selectedMetric]: getValue(measurement, currentMetric?.path || ''),
    }))
    .filter(item => item[selectedMetric] != null);

  const getUnitLabel = () => {
    const unit = userProfile?.unit_preference || 'metric';
    if (selectedMetric === 'weight') {
      return unit === 'metric' ? 'kg' : 'lbs';
    } else {
      return unit === 'metric' ? 'cm' : 'in';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Progress Charts</h1>
          <p className="text-gray-600 dark:text-gray-400">Visualize your fitness journey</p>
        </div>
      </div>

      {measurements.length === 0 ? (
        <div className="card">
          <div className="text-center py-12">
            <TrendingUp className="w-12 h-12 text-gray-300 dark:text-gray-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Data Available</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">Add your first measurement to start tracking progress</p>
          </div>
        </div>
      ) : (
        <>
          {/* Controls */}
          <div className="card">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex flex-wrap items-center gap-4">
                {/* Metric Selector */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Metric</label>
                  <select
                    value={selectedMetric}
                    onChange={(e) => setSelectedMetric(e.target.value)}
                    className="input w-32"
                  >
                    {metrics.map(metric => (
                      <option key={metric.id} value={metric.id}>
                        {metric.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Chart Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Chart Type</label>
                  <div className="flex bg-gray-100 dark:bg-[#262626] rounded-lg p-1">
                    <button
                      onClick={() => setChartType('line')}
                      className={`p-2 rounded-md flex items-center space-x-1 text-sm font-medium transition-colors ${
                        chartType === 'line'
                          ? 'bg-white dark:bg-[#171717] text-gray-900 dark:text-white shadow-sm'
                          : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                      }`}
                    >
                      <LineChartIcon className="w-4 h-4" />
                      <span>Line</span>
                    </button>
                    <button
                      onClick={() => setChartType('bar')}
                      className={`p-2 rounded-md flex items-center space-x-1 text-sm font-medium transition-colors ${
                        chartType === 'bar'
                          ? 'bg-white dark:bg-[#171717] text-gray-900 dark:text-white shadow-sm'
                          : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                      }`}
                    >
                      <BarChart3 className="w-4 h-4" />
                      <span>Bar</span>
                    </button>
                  </div>
                </div>

                {/* Date Range */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Time Range</label>
                  <select
                    value={dateRange}
                    onChange={(e) => setDateRange(e.target.value)}
                    className="input w-32"
                  >
                    {dateRanges.map(range => (
                      <option key={range.id} value={range.id}>
                        {range.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Chart */}
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {currentMetric?.label} Progress
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {dateRange === 'all' ? 'All time' : `Last ${dateRanges.find(r => r.id === dateRange)?.label}`}
                </p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {latestValue ? `${latestValue.toFixed(1)} ${getUnitLabel()}` : 'N/A'}
                </p>
                {change !== 0 && (
                  <p className={`text-sm font-medium ${
                    change > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                  }`}>
                    {change > 0 ? '+' : ''}{change.toFixed(1)} {getUnitLabel()} ({changePercentage.toFixed(1)}%)
                  </p>
                )}
              </div>
            </div>

            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                {chartType === 'line' ? (
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={formatDate}
                      tick={{ fontSize: 12 }}
                    />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip 
                      labelFormatter={formatDate}
                      formatter={(value: any) => [`${value} ${getUnitLabel()}`, currentMetric?.label]}
                    />
                    <Line
                      type="monotone"
                      dataKey={selectedMetric}
                      stroke={currentMetric?.color}
                      strokeWidth={3}
                      dot={{ fill: currentMetric?.color, strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6, stroke: currentMetric?.color, strokeWidth: 2 }}
                    />
                  </LineChart>
                ) : (
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={formatDate}
                      tick={{ fontSize: 12 }}
                    />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip 
                      labelFormatter={formatDate}
                      formatter={(value: any) => [`${value} ${getUnitLabel()}`, currentMetric?.label]}
                    />
                    <Bar
                      dataKey={selectedMetric}
                      fill={currentMetric?.color}
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                )}
              </ResponsiveContainer>
            </div>
          </div>

          {/* Goals */}
          <div className="card">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Goals</h3>
            <div className="space-y-3">
              <div className="bg-gray-50 dark:bg-[#262626] p-3 rounded-lg">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-gray-600 dark:text-gray-300">Target Weight</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {userProfile?.unit_preference === 'metric' ? '72.0 kg' : '158.7 lbs'}
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                  <div
                    className="bg-primary-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: '75%' }}
                  />
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">75% complete</p>
              </div>
              <div className="bg-gray-50 dark:bg-[#262626] p-3 rounded-lg">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-gray-600 dark:text-gray-300">Target Waist</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {userProfile?.unit_preference === 'metric' ? '80.0 cm' : '31.5 in'}
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                  <div
                    className="bg-primary-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: '60%' }}
                  />
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">60% complete</p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}