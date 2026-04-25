import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react';
import { useAuth } from './AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';

const OrderContext = createContext();

export const OrderProvider = ({ children }) => {
  const { user } = useAuth();
  const [activeOrdersCount, setActiveOrdersCount] = useState(0);
  const prevCountRef = useRef(0);

  const playNotificationSound = useCallback(() => {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    osc.frequency.setValueAtTime(660, ctx.currentTime + 0.1);
    gain.gain.setValueAtTime(0.4, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
    
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.5);
  }, []);

  const checkOrders = useCallback(async () => {
    if (!user || user.role !== 'ADMIN' || !user.cafeId) return;

    try {
      const res = await api.get(`/orders/cafe/${user.cafeId}`);
      const activeOrders = res.data.filter(o => o.status !== 'COMPLETED');
      const currentCount = activeOrders.length;

      if (prevCountRef.current > 0 && currentCount > prevCountRef.current) {
        playNotificationSound();
        toast.success('🔔 New Order Received!', {
          duration: 5000,
          icon: '🍽️',
        });

        if (Notification.permission === 'granted') {
          new Notification('UniteQR - New Order!', {
            body: `New order from Table ${activeOrders[activeOrders.length - 1].tableNumber}`,
            icon: '/favicon.ico'
          });
        }
      }
      
      prevCountRef.current = currentCount;
      setActiveOrdersCount(currentCount);
    } catch (err) {
      console.error('Order poll error:', err);
    }
  }, [user, playNotificationSound]);

  useEffect(() => {
    if (user?.role === 'ADMIN') {
      if (Notification.permission === 'default') {
        Notification.requestPermission();
      }
      
      checkOrders();
      const interval = setInterval(checkOrders, 5000);
      return () => clearInterval(interval);
    }
  }, [user, checkOrders]);

  return (
    <OrderContext.Provider value={{ activeOrdersCount }}>
      {children}
    </OrderContext.Provider>
  );
};

export const useOrders = () => useContext(OrderContext);
