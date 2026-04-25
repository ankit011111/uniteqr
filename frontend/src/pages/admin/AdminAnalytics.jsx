import { useEffect, useState } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import { IndianRupee, ShoppingBag, TrendingUp, Award } from 'lucide-react';

const AdminAnalytics = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [filter, setFilter] = useState('day');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/analytics/${user.cafeId}?filter=${filter}`);
        setData(res.data);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    load();
  }, [filter, user.cafeId]);

  const filters = [
    { key: 'day', label: 'Today' },
    { key: 'month', label: 'This Month' },
    { key: 'all', label: 'All Time' },
  ];

  return (
    <AdminLayout title="Analytics">
      <div className="space-y-6">
        {/* Filter tabs */}
        <div className="bg-white rounded-2xl p-1.5 border border-gray-100 shadow-sm flex gap-1">
          {filters.map(f => (
            <button key={f.key} onClick={() => setFilter(f.key)}
              className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all
                ${filter === f.key ? 'bg-orange-600 text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
              {f.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-16 text-gray-400">Loading analytics...</div>
        ) : data ? (
          <>
            {/* Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center mb-3">
                  <ShoppingBag size={20} className="text-blue-600" />
                </div>
                <p className="text-2xl font-bold text-gray-900">{data.totalOrders}</p>
                <p className="text-sm text-gray-500">Total Orders</p>
              </div>
              <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center mb-3">
                  <IndianRupee size={20} className="text-green-600" />
                </div>
                <p className="text-2xl font-bold text-gray-900">₹{data.revenue}</p>
                <p className="text-sm text-gray-500">Revenue</p>
              </div>
              <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center mb-3">
                  <TrendingUp size={20} className="text-orange-600" />
                </div>
                <p className="text-2xl font-bold text-gray-900">{data.completedOrders}</p>
                <p className="text-sm text-gray-500">Completed</p>
              </div>
              <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center mb-3">
                  <Award size={20} className="text-purple-600" />
                </div>
                <p className="text-2xl font-bold text-gray-900">
                  {data.totalOrders > 0 ? `₹${Math.round(data.revenue / Math.max(data.completedOrders, 1))}` : '—'}
                </p>
                <p className="text-sm text-gray-500">Avg Order Value</p>
              </div>
            </div>

            {/* Order status breakdown */}
            {data.statusCounts && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <h3 className="font-semibold text-gray-900 mb-4">Orders by Status</h3>
                <div className="space-y-3">
                  {Object.entries(data.statusCounts).map(([status, count]) => {
                    const total = data.totalOrders || 1;
                    const pct = Math.round((count / total) * 100);
                    const colors = {
                      PLACED: 'bg-yellow-400',
                      ACCEPTED: 'bg-blue-400',
                      PREPARING: 'bg-orange-400',
                      READY: 'bg-green-400',
                      COMPLETED: 'bg-gray-400',
                    };
                    return (
                      <div key={status}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-600">{status}</span>
                          <span className="font-medium text-gray-900">{count}</span>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full transition-all duration-500 ${colors[status]}`} style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Top items */}
            {data.topItems?.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <h3 className="font-semibold text-gray-900 mb-4">🏆 Top Items</h3>
                <div className="space-y-3">
                  {data.topItems.map((item, i) => (
                    <div key={item.name} className="flex items-center gap-3">
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0
                        ${i === 0 ? 'bg-yellow-500' : i === 1 ? 'bg-gray-400' : i === 2 ? 'bg-amber-700' : 'bg-gray-300'}`}>
                        {i + 1}
                      </span>
                      <span className="flex-1 text-sm text-gray-700">{item.name}</span>
                      <span className="text-sm font-semibold text-gray-900">{item.count} sold</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : null}
      </div>
    </AdminLayout>
  );
};

export default AdminAnalytics;
