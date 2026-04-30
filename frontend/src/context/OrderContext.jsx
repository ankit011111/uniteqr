import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react';
import { useAuth } from './AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';

const OrderContext = createContext();

export const OrderProvider = ({ children }) => {
  const { user } = useAuth();
  const [activeOrdersCount, setActiveOrdersCount] = useState(0);
  const prevCountRef = useRef(null);

  const playNotificationSound = useCallback(() => {
    const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
    audio.play().catch(e => console.log('Audio autoplay prevented', e));
  }, []);

  const checkOrders = useCallback(async () => {
    if (!user || user.role !== 'ADMIN' || !user.cafeId) return;

    try {
      const res = await api.get(`/orders/cafe/${user.cafeId}`);
      const activeOrders = res.data.filter(o => o.status !== 'COMPLETED');
      const currentCount = activeOrders.length;
      
      const currentPlacedIds = new Set(res.data.filter(o => o.status === 'PLACED').map(o => o._id));

      if (prevCountRef.current !== null) {
        // Find if there are any new PLACED orders that weren't in the previous set
        const prevPlacedIds = prevCountRef.current;
        const hasNewOrder = [...currentPlacedIds].some(id => !prevPlacedIds.has(id));

        if (hasNewOrder) {
          playNotificationSound();
          toast.success('🔔 New Order Received!', {
            duration: 5000,
            icon: '🍽️',
          });

          if (Notification.permission === 'granted') {
            new Notification('UniteQR - New Order!', {
              body: 'A new order has been placed. Please check the Live Orders tab.',
              icon: '/favicon.ico'
            });
          }
        }
      }
      
      // Store current placed IDs instead of count
      prevCountRef.current = currentPlacedIds;
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
