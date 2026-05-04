import { useEffect, useState, useRef, useCallback } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { useAuth } from '../../context/AuthContext';
import { useOrders } from '../../context/OrderContext';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { CheckCircle, Clock, ChefHat, Bell } from 'lucide-react';

const STATUS_FLOW = {
  PLACED: { next: 'ACCEPTED', label: 'Accept', color: 'bg-yellow-100 text-yellow-700 border-yellow-200', btnColor: 'bg-yellow-500 hover:bg-yellow-600' },
  ACCEPTED: { next: 'PREPARING', label: 'Start Preparing', color: 'bg-blue-100 text-blue-700 border-blue-200', btnColor: 'bg-blue-500 hover:bg-blue-600' },
  PREPARING: { next: 'READY', label: 'Mark Ready', color: 'bg-orange-100 text-orange-700 border-orange-200', btnColor: 'bg-orange-500 hover:bg-orange-600' },
  READY: { next: 'COMPLETED', label: 'Complete', color: 'bg-green-100 text-green-700 border-green-200', btnColor: 'bg-green-500 hover:bg-green-600' },
  COMPLETED: { next: null, label: '', color: 'bg-gray-100 text-gray-500 border-gray-200', btnColor: '' },
};

const SECTION_ICONS = { PLACED: Bell, ACCEPTED: Clock, PREPARING: ChefHat, READY: CheckCircle };

const AdminOrders = () => {
  const { user } = useAuth();
  const { activeOrdersCount } = useOrders();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = useCallback(async () => {
    try {
      const res = await api.get(`/orders/cafe/${user.cafeId}`);
      setOrders(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [user.cafeId]);

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 5000);
    return () => clearInterval(interval);
  }, [fetchOrders]);

  const updateStatus = async (orderId, status, estimatedTime = null) => {
    try {
      await api.put(`/orders/${orderId}/status`, { status, estimatedTime });
      setOrders(prev => prev.map(o => o._id === orderId ? { ...o, status } : o));
      toast.success(`Order marked as ${status}`);
    } catch {
      toast.error('Failed to update order');
    }
  };

  const sections = ['PLACED', 'ACCEPTED', 'PREPARING', 'READY'];
  const grouped = sections.reduce((acc, s) => {
    acc[s] = orders.filter(o => o.status === s);
    return acc;
  }, {});

  const activeCount = orders.filter(o => o.status !== 'COMPLETED').length;

  return (
    <AdminLayout title="Live Orders">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">Auto-refreshes every 5 seconds</p>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-sm font-medium text-gray-700">{activeCount} active</span>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-20 text-gray-400">Loading orders...</div>
        ) : (
          sections.map(status => {
            const Icon = SECTION_ICONS[status];
            const statusInfo = STATUS_FLOW[status];
            const sectionOrders = grouped[status];

            return (
              <div key={status}>
                <div className="flex items-center gap-2 mb-3">
                  <Icon size={16} className="text-gray-500" />
                  <h3 className="font-semibold text-gray-700 text-sm uppercase tracking-wide">{status}</h3>
                  <span className="bg-gray-200 text-gray-600 text-xs font-bold px-2 py-0.5 rounded-full">{sectionOrders.length}</span>
                </div>

                {sectionOrders.length === 0 ? (
                  <div className="bg-gray-50 rounded-xl p-4 text-center text-sm text-gray-400 mb-4">No orders</div>
                ) : (
                  <div className="space-y-3">
                    {sectionOrders.map(order => (
                      <div key={order._id} className={`bg-white rounded-2xl border p-4 shadow-sm ${statusInfo.color}`}>
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <p className="font-bold text-gray-900">Table {order.tableNumber}</p>
                            <p className="text-xs text-gray-500">{new Date(order.createdAt).toLocaleTimeString()}</p>
                          </div>
                          <span className="font-bold text-gray-900">₹{order.totalAmount}</span>
                        </div>
                        <div className="space-y-1 mb-3">
                          {order.items.map((item, i) => (
                            <div key={i} className="flex justify-between text-sm">
                              <span className="text-gray-700">{item.name} × {item.qty}</span>
                              <span className="text-gray-500">₹{item.price * item.qty}</span>
                            </div>
                          ))}
                        </div>
                        {statusInfo.next && status === 'PLACED' ? (
                          <div className="mt-4 pt-3 border-t border-yellow-200/50">
                            <div className="flex items-center justify-between mb-2">
                              <p className="text-xs font-bold text-yellow-800 flex items-center gap-1">
                                <Clock size={12} /> Accept & Set Time
                              </p>
                            </div>
                            <div className="grid grid-cols-4 gap-2">
                              {[5, 10, 15, 20].map(time => (
                                <button
                                  key={time}
                                  onClick={() => updateStatus(order._id, statusInfo.next, time)}
                                  className="group relative flex flex-col items-center justify-center py-2 bg-white rounded-xl border-2 border-yellow-200 hover:border-yellow-500 hover:bg-yellow-50 transition-all overflow-hidden"
                                >
                                  <span className="text-sm font-black text-yellow-700 group-hover:text-yellow-600">{time}</span>
                                  <span className="text-[9px] font-bold text-yellow-500 uppercase">mins</span>
                                </button>
                              ))}
                            </div>
                          </div>
                        ) : statusInfo.next && (
                          <button
                            onClick={() => updateStatus(order._id, statusInfo.next)}
                            className={`w-full py-2.5 mt-3 rounded-xl text-white text-sm font-bold ${statusInfo.btnColor} transition-all`}
                          >
                            {statusInfo.label}
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })
        )}

        {/* Completed today */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle size={16} className="text-gray-400" />
            <h3 className="font-semibold text-gray-500 text-sm uppercase tracking-wide">Completed</h3>
            <span className="bg-gray-200 text-gray-600 text-xs font-bold px-2 py-0.5 rounded-full">
              {orders.filter(o => o.status === 'COMPLETED').length}
            </span>
          </div>
          <div className="space-y-2">
            {orders.filter(o => o.status === 'COMPLETED').slice(0, 5).map(order => (
              <div key={order._id} className="bg-white rounded-xl p-3 border border-gray-100 flex justify-between items-center opacity-60">
                <div>
                  <span className="text-sm font-medium text-gray-700">Table {order.tableNumber}</span>
                  <span className="text-xs text-gray-400 ml-2">{order.items.length} items</span>
                </div>
                <span className="text-sm font-bold text-gray-600">₹{order.totalAmount}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminOrders;
