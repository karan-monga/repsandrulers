'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { User, Download, Bell, Shield, Save, Upload, RotateCcw, Trash2 } from 'lucide-react';
import { resetOnboarding } from '../onboarding/Onboarding';
import { CSVImport } from '../import/CSVImport';
import { CSVExport } from '../export/CSVExport';

export function Settings() {
  const { userProfile, updateProfile, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [formData, setFormData] = useState({
    unit_preference: userProfile?.unit_preference || 'metric',
    height: userProfile?.height?.toString() || '',
    weight: userProfile?.weight?.toString() || '',
  });
  const [saving, setSaving] = useState(false);

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'import', label: 'Import Data', icon: Upload },
    { id: 'export', label: 'Export Data', icon: Download },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'data', label: 'Data & Privacy', icon: Shield },
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const profileData = {
        ...formData,
        height: formData.height ? parseFloat(formData.height) : null,
        weight: formData.weight ? parseFloat(formData.weight) : null,
      };
      await updateProfile(profileData);
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setSaving(false);
    }
  };





  const handleResetOnboarding = () => {
    if (window.confirm('Reset the onboarding tour? This will show the tour again on your next visit.')) {
      resetOnboarding();
      alert('Onboarding tour has been reset. Refresh the page to see it again.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar */}
        <div className="lg:w-64">
          <div className="card">
            <nav className="space-y-1">
              {tabs.map(tab => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      activeTab === tab.id
                        ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#262626]'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1">
          {activeTab === 'profile' && (
            <div className="card">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Profile Settings</h2>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="btn-primary flex items-center space-x-2"
                >
                  <Save className="w-4 h-4" />
                  <span>{saving ? 'Saving...' : 'Save Changes'}</span>
                </button>
              </div>

              <div className="space-y-6">
                {/* Profile Picture */}
                <div className="flex items-center space-x-4">
                  <div className="w-20 h-20 rounded-full bg-primary-500 flex items-center justify-center overflow-hidden">
                    <span className="text-white text-2xl font-medium">
                      {userProfile?.email?.charAt(0)?.toUpperCase() || 'U'}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{userProfile?.email}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-500">Profile picture not available</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Unit Preference
                  </label>
                  <select
                    name="unit_preference"
                    value={formData.unit_preference}
                    onChange={handleInputChange}
                    className="input"
                  >
                    <option value="metric">Metric (kg, cm)</option>
                    <option value="imperial">Imperial (lbs, feet)</option>
                  </select>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    This affects how measurements are displayed throughout the app
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Height ({formData.unit_preference === 'metric' ? 'cm' : 'in'})
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      name="height"
                      value={formData.height}
                      onChange={handleInputChange}
                      className="input"
                      placeholder={formData.unit_preference === 'metric' ? '170' : '67'}
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Used for BMI calculations
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Weight ({formData.unit_preference === 'metric' ? 'kg' : 'lbs'})
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      name="weight"
                      value={formData.weight}
                      onChange={handleInputChange}
                      className="input"
                      placeholder={formData.unit_preference === 'metric' ? '70' : '154'}
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Your current weight for reference
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'import' && (
            <CSVImport />
          )}

          {activeTab === 'export' && (
            <CSVExport />
          )}

          {activeTab === 'notifications' && (
            <div className="card">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Notification Settings</h2>
              
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">Measurement Reminders</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Get notified when it's time to take measurements</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">Weekly Progress Email</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Receive weekly progress summaries via email</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">Goal Achievements</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Get notified when you reach milestones</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                  </label>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'data' && (
            <div className="space-y-6">

              <div className="card">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Account Actions</h2>
                <div className="space-y-4">
                  <div className="border-l-4 border-yellow-400 bg-yellow-50 p-4">
                    <h3 className="font-medium text-yellow-800">Sign Out</h3>
                    <p className="text-sm text-yellow-700 mt-1">
                      Sign out of your account on this device.
                    </p>
                    <button
                      onClick={logout}
                      className="btn-secondary mt-3"
                    >
                      Sign Out
                    </button>
                  </div>

                  <div className="border-l-4 border-blue-400 bg-blue-50 p-4">
                    <h3 className="font-medium text-blue-800">Reset Onboarding</h3>
                    <p className="text-sm text-blue-700 mt-1">
                      Reset the onboarding tour to show it again on your next visit.
                    </p>
                    <button
                      onClick={handleResetOnboarding}
                      className="btn-secondary mt-3 text-blue-600 hover:text-blue-700 flex items-center space-x-2"
                    >
                      <RotateCcw className="w-4 h-4" />
                      <span>Reset Tour</span>
                    </button>
                  </div>

                  <div className="border-l-4 border-red-400 bg-red-50 p-4">
                    <h3 className="font-medium text-red-800">Delete Account</h3>
                    <p className="text-sm text-red-700 mt-1">
                      Permanently delete your account and all associated data. This action cannot be undone.
                    </p>
                    <button className="btn-secondary mt-3 text-red-600 hover:text-red-700 flex items-center space-x-2">
                      <Trash2 className="w-4 h-4" />
                      <span>Delete Account</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}