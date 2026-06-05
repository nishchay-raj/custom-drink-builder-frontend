'use client';

import React, { useState } from 'react';
import { LayoutDashboard, UtensilsCrossed, ShoppingCart, CreditCard, MessageSquare, Droplets, LayoutGrid, CakeSlice } from 'lucide-react';
import { ManagerDashboard } from './manager-dashboard';
import { MenuManagement } from './basedrink-management';
import { FlavorManagement } from './flavor-management';
import { ManagerOrders } from './manager-orders';
import { ManagerPayments } from './manager-payments';
import { ManagerFeedback } from './manager-feedback';
import { ManagerTable } from './manager-table';
import { AddonManagement } from './addon-management';

type TabType = 'dashboard' | 'menu' | 'flavors' | 'addons' | 'orders' | 'payments' | 'feedback' | 'table';

export const ManagerPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'menu', label: 'Menu', icon: UtensilsCrossed },
    { id: 'flavors', label: 'Flavors', icon: Droplets },
    { id: 'addons', label: 'Addons', icon: CakeSlice},
    { id: 'orders', label: 'Orders', icon: ShoppingCart },
    { id: 'payments', label: 'Payments', icon: CreditCard },
    { id: 'feedback', label: 'Feedback', icon: MessageSquare },
    { id: 'table', label: 'Tables', icon: LayoutGrid}
  ] as const;

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <ManagerDashboard />;
      case 'menu':
        return <MenuManagement />;
      case 'flavors':
        return <FlavorManagement />;
      case 'addons':
        return <AddonManagement />;
      case 'orders':
        return <ManagerOrders />;
      case 'payments':
        return <ManagerPayments />;
      case 'table':
        return <ManagerTable />;
      case 'feedback':
        return <ManagerFeedback />;
      default:
        return <ManagerDashboard />;
    }
  };

  return (
    <div className="min-h-dvh flex flex-col bg-background overflow-hidden">
      {/* Header */}
      <div className="border-b border-border bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:py-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Manager Panel</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage your restaurant operations</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-border bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-1 overflow-x-auto pb-1">
            {tabs.map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as TabType)}
                  className={`shrink-0 flex items-center gap-2 px-3 sm:px-4 py-3 sm:py-4 border-b-2 transition font-medium ${
                    isActive
                      ? 'border-accent text-accent'
                      : 'border-transparent text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Icon size={18} />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-h-0 overflow-y-auto">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:py-6">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};
