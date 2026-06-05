'use client';

import React, { useEffect, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import axios from 'axios';

type OrderStatus = 'PENDING' | 'READY' | 'COMPLETED';

interface OrderFlavor {
  name: string;
  price: number;
}

interface OrderItem {
  id: string;
  baseDrink?: string;
  basePrice: number;
  quantity: number;
  totalAmount: number;
  flavors: OrderFlavor[];
}

interface Orders {
  id: string;
  payment_method: string;
  payment_successful: boolean;
  status: OrderStatus;
  table_number: number | null;
  total_amount: number;
  name: string;
  remarks: string;
  created_at: string;
}

export const ManagerOrders: React.FC = () => {
  const [filterStatus, setFilterStatus] = useState<string | null>(null);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [orders, setOrders] = useState<Orders[]>([]);
  const [orderItemsByOrderId, setOrderItemsByOrderId] = useState<Record<string, OrderItem[]>>({});
  const [loadingOrderId, setLoadingOrderId] = useState<string | null>(null);

  const filteredOrders = filterStatus
    ? orders.filter(o => o.status === filterStatus)
    : orders;

  const sortedOrders = [...filteredOrders].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  useEffect(() => {
    const fetchOrders = async () => {
      try{
        const res = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/order/get/all`, {withCredentials: true});
        setOrders(res.data);
      }catch(err){
        console.error(err);
      }
    };

    fetchOrders();
  }, []);

  const loadOrderItems = async (orderId: string) => {
    if (orderItemsByOrderId[orderId]) {
      return;
    }

    setLoadingOrderId(orderId);

    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/order/get/${orderId}`,
        { withCredentials: true },
      );

      setOrderItemsByOrderId(prev => ({
        ...prev,
        [orderId]: Array.isArray(res.data) ? res.data : [],
      }));
    } catch (err) {
      console.error(err);
      setOrderItemsByOrderId(prev => ({
        ...prev,
        [orderId]: [],
      }));
    } finally {
      setLoadingOrderId(current => (current === orderId ? null : current));
    }
  };

  const handleOrderToggle = async (orderId: string) => {
    const nextExpanded = expandedOrder === orderId ? null : orderId;
    setExpandedOrder(nextExpanded);

    if (nextExpanded) {
      await loadOrderItems(orderId);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-700';
      case 'READY': return 'bg-green-100 text-green-700';
      case 'COMPLETED': return 'bg-accent/20 text-accent';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    try {
      await axios.patch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/order/${orderId}/update/status`, 
        {
          status: newStatus,
        },
        {withCredentials: true}
      );

      setOrders(prev =>
        prev.map(order =>
          order.id === orderId ? { ...order, status: newStatus } : order
        )
      );
    }catch(err){
      console.error(err);
    }
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const statusOptions: OrderStatus[] = ['PENDING', 'READY', 'COMPLETED'];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">Orders</h2>
        <div className="text-sm text-muted-foreground">
          Total: <span className="font-semibold text-foreground">{orders.length}</span>
        </div>
      </div>

      {/* Status Filter */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setFilterStatus(null)}
          className={`px-4 py-2 rounded-lg transition ${
            filterStatus === null
              ? 'bg-accent text-white'
              : 'bg-muted text-foreground hover:bg-secondary'
          }`}
        >
          All Orders
        </button>
        {['PENDING', 'READY', 'COMPLETED'].map(status => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={`px-4 py-2 rounded-lg transition capitalize ${
              filterStatus === status
                ? 'bg-accent text-white'
                : 'bg-muted text-foreground hover:bg-secondary'
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {/* Orders List */}
      <div className="space-y-3">
        {sortedOrders.length === 0 ? (
          <div className="bg-white rounded-lg p-8 text-center border border-border">
            <p className="text-muted-foreground">No orders found</p>
          </div>
        ) : (
          sortedOrders.map(order => (
            <div key={order.id} className="bg-white rounded-lg border border-border overflow-hidden shadow-sm">
              <button
                onClick={() => {
                  void handleOrderToggle(order.id);
                }}
                className="w-full p-4 flex items-center justify-between hover:bg-muted transition"
              >
                <div className="flex items-center gap-4 flex-1">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium text-foreground">
                        {order.name || (order.table_number ? `Table ${order.table_number}` : 'Takeout')}
                      </p>
                      <span className={`px-2 py-1 rounded text-xs font-semibold capitalize ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">{formatTime(order.created_at)}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-accent text-lg">${order.total_amount.toFixed(2)}</p>
                  <ChevronDown
                    size={20}
                    className={`text-muted-foreground transition transform ${
                      expandedOrder === order.id ? 'rotate-180' : ''
                    }`}
                  />
                </div>
              </button>

              {expandedOrder === order.id && (
                <div className="border-t border-border p-4 bg-muted/30 space-y-4">
                  {/* Items */}
                  <div>
                    <h4 className="font-semibold text-foreground mb-2 text-sm">Items</h4>
                    <div className="space-y-2">
                      {loadingOrderId === order.id ? (
                        <p className="text-sm text-muted-foreground">Loading items...</p>
                      ) : orderItemsByOrderId[order.id]?.length ? (
                        orderItemsByOrderId[order.id].map((item, idx) => (
                          <div key={idx} className="flex items-center justify-between text-sm">
                            <div className="text-foreground">
                              <div>
                                {item.baseDrink || 'Item'} <span className="text-muted-foreground">x{item.quantity}</span>
                              </div>
                              {item.flavors.length > 0 && (
                                <div className="text-xs text-muted-foreground mt-1">
                                  {item.flavors.map(flavor => flavor.name).join(', ')}
                                </div>
                              )}
                            </div>
                            <span className="font-medium text-foreground">${item.totalAmount.toFixed(2)}</span>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-muted-foreground">No item details available.</p>
                      )}
                    </div>
                  </div>

                  {/* Status Update */}
                  <div>
                    <h4 className="font-semibold text-foreground mb-2 text-sm">Update Status</h4>
                    <select
                      value={order.status}
                      onChange={(e) => handleStatusChange(order.id, e.target.value as OrderStatus)}
                      className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                    >
                      {statusOptions.map(status => (
                        <option key={status} value={status} className="capitalize">
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
