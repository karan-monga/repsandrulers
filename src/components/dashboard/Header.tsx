'use client';

import { Menu, ChevronDown, Sun, Moon } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { ActiveTab } from './Dashboard';
import { NotificationDropdown } from '@/components/ui/NotificationDropdown';
import { useState } from 'react';

interface HeaderProps {
  activeTab: ActiveTab;
  onMenuClick: () => void;
  onTabChange: (tab: ActiveTab) => void;
}

const tabTitles: Record<ActiveTab, string> = {
  dashboard: 'Dashboard',
  add: 'Add Measurement',
  timeline: 'Timeline',
  charts: 'Progress Charts',
  renpho: 'Renpho Data',
  library: 'Exercise Library',
  'workout-generator': 'AI Workout Generator',
  routines: 'My Routines',
  settings: 'Settings',
};

export function Header({ activeTab, onMenuClick, onTabChange }: HeaderProps) {
  const { userProfile, logout } = useAuth();
  const { isDarkMode, toggleDarkMode } = useTheme();
  const [showDropdown, setShowDropdown] = useState(false);

  return (
    <header className="bg-white dark:bg-[#171717] shadow-sm border-b border-gray-200 dark:border-[#2e2e2e]">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center space-x-4">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-[#262626]"
          >
            <Menu className="w-5 h-5 dark:text-gray-300" />
          </button>
          <div className="flex items-center space-x-3">
            <img src="/logo.jpg" alt="Logo" className="w-8 h-8 rounded" />
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
              {tabTitles[activeTab]}
            </h1>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <button 
            onClick={toggleDarkMode}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-[#262626] transition-colors"
          >
            {isDarkMode ? (
              <Sun className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            ) : (
              <Moon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            )}
          </button>
          
          <NotificationDropdown />
          
          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-[#262626]"
            >
              <div className="w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center overflow-hidden">
                <span className="text-white text-sm font-medium">
                  {userProfile?.email?.charAt(0)?.toUpperCase() || 'U'}
                </span>
              </div>
              <div className="text-left hidden sm:block">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {userProfile?.email ? userProfile.email.split('@')[0] : 'User'}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {userProfile?.email || 'No email'}
                </p>
              </div>
              <ChevronDown className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            </button>

            {showDropdown && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-[#171717] rounded-lg shadow-lg border border-gray-200 dark:border-[#2e2e2e] py-1 z-50">
                <button
                  onClick={() => {
                    setShowDropdown(false);
                    onTabChange('settings');
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#262626]"
                >
                  Profile Settings
                </button>
                <hr className="my-1 border-gray-200 dark:border-[#2e2e2e]" />
                <button
                  onClick={() => {
                    setShowDropdown(false);
                    logout();
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-[#262626]"
                >
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}