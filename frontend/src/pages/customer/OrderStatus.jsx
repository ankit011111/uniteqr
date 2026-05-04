import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../utils/api';
import { Coffee, CheckCircle, Circle, Clock } from 'lucide-react';

const STEPS = [
  { status: 'PLACED', label: 'Order Placed', emoji: '📋', desc: 'Your order has been received' },
  { status: 'ACCEPTED', label: 'Accepted', emoji: '✅', desc: 'Café has accepted your order' },
  { status: 'PREPARING', label: 'Preparing', emoji: '👨‍🍳', desc: 'Your food is being prepared' },
  { status: 'READY', label: 'Ready!', emoji: '🛎️', desc: 'Your order is ready to collect' },
];

const STATUS_ORDER = ['PLACED', 'ACCEPTED', 'PREPARING', 'READY', 'COMPLETED'];

const OrderStatus = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchOrder = async () => {
    try {
      const res = await api.get(`/orders/track/${orderId}`);
      setOrder(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
    const interval = setInterval(fetchOrder, 5000);
    return () => clearInterval(interval);
  }, [orderId]);

  const [timeLeft, setTimeLeft] = useState(null);

  useEffect(() => {
    if (order?.estimatedCompletionTime && !['READY', 'COMPLETED'].includes(order.status)) {
      const target = new Date(order.estimatedCompletionTime).getTime();
      
      const updateTimer = () => {
        const now = Date.now();
        const diff = target - now;
        if (diff > 0) {
          const m = Math.floor(diff / 60000);
          const s = Math.floor((diff % 60000) / 1000);
          setTimeLeft(`${m}:${s.toString().padStart(2, '0')}`);
        } else {
          setTimeLeft('Almost ready...');
        }
      };

      updateTimer();
      const interval = setInterval(updateTimer, 1000);
      return () => clearInterval(interval);
    } else {
      setTimeLeft(null);
    }
  }, [order?.estimatedCompletionTime, order?.status]);

  const currentIndex = order ? STATUS_ORDER.indexOf(order.status) : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-3 animate-pulse">
            <Coffee size={24} className="text-orange-600" />
          </div>
          <p className="text-gray-500">Loading order...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-gray-500 mb-4">Order not found</p>
          <Link to="/" className="text-orange-600 underline">Go back</Link>
        </div>
      </div>
    );
  }

  const isCompleted = order.status === 'COMPLETED';

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-gray-50 p-4">
      <div className="max-w-md mx-auto pt-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Coffee size={32} className="text-orange-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Order Status</h1>
          <p className="text-gray-500 text-sm mt-1">Table {order.tableNumber}</p>
          <div className="flex items-center justify-center gap-2 mt-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xs text-green-600 font-medium">Live updates</span>
          </div>
          {timeLeft && (
            <div className="mt-8 relative mb-4">
              <div className="absolute inset-0 bg-orange-400 opacity-20 blur-xl rounded-full animate-pulse"></div>
              <div className="relative inline-flex flex-col items-center justify-center bg-white border border-orange-100 px-8 py-6 rounded-[32px] shadow-xl">
                <div className="flex items-center gap-2 mb-2">
                  <Clock size={16} className="text-orange-500 animate-spin-slow" />
                  <p className="text-[11px] text-orange-500 font-black uppercase tracking-[0.2em]">Estimated Wait</p>
                </div>
                <div className="text-5xl font-black text-gray-900 font-mono tracking-tighter" style={{ fontVariantNumeric: 'tabular-nums' }}>
                  {timeLeft.includes(':') ? (
                    <>
                      <span className="text-orange-600">{timeLeft.split(':')[0]}</span>
                      <span className="text-orange-300 mx-1 animate-pulse">:</span>
                      <span className="text-orange-600">{timeLeft.split(':')[1]}</span>
                    </>
                  ) : (
                    <span className="text-xl text-orange-600">{timeLeft}</span>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {isCompleted ? (
          <div className="bg-white rounded-2xl p-8 text-center shadow-sm border border-green-100 mb-6">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle size={40} className="text-green-500" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Order Completed! 🎉</h2>
            <p className="text-gray-500">Thank you for dining with us!</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
            <div className="space-y-0">
              {STEPS.map((step, idx) => {
                const stepIndex = STATUS_ORDER.indexOf(step.status);
                const isDone = currentIndex > stepIndex;
                const isCurrent = currentIndex === stepIndex;

                return (
                  <div key={step.status} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg flex-shrink-0 transition-all
                        ${isDone ? 'bg-green-100' : isCurrent ? 'bg-orange-100 ring-2 ring-orange-400' : 'bg-gray-100'}`}>
                        {isDone ? '✅' : step.emoji}
                      </div>
                      {idx < STEPS.length - 1 && (
                        <div className={`w-0.5 h-8 my-1 ${isDone ? 'bg-green-300' : 'bg-gray-200'}`} />
                      )}
                    </div>
                    <div className="pb-6 pt-1.5">
                      <p className={`font-semibold text-sm ${isCurrent ? 'text-orange-600' : isDone ? 'text-green-600' : 'text-gray-400'}`}>
                        {step.label}
                      </p>
                      <p className="text-xs text-gray-400">{step.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Order summary */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-900 mb-3">Order Summary</h3>
          <div className="space-y-2">
            {order.items.map((item, i) => (
              <div key={i} className="flex justify-between text-sm">
                <span className="text-gray-700">{item.name} × {item.qty}</span>
                <span className="font-medium text-gray-900">₹{item.price * item.qty}</span>
              </div>
            ))}
            <div className="border-t border-gray-100 pt-2 flex justify-between font-bold">
              <span className="text-gray-900">Total</span>
              <span className="text-orange-600">₹{order.totalAmount}</span>
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-gray-400 mt-12 pb-8">
          Powered by <span className="font-black text-blue-600 tracking-tight">UniteQR</span>
        </p>
      </div>
    </div>
  );
};

export default OrderStatus;
