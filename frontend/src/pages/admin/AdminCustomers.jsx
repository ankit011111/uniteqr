import { useEffect, useState } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import { Users, Phone, ShoppingBag, Lock } from 'lucide-react';

const AdminCustomers = () => {
  const { user } = useAuth();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [planAllowed, setPlanAllowed] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get(`/orders/cafe/${user.cafeId}/customers`);
        setCustomers(res.data);
      } catch (err) {
        if (err.response?.status === 403) {
          setPlanAllowed(false);
        }
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [user.cafeId]);

  if (!planAllowed) {
    return (
      <AdminLayout title="Customers">
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-20 h-20 bg-yellow-100 rounded-3xl flex items-center justify-center mb-6">
            <Lock size={36} className="text-yellow-500" />
          </div>
          <h2 className="text-2xl font-black text-gray-900 mb-2">Upgrade Required</h2>
          <p className="text-gray-500 max-w-xs leading-relaxed">Customer data access requires the <span className="font-bold text-yellow-600">₹1000 Plan</span> or higher. Contact your sales team to upgrade.</p>
          <div className="mt-8 px-6 py-3 bg-yellow-50 border border-yellow-200 rounded-2xl text-sm font-bold text-yellow-700">
            ₹1000 Plan • ₹1500 Plan
          </div>
        </div>
      </AdminLayout>
    );
  }

  // Group by phone number - aggregate orders per customer
  const customerMap = {};
  customers.forEach(order => {
    const phone = order.customerPhone;
    if (!customerMap[phone]) {
      customerMap[phone] = { phone, orders: [], totalSpent: 0, lastSeen: order.createdAt };
    }
    customerMap[phone].orders.push(order);
    customerMap[phone].totalSpent += order.totalAmount;
    if (new Date(order.createdAt) > new Date(customerMap[phone].lastSeen)) {
      customerMap[phone].lastSeen = order.createdAt;
    }
  });

  const uniqueCustomers = Object.values(customerMap).sort((a, b) => new Date(b.lastSeen) - new Date(a.lastSeen));

  return (
    <AdminLayout title="Customers">
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-blue-50 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <Users size={16} className="text-blue-500" />
              <span className="text-xs font-semibold text-blue-600 uppercase tracking-wide">Total Customers</span>
            </div>
            <p className="text-3xl font-black text-blue-700">{uniqueCustomers.length}</p>
          </div>
          <div className="bg-orange-50 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <ShoppingBag size={16} className="text-orange-500" />
              <span className="text-xs font-semibold text-orange-600 uppercase tracking-wide">Total Orders</span>
            </div>
            <p className="text-3xl font-black text-orange-700">{customers.length}</p>
          </div>
        </div>

        {/* Customer List */}
        {loading ? (
          <div className="text-center py-16 text-gray-400">Loading customers...</div>
        ) : uniqueCustomers.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <Phone size={36} className="mx-auto mb-3 opacity-30" />
            <p className="font-medium">No customers yet</p>
            <p className="text-sm mt-1">Phone numbers will appear here once customers place orders</p>
          </div>
        ) : (
          <div className="space-y-3">
            {uniqueCustomers.map(c => (
              <div key={c.phone} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
                      <Phone size={18} className="text-orange-600" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">{c.phone}</p>
                      <p className="text-xs text-gray-500">
                        {c.orders.length} order{c.orders.length !== 1 ? 's' : ''} •  Last: {new Date(c.lastSeen).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-gray-900">₹{c.totalSpent}</p>
                    <p className="text-xs text-gray-400">total spent</p>
                  </div>
                </div>

                {/* Order history mini */}
                <div className="mt-3 space-y-1.5">
                  {c.orders.slice(0, 2).map(order => (
                    <div key={order._id} className="flex justify-between items-center bg-gray-50 rounded-xl px-3 py-2 text-xs">
                      <span className="text-gray-600">Table {order.tableNumber} • {order.items.length} items</span>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-gray-800">₹{order.totalAmount}</span>
                        <span className={`px-2 py-0.5 rounded-full font-bold ${
                          order.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                          order.status === 'PLACED' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-blue-100 text-blue-700'
                        }`}>{order.status}</span>
                      </div>
                    </div>
                  ))}
                  {c.orders.length > 2 && (
                    <p className="text-xs text-gray-400 text-center">+{c.orders.length - 2} more orders</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminCustomers;
