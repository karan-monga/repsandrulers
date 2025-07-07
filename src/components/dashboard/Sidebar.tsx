'use client';

import { clsx } from 'clsx';
import { 
  Home, 
  Plus, 
  Clock, 
  BarChart3, 
  Settings, 
  X,
  Dumbbell,
  Calendar,
  Scale
} from 'lucide-react';
import { ActiveTab } from './Dashboard';

interface SidebarProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  isOpen: boolean;
  onClose: () => void;
}

const navigation = [
  { id: 'dashboard', name: 'Dashboard', icon: Home },
  { id: 'add', name: 'Add Measurement', icon: Plus },
  { id: 'timeline', name: 'Timeline', icon: Clock },
  { id: 'charts', name: 'Charts', icon: BarChart3 },
  { id: 'renpho', name: 'Renpho Data', icon: Scale },
  { id: 'library', name: 'Exercise Library', icon: Dumbbell },
  { id: 'routines', name: 'My Routines', icon: Calendar },
  { id: 'settings', name: 'Settings', icon: Settings },
];

export function Sidebar({ activeTab, onTabChange, isOpen, onClose }: SidebarProps) {
  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden" onClick={onClose} />
      )}
      
      {/* Sidebar */}
      <div className={clsx(
        'fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-[#171717] shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0',
        isOpen ? 'translate-x-0' : '-translate-x-full'
      )}>
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-[#2e2e2e]">
          <button
            onClick={() => {
              onTabChange('dashboard');
              onClose();
            }}
            className="flex items-center space-x-2 hover:opacity-80 transition-opacity cursor-pointer"
          >
            <img src="/logo.jpg" alt="Logo" className="w-8 h-8 rounded" />
            <span className="font-bold text-gray-900 dark:text-gray-100">Reps & Rulers</span>
          </button>
          <button
            onClick={onClose}
            className="lg:hidden p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-[#262626]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <nav className="mt-6 px-3">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => {
                  onTabChange(item.id as ActiveTab);
                  onClose();
                }}
                className={clsx(
                  'w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200',
                  isActive
                    ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400 border-r-2 border-primary-500'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#262626] hover:text-gray-900 dark:hover:text-gray-100'
                )}
                data-tour={item.id === 'timeline' ? 'timeline-tab' : item.id === 'charts' ? 'charts-tab' : undefined}
              >
                <Icon className="w-5 h-5" />
                <span>{item.name}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </>
  );
}