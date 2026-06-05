'use client';

import axios from 'axios';
import { useState, useEffect } from 'react';

type OrderStatus = 'PENDING' | 'READY' | 'COMPLETED';

interface OrderItem {
  id: string;
  baseDrink?: string;
  basePrice: number;
  quantity: number;
  totalAmount: number;
  flavors: OrderFlavor[];
}

interface OrderFlavor {
  name: string;
  price: number;
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
  created_at: string | Date;
}

interface KDSOrder {
  id: string;
  payment_method: string;
  payment_successful: boolean;
  status: OrderStatus;
  table_number: number | null;
  total_amount: number;
  name: string;
  remarks: string;
  created_at: string | Date;
}

const TIME_COLORS = (minutesElapsed: number) => {
  if (minutesElapsed < 8) return { bg: 'bg-blue-50', text: 'text-blue-600', label: 'Fresh' };
  if (minutesElapsed < 15) return { bg: 'bg-yellow-50', text: 'text-yellow-700', label: 'Medium' };
  return { bg: 'bg-red-50', text: 'text-red-600', label: 'Late' };
};

export default function KitchenDisplay() {
  const [orders, setOrders] = useState<KDSOrder[]>([]);
  const [orderItemsByOrderId, setOrderItemsByOrderId] = useState<Record<string, OrderItem[]>>({});
  const [loadingOrderId, setLoadingOrderId] = useState<string | null>(null);

  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const fetchOrder = async () => {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/order/get/all`,
        {withCredentials: true},
      );

      setOrders(
        Array.isArray(res.data)
          ? res.data.map((order: KDSOrder) => ({
              ...order,
              created_at: new Date(order.created_at),
            }))
          : [],
      );
    };

    fetchOrder();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
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

  // Auto-load items for each order when orders list changes
  useEffect(() => {
    if (!orders || orders.length === 0) return;

    orders.forEach(o => {
      loadOrderItems(o.id);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orders]);

  const completeOrder = async (order: Orders) => {
    const targetStatus: OrderStatus = order.status === 'PENDING' ? 'READY' : 'COMPLETED';
    updateOrderStatus(order.id, targetStatus);
  };

  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);

  const updateOrderStatus = async (orderId: string, status: OrderStatus) => {
    setUpdatingOrderId(orderId);

    // optimistic update
    setOrders(prev => prev.map(o => (o.id === orderId ? { ...o, status } : o)));

    try {
      await axios.patch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/order/${orderId}/update/status`,
        { status },
        { withCredentials: true },
      );

      if (status === 'COMPLETED') {
        setOrders(prev => prev.filter(o => o.id !== orderId));
      }
    } catch (err) {
      console.error('Failed to update order status', err);
      // rollback by refetching orders
      try {
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/order/get/all`,
          { withCredentials: true },
        );

        setOrders(
          Array.isArray(res.data)
            ? res.data.map((order: KDSOrder) => ({ ...order, created_at: new Date(order.created_at) }))
            : [],
        );
      } catch (e) {
        console.error('Failed to refetch orders after rollback', e);
      }
    } finally {
      setUpdatingOrderId(current => (current === orderId ? null : current));
    }
  };

  const getMinutesElapsed = (order: Orders) => {
    const createdAt = order.created_at instanceof Date
      ? order.created_at
      : new Date(order.created_at);

    const createdAtMs = createdAt.getTime();

    if (Number.isNaN(createdAtMs)) {
      return 0;
    }

    return Math.floor((time.getTime() - createdAtMs) / 60000);
  };

  const formatTime = (date: Date) => {
    const h = date.getHours();
    const m = String(date.getMinutes()).padStart(2, '0');
    return `${h}:${m}`;
  };

  return (
    <div className="h-full bg-secondary overflow-y-auto p-4 sm:p-5">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col gap-2 sm:flex-row sm:justify-between sm:items-center mb-4">
          <h2 className="text-xl font-medium">Kitchen Display</h2>
          <span className="font-light text-lg text-muted-foreground">{formatTime(time)}</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
          {orders.map(order => {
            const minutesElapsed = getMinutesElapsed(order);
            const timeColor = TIME_COLORS(minutesElapsed);

            return (
              <div
                key={order.id}
                className={`
                  bg-background border-2 rounded-2xl p-4 w-full
                  ${order.status === 'PENDING' ? 'border-accent shadow-lg shadow-accent/20' : ''}
                  ${order.status === 'READY' ? 'border-blue-500' : ''}
                `}
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <div className="text-lg font-bold tracking-tight">{order.name}</div>
                  </div>
                  <div className={`${timeColor.bg} ${timeColor.text} px-3 py-1.5 rounded-lg text-xs font-bold`}>
                    {minutesElapsed}m
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  {(orderItemsByOrderId[order.id] ?? []).map((item) => (
                    <div key={item.id ?? Math.random()} className="bg-secondary rounded-lg p-3">
                      <div className="font-medium text-sm mb-2">{item.baseDrink} ×{item.quantity}</div>
                      {item.flavors && item.flavors.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {item.flavors.map((part, pidx) => (
                            <span
                              key={pidx}
                              className="text-xs bg-background border border-border rounded-md px-2 py-1 text-muted-foreground"
                            >
                              {part.name}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => completeOrder(order)}
                    className="flex-1 px-3 py-2 bg-green-600 text-white text-xs font-medium rounded-lg hover:bg-green-700 cursor-pointer transition"
                  >
                    {order.status === "PENDING" ? "Mark as ready" : "Mark as Completed"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {orders.length === 0 && (
          <div className="text-center py-12">
            <div className="text-5xl mb-3">✓</div>
            <p className="text-lg font-medium">All orders completed!</p>
            <p className="text-sm text-muted-foreground mt-1">Ready for new orders</p>
          </div>
        )}
      </div>

    </div>
  );
}
