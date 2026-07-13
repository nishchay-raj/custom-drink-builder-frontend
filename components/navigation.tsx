'use client';

import React from 'react';

import {
  ShoppingCart,
  Users,
  ChefHat,
  BarChart3,
} from 'lucide-react';

import { Button } from '@/components/ui/button';

type UserRole = 'customer' | 'waiter' | 'kitchen' | 'manager';

interface NavigationProps {
  currentView: UserRole;
  onViewChange: (
    view: UserRole
  ) => void;
  onLoginClick: () => void;
  onLogoutClick: () => void;
  isLoggedIn: boolean;
  userRole: UserRole;
}

export default function Navigation({
  currentView,
  onViewChange,
  onLoginClick,
  onLogoutClick,
  isLoggedIn,
  userRole,
}: NavigationProps) {
  const navItems: Array<{ id: UserRole; label: string; icon: React.ComponentType<{ size?: number }> }> = [
    { id: 'customer', label: 'Customer', icon: ShoppingCart },
    { id: 'waiter', label: 'Waiter', icon: Users },
    { id: 'kitchen', label: 'Kitchen', icon: ChefHat },
    { id: 'manager', label: 'Manager', icon: BarChart3 },
  ];

  const visibleNavItem = navItems.find((item) =>
    isLoggedIn ? item.id === userRole : item.id === 'customer'
  ) ?? navItems[0];

  const handleLogout = () => {
    onLogoutClick();
  };

  return (
    <div className="flex flex-col gap-3 border-b border-border bg-background px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6 flex-shrink-0">
      
      {/* Left Side */}
      <div className="flex min-w-0 items-stretch gap-3 sm:gap-0">
        
        {/* Logo */}
        <div className="flex items-center gap-3 pr-3 border-r border-border sm:gap-6 sm:pr-6">
          <h1 className="text-xl sm:text-2xl font-serif font-normal tracking-tight">
            SIP
          </h1>
        </div>

        {/* Nav Items */}
        <div className="flex min-w-0 items-stretch gap-1 overflow-x-auto pb-1 sm:pb-0">
          {[visibleNavItem].map((item) => {
            const isActive = currentView === item.id;
            const Icon = item.icon;

            return (
              <button
                key={item.id}
                onClick={() => onViewChange(item.id)}
                className={`
                  shrink-0 px-4 py-3 text-sm font-normal border-b-2 flex items-center gap-2 whitespace-nowrap rounded-t-lg
                  transition-all duration-200
                  ${
                    isActive
                      ? 'border-b-foreground text-foreground'
                      : 'border-b-transparent text-muted-foreground hover:bg-secondary'
                  }
                `}
              >
                <Icon size={16} />
                {item.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Right Side */}
      <div className="flex items-center self-start sm:self-auto">
        {!isLoggedIn ? (
          <Button onClick={onLoginClick}>
            Login
          </Button>
        ) : (
          <Button variant="ghost" onClick={handleLogout}>
            Logout
          </Button>
        )}
      </div>
    </div>
  );
}