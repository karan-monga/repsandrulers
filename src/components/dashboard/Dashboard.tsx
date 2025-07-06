'use client';

import { useState, useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { DashboardContent } from './DashboardContent';
import { AddMeasurement } from '../measurements/AddMeasurement';
import { Timeline } from '../timeline/Timeline';
import { Charts } from '../charts/Charts';
import { Settings } from '../settings/Settings';
import { Onboarding, isOnboardingCompleted } from '../onboarding/Onboarding';

export type ActiveTab = 'dashboard' | 'add' | 'timeline' | 'charts' | 'settings';

export function Dashboard() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    // Check if this is the user's first time
    if (!isOnboardingCompleted()) {
      setShowOnboarding(true);
    }
  }, []);

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardContent 
          onAddMeasurement={() => setActiveTab('add')} 
          onNavigateToSettings={() => setActiveTab('settings')}
        />;
      case 'add':
        return <AddMeasurement onComplete={() => setActiveTab('dashboard')} />;
      case 'timeline':
        return <Timeline />;
      case 'charts':
        return <Charts />;
      case 'settings':
        return <Settings />;
      default:
        return <DashboardContent 
          onAddMeasurement={() => setActiveTab('add')} 
          onNavigateToSettings={() => setActiveTab('settings')}
        />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-[#171717]">
      <Sidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header
          activeTab={activeTab}
          onMenuClick={() => setSidebarOpen(true)}
          onTabChange={setActiveTab}
        />
        
        <main className="flex-1 overflow-auto p-6">
          {renderContent()}
        </main>
      </div>

      {/* Onboarding Tour */}
      <Onboarding 
        isFirstTime={showOnboarding} 
        onComplete={handleOnboardingComplete} 
      />
    </div>
  );
}