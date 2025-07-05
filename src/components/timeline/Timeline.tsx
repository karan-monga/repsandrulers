'use client';

import { useState } from 'react';
import { Calendar, Search, Edit2, Trash2, Save, X } from 'lucide-react';
import { format } from 'date-fns';
import { useAuth } from '@/contexts/AuthContext';
import { formatMeasurement } from '@/lib/calculations';

export function Timeline() {
  const { measurements, updateMeasurement, deleteMeasurement, userProfile } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [editingEntry, setEditingEntry] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<any>({});

  // Sort measurements by date (newest first)
  const sortedMeasurements = [...measurements].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const filteredEntries = sortedMeasurements.filter(entry => {
    const matchesSearch = format(new Date(entry.date), 'MMM dd, yyyy').toLowerCase().includes(searchTerm.toLowerCase());
    
    if (selectedFilter === 'all') return matchesSearch;
    
    return matchesSearch;
  });

  const calculateChange = (current: number, previous: number) => {
    const change = current - previous;
    return {
      value: Math.abs(change),
      trend: change > 0 ? 'up' : change < 0 ? 'down' : 'same',
      percentage: previous ? Math.abs((change / previous) * 100) : 0,
    };
  };

  const startEditing = (entry: any) => {
    setEditingEntry(entry.id);
    setEditForm({
      date: entry.date,
      weight: entry.weight,
      waist: entry.waist,
      chest: entry.chest,
      hips: entry.hips,
      biceps: entry.biceps,
      thighs: entry.thighs,
      calves: entry.calves,
      left_thigh: entry.left_thigh,
      right_thigh: entry.right_thigh,
      left_calf: entry.left_calf,
      right_calf: entry.right_calf,
      notes: entry.notes || '',
    });
  };

  const cancelEditing = () => {
    setEditingEntry(null);
    setEditForm({});
  };

  const saveEdit = async () => {
    if (!editingEntry) return;
    
    try {
      await updateMeasurement(editingEntry, editForm);
      setEditingEntry(null);
      setEditForm({});
    } catch (error) {
      console.error('Error updating measurement:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this measurement?')) {
      try {
        await deleteMeasurement(id);
      } catch (error) {
        console.error('Error deleting measurement:', error);
      }
    }
  };

  const getUnitLabel = (type: 'weight' | 'length') => {
    const unit = userProfile?.unit_preference || 'metric';
    return type === 'weight' ? (unit === 'metric' ? 'kg' : 'lbs') : (unit === 'metric' ? 'cm' : 'in');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Timeline</h1>
        
        <div className="flex items-center space-x-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search entries..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input pl-10 w-64"
            />
          </div>

          {/* Filter */}
          <select
            value={selectedFilter}
            onChange={(e) => setSelectedFilter(e.target.value)}
            className="input w-32"
          >
            <option value="all">All entries</option>
            <option value="photos">With photos</option>
            <option value="notes">With notes</option>
          </select>
        </div>
      </div>

      {/* Timeline */}
      <div className="space-y-4">
        {filteredEntries.map((entry, index) => {
          const previousEntry = filteredEntries[index + 1];
          const weightChange = previousEntry && entry.weight && previousEntry.weight ? 
            calculateChange(entry.weight, previousEntry.weight) : null;
          const isEditing = editingEntry === entry.id;

          return (
            <div key={entry.id} className="card hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="bg-primary-100 dark:bg-primary-900/20 p-2 rounded-lg">
                    <Calendar className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {format(new Date(entry.date), 'MMMM dd, yyyy')}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {format(new Date(entry.date), 'EEEE')}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {isEditing ? (
                    <>
                      <button
                        onClick={saveEdit}
                        className="p-2 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg"
                      >
                        <Save className="w-4 h-4" />
                      </button>
                      <button
                        onClick={cancelEditing}
                        className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-[#262626] rounded-lg"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => startEditing(entry)}
                        className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(entry.id)}
                        className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>

              {isEditing ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date</label>
                      <input
                        type="date"
                        value={editForm.date}
                        onChange={(e) => setEditForm((prev: typeof editForm) => ({ ...prev, date: e.target.value }))}
                        className="input"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Weight ({getUnitLabel('weight')})
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={editForm.weight}
                        onChange={(e) => setEditForm((prev: typeof editForm) => ({ ...prev, weight: Number(e.target.value) }))}
                        className="input"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Waist ({getUnitLabel('length')})
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={editForm.waist ?? ''}
                        onChange={(e) => setEditForm((prev: typeof editForm) => ({ ...prev, waist: Number(e.target.value) }))}
                        className="input"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Chest ({getUnitLabel('length')})
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={editForm.chest ?? ''}
                        onChange={(e) => setEditForm((prev: typeof editForm) => ({ ...prev, chest: Number(e.target.value) }))}
                        className="input"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Notes</label>
                    <textarea
                      value={editForm.notes}
                      onChange={(e) => setEditForm((prev: typeof editForm) => ({ ...prev, notes: e.target.value }))}
                      rows={2}
                      className="input"
                    />
                  </div>
                </div>
              ) : (
                <>
                  {/* Metrics */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-4">
                    <div className="bg-gray-50 dark:bg-[#262626] p-3 rounded-lg">
                      <p className="text-sm text-gray-600 dark:text-gray-300">Weight</p>
                      <div className="flex items-center space-x-2">
                        <span className="text-lg font-semibold text-gray-900 dark:text-white">
                          {entry.weight ? formatMeasurement(entry.weight, userProfile?.unit_preference || 'metric', 'weight') : 'N/A'}
                        </span>
                        {weightChange && (
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            weightChange.trend === 'down' ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300' :
                            weightChange.trend === 'up' ? 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300' :
                            'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                          }`}>
                            {weightChange.trend === 'down' ? '↓' : weightChange.trend === 'up' ? '↑' : '→'}
                            {weightChange.value.toFixed(1)}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="bg-gray-50 dark:bg-[#262626] p-3 rounded-lg">
                      <p className="text-sm text-gray-600 dark:text-gray-300">Height</p>
                      <span className="text-lg font-semibold text-gray-900 dark:text-white">{entry.height ? formatMeasurement(entry.height, userProfile?.unit_preference || 'metric', 'length') : 'N/A'}</span>
                    </div>

                    <div className="bg-gray-50 dark:bg-[#262626] p-3 rounded-lg">
                      <p className="text-sm text-gray-600 dark:text-gray-300">Chest</p>
                      <span className="text-lg font-semibold text-gray-900 dark:text-white">{entry.chest ? formatMeasurement(entry.chest, userProfile?.unit_preference || 'metric', 'length') : 'N/A'}</span>
                    </div>
                  </div>

                  {/* Body measurements */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
                    <div className="text-center">
                      <p className="text-xs text-gray-500 dark:text-gray-400">Waist</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {entry.waist ? formatMeasurement(entry.waist, userProfile?.unit_preference || 'metric', 'length') : 'N/A'}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-500 dark:text-gray-400">Hips</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {entry.hips ? formatMeasurement(entry.hips, userProfile?.unit_preference || 'metric', 'length') : 'N/A'}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-500 dark:text-gray-400">Biceps</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {entry.biceps ? formatMeasurement(entry.biceps, userProfile?.unit_preference || 'metric', 'length') : 'N/A'}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-500 dark:text-gray-400">Thighs</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {entry.thighs ? formatMeasurement(entry.thighs, userProfile?.unit_preference || 'metric', 'length') : 'N/A'}
                      </p>
                    </div>
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>

      {filteredEntries.length === 0 && (
        <div className="text-center py-12">
          <Calendar className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No entries found</h3>
          <p className="text-gray-600 dark:text-gray-400">Try adjusting your search or filter criteria.</p>
        </div>
      )}
    </div>
  );
}