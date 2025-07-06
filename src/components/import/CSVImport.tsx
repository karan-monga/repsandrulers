'use client';

import { useState, useRef } from 'react';
import { Upload, FileText, CheckCircle, AlertCircle, X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { MeasurementEntry } from '@/contexts/AuthContext';


interface CSVRow {
  [key: string]: string;
}

interface MappedData {
  date: string;
  weight: number;
  height: number | null;
  measurements: {
    neck: number;
    chest: number;
    waist: number;
    hips: number;
    leftBicep: number;
    rightBicep: number;
    leftThigh: number;
    rightThigh: number;
    leftCalf: number;
    rightCalf: number;
  };
  notes?: string;
}

interface ColumnMapping {
  date: string;
  weight: string;
  height: string;
  neck: string;
  chest: string;
  waist: string;
  hips: string;
  leftBicep: string;
  rightBicep: string;
  leftThigh: string;
  rightThigh: string;
  leftCalf: string;
  rightCalf: string;
  notes: string;
}

export function CSVImport() {
  const { addMeasurement } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [csvData, setCsvData] = useState<CSVRow[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [columnMapping, setColumnMapping] = useState<ColumnMapping>({
    date: '',
    weight: '',
    height: '',
    neck: '',
    chest: '',
    waist: '',
    hips: '',
    leftBicep: '',
    rightBicep: '',
    leftThigh: '',
    rightThigh: '',
    leftCalf: '',
    rightCalf: '',
    notes: ''
  });
  const [mappedData, setMappedData] = useState<MappedData[]>([]);
  const [previewData, setPreviewData] = useState<MappedData[]>([]);
  const [currentStep, setCurrentStep] = useState<'upload' | 'mapping' | 'preview' | 'importing' | 'complete'>('upload');
  const [errors, setErrors] = useState<string[]>([]);
  const [importProgress, setImportProgress] = useState({ current: 0, total: 0 });
  const [importedCount, setImportedCount] = useState(0);
  const [skippedCount, setSkippedCount] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile && selectedFile.type === 'text/csv') {
      setFile(selectedFile);
      parseCSV(selectedFile);
    } else {
      setErrors(['Please select a valid CSV file']);
    }
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    const droppedFile = event.dataTransfer.files[0];
    if (droppedFile && droppedFile.type === 'text/csv') {
      setFile(droppedFile);
      parseCSV(droppedFile);
    } else {
      setErrors(['Please drop a valid CSV file']);
    }
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
  };

  const parseCSV = async (file: File) => {
    try {
      const text = await file.text();
      const lines = text.split('\n').filter(line => line.trim());
      
      if (lines.length === 0) {
        setErrors(['CSV file is empty']);
        return;
      }

      // Parse headers
      const headerLine = lines[0];
      const parsedHeaders = headerLine.split(',').map(h => h.trim().replace(/"/g, ''));
      setHeaders(parsedHeaders);

      // Parse data rows
      const dataRows: CSVRow[] = [];
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i];
        const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
        const row: CSVRow = {};
        parsedHeaders.forEach((header, index) => {
          row[header] = values[index] || '';
        });
        dataRows.push(row);
      }

      setCsvData(dataRows);
      setErrors([]);
      setCurrentStep('mapping');
    } catch (error) {
      setErrors(['Failed to parse CSV file']);
    }
  };

  const updateColumnMapping = (field: keyof ColumnMapping, value: string) => {
    setColumnMapping(prev => ({ ...prev, [field]: value }));
  };

  const validateMapping = () => {
    const requiredFields = ['date', 'weight'];
    const missingFields = requiredFields.filter(field => !columnMapping[field as keyof ColumnMapping]);
    
    if (missingFields.length > 0) {
      setErrors([`Required fields missing: ${missingFields.join(', ')}`]);
      return false;
    }

    setErrors([]);
    return true;
  };

  const mapData = () => {
    if (!validateMapping()) return;

    const mapped: MappedData[] = [];
    const newErrors: string[] = [];

    csvData.forEach((row, index) => {
      try {
        // Parse date
        const dateStr = row[columnMapping.date];
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) {
          newErrors.push(`Row ${index + 2}: Invalid date format`);
          return;
        }

        // Parse weight
        const weightStr = row[columnMapping.weight];
        const weight = parseFloat(weightStr);
        if (isNaN(weight) || weight <= 0) {
          newErrors.push(`Row ${index + 2}: Invalid weight value`);
          return;
        }

        // Parse height (optional)
        const heightStr = row[columnMapping.height];
        const height = heightStr ? parseFloat(heightStr) : null;
        if (heightStr && (isNaN(height!) || height! <= 0)) {
          newErrors.push(`Row ${index + 2}: Invalid height value`);
          return;
        }

        // Parse measurements
        const measurements = {
          neck: parseFloat(row[columnMapping.neck] || '0') || 0,
          chest: parseFloat(row[columnMapping.chest] || '0') || 0,
          waist: parseFloat(row[columnMapping.waist] || '0') || 0,
          hips: parseFloat(row[columnMapping.hips] || '0') || 0,
          leftBicep: parseFloat(row[columnMapping.leftBicep] || '0') || 0,
          rightBicep: parseFloat(row[columnMapping.rightBicep] || '0') || 0,
          leftThigh: parseFloat(row[columnMapping.leftThigh] || '0') || 0,
          rightThigh: parseFloat(row[columnMapping.rightThigh] || '0') || 0,
          leftCalf: parseFloat(row[columnMapping.leftCalf] || '0') || 0,
          rightCalf: parseFloat(row[columnMapping.rightCalf] || '0') || 0,
        };

        const notes = row[columnMapping.notes] || '';

        mapped.push({
          date: date.toISOString().split('T')[0],
          weight,
          height,
          measurements,
          notes: notes || undefined
        });
      } catch (error) {
        newErrors.push(`Row ${index + 2}: Data parsing error`);
      }
    });

    if (newErrors.length > 0) {
      setErrors(newErrors);
      return;
    }

    setMappedData(mapped);
    setPreviewData(mapped.slice(0, 5)); // Show first 5 rows in preview
    setCurrentStep('preview');
  };

  const importData = async () => {
    setCurrentStep('importing');
    setImportProgress({ current: 0, total: mappedData.length });
    setImportedCount(0);
    setSkippedCount(0);

    for (let i = 0; i < mappedData.length; i++) {
      const data = mappedData[i];
      
      try {
        // Check if measurement already exists for this date
        const existingMeasurements = await checkExistingMeasurement(data.date);
        
        if (existingMeasurements.length > 0) {
          setSkippedCount(prev => prev + 1);
        } else {
          // BMI calculation removed - height is now stored per measurement

          await addMeasurement({
            date: data.date,
            weight: data.weight,
            height: data.height, // Use imported height if available
            chest: data.measurements?.chest,
            waist: data.measurements?.waist,
            hips: data.measurements?.hips,
            biceps: data.measurements?.leftBicep, // Map to biceps
            forearms: data.measurements?.rightBicep, // Map to forearms temporarily
            thighs: data.measurements?.leftThigh, // Map to thighs
            calves: data.measurements?.leftCalf, // Map to calves
            left_thigh: data.measurements?.leftThigh,
            right_thigh: data.measurements?.rightThigh,
            left_calf: data.measurements?.leftCalf,
            right_calf: data.measurements?.rightCalf,
          });
          
          setImportedCount(prev => prev + 1);
        }
      } catch (error) {
        console.error('Import error:', error);
        setSkippedCount(prev => prev + 1);
      }

      setImportProgress({ current: i + 1, total: mappedData.length });
    }

    setCurrentStep('complete');
  };

  const checkExistingMeasurement = async (_date: string): Promise<MeasurementEntry[]> => {
    // This would check Firestore for existing measurements on the same date
    // For now, return empty array (no duplicates)
    return [];
  };

  const resetImport = () => {
    setFile(null);
    setCsvData([]);
    setHeaders([]);
    setColumnMapping({
      date: '',
      weight: '',
      height: '',
      neck: '',
      chest: '',
      waist: '',
      hips: '',
      leftBicep: '',
      rightBicep: '',
      leftThigh: '',
      rightThigh: '',
      leftCalf: '',
      rightCalf: '',
      notes: ''
    });
    setMappedData([]);
    setPreviewData([]);
    setCurrentStep('upload');
    setErrors([]);
    setImportProgress({ current: 0, total: 0 });
    setImportedCount(0);
    setSkippedCount(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const renderUploadStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Import CSV Data</h3>
        <p className="text-gray-600">Upload a CSV file with your historical measurements</p>
      </div>

      <div
        className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-primary-400 transition-colors"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600 mb-4">
          Drag and drop your CSV file here, or{' '}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="text-primary-600 hover:text-primary-700 font-medium"
          >
            browse files
          </button>
        </p>
        <p className="text-sm text-gray-500">
          Supported format: CSV with headers (date, weight, measurements...)
        </p>
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {file && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center">
            <FileText className="w-5 h-5 text-green-600 mr-2" />
            <span className="text-green-800 font-medium">{file.name}</span>
            <span className="text-green-600 ml-2">({Math.round(file.size / 1024)} KB)</span>
          </div>
        </div>
      )}
    </div>
  );

  const renderMappingStep = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Map CSV Columns</h3>
        <p className="text-gray-600">Match your CSV columns to the measurement fields</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
          <select
            value={columnMapping.date}
            onChange={(e) => updateColumnMapping('date', e.target.value)}
            className="input"
          >
            <option value="">Select column</option>
            {headers.map(header => (
              <option key={header} value={header}>{header}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Weight *</label>
          <select
            value={columnMapping.weight}
            onChange={(e) => updateColumnMapping('weight', e.target.value)}
            className="input"
          >
            <option value="">Select column</option>
            {headers.map(header => (
              <option key={header} value={header}>{header}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Height (Optional)</label>
          <select
            value={columnMapping.height}
            onChange={(e) => updateColumnMapping('height', e.target.value)}
            className="input"
          >
            <option value="">Select column</option>
            {headers.map(header => (
              <option key={header} value={header}>{header}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Neck</label>
          <select
            value={columnMapping.neck}
            onChange={(e) => updateColumnMapping('neck', e.target.value)}
            className="input"
          >
            <option value="">Select column</option>
            {headers.map(header => (
              <option key={header} value={header}>{header}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Chest</label>
          <select
            value={columnMapping.chest}
            onChange={(e) => updateColumnMapping('chest', e.target.value)}
            className="input"
          >
            <option value="">Select column</option>
            {headers.map(header => (
              <option key={header} value={header}>{header}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Waist</label>
          <select
            value={columnMapping.waist}
            onChange={(e) => updateColumnMapping('waist', e.target.value)}
            className="input"
          >
            <option value="">Select column</option>
            {headers.map(header => (
              <option key={header} value={header}>{header}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Hips</label>
          <select
            value={columnMapping.hips}
            onChange={(e) => updateColumnMapping('hips', e.target.value)}
            className="input"
          >
            <option value="">Select column</option>
            {headers.map(header => (
              <option key={header} value={header}>{header}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Left Bicep</label>
          <select
            value={columnMapping.leftBicep}
            onChange={(e) => updateColumnMapping('leftBicep', e.target.value)}
            className="input"
          >
            <option value="">Select column</option>
            {headers.map(header => (
              <option key={header} value={header}>{header}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Right Bicep</label>
          <select
            value={columnMapping.rightBicep}
            onChange={(e) => updateColumnMapping('rightBicep', e.target.value)}
            className="input"
          >
            <option value="">Select column</option>
            {headers.map(header => (
              <option key={header} value={header}>{header}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Left Thigh</label>
          <select
            value={columnMapping.leftThigh}
            onChange={(e) => updateColumnMapping('leftThigh', e.target.value)}
            className="input"
          >
            <option value="">Select column</option>
            {headers.map(header => (
              <option key={header} value={header}>{header}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Right Thigh</label>
          <select
            value={columnMapping.rightThigh}
            onChange={(e) => updateColumnMapping('rightThigh', e.target.value)}
            className="input"
          >
            <option value="">Select column</option>
            {headers.map(header => (
              <option key={header} value={header}>{header}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Left Calf</label>
          <select
            value={columnMapping.leftCalf}
            onChange={(e) => updateColumnMapping('leftCalf', e.target.value)}
            className="input"
          >
            <option value="">Select column</option>
            {headers.map(header => (
              <option key={header} value={header}>{header}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Right Calf</label>
          <select
            value={columnMapping.rightCalf}
            onChange={(e) => updateColumnMapping('rightCalf', e.target.value)}
            className="input"
          >
            <option value="">Select column</option>
            {headers.map(header => (
              <option key={header} value={header}>{header}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
          <select
            value={columnMapping.notes}
            onChange={(e) => updateColumnMapping('notes', e.target.value)}
            className="input"
          >
            <option value="">Select column</option>
            {headers.map(header => (
              <option key={header} value={header}>{header}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex space-x-3">
        <button
          onClick={mapData}
          disabled={!columnMapping.date || !columnMapping.weight}
          className="btn-primary disabled:opacity-50"
        >
          Preview Data
        </button>
        <button onClick={resetImport} className="btn-secondary">
          Start Over
        </button>
      </div>
    </div>
  );

  const renderPreviewStep = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Preview Data</h3>
        <p className="text-gray-600">
          Review the first 5 rows of your data before importing ({mappedData.length} total rows)
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200 rounded-lg">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Date</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Weight</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Waist</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Chest</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Notes</th>
            </tr>
          </thead>
          <tbody>
            {previewData.map((row, index) => (
              <tr key={index} className="border-t border-gray-200">
                <td className="px-4 py-2 text-sm text-gray-900">{row.date}</td>
                <td className="px-4 py-2 text-sm text-gray-900">{row.weight}</td>
                <td className="px-4 py-2 text-sm text-gray-900">{row.measurements.waist || '-'}</td>
                <td className="px-4 py-2 text-sm text-gray-900">{row.measurements.chest || '-'}</td>
                <td className="px-4 py-2 text-sm text-gray-900">{row.notes || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex space-x-3">
        <button onClick={importData} className="btn-primary">
          Import {mappedData.length} Measurements
        </button>
        <button onClick={() => setCurrentStep('mapping')} className="btn-secondary">
          Back to Mapping
        </button>
      </div>
    </div>
  );

  const renderImportingStep = () => (
    <div className="space-y-6 text-center">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Importing Data</h3>
        <p className="text-gray-600">Please wait while we import your measurements...</p>
      </div>

      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className="bg-primary-600 h-2 rounded-full transition-all duration-300"
          style={{ width: `${(importProgress.current / importProgress.total) * 100}%` }}
        />
      </div>

      <p className="text-sm text-gray-600">
        {importProgress.current} of {importProgress.total} measurements processed
      </p>
    </div>
  );

  const renderCompleteStep = () => (
    <div className="space-y-6 text-center">
      <div>
        <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Import Complete!</h3>
        <p className="text-gray-600">
          Successfully imported {importedCount} measurements
          {skippedCount > 0 && ` (${skippedCount} skipped due to duplicates)`}
        </p>
      </div>

      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-green-800 font-medium">Imported:</span>
            <span className="text-green-600 ml-2">{importedCount}</span>
          </div>
          <div>
            <span className="text-green-800 font-medium">Skipped:</span>
            <span className="text-green-600 ml-2">{skippedCount}</span>
          </div>
        </div>
      </div>

      <button onClick={resetImport} className="btn-primary">
        Import Another File
      </button>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto">
      <div className="card">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Import CSV Data</h2>
            <p className="text-gray-600">Import your historical measurement data</p>
          </div>
          {currentStep !== 'upload' && (
            <button onClick={resetImport} className="btn-secondary">
              <X className="w-4 h-4 mr-2" />
              Cancel
            </button>
          )}
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center space-x-4">
            {['upload', 'mapping', 'preview', 'importing', 'complete'].map((step, index) => (
              <div key={step} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  currentStep === step
                    ? 'bg-primary-600 text-white'
                    : index < ['upload', 'mapping', 'preview', 'importing', 'complete'].indexOf(currentStep)
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {index + 1}
                </div>
                {index < 4 && (
                  <div className={`w-12 h-0.5 mx-2 ${
                    index < ['upload', 'mapping', 'preview', 'importing', 'complete'].indexOf(currentStep)
                      ? 'bg-green-600'
                      : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Error Messages */}
        {errors.length > 0 && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
              <div>
                <h4 className="text-red-800 font-medium">Import Errors</h4>
                <ul className="text-red-700 text-sm mt-1">
                  {errors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Step Content */}
        {currentStep === 'upload' && renderUploadStep()}
        {currentStep === 'mapping' && renderMappingStep()}
        {currentStep === 'preview' && renderPreviewStep()}
        {currentStep === 'importing' && renderImportingStep()}
        {currentStep === 'complete' && renderCompleteStep()}
      </div>
    </div>
  );
} 