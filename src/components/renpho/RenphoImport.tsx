'use client';

import { useState, useRef } from 'react';
import { Upload, FileText, CheckCircle, AlertCircle, X } from 'lucide-react';
import { useImportRenphoData } from '@/hooks/useRenpho';
import { RenphoCSVRow } from '@/types/renpho';

interface ImportPreview {
  data: RenphoCSVRow[];
  errors: string[];
  isValid: boolean;
}

export function RenphoImport() {
  const [preview, setPreview] = useState<ImportPreview | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [importStatus, setImportStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const importMutation = useImportRenphoData();

  const validateCSV = (csvText: string): ImportPreview => {
    const lines = csvText.trim().split('\n');
    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    
    const requiredHeaders = [
      'Time of Measurement',
      'Weight(lb)',
      'BMI',
      'Body Fat(%)',
      'Fat-free Body Weight(lb)',
      'Subcutaneous Fat(%)',
      'Visceral Fat',
      'Body Water(%)',
      'Skeletal Muscle(%)',
      'Muscle Mass(lb)',
      'Bone Mass(lb)',
      'Protein(%)',
      'BMR(kcal)',
      'Metabolic Age'
    ];

    const errors: string[] = [];
    
    // Check headers
    const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
    if (missingHeaders.length > 0) {
      errors.push(`Missing required headers: ${missingHeaders.join(', ')}`);
    }

    if (errors.length > 0) {
      return { data: [], errors, isValid: false };
    }

    // Parse data
    const data: RenphoCSVRow[] = [];
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      if (!line.trim()) continue;

      const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
      const row: any = {};
      
      headers.forEach((header, index) => {
        row[header] = values[index] || '';
      });

      // Validate required fields
      if (!row['Time of Measurement'] || !row['Weight(lb)']) {
        errors.push(`Row ${i + 1}: Missing required fields (Time of Measurement or Weight)`);
        continue;
      }

      // Validate date format
      const date = new Date(row['Time of Measurement']);
      if (isNaN(date.getTime())) {
        errors.push(`Row ${i + 1}: Invalid date format in Time of Measurement`);
        continue;
      }

      // Validate weight
      const weight = parseFloat(row['Weight(lb)']);
      if (isNaN(weight) || weight <= 0) {
        errors.push(`Row ${i + 1}: Invalid weight value`);
        continue;
      }

      data.push(row as RenphoCSVRow);
    }

    return {
      data,
      errors,
      isValid: errors.length === 0 && data.length > 0
    };
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const csvText = e.target?.result as string;
      const validation = validateCSV(csvText);
      setPreview(validation);
      setImportStatus('idle');
    };
    reader.readAsText(file);
  };

  const handleImport = async () => {
    if (!preview?.isValid || !preview.data.length) return;

    setIsImporting(true);
    setImportStatus('idle');

    try {
      await importMutation.mutateAsync(preview.data);
      setImportStatus('success');
      setPreview(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Import error:', error);
      setImportStatus('error');
    } finally {
      setIsImporting(false);
    }
  };

  const handleClear = () => {
    setPreview(null);
    setImportStatus('idle');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-6">
      <div className="card">
        <div className="flex items-center space-x-3 mb-4">
          <div className="bg-green-100 dark:bg-green-900/20 p-2 rounded-lg">
            <Upload className="w-5 h-5 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Import Renpho Data</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Upload your Renpho CSV export to import body composition data
            </p>
          </div>
        </div>

        {/* File Upload */}
        <div className="space-y-4">
          <div className="border-2 border-dashed border-gray-300 dark:border-[#2e2e2e] rounded-lg p-6 text-center">
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="btn-primary flex items-center space-x-2 mx-auto"
            >
              <FileText className="w-4 h-4" />
              <span>Choose CSV File</span>
            </button>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              Select your Renpho CSV export file
            </p>
          </div>

          {/* Preview */}
          {preview && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-gray-900 dark:text-white">Import Preview</h4>
                <button
                  onClick={handleClear}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Validation Status */}
              <div className={`p-3 rounded-lg ${
                preview.isValid 
                  ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' 
                  : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
              }`}>
                <div className="flex items-center space-x-2">
                  {preview.isValid ? (
                    <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
                  )}
                  <span className={`text-sm font-medium ${
                    preview.isValid 
                      ? 'text-green-800 dark:text-green-300' 
                      : 'text-red-800 dark:text-red-300'
                  }`}>
                    {preview.isValid 
                      ? `${preview.data.length} measurements ready to import` 
                      : 'Validation failed'
                    }
                  </span>
                </div>
              </div>

              {/* Errors */}
              {preview.errors.length > 0 && (
                <div className="space-y-2">
                  <h5 className="text-sm font-medium text-gray-900 dark:text-white">Errors:</h5>
                  <div className="max-h-32 overflow-y-auto space-y-1">
                    {preview.errors.map((error, index) => (
                      <p key={index} className="text-sm text-red-600 dark:text-red-400">
                        {error}
                      </p>
                    ))}
                  </div>
                </div>
              )}

              {/* Sample Data */}
              {preview.isValid && preview.data.length > 0 && (
                <div className="space-y-2">
                  <h5 className="text-sm font-medium text-gray-900 dark:text-white">
                    Sample Data (first 3 rows):
                  </h5>
                  <div className="bg-gray-50 dark:bg-[#262626] rounded-lg p-3 overflow-x-auto">
                    <table className="text-xs">
                      <thead>
                        <tr className="border-b border-gray-200 dark:border-[#2e2e2e]">
                          <th className="text-left p-1">Date</th>
                          <th className="text-left p-1">Weight</th>
                          <th className="text-left p-1">BMI</th>
                          <th className="text-left p-1">Body Fat</th>
                          <th className="text-left p-1">Muscle Mass</th>
                        </tr>
                      </thead>
                      <tbody>
                        {preview.data.slice(0, 3).map((row, index) => (
                          <tr key={index} className="border-b border-gray-100 dark:border-[#2e2e2e]">
                            <td className="p-1">{new Date(row['Time of Measurement']).toLocaleDateString()}</td>
                            <td className="p-1">{row['Weight(lb)']} lb</td>
                            <td className="p-1">{row['BMI']}</td>
                            <td className="p-1">{row['Body Fat(%)']}%</td>
                            <td className="p-1">{row['Muscle Mass(lb)']} lb</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Import Button */}
              {preview.isValid && (
                <button
                  onClick={handleImport}
                  disabled={isImporting}
                  className="btn-primary w-full"
                >
                  {isImporting ? 'Importing...' : `Import ${preview.data.length} Measurements`}
                </button>
              )}
            </div>
          )}

          {/* Import Status */}
          {importStatus === 'success' && (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                <span className="text-sm font-medium text-green-800 dark:text-green-300">
                  Import completed successfully!
                </span>
              </div>
            </div>
          )}

          {importStatus === 'error' && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
                <span className="text-sm font-medium text-red-800 dark:text-red-300">
                  Import failed. Please try again.
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 