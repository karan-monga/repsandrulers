'use client';

import { useState } from 'react';
import { Trash2, Download, Calendar, Scale, Activity, Droplets, Zap, Clock } from 'lucide-react';
import { RenphoMeasurement } from '@/types/renpho';
import { useDeleteRenphoMeasurement } from '@/hooks/useRenpho';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

interface RenphoDataTableProps {
  measurements: RenphoMeasurement[];
  isLoading: boolean;
}

type SortField = 'time_of_measurement' | 'weight_lb' | 'body_fat_percent' | 'muscle_mass_lb' | 'bmi';
type SortDirection = 'asc' | 'desc';

export function RenphoDataTable({ measurements, isLoading }: RenphoDataTableProps) {
  const [sortField, setSortField] = useState<SortField>('time_of_measurement');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  const deleteMutation = useDeleteRenphoMeasurement();

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this measurement?')) {
      await deleteMutation.mutateAsync(id);
    }
  };

  const exportToCSV = () => {
    const headers = [
      'Date',
      'Weight (lb)',
      'BMI',
      'Body Fat (%)',
      'Fat-free Body Weight (lb)',
      'Subcutaneous Fat (%)',
      'Visceral Fat',
      'Body Water (%)',
      'Skeletal Muscle (%)',
      'Muscle Mass (lb)',
      'Bone Mass (lb)',
      'Protein (%)',
      'BMR (kcal)',
      'Metabolic Age'
    ];

    const csvContent = [
      headers.join(','),
      ...measurements.map(m => [
        new Date(m.time_of_measurement).toLocaleDateString(),
        m.weight_lb,
        m.bmi || '',
        m.body_fat_percent || '',
        m.fat_free_body_weight_lb || '',
        m.subcutaneous_fat_percent || '',
        m.visceral_fat || '',
        m.body_water_percent || '',
        m.skeletal_muscle_percent || '',
        m.muscle_mass_lb || '',
        m.bone_mass_lb || '',
        m.protein_percent || '',
        m.bmr_kcal || '',
        m.metabolic_age || ''
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `renpho-data-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  // Filter and sort data
  const filteredData = measurements.filter(measurement => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      new Date(measurement.time_of_measurement).toLocaleDateString().toLowerCase().includes(searchLower) ||
      measurement.weight_lb.toString().includes(searchLower) ||
      (measurement.body_fat_percent?.toString() || '').includes(searchLower) ||
      (measurement.muscle_mass_lb?.toString() || '').includes(searchLower)
    );
  });

  const sortedData = [...filteredData].sort((a, b) => {
    let aValue: any = a[sortField];
    let bValue: any = b[sortField];

    if (sortField === 'time_of_measurement') {
      aValue = new Date(aValue).getTime();
      bValue = new Date(bValue).getTime();
    }

    if (aValue === null || aValue === undefined) aValue = 0;
    if (bValue === null || bValue === undefined) bValue = 0;

    if (sortDirection === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  // Pagination
  const totalPages = Math.ceil(sortedData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = sortedData.slice(startIndex, startIndex + itemsPerPage);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? '↑' : '↓';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Table Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search measurements..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input pl-10"
            />
            <Clock className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={exportToCSV}
            className="btn-secondary flex items-center space-x-2"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Results Info */}
      <div className="text-sm text-gray-600 dark:text-gray-400">
        Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, sortedData.length)} of {sortedData.length} measurements
      </div>

      {/* Data Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-[#262626]">
              <tr>
                <th 
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-[#2e2e2e]"
                  onClick={() => handleSort('time_of_measurement')}
                >
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-4 h-4" />
                    <span>Date & Time</span>
                    <span className="text-gray-400">{getSortIcon('time_of_measurement')}</span>
                  </div>
                </th>
                <th 
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-[#2e2e2e]"
                  onClick={() => handleSort('weight_lb')}
                >
                  <div className="flex items-center space-x-1">
                    <Scale className="w-4 h-4" />
                    <span>Weight (lb)</span>
                    <span className="text-gray-400">{getSortIcon('weight_lb')}</span>
                  </div>
                </th>
                <th 
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-[#2e2e2e]"
                  onClick={() => handleSort('bmi')}
                >
                  <span>BMI</span>
                  <span className="text-gray-400">{getSortIcon('bmi')}</span>
                </th>
                <th 
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-[#2e2e2e]"
                  onClick={() => handleSort('body_fat_percent')}
                >
                  <div className="flex items-center space-x-1">
                    <Activity className="w-4 h-4" />
                    <span>Body Fat (%)</span>
                    <span className="text-gray-400">{getSortIcon('body_fat_percent')}</span>
                  </div>
                </th>
                <th 
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-[#2e2e2e]"
                  onClick={() => handleSort('muscle_mass_lb')}
                >
                  <div className="flex items-center space-x-1">
                    <Zap className="w-4 h-4" />
                    <span>Muscle Mass (lb)</span>
                    <span className="text-gray-400">{getSortIcon('muscle_mass_lb')}</span>
                  </div>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  <div className="flex items-center space-x-1">
                    <Droplets className="w-4 h-4" />
                    <span>Body Water (%)</span>
                  </div>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  <span>BMR (kcal)</span>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  <span>Metabolic Age</span>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  <span>Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-[#171717] divide-y divide-gray-200 dark:divide-[#2e2e2e]">
              {paginatedData.map((measurement) => (
                <tr key={measurement.id} className="hover:bg-gray-50 dark:hover:bg-[#262626]">
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {formatDate(measurement.time_of_measurement)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                    {measurement.weight_lb.toFixed(1)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {measurement.bmi?.toFixed(1) || '-'}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {measurement.body_fat_percent?.toFixed(1) || '-'}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {measurement.muscle_mass_lb?.toFixed(1) || '-'}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {measurement.body_water_percent?.toFixed(1) || '-'}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {measurement.bmr_kcal || '-'}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {measurement.metabolic_age || '-'}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    <button
                      onClick={() => handleDelete(measurement.id)}
                      disabled={deleteMutation.isPending}
                      className="text-red-600 hover:text-red-900 dark:hover:text-red-400"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-gray-50 dark:bg-[#262626] px-4 py-3 flex items-center justify-between border-t border-gray-200 dark:border-[#2e2e2e]">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="btn-secondary"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="btn-secondary"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  Showing <span className="font-medium">{startIndex + 1}</span> to{' '}
                  <span className="font-medium">{Math.min(startIndex + itemsPerPage, sortedData.length)}</span> of{' '}
                  <span className="font-medium">{sortedData.length}</span> results
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 dark:border-[#2e2e2e] bg-white dark:bg-[#171717] text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-[#262626] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const page = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                    return (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          currentPage === page
                            ? 'z-10 bg-primary-50 dark:bg-primary-900/20 border-primary-500 text-primary-600 dark:text-primary-400'
                            : 'bg-white dark:bg-[#171717] border-gray-300 dark:border-[#2e2e2e] text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-[#262626]'
                        }`}
                      >
                        {page}
                      </button>
                    );
                  })}
                  
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 dark:border-[#2e2e2e] bg-white dark:bg-[#171717] text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-[#262626] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 