'use client';

import { useEffect, useState } from 'react';
import Navigation from '@/components/navigation';
import CustomerInterface from '@/components/customer-interface';
import WaiterInterface from '@/components/waiter-interface';
import KitchenDisplay from '@/components/kitchen-display';
import { ManagerPanel } from '@/components/manager-panel';
import { AppProvider } from '@/context/app-context';
import { useRouter } from 'next/navigation';

type UserRole = 'customer' | 'waiter' | 'kitchen' | 'manager';

const normalizeRole = (role: string | null | undefined): UserRole => {
  const value = role?.trim().toLowerCase();

  if (value === 'manager' || value === 'admin') return 'manager';
  if (value === 'waiter' || value === 'server' || value === 'staff') return 'waiter';
  if (value === 'kitchen' || value === 'chef' || value === 'cook') return 'kitchen';
  return 'customer';
};

const readAuthState = () => {
  try {
    const isLoggedIn = Boolean(localStorage.getItem('isLoggedIn'));
    const storedRole = localStorage.getItem('userRole');

    return {
      isLoggedIn,
      userRole: normalizeRole(storedRole),
    };
  } catch (error) {
    return {
      isLoggedIn: false,
      userRole: 'customer' as UserRole,
    };
  }
};

function AppContent() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<UserRole>('customer');
  const [currentView, setCurrentView] = useState<UserRole>('customer');

  const router = useRouter();

  useEffect(() => {
    const authState = readAuthState();
    setIsLoggedIn(authState.isLoggedIn);
    setUserRole(authState.userRole);
  }, []);

  useEffect(() => {
    setCurrentView(isLoggedIn ? userRole : 'customer');
  }, [isLoggedIn, userRole]);

  const handleLogout = () => {
    try {
      localStorage.removeItem('isLoggedIn');
      localStorage.removeItem('userRole');
    } catch (error) {
      // ignore storage failures
    }

    setIsLoggedIn(false);
    setUserRole('customer');
    setCurrentView('customer');
  };

  return (
    <div className="min-h-dvh flex flex-col bg-background text-foreground overflow-x-hidden">
      <Navigation
        currentView={currentView}
        onViewChange={setCurrentView}
        onLoginClick={() => router.push('/login')}
        onLogoutClick={handleLogout}
        isLoggedIn={isLoggedIn}
        userRole={userRole}
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