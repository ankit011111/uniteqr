import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from '../../components/AdminLayout';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import { ShoppingBag, IndianRupee, UtensilsCrossed, TrendingUp } from 'lucide-react';

const StatCard = ({ icon: Icon, label, value, color }) => (
  <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
    <div className={`w-10 h-10 ${color} rounded-xl flex items-center justify-center mb-3`}>
      <Icon size={20} className="text-white" />
    </div>
    <p className="text-2xl font-bold text-gray-900">{value}</p>
    <p className="text-sm text-gray-500 mt-0.5">{label}</p>
  </div>
);

const AdminDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        const [analyticsRes, ordersRes] = await Promise.all([
          api.get(`/analytics/${user.cafeId}?filter=day`),
          api.get(`/orders/cafe/${user.cafeId}`)
        ]);
        setStats(analyticsRes.data);
        setRecentOrders(ordersRes.data.slice(0, 5));
      } catch (err) {
        console.error(err);
      }
    };
    load();
  }, [user.cafeId]);

  const statusColors = {
    PLACED: 'bg-yellow-100 text-yellow-700',
    ACCEPTED: 'bg-blue-100 text-blue-700',
    PREPARING: 'bg-orange-100 text-orange-700',
    READY: 'bg-green-100 text-green-700',
    COMPLETED: 'bg-gray-100 text-gray-600',
  };

  return (
    <AdminLayout title="Dashboard">
      <div className="space-y-6">
        {/* Welcome */}
        <div className="bg-gradient-to-r from-orange-500 to-amber-500 rounded-2xl p-6 text-white">
          <p className="text-orange-100 text-sm">Good day,</p>
          <h2 className="text-2xl font-bold">{user?.cafeName}</h2>
          <p className="text-orange-100 text-sm mt-1">Here's your café overview for today</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4">
          <StatCard icon={ShoppingBag} label="Orders Today" value={stats?.totalOrders ?? '—'} color="bg-blue-500" />
          <StatCard icon={IndianRupee} label="Revenue Today" value={stats ? `₹${stats.revenue}` : '—'} color="bg-green-500" />
          <StatCard icon={UtensilsCrossed} label="Completed" value={stats?.completedOrders ?? '—'} color="bg-orange-500" />
          <StatCard icon={TrendingUp} label="Pending" value={stats ? (stats.totalOrders - stats.completedOrders) : '—'} color="bg-purple-500" />
        </div>

        {/* Quick links */}
        <div className="grid grid-cols-2 gap-3">
          {[
            { to: '/admin/orders', label: '📋 Live Orders', bg: 'bg-red-50 border-red-100 text-red-700' },
            { to: '/admin/menu', label: '🍽️ Manage Menu', bg: 'bg-orange-50 border-orange-100 text-orange-700' },
            { to: '/admin/analytics', label: '📊 Analytics', bg: 'bg-blue-50 border-blue-100 text-blue-700' },
            { to: '/admin/qr', label: '📲 QR Codes', bg: 'bg-green-50 border-green-100 text-green-700' },
          ].map(({ to, label, bg }) => (
            <Link key={to} to={to} className={`rounded-2xl border p-4 font-medium text-sm hover:shadow-md transition-shadow ${bg}`}>
              {label}
            </Link>
          ))}
        </div>

        {/* Recent orders */}
        {recentOrders.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Recent Orders</h3>
              <Link to="/admin/orders" className="text-xs text-orange-600 hover:underline">View all</Link>
            </div>
            <div className="space-y-3">
              {recentOrders.map(order => (
                <div key={order._id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Table {order.tableNumber}</p>
                    <p className="text-xs text-gray-500">{order.items.length} item{order.items.length !== 1 ? 's' : ''} · ₹{order.totalAmount}</p>
                  </div>
                  <span className={`text-xs font-medium px-2 py-1 rounded-lg ${statusColors[order.status]}`}>
                    {order.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
