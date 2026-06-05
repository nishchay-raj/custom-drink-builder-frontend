'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface MenuItem {
  id: string;
  name: string;
  price: number;
  description: string;
  available: boolean;
  image?: string;
}

export interface OrderItem {
  menuItemId: string;
  name: string;
  quantity: number;
  price: number;
  special_instructions?: string;
}

export interface Order {
  id?: string;
  table_number?: number;
  items: OrderItem[];
  total_amount: number;
  name: string;
  remarks?: string;
  status: 'PENDING' | 'READY' | 'COMPLETED';
  created_at?: string;
}

export interface Payment {
  id: string;
  orderId: string;
  amount: number;
  method: 'card' | 'cash' | 'mobile';
  status: 'PENDING' | 'COMPLETED' | 'FAILED';
  created_at: string;
  processed_at?: string;
}

export interface Feedback {
  id: string;
  name: string;
  rating: 1 | 2 | 3 | 4 | 5;
  feedback: string;
  created_at: string;
  category?: 'Food' | 'Service' | 'Ambiance' | 'Other';
}

interface AppContextType {
  menuItems: MenuItem[];
  orders: Order[];
  payments: Payment[];
  feedbacks: Feedback[];
  addMenuItem: (item: MenuItem) => void;
  updateMenuItem: (id: string, item: Partial<MenuItem>) => void;
  deleteMenuItem: (id: string) => void;
  addOrder: (order: Order) => void;
  updateOrder: (id: string, order: Partial<Order>) => void;
  addPayment: (payment: Payment) => void;
  addFeedback: (feedback: Feedback) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const initialMenuItems: MenuItem[] = [
  { id: '1', name: 'Espresso', price: 2.50, description: 'Rich and bold', available: true },
  { id: '2', name: 'Cappuccino', price: 4.00, description: 'Creamy coffee with milk foam', available: true },
  { id: '3', name: 'Latte', price: 4.50, description: 'Smooth and mild', available: true },
  { id: '4', name: 'Iced Coffee', price: 3.50, description: 'Refreshing cold brew', available: true },
  { id: '5', name: 'Americano', price: 3.00, description: 'Classic Americano', available: true },
  { id: '6', name: 'Mocha', price: 5.00, description: 'Coffee with chocolate', available: true },
  { id: '7', name: 'Croissant', price: 3.50, description: 'Buttery French pastry', available: true },
  { id: '8', name: 'Blueberry Muffin', price: 4.00, description: 'Fresh blueberry', available: true },
  { id: '9', name: 'Chocolate Cake', price: 5.50, description: 'Rich chocolate cake', available: true },
  { id: '10', name: 'Donut', price: 2.50, description: 'Fresh glazed donut', available: true },
  { id: '11', name: 'Orange Juice', price: 3.00, description: 'Fresh squeezed', available: true },
  { id: '12', name: 'Smoothie', price: 5.50, description: 'Mixed fruit smoothie', available: true },
  { id: '13', name: 'Tea', price: 2.50, description: 'Assorted tea selection', available: true },
  { id: '14', name: 'Hot Chocolate', price: 3.50, description: 'Creamy hot chocolate', available: true },
  { id: '15', name: 'Chicken Sandwich', price: 8.50, description: 'Grilled chicken breast', available: true },
  { id: '16', name: 'Turkey Sandwich', price: 8.00, description: 'Sliced turkey breast', available: true },
  { id: '17', name: 'Veggie Wrap', price: 7.50, description: 'Fresh vegetables', available: true },
  { id: '18', name: 'Club Sandwich', price: 9.50, description: 'Triple stack classic', available: true },
];

const initialOrders: Order[] = [
  { id: '1', name: "fo", table_number: 5, items: [{ menuItemId: '1', name: 'Espresso', quantity: 2, price: 2.50 }], total_amount: 5.00, status: 'COMPLETED', created_at: new Date(Date.now() - 3600000).toISOString()},
  { id: '2', name: "fo", items: [{ menuItemId: '3', name: 'Latte', quantity: 1, price: 4.50 }, { menuItemId: '8', name: 'Blueberry Muffin', quantity: 1, price: 4.00 }], total_amount: 8.50, status: 'COMPLETED', created_at: new Date(Date.now() - 2400000).toISOString(), },
  { id: '3', name: "fo", table_number: 3, items: [{ menuItemId: '2', name: 'Cappuccino', quantity: 3, price: 4.00 }], total_amount: 12.00, status: 'READY', created_at: new Date(Date.now() - 1200000).toISOString() },
  { id: '4', name: "fo", table_number: 8, items: [{ menuItemId: '15', name: 'Chicken Sandwich', quantity: 1, price: 8.50 }, { menuItemId: '11', name: 'Orange Juice', quantity: 2, price: 3.00 }], total_amount: 14.50, status: 'READY', created_at: new Date(Date.now() - 900000).toISOString() },
  { id: '5', name: "fo", items: [{ menuItemId: '6', name: 'Mocha', quantity: 1, price: 5.00 }, { menuItemId: '9', name: 'Chocolate Cake', quantity: 1, price: 5.50 }], total_amount: 10.50, status: 'PENDING', created_at: new Date(Date.now() - 300000).toISOString() },
  { id: '6', name: "fo", table_number: 2, items: [{ menuItemId: '4', name: 'Iced Coffee', quantity: 4, price: 3.50 }], total_amount: 14.00, status: 'COMPLETED', created_at: new Date(Date.now() - 7200000).toISOString() },
  { id: '7', name: "fo", items: [{ menuItemId: '12', name: 'Smoothie', quantity: 2, price: 5.50 }], total_amount: 11.00, status: 'COMPLETED', created_at: new Date(Date.now() - 5400000).toISOString()},
];

const initialPayments: Payment[] = [
  { id: '1', orderId: '1', amount: 5.00, method: 'card', status: 'COMPLETED', created_at: new Date(Date.now() - 3600000).toISOString(), processed_at: new Date(Date.now() - 3000000).toISOString() },
  { id: '2', orderId: '2', amount: 8.50, method: 'cash', status: 'COMPLETED', created_at: new Date(Date.now() - 2400000).toISOString(), processed_at: new Date(Date.now() - 2100000).toISOString() },
  { id: '3', orderId: '3', amount: 12.00, method: 'card', status: 'PENDING', created_at: new Date(Date.now() - 1200000).toISOString() },
  { id: '4', orderId: '4', amount: 14.50, method: 'mobile', status: 'COMPLETED', created_at: new Date(Date.now() - 900000).toISOString(), processed_at: new Date(Date.now() - 600000).toISOString() },
  { id: '5', orderId: '6', amount: 14.00, method: 'card', status: 'COMPLETED', created_at: new Date(Date.now() - 7200000).toISOString() },
  { id: '6', orderId: '7', amount: 11.00, method: 'mobile', status: 'COMPLETED', created_at: new Date(Date.now() - 5400000).toISOString() },
];

const initialFeedbacks: Feedback[] = [
  { id: '1', name: '1', rating: 5, feedback: 'Excellent espresso! Perfect temperature.', created_at: new Date(Date.now() - 3000000).toISOString(), category: 'Food' },
  { id: '2', name: '2', rating: 4, feedback: 'Great service, coffee was a bit hot.', created_at: new Date(Date.now() - 2100000).toISOString(), category: 'Service' },
  { id: '3', name: '6', rating: 5, feedback: 'Best iced coffee in town!', created_at: new Date(Date.now() - 7200000).toISOString(), category: 'Food' },
  { id: '4', name: '7', rating: 4, feedback: 'Smoothie was delicious, wish portions were bigger.', created_at: new Date(Date.now() - 5400000).toISOString(), category: 'Food' },
  { id: '5', name: '1', rating: 5, feedback: 'Cozy atmosphere!', created_at: new Date(Date.now() - 3000000).toISOString(), category: 'Ambiance' },
];

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>(initialMenuItems);
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [payments, setPayments] = useState<Payment[]>(initialPayments);
  const [feedbacks, setFeedbacks] = useState<Feedback[]>(initialFeedbacks);

  const addMenuItem = (item: MenuItem) => {
    setMenuItems([...menuItems, item]);
  };

  const updateMenuItem = (id: string, updates: Partial<MenuItem>) => {
    setMenuItems(menuItems.map(item => item.id === id ? { ...item, ...updates } : item));
  };

  const deleteMenuItem = (id: string) => {
    setMenuItems(menuItems.filter(item => item.id !== id));
  };

  const addOrder = (order: Order) => {
    setOrders([...orders, order]);
  };

  const updateOrder = (id: string, updates: Partial<Order>) => {
    setOrders(orders.map(order => order.id === id ? { ...order, ...updates } : order));
  };

  const addPayment = (payment: Payment) => {
    setPayments([...payments, payment]);
  };

  const addFeedback = (feedback: Feedback) => {
    setFeedbacks([...feedbacks, feedback]);
  };

  return (
    <AppContext.Provider value={{ menuItems, orders, payments, feedbacks, addMenuItem, updateMenuItem, deleteMenuItem, addOrder, updateOrder, addPayment, addFeedback }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within AppProvider');
  }
  return context;
};
