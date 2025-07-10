'use client';

import { useState } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Scale, 
  Activity, 
  Droplets, 
  Zap,
  Calendar,
  Filter,
  Download,
  Trash2
} from 'lucide-react';
import { useRenphoMeasurements, useRenphoStats, useLatestRenphoMeasurement, useClearAllRenphoData } from '@/hooks/useRenpho';
import { RenphoFilters } from '@/types/renpho';
import { RenphoImport } from './RenphoImport';
import { RenphoCharts } from './RenphoCharts';
import { RenphoDataTable } from './RenphoDataTable';
import { AIInsights } from './AIInsights';

export function RenphoDashboard() {
  const [activeTab, setActiveTab] = useState<'overview' | 'charts' | 'data' | 'import'>('overview');
  const [filters, setFilters] = useState<RenphoFilters>({});
  const [showFilters, setShowFilters] = useState(false);

  const { data: measurements = [], isLoading } = useRenphoMeasurements(filters);
  const { data: stats } = useRenphoStats(filters);
  const { data: latestMeasurement } = useLatestRenphoMeasurement();
  const clearAllMutation = useClearAllRenphoData();

  const handleClearAllData = async () => {
    if (confirm('Are you sure you want to delete all Renpho data? This action cannot be undone.')) {
      await clearAllMutation.mutateAsync();
    }
  };

  const getTrendIcon = (value: number) => {
    if (value > 0) return <TrendingUp className="w-4 h-4 text-green-500" />;
    if (value < 0) return <TrendingDown className="w-4 h-4 text-red-500" />;
    return <Activity className="w-4 h-4 text-gray-500" />;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const tabs = [
    { id: 'overview', name: 'Overview', icon: Activity },
    { id: 'charts', name: 'Charts', icon: TrendingUp },
    { id: 'data', name: 'Data Table', icon: Scale },
    { id: 'import', name: 'Import', icon: Download },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Renpho Data</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Body composition analytics from your Renpho smart scale
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="btn-secondary flex items-center space-x-2"
          >
            <Filter className="w-4 h-4" />
            <span>Filters</span>
          </button>
          
          {measurements.length > 0 && (
            <button
              onClick={handleClearAllData}
              disabled={clearAllMutation.isPending}
              className="btn-secondary text-red-600 hover:text-red-700 flex items-center space-x-2"
            >
              <Trash2 className="w-4 h-4" />
              <span>Clear All</span>
            </button>
          )}
        </div>
      </div>

      {/* Last Measurement Info */}
      {latestMeasurement && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span className="text-sm font-medium text-blue-800 dark:text-blue-300">
                Last measurement: {formatDate(latestMeasurement.time_of_measurement)}
              </span>
            </div>
            <div className="text-sm text-blue-600 dark:text-blue-400">
              {latestMeasurement.weight_lb.toFixed(1)} lb
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      {showFilters && (
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Filters</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Start Date
              </label>
              <input
                type="date"
                value={filters.dateRange?.start || ''}
                onChange={(e) => setFilters(prev => ({
                  ...prev,
                  dateRange: {
                    start: e.target.value || undefined,
                    end: prev.dateRange?.end || undefined
                  }
                }))}
                className="input"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                End Date
              </label>
              <input
                type="date"
                value={filters.dateRange?.end || ''}
                onChange={(e) => setFilters(prev => ({
                  ...prev,
                  dateRange: {
                    start: prev.dateRange?.start || undefined,
                    end: e.target.value || undefined
                  }
                }))}
                className="input"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Min Weight (lb)
              </label>
              <input
                type="number"
                value={filters.minWeight || ''}
                onChange={(e) => setFilters(prev => ({
                  ...prev,
                  minWeight: e.target.value ? parseFloat(e.target.value) : undefined
                }))}
                className="input"
                placeholder="0"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Max Weight (lb)
              </label>
              <input
                type="number"
                value={filters.maxWeight || ''}
                onChange={(e) => setFilters(prev => ({
                  ...prev,
                  maxWeight: e.target.value ? parseFloat(e.target.value) : undefined
                }))}
                className="input"
                placeholder="500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Min Body Fat (%)
              </label>
              <input
                type="number"
                value={filters.minBodyFat || ''}
                onChange={(e) => setFilters(prev => ({
                  ...prev,
                  minBodyFat: e.target.value ? parseFloat(e.target.value) : undefined
                }))}
                className="input"
                placeholder="0"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Max Body Fat (%)
              </label>
              <input
                type="number"
                value={filters.maxBodyFat || ''}
                onChange={(e) => setFilters(prev => ({
                  ...prev,
                  maxBodyFat: e.target.value ? parseFloat(e.target.value) : undefined
                }))}
                className="input"
                placeholder="50"
              />
            </div>
          </div>
          
          <div className="flex justify-end mt-4">
            <button
              onClick={() => setFilters({})}
              className="btn-secondary"
            >
              Clear Filters
            </button>
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 dark:border-[#2e2e2e]">
        <nav className="flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.name}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Stats Cards */}
            {stats && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="card">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Weight</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {stats.averages.weight_lb.toFixed(1)} lb
                      </p>
                    </div>
                    <div className="bg-blue-100 dark:bg-blue-900/20 p-3 rounded-lg">
                      <Scale className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                  </div>
                  <div className="flex items-center space-x-1 mt-2">
                    {getTrendIcon(stats.trends.weight_lb)}
                    <span className={`text-sm ${
                      stats.trends.weight_lb > 0 ? 'text-green-600' : 
                      stats.trends.weight_lb < 0 ? 'text-red-600' : 'text-gray-500'
                    }`}>
                      {Math.abs(stats.trends.weight_lb).toFixed(1)} lb
                    </span>
                  </div>
                </div>

                <div className="card">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Body Fat</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {stats.averages.body_fat_percent.toFixed(1)}%
                      </p>
                    </div>
                    <div className="bg-red-100 dark:bg-red-900/20 p-3 rounded-lg">
                      <Activity className="w-6 h-6 text-red-600 dark:text-red-400" />
                    </div>
                  </div>
                  <div className="flex items-center space-x-1 mt-2">
                    {getTrendIcon(stats.trends.body_fat_percent)}
                    <span className={`text-sm ${
                      stats.trends.body_fat_percent > 0 ? 'text-red-600' : 
                      stats.trends.body_fat_percent < 0 ? 'text-green-600' : 'text-gray-500'
                    }`}>
                      {Math.abs(stats.trends.body_fat_percent).toFixed(1)}%
                    </span>
                  </div>
                </div>

                <div className="card">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Muscle Mass</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {stats.averages.muscle_mass_lb.toFixed(1)} lb
                      </p>
                    </div>
                    <div className="bg-green-100 dark:bg-green-900/20 p-3 rounded-lg">
                      <Zap className="w-6 h-6 text-green-600 dark:text-green-400" />
                    </div>
                  </div>
                  <div className="flex items-center space-x-1 mt-2">
                    {getTrendIcon(stats.trends.muscle_mass_lb)}
                    <span className={`text-sm ${
                      stats.trends.muscle_mass_lb > 0 ? 'text-green-600' : 
                      stats.trends.muscle_mass_lb < 0 ? 'text-red-600' : 'text-gray-500'
                    }`}>
                      {Math.abs(stats.trends.muscle_mass_lb).toFixed(1)} lb
                    </span>
                  </div>
                </div>

                <div className="card">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Body Water</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {stats.averages.body_water_percent.toFixed(1)}%
                      </p>
                    </div>
                    <div className="bg-blue-100 dark:bg-blue-900/20 p-3 rounded-lg">
                      <Droplets className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Summary Stats */}
            {stats && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="card">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Summary</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Total Measurements</span>
                      <span className="font-medium text-gray-900 dark:text-white">{stats.totalMeasurements}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Date Range</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {stats.dateRange.first ? new Date(stats.dateRange.first).toLocaleDateString() : 'N/A'} - {stats.dateRange.last ? new Date(stats.dateRange.last).toLocaleDateString() : 'N/A'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Average BMI</span>
                      <span className="font-medium text-gray-900 dark:text-white">{stats.averages.bmi.toFixed(1)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">BMR</span>
                      <span className="font-medium text-gray-900 dark:text-white">{Math.round(stats.averages.bmr_kcal)} kcal</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Metabolic Age</span>
                      <span className="font-medium text-gray-900 dark:text-white">{Math.round(stats.averages.metabolic_age)}</span>
                    </div>
                  </div>
                </div>

                <div className="card">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Body Composition</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Fat-free Weight</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {stats.averages.fat_free_body_weight_lb?.toFixed(1) || 'N/A'} lb
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Subcutaneous Fat</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {stats.averages.subcutaneous_fat_percent?.toFixed(1) || 'N/A'}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Visceral Fat</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {stats.averages.visceral_fat?.toFixed(1) || 'N/A'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Skeletal Muscle</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {stats.averages.skeletal_muscle_percent?.toFixed(1) || 'N/A'}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Bone Mass</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {stats.averages.bone_mass_lb?.toFixed(1) || 'N/A'} lb
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Protein</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {stats.averages.protein_percent?.toFixed(1) || 'N/A'}%
                      </span>
                    </div>
                  </div>
                </div>

                <div className="card">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Trends</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 dark:text-gray-400">Weight Change</span>
                      <div className="flex items-center space-x-1">
                        {getTrendIcon(stats.trends.weight_lb)}
                        <span className={`font-medium ${
                          stats.trends.weight_lb > 0 ? 'text-red-600' : 
                          stats.trends.weight_lb < 0 ? 'text-green-600' : 'text-gray-500'
                        }`}>
                          {stats.trends.weight_lb > 0 ? '+' : ''}{stats.trends.weight_lb.toFixed(1)} lb
                        </span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 dark:text-gray-400">Body Fat Change</span>
                      <div className="flex items-center space-x-1">
                        {getTrendIcon(stats.trends.body_fat_percent)}
                        <span className={`font-medium ${
                          stats.trends.body_fat_percent > 0 ? 'text-red-600' : 
                          stats.trends.body_fat_percent < 0 ? 'text-green-600' : 'text-gray-500'
                        }`}>
                          {stats.trends.body_fat_percent > 0 ? '+' : ''}{stats.trends.body_fat_percent.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 dark:text-gray-400">Muscle Mass Change</span>
                      <div className="flex items-center space-x-1">
                        {getTrendIcon(stats.trends.muscle_mass_lb)}
                        <span className={`font-medium ${
                          stats.trends.muscle_mass_lb > 0 ? 'text-green-600' : 
                          stats.trends.muscle_mass_lb < 0 ? 'text-red-600' : 'text-gray-500'
                        }`}>
                          {stats.trends.muscle_mass_lb > 0 ? '+' : ''}{stats.trends.muscle_mass_lb.toFixed(1)} lb
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Quick Charts */}
            {measurements.length > 0 && (
              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Overview</h3>
                <RenphoCharts measurements={measurements} />
              </div>
            )}

            {/* AI Progress Insights */}
            <AIInsights measurements={measurements} stats={stats || null} />
          </div>
        )}

        {activeTab === 'charts' && (
          <RenphoCharts measurements={measurements} />
        )}

        {activeTab === 'data' && (
          <RenphoDataTable measurements={measurements} isLoading={isLoading} />
        )}

        {activeTab === 'import' && (
          <RenphoImport />
        )}
      </div>
    </div>
  );
} 