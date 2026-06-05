'use client';

import { useState } from 'react';
import Navigation from '@/components/navigation';
import CustomerInterface from '@/components/customer-interface';
import WaiterInterface from '@/components/waiter-interface';
import KitchenDisplay from '@/components/kitchen-display';
import { ManagerPanel } from '@/components/manager-panel';
import { AppProvider } from '@/context/app-context';
import { useRouter } from 'next/navigation';

function AppContent() {
  const [currentView, setCurrentView] = useState<
    'customer' | 'waiter' | 'kitchen' | 'manager'
  >('customer');

  const router = useRouter();

  return (
    <div className="min-h-dvh flex flex-col bg-background text-foreground overflow-x-hidden">
      <Navigation
        currentView={currentView}
        onViewChange={setCurrentView}
        onLoginClick={() => router.push('/login')}
      />

      <div className="flex-1 min-h-0 overflow-hidden">
        {currentView === 'customer' && <CustomerInterface />}
        {currentView === 'waiter' && <WaiterInterface />}
        {currentView === 'kitchen' && <KitchenDisplay />}
        {currentView === 'manager' && <ManagerPanel />}
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}