'use client';

import { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { RenphoMeasurement } from '@/types/renpho';

interface RenphoChartsProps {
  measurements: RenphoMeasurement[];
}

const chartTypes = [
  { id: 'weight', name: 'Weight', color: '#3B82F6' },
  { id: 'bodyFat', name: 'Body Fat %', color: '#EF4444' },
  { id: 'muscleMass', name: 'Muscle Mass', color: '#10B981' },
  { id: 'bodyWater', name: 'Body Water %', color: '#06B6D4' },
  { id: 'bmi', name: 'BMI', color: '#8B5CF6' },
  { id: 'bmr', name: 'BMR', color: '#F59E0B' },
];

export function RenphoCharts({ measurements }: RenphoChartsProps) {
  const [selectedChart, setSelectedChart] = useState('weight');
  const [chartType, setChartType] = useState<'line' | 'bar'>('line');

  // Prepare data for charts
  const chartData = measurements.map(measurement => ({
    date: new Date(measurement.time_of_measurement).toLocaleDateString(),
    timestamp: new Date(measurement.time_of_measurement).getTime(),
    weight: measurement.weight_lb,
    bodyFat: measurement.body_fat_percent,
    muscleMass: measurement.muscle_mass_lb,
    bodyWater: measurement.body_water_percent,
    bmi: measurement.bmi,
    bmr: measurement.bmr_kcal,
    visceralFat: measurement.visceral_fat,
    boneMass: measurement.bone_mass_lb,
    protein: measurement.protein_percent,
    metabolicAge: measurement.metabolic_age,
  })).sort((a, b) => a.timestamp - b.timestamp);

  // Calculate body composition breakdown for pie chart
  const latestMeasurement = measurements[0];
  const bodyCompositionData = latestMeasurement ? [
    { name: 'Muscle Mass', value: latestMeasurement.muscle_mass_lb || 0, color: '#10B981' },
    { name: 'Body Fat', value: latestMeasurement.weight_lb * (latestMeasurement.body_fat_percent || 0) / 100, color: '#EF4444' },
    { name: 'Bone Mass', value: latestMeasurement.bone_mass_lb || 0, color: '#8B5CF6' },
    { name: 'Other', value: latestMeasurement.weight_lb - (latestMeasurement.muscle_mass_lb || 0) - (latestMeasurement.weight_lb * (latestMeasurement.body_fat_percent || 0) / 100) - (latestMeasurement.bone_mass_lb || 0), color: '#6B7280' },
  ].filter(item => item.value > 0) : [];

  const getChartData = () => {
    switch (selectedChart) {
      case 'weight':
        return chartData.map(d => ({ date: d.date, value: d.weight, label: 'Weight (lb)' }));
      case 'bodyFat':
        return chartData.map(d => ({ date: d.date, value: d.bodyFat, label: 'Body Fat (%)' }));
      case 'muscleMass':
        return chartData.map(d => ({ date: d.date, value: d.muscleMass, label: 'Muscle Mass (lb)' }));
      case 'bodyWater':
        return chartData.map(d => ({ date: d.date, value: d.bodyWater, label: 'Body Water (%)' }));
      case 'bmi':
        return chartData.map(d => ({ date: d.date, value: d.bmi, label: 'BMI' }));
      case 'bmr':
        return chartData.map(d => ({ date: d.date, value: d.bmr, label: 'BMR (kcal)' }));
      default:
        return chartData.map(d => ({ date: d.date, value: d.weight, label: 'Weight (lb)' }));
    }
  };

  const currentChartData = getChartData();
  const selectedChartConfig = chartTypes.find(chart => chart.id === selectedChart);

  if (measurements.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 dark:text-gray-400">No data available for charts</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Chart Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          {chartTypes.map((chart) => (
            <button
              key={chart.id}
              onClick={() => setSelectedChart(chart.id)}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                selectedChart === chart.id
                  ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/20 dark:text-primary-300'
                  : 'bg-gray-100 text-gray-700 dark:bg-[#262626] dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-[#2e2e2e]'
              }`}
            >
              {chart.name}
            </button>
          ))}
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={() => setChartType('line')}
            className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
              chartType === 'line'
                ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/20 dark:text-primary-300'
                : 'bg-gray-100 text-gray-700 dark:bg-[#262626] dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-[#2e2e2e]'
            }`}
          >
            Line
          </button>
          <button
            onClick={() => setChartType('bar')}
            className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
              chartType === 'bar'
                ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/20 dark:text-primary-300'
                : 'bg-gray-100 text-gray-700 dark:bg-[#262626] dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-[#2e2e2e]'
            }`}
          >
            Bar
          </button>
        </div>
      </div>

      {/* Main Chart */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          {selectedChartConfig?.name} Over Time
        </h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            {chartType === 'line' ? (
              <LineChart data={currentChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  dataKey="date" 
                  stroke="#9CA3AF"
                  fontSize={12}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis stroke="#9CA3AF" fontSize={12} />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: '#1F2937',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#F9FAFB'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke={selectedChartConfig?.color || '#3B82F6'} 
                  strokeWidth={2}
                  dot={{ fill: selectedChartConfig?.color || '#3B82F6', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: selectedChartConfig?.color || '#3B82F6', strokeWidth: 2 }}
                />
              </LineChart>
            ) : (
              <BarChart data={currentChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  dataKey="date" 
                  stroke="#9CA3AF"
                  fontSize={12}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis stroke="#9CA3AF" fontSize={12} />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: '#1F2937',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#F9FAFB'
                  }}
                />
                <Bar 
                  dataKey="value" 
                  fill={selectedChartConfig?.color || '#3B82F6'}
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>

      {/* Body Composition Pie Chart */}
      {bodyCompositionData.length > 0 && (
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Body Composition Breakdown
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={bodyCompositionData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {bodyCompositionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{
                    backgroundColor: '#1F2937',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#F9FAFB'
                  }}
                  formatter={(value: number) => [`${value.toFixed(1)} lb`, 'Weight']}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Multiple Metrics Chart */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Key Metrics Comparison
        </h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="date" 
                stroke="#9CA3AF"
                fontSize={12}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis stroke="#9CA3AF" fontSize={12} />
              <Tooltip 
                contentStyle={{
                  backgroundColor: '#1F2937',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#F9FAFB'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="weight" 
                stroke="#3B82F6" 
                strokeWidth={2}
                name="Weight (lb)"
                dot={false}
              />
              <Line 
                type="monotone" 
                dataKey="bodyFat" 
                stroke="#EF4444" 
                strokeWidth={2}
                name="Body Fat (%)"
                dot={false}
              />
              <Line 
                type="monotone" 
                dataKey="muscleMass" 
                stroke="#10B981" 
                strokeWidth={2}
                name="Muscle Mass (lb)"
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
} 