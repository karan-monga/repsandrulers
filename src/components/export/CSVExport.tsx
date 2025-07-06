'use client';

import { useState } from 'react';
import { Download, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { formatMeasurement } from '@/lib/calculations';

interface ExportOptions {
  includeAllMeasurements: boolean;
  dateRange: {
    start: string;
    end: string;
  };
  format: 'metric' | 'imperial' | 'both';
  includeCalculatedFields: boolean;
}

export function CSVExport() {
  const { measurements, userProfile } = useAuth();
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    includeAllMeasurements: true,
    dateRange: {
      start: '',
      end: ''
    },
    format: 'both',
    includeCalculatedFields: true
  });
  const [isExporting, setIsExporting] = useState(false);
  const [exportStatus, setExportStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const getFilteredMeasurements = () => {
    let filtered = [...measurements];

    // Filter by date range if specified
    if (exportOptions.dateRange.start && exportOptions.dateRange.end) {
      filtered = filtered.filter(measurement => {
        const measurementDate = new Date(measurement.date);
        const startDate = new Date(exportOptions.dateRange.start);
        const endDate = new Date(exportOptions.dateRange.end);
        return measurementDate >= startDate && measurementDate <= endDate;
      });
    }

    // Sort by date (newest first)
    return filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };

  const calculateBMI = (weight: number, height: number): number => {
    if (!height || height <= 0) return 0;
    const heightInM = height / 100;
    return Number((weight / (heightInM * heightInM)).toFixed(1));
  };

  const getBMICategory = (bmi: number): string => {
    if (bmi < 18.5) return 'Underweight';
    if (bmi < 25) return 'Normal';
    if (bmi < 30) return 'Overweight';
    return 'Obese';
  };

  const convertToCSV = (data: any[]): string => {
    if (data.length === 0) return '';

    const headers = Object.keys(data[0]);
    const csvRows = [
      headers.join(','),
      ...data.map(row => 
        headers.map(header => {
          const value = row[header];
          // Escape commas and quotes in the value
          const escapedValue = String(value).replace(/"/g, '""');
          return `"${escapedValue}"`;
        }).join(',')
      )
    ];

    return csvRows.join('\n');
  };

  const generateCSVData = () => {
    const filteredMeasurements = getFilteredMeasurements();
    const unitPreference = userProfile?.unit_preference || 'metric';

    return filteredMeasurements.map(measurement => {
      const baseData: any = {
        Date: measurement.date,
        Weight: measurement.weight ? formatMeasurement(measurement.weight, unitPreference, 'weight') : '',
        Height: measurement.height ? formatMeasurement(measurement.height, unitPreference, 'length') : '',
        Chest: measurement.chest ? formatMeasurement(measurement.chest, unitPreference, 'length') : '',
        Waist: measurement.waist ? formatMeasurement(measurement.waist, unitPreference, 'length') : '',
        Hips: measurement.hips ? formatMeasurement(measurement.hips, unitPreference, 'length') : '',
        'Left Bicep': measurement.left_thigh ? formatMeasurement(measurement.left_thigh, unitPreference, 'length') : '',
        'Right Bicep': measurement.right_thigh ? formatMeasurement(measurement.right_thigh, unitPreference, 'length') : '',
        'Left Thigh': measurement.left_thigh ? formatMeasurement(measurement.left_thigh, unitPreference, 'length') : '',
        'Right Thigh': measurement.right_thigh ? formatMeasurement(measurement.right_thigh, unitPreference, 'length') : '',
        'Left Calf': measurement.left_calf ? formatMeasurement(measurement.left_calf, unitPreference, 'length') : '',
        'Right Calf': measurement.right_calf ? formatMeasurement(measurement.right_calf, unitPreference, 'length') : '',
        Biceps: measurement.biceps ? formatMeasurement(measurement.biceps, unitPreference, 'length') : '',
        Forearms: measurement.forearms ? formatMeasurement(measurement.forearms, unitPreference, 'length') : '',
        Thighs: measurement.thighs ? formatMeasurement(measurement.thighs, unitPreference, 'length') : '',
        Calves: measurement.calves ? formatMeasurement(measurement.calves, unitPreference, 'length') : '',
      };

      // Add calculated fields if enabled
      if (exportOptions.includeCalculatedFields && measurement.weight && measurement.height) {
        const bmi = calculateBMI(measurement.weight, measurement.height);
        baseData.BMI = bmi.toFixed(1);
        baseData['BMI Category'] = getBMICategory(bmi);
      }

      // Add both metric and imperial if format is 'both'
      if (exportOptions.format === 'both') {
        if (measurement.weight) {
          baseData['Weight (kg)'] = measurement.weight.toFixed(1);
          baseData['Weight (lbs)'] = (measurement.weight * 2.20462).toFixed(1);
        }
        if (measurement.height) {
          baseData['Height (cm)'] = measurement.height.toFixed(1);
          baseData['Height (in)'] = (measurement.height / 2.54).toFixed(1);
        }
      }

      return baseData;
    });
  };

  const downloadCSV = async () => {
    setIsExporting(true);
    setExportStatus('idle');

    try {
      const csvData = generateCSVData();
      
      if (csvData.length === 0) {
        setExportStatus('error');
        return;
      }

      const csv = convertToCSV(csvData);
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      
      const filename = `fitness-data-${new Date().toISOString().split('T')[0]}.csv`;
      link.href = URL.createObjectURL(blob);
      link.download = filename;
      link.click();
      
      URL.revokeObjectURL(link.href);
      setExportStatus('success');
    } catch (error) {
      console.error('Export error:', error);
      setExportStatus('error');
    } finally {
      setIsExporting(false);
    }
  };

  const getExportSummary = () => {
    const filteredMeasurements = getFilteredMeasurements();
    const totalMeasurements = measurements.length;
    const exportedMeasurements = filteredMeasurements.length;
    
    return {
      total: totalMeasurements,
      exported: exportedMeasurements,
      dateRange: exportOptions.dateRange.start && exportOptions.dateRange.end
    };
  };

  const summary = getExportSummary();

  return (
    <div className="space-y-6">
      <div className="card">
        <div className="flex items-center space-x-3 mb-4">
          <div className="bg-blue-100 dark:bg-blue-900/20 p-2 rounded-lg">
            <Download className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Export Data</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Download your fitness data as a CSV file
            </p>
          </div>
        </div>

        {/* Export Summary */}
        <div className="bg-gray-50 dark:bg-[#262626] rounded-lg p-4 mb-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-gray-600 dark:text-gray-400">Total Measurements</p>
              <p className="font-semibold text-gray-900 dark:text-white">{summary.total}</p>
            </div>
            <div>
              <p className="text-gray-600 dark:text-gray-400">To Export</p>
              <p className="font-semibold text-gray-900 dark:text-white">{summary.exported}</p>
            </div>
            <div>
              <p className="text-gray-600 dark:text-gray-400">Date Range</p>
              <p className="font-semibold text-gray-900 dark:text-white">
                {summary.dateRange ? 'Custom' : 'All'}
              </p>
            </div>
            <div>
              <p className="text-gray-600 dark:text-gray-400">Format</p>
              <p className="font-semibold text-gray-900 dark:text-white capitalize">
                {exportOptions.format}
              </p>
            </div>
          </div>
        </div>

        {/* Export Options */}
        <div className="space-y-4">
          {/* Date Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Date Range (Optional)
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <input
                  type="date"
                  value={exportOptions.dateRange.start}
                  onChange={(e) => setExportOptions(prev => ({
                    ...prev,
                    dateRange: { ...prev.dateRange, start: e.target.value }
                  }))}
                  className="input"
                  placeholder="Start date"
                />
              </div>
              <div>
                <input
                  type="date"
                  value={exportOptions.dateRange.end}
                  onChange={(e) => setExportOptions(prev => ({
                    ...prev,
                    dateRange: { ...prev.dateRange, end: e.target.value }
                  }))}
                  className="input"
                  placeholder="End date"
                />
              </div>
            </div>
          </div>

          {/* Format Options */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Export Format
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {[
                { value: 'metric', label: 'Metric Only' },
                { value: 'imperial', label: 'Imperial Only' },
                { value: 'both', label: 'Both Units' }
              ].map((option) => (
                <label key={option.value} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="format"
                    value={option.value}
                    checked={exportOptions.format === option.value}
                    onChange={(e) => setExportOptions(prev => ({
                      ...prev,
                      format: e.target.value as 'metric' | 'imperial' | 'both'
                    }))}
                    className="text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">{option.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Additional Options */}
          <div>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={exportOptions.includeCalculatedFields}
                onChange={(e) => setExportOptions(prev => ({
                  ...prev,
                  includeCalculatedFields: e.target.checked
                }))}
                className="text-primary-600 focus:ring-primary-500"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Include calculated fields (BMI, BMI Category)
              </span>
            </label>
          </div>
        </div>

        {/* Export Button */}
        <div className="mt-6">
          <button
            onClick={downloadCSV}
            disabled={isExporting || summary.exported === 0}
            className="btn-primary w-full flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            {isExporting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Exporting...</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>Export CSV ({summary.exported} measurements)</span>
              </>
            )}
          </button>
        </div>

        {/* Status Messages */}
        {exportStatus === 'success' && (
          <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-center space-x-2">
            <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
            <span className="text-sm text-green-800 dark:text-green-200">
              Data exported successfully! Check your downloads folder.
            </span>
          </div>
        )}

        {exportStatus === 'error' && (
          <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
            <span className="text-sm text-red-800 dark:text-red-200">
              Export failed. Please try again.
            </span>
          </div>
        )}

        {summary.exported === 0 && (
          <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
            <span className="text-sm text-yellow-800 dark:text-yellow-200">
              No measurements found for the selected criteria.
            </span>
          </div>
        )}
      </div>
    </div>
  );
} 