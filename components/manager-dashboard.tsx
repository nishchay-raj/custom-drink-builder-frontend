'use client';

import React from 'react';
import { useAppContext } from '@/context/app-context';

export const ManagerDashboard: React.FC = () => {
  const { orders, payments, feedbacks, menuItems } = useAppContext();

  const totalRevenue = payments
    .filter(p => p.status === 'completed')
    .reduce((sum, p) => sum + p.amount, 0);

  const totalOrders = orders.length;
  const completedOrders = orders.filter(o => o.status === 'completed').length;
  const completionRate = totalOrders > 0 ? ((completedOrders / totalOrders) * 100).toFixed(1) : '0';

  const avgRating = feedbacks.length > 0 
    ? (feedbacks.reduce((sum, f) => sum + f.rating, 0) / feedbacks.length).toFixed(1)
    : 'N/A';

  const ordersByStatus = {
    pending: orders.filter(o => o.status === 'pending').length,
    preparing: orders.filter(o => o.status === 'preparing').length,
    ready: orders.filter(o => o.status === 'ready').length,
    completed: orders.filter(o => o.status === 'completed').length,
  };

  const paymentsByMethod = {
    card: payments.filter(p => p.method === 'card' && p.status === 'completed').reduce((sum, p) => sum + p.amount, 0),
    cash: payments.filter(p => p.method === 'cash' && p.status === 'completed').reduce((sum, p) => sum + p.amount, 0),
    mobile: payments.filter(p => p.method === 'mobile' && p.status === 'completed').reduce((sum, p) => sum + p.amount, 0),
  };

  const topItems = menuItems
    .map(item => ({
      ...item,
      sold: orders
        .flatMap(o => o.items)
        .filter(oi => oi.menuItemId === item.id)
        .reduce((sum, oi) => sum + oi.quantity, 0),
    }))
    .sort((a, b) => b.sold - a.sold)
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-foreground">Dashboard</h2>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg p-6 border border-border shadow-sm">
          <p className="text-muted-foreground text-sm mb-2">Total Revenue</p>
          <p className="text-3xl font-bold text-accent">${totalRevenue.toFixed(2)}</p>
          <p className="text-xs text-muted-foreground mt-2">From completed payments</p>
        </div>
        <div className="bg-white rounded-lg p-6 border border-border shadow-sm">
          <p className="text-muted-foreground text-sm mb-2">Total Orders</p>
          <p className="text-3xl font-bold text-primary">{totalOrders}</p>
          <p className="text-xs text-muted-foreground mt-2">{completionRate}% completion rate</p>
        </div>
        <div className="bg-white rounded-lg p-6 border border-border shadow-sm">
          <p className="text-muted-foreground text-sm mb-2">Average Rating</p>
          <p className="text-3xl font-bold text-primary">{avgRating} ⭐</p>
          <p className="text-xs text-muted-foreground mt-2">From {feedbacks.length} reviews</p>
        </div>
        <div className="bg-white rounded-lg p-6 border border-border shadow-sm">
          <p className="text-muted-foreground text-sm mb-2">Menu Items</p>
          <p className="text-3xl font-bold text-primary">{menuItems.length}</p>
          <p className="text-xs text-muted-foreground mt-2">{menuItems.filter(m => m.available).length} available</p>
        </div>
      </div>

      {/* Orders by Status & Payment Methods */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-lg p-6 border border-border shadow-sm">
          <h3 className="font-semibold text-foreground mb-4">Orders by Status</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Pending</span>
              <div className="flex items-center gap-2">
                <div className="w-24 bg-muted rounded-full h-2">
                  <div className="bg-yellow-500 h-2 rounded-full" style={{ width: `${totalOrders > 0 ? (ordersByStatus.pending / totalOrders) * 100 : 0}%` }}></div>
                </div>
                <span className="font-semibold text-foreground min-w-8">{ordersByStatus.pending}</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Preparing</span>
              <div className="flex items-center gap-2">
                <div className="w-24 bg-muted rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${totalOrders > 0 ? (ordersByStatus.preparing / totalOrders) * 100 : 0}%` }}></div>
                </div>
                <span className="font-semibold text-foreground min-w-8">{ordersByStatus.preparing}</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Ready</span>
              <div className="flex items-center gap-2">
                <div className="w-24 bg-muted rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: `${totalOrders > 0 ? (ordersByStatus.ready / totalOrders) * 100 : 0}%` }}></div>
                </div>
                <span className="font-semibold text-foreground min-w-8">{ordersByStatus.ready}</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Completed</span>
              <div className="flex items-center gap-2">
                <div className="w-24 bg-muted rounded-full h-2">
                  <div className="bg-accent h-2 rounded-full" style={{ width: `${totalOrders > 0 ? (ordersByStatus.completed / totalOrders) * 100 : 0}%` }}></div>
                </div>
                <span className="font-semibold text-foreground min-w-8">{ordersByStatus.completed}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 border border-border shadow-sm">
          <h3 className="font-semibold text-foreground mb-4">Revenue by Payment Method</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Card</span>
              <div className="flex items-center gap-2">
                <div className="w-24 bg-muted rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${totalRevenue > 0 ? (paymentsByMethod.card / totalRevenue) * 100 : 0}%` }}></div>
                </div>
                <span className="font-semibold text-foreground">${paymentsByMethod.card.toFixed(2)}</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Cash</span>
              <div className="flex items-center gap-2">
                <div className="w-24 bg-muted rounded-full h-2">
                  <div className="bg-green-600 h-2 rounded-full" style={{ width: `${totalRevenue > 0 ? (paymentsByMethod.cash / totalRevenue) * 100 : 0}%` }}></div>
                </div>
                <span className="font-semibold text-foreground">${paymentsByMethod.cash.toFixed(2)}</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Mobile</span>
              <div className="flex items-center gap-2">
                <div className="w-24 bg-muted rounded-full h-2">
                  <div className="bg-purple-600 h-2 rounded-full" style={{ width: `${totalRevenue > 0 ? (paymentsByMethod.mobile / totalRevenue) * 100 : 0}%` }}></div>
                </div>
                <span className="font-semibold text-foreground">${paymentsByMethod.mobile.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Top Items */}
      <div className="bg-white rounded-lg p-6 border border-border shadow-sm">
        <h3 className="font-semibold text-foreground mb-4">Top 5 Items</h3>
        <div className="space-y-3">
          {topItems.map((item, idx) => (
            <div key={item.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
              <div className="flex items-center gap-3">
                <span className="text-muted-foreground font-semibold text-sm w-6">{idx + 1}</span>
                <div>
                  <p className="font-medium text-foreground">{item.name}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold text-foreground">{item.sold} sold</p>
                <p className="text-xs text-accent">${(item.sold * item.price).toFixed(2)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
