'use client';

import React, { useState } from 'react';
import { useAppContext, Payment } from '@/context/app-context';

export const ManagerPayments: React.FC = () => {
  const { payments, orders } = useAppContext();
  const [filterMethod, setFilterMethod] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string | null>(null);

  const filteredPayments = payments.filter(p => {
    if (filterMethod && p.method !== filterMethod) return false;
    if (filterStatus && p.status !== filterStatus) return false;
    return true;
  });

  const sortedPayments = [...filteredPayments].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  const getMethodIcon = (method: string) => {
    switch (method) {
      case 'card': return '💳';
      case 'cash': return '💵';
      case 'mobile': return '📱';
      default: return '💰';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-700';
      case 'pending': return 'bg-yellow-100 text-yellow-700';
      case 'failed': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const totalCompleted = payments
    .filter(p => p.status === 'completed')
    .reduce((sum, p) => sum + p.amount, 0);

  const totalPending = payments
    .filter(p => p.status === 'pending')
    .reduce((sum, p) => sum + p.amount, 0);

  const getOrderNumber = (orderId: string) => {
    return orders.find(o => o.id === orderId)?.orderNumber || '—';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">Payments</h2>
        <div className="text-sm text-muted-foreground">
          Total: <span className="font-semibold text-foreground">{payments.length}</span>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-lg p-6 border border-border shadow-sm">
          <p className="text-muted-foreground text-sm mb-2">Completed Payments</p>
          <p className="text-3xl font-bold text-green-600">${totalCompleted.toFixed(2)}</p>
          <p className="text-xs text-muted-foreground mt-2">{payments.filter(p => p.status === 'completed').length} payments</p>
        </div>
        <div className="bg-white rounded-lg p-6 border border-border shadow-sm">
          <p className="text-muted-foreground text-sm mb-2">Pending Payments</p>
          <p className="text-3xl font-bold text-yellow-600">${totalPending.toFixed(2)}</p>
          <p className="text-xs text-muted-foreground mt-2">{payments.filter(p => p.status === 'pending').length} payments</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="flex gap-2">
          <button
            onClick={() => setFilterMethod(null)}
            className={`px-4 py-2 rounded-lg transition text-sm ${
              filterMethod === null
                ? 'bg-accent text-white'
                : 'bg-muted text-foreground hover:bg-secondary'
            }`}
          >
            All Methods
          </button>
          {['card', 'cash', 'mobile'].map(method => (
            <button
              key={method}
              onClick={() => setFilterMethod(method)}
              className={`px-4 py-2 rounded-lg transition text-sm capitalize ${
                filterMethod === method
                  ? 'bg-accent text-white'
                  : 'bg-muted text-foreground hover:bg-secondary'
              }`}
            >
              {getMethodIcon(method)} {method}
            </button>
          ))}
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setFilterStatus(null)}
            className={`px-4 py-2 rounded-lg transition text-sm ${
              filterStatus === null
                ? 'bg-accent text-white'
                : 'bg-muted text-foreground hover:bg-secondary'
            }`}
          >
            All Status
          </button>
          {['completed', 'pending', 'failed'].map(status => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-4 py-2 rounded-lg transition text-sm capitalize ${
                filterStatus === status
                  ? 'bg-accent text-white'
                  : 'bg-muted text-foreground hover:bg-secondary'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-white rounded-lg border border-border overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left p-4 font-semibold text-foreground">Order #</th>
                <th className="text-left p-4 font-semibold text-foreground">Amount</th>
                <th className="text-left p-4 font-semibold text-foreground">Method</th>
                <th className="text-left p-4 font-semibold text-foreground">Status</th>
                <th className="text-left p-4 font-semibold text-foreground">Date & Time</th>
              </tr>
            </thead>
            <tbody>
              {sortedPayments.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-muted-foreground">
                    No payments found
                  </td>
                </tr>
              ) : (
                sortedPayments.map((payment) => (
                  <tr key={payment.id} className="border-b border-border hover:bg-muted/30 transition">
                    <td className="p-4 font-semibold text-foreground">#{getOrderNumber(payment.orderId)}</td>
                    <td className="p-4 font-bold text-accent text-base">${payment.amount.toFixed(2)}</td>
                    <td className="p-4">
                      <span className="text-lg">{getMethodIcon(payment.method)}</span> {payment.method}
                    </td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${getStatusColor(payment.status)}`}>
                        {payment.status}
                      </span>
                    </td>
                    <td className="p-4 text-muted-foreground">{formatDate(payment.created_at)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
