import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import { Users, Store, TrendingUp, LogOut, UserPlus, Trash2, Shield, X, Phone, Edit3 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const PLAN_COLORS = {
  500:  { bg: 'bg-green-100',  text: 'text-green-700',  label: '₹500',  name: 'Basic' },
  1000: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: '₹1000', name: 'Growth' },
  1500: { bg: 'bg-red-100',    text: 'text-red-700',    label: '₹1500', name: 'Complete' },
};

const StatCard = ({ icon: Icon, label, value, color, sub }) => (
  <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center gap-4">
    <div className={`w-14 h-14 ${color} rounded-2xl flex items-center justify-center shrink-0`}>
      <Icon size={24} className="text-white" />
    </div>
    <div>
      <p className="text-sm font-medium text-gray-500">{label}</p>
      <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
    </div>
  </div>
);

const PlanBadge = ({ plan }) => {
  const c = PLAN_COLORS[plan] || PLAN_COLORS[500];
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${c.bg} ${c.text}`}>
      {c.label} · {c.name}
    </span>
  );
};

const OwnerDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newEmp, setNewEmp] = useState({ username: '', password: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cafeSearch, setCafeSearch] = useState('');

  // Edit Cafe State
  const [showEditCafe, setShowEditCafe] = useState(false);
  const [editingCafe, setEditingCafe] = useState(null);
  const [editCafeData, setEditCafeData] = useState({ planType: 500, password: '', cafeName: '' });

  const fetchStats = async () => {
    try {
      const res = await api.get('/owner/stats');
      setStats(res.data);
    } catch {
      toast.error('Failed to load owner statistics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchStats(); }, []);

  const handleLogout = () => { logout(); navigate('/employee/login'); };

  const handleAddEmployee = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.post('/owner/employees', newEmp);
      toast.success('Employee created successfully!');
      setShowAddModal(false);
      setNewEmp({ username: '', password: '' });
      fetchStats();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to create employee');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteEmployee = async (id, empName) => {
    if (empName === user.username) { toast.error('You cannot delete your own account!'); return; }
    if (!window.confirm(`Delete employee "${empName}"?`)) return;
    try {
      await api.delete(`/owner/employees/${id}`);
      toast.success('Employee deleted');
      fetchStats();
    } catch { toast.error('Failed to delete employee'); }
  };

  const handleEditCafe = (cafe) => {
    setEditingCafe(cafe);
    setEditCafeData({ planType: cafe.planType || 500, password: '', cafeName: cafe.cafeName || '' });
    setShowEditCafe(true);
  };

  const handleUpdateCafe = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = { planType: editCafeData.planType };
      if (editCafeData.password.trim()) {
        payload.password = editCafeData.password.trim();
      }
      if (editCafeData.cafeName?.trim()) {
        payload.cafeName = editCafeData.cafeName.trim();
      }
      await api.put(`/owner/cafes/${editingCafe.cafeId}`, payload);
      toast.success('Cafe updated successfully');
      setShowEditCafe(false);
      fetchStats();
    } catch (err) {
      toast.error('Failed to update cafe');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCafe = async (cafeId, cafeName) => {
    if (!window.confirm(`Delete café "${cafeName}" and ALL its orders permanently?`)) return;
    try {
      await api.delete(`/owner/cafes/${cafeId}`);
      toast.success('Café deleted');
      fetchStats();
    } catch {
      toast.error('Failed to delete café');
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center font-bold text-blue-600 animate-pulse text-xl">Loading Master Panel...</div>;
  }

  const totalRevenue = stats?.cafeStats?.reduce((acc, c) => acc + c.revenue, 0) || 0;
  const pb = stats?.planBreakdown || {};

  const filteredCafes = (stats?.cafeStats || []).filter(c =>
    c.cafeName.toLowerCase().includes(cafeSearch.toLowerCase()) ||
    c.createdBy.toLowerCase().includes(cafeSearch.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 pb-10 font-sans selection:bg-blue-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-600/20">
              <Shield size={22} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl font-black text-gray-900 tracking-tight">Master Portal</h1>
              <p className="text-[10px] uppercase font-black text-blue-600 tracking-widest">UniteQR Enterprise</p>
            </div>
          </div>
          <button onClick={handleLogout} className="flex items-center gap-2 text-gray-400 hover:text-red-600 font-bold text-xs uppercase tracking-widest transition-all p-2">
            <LogOut size={18} /><span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 mt-8 space-y-8">

        {/* Welcome Banner */}
        <div className="bg-gray-900 rounded-[32px] p-10 text-white shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-700">
            <Shield size={200} />
          </div>
          <div className="relative z-10">
            <p className="text-blue-400 font-black uppercase tracking-[0.2em] text-xs mb-3">System Administrator</p>
            <h2 className="text-5xl font-black mb-4">Hello, {user?.username}</h2>
            <p className="text-gray-400 mt-2 max-w-xl text-lg font-medium leading-relaxed">
              Global dashboard for platform oversight. Manage your sales team, track café acquisitions, and monitor revenue.
            </p>
          </div>
        </div>

        {/* Global Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard icon={Store}     label="Cafés Onboarded"       value={stats?.totalCafes || 0}  color="bg-blue-600"    sub={`${pb.plan500||0} Basic · ${pb.plan1000||0} Growth · ${pb.plan1500||0} Complete`} />
          <StatCard icon={TrendingUp} label="Total Platform Revenue" value={`₹${totalRevenue}`}      color="bg-emerald-500" />
          <StatCard icon={Users}     label="Sales Force"            value={stats?.employeeStats?.length || 0} color="bg-indigo-600" />
        </div>

        {/* Plan Breakdown Cards */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { plan: 500,  icon: '🟢', count: pb.plan500  || 0 },
            { plan: 1000, icon: '🟡', count: pb.plan1000 || 0 },
            { plan: 1500, icon: '🔴', count: pb.plan1500 || 0 },
          ].map(({ plan, icon, count }) => {
            const c = PLAN_COLORS[plan];
            return (
              <div key={plan} className={`rounded-2xl p-5 border ${c.bg} border-opacity-50`}>
                <p className="text-xs font-black uppercase tracking-widest text-gray-500 mb-1">{icon} {c.label} Plan</p>
                <p className={`text-4xl font-black ${c.text}`}>{count}</p>
                <p className="text-xs text-gray-500 mt-1">{c.name} cafés</p>
              </div>
            );
          })}
        </div>

        {/* Cafés Table */}
        <div className="bg-white rounded-[32px] shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-8 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-2xl font-black text-gray-900">Café Registry</h3>
              <p className="text-sm text-gray-500 mt-1">All onboarded cafés with their active plan</p>
            </div>
            <input
              type="text"
              placeholder="Search cafés..."
              value={cafeSearch}
              onChange={e => setCafeSearch(e.target.value)}
              className="bg-gray-50 border-0 rounded-2xl px-5 py-3 text-sm font-bold focus:ring-2 focus:ring-blue-600 outline-none w-full sm:w-64"
            />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50/50 text-gray-400 font-black uppercase tracking-widest text-[10px] border-b border-gray-100">
                <tr>
                  <th className="px-8 py-5">Café</th>
                  <th className="px-8 py-5">Plan</th>
                  <th className="px-8 py-5">Phone</th>
                  <th className="px-8 py-5">Added By</th>
                  <th className="px-8 py-5 text-right">Orders</th>
                  <th className="px-8 py-5 text-right">Revenue</th>
                  <th className="px-8 py-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredCafes.length === 0 ? (
                  <tr><td colSpan={6} className="text-center py-10 text-gray-400">No cafés found</td></tr>
                ) : filteredCafes.map(cafe => (
                  <tr key={cafe.cafeId} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-8 py-5">
                      <div>
                        <p className="font-bold text-gray-900">{cafe.cafeName}</p>
                        <p className="text-[10px] text-gray-400 font-mono">{cafe.cafeId}</p>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <PlanBadge plan={cafe.planType} />
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-1.5 text-gray-600 text-xs font-bold">
                        <Phone size={12} />
                        {cafe.phone || '—'}
                      </div>
                    </td>
                    <td className="px-8 py-5 text-gray-500 font-bold text-xs">{cafe.createdBy}</td>
                    <td className="px-8 py-5 text-right font-black text-gray-700">{cafe.totalOrders}</td>
                    <td className="px-8 py-5 text-right font-black text-emerald-600 text-lg">₹{cafe.revenue}</td>
                    <td className="px-8 py-5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEditCafe(cafe)}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                          title="Edit Café"
                        >
                          <Edit3 size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteCafe(cafe.cafeId, cafe.cafeName)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                          title="Delete Café"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Employee Management + Appointments Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* Employee Management */}
          <div className="bg-white rounded-[32px] shadow-sm border border-gray-100 overflow-hidden flex flex-col">
            <div className="p-8 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-xl font-black text-gray-900">Sales Team</h3>
                <p className="text-sm text-gray-500 mt-1">Manage your sales employees</p>
              </div>
              <button
                onClick={() => setShowAddModal(true)}
                className="flex items-center justify-center gap-2 bg-blue-600 text-white px-5 py-3 rounded-2xl font-black text-sm hover:bg-gray-900 transition-all shadow-xl shadow-blue-600/20"
              >
                <UserPlus size={16} /> Add Employee
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50/50 text-gray-400 font-black uppercase tracking-widest text-[10px] border-b border-gray-100">
                  <tr>
                    <th className="px-8 py-5">Name</th>
                    <th className="px-8 py-5 text-center">Today</th>
                    <th className="px-8 py-5 text-center">Total</th>
                    <th className="px-8 py-5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {stats?.employeeStats?.map(emp => (
                    <tr key={emp._id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-black text-xs">
                            {emp.username.substring(0, 2).toUpperCase()}
                          </div>
                          <p className="font-bold text-gray-900">{emp.username}</p>
                        </div>
                      </td>
                      <td className="px-8 py-5 text-center">
                        <span className={`px-3 py-1 rounded-full text-xs font-black ${emp.createdToday > 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-400'}`}>
                          {emp.createdToday}
                        </span>
                      </td>
                      <td className="px-8 py-5 text-center font-black text-gray-700">{emp.totalCreated}</td>
                      <td className="px-8 py-5 text-right">
                        <button
                          onClick={() => handleDeleteEmployee(emp._id, emp.username)}
                          className={`p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all ${emp.username === user.username ? 'opacity-0 pointer-events-none' : ''}`}
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Appointments */}
          <div className="bg-white rounded-[32px] shadow-sm border border-gray-100 overflow-hidden flex flex-col">
            <div className="p-8 border-b border-gray-100">
              <h3 className="text-xl font-black text-gray-900">Leads & Inquiries</h3>
              <p className="text-sm text-gray-500 mt-1">Direct requests from the homepage</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50/50 text-gray-400 font-black uppercase tracking-widest text-[10px] border-b border-gray-100">
                  <tr>
                    <th className="px-8 py-5">Service</th>
                    <th className="px-8 py-5">Name</th>
                    <th className="px-8 py-5">WhatsApp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {stats?.appointments?.map(appt => (
                    <tr key={appt._id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-8 py-5">
                        <span className="inline-flex px-3 py-1 rounded-xl bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase tracking-widest border border-indigo-100">
                          {appt.serviceOfInterest || 'Menu QR'}
                        </span>
                      </td>
                      <td className="px-8 py-5 font-bold text-gray-900">{appt.fullName}</td>
                      <td className="px-8 py-5 font-black text-blue-600">{appt.contactNumber}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>

      {/* Add Employee Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={() => setShowAddModal(false)} />
          <div className="relative bg-white w-full max-w-md rounded-[32px] shadow-2xl p-10 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-2xl font-black text-gray-900">New Employee</h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-900"><X size={24} /></button>
            </div>
            <form onSubmit={handleAddEmployee} className="space-y-6">
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Username</label>
                <input type="text" required value={newEmp.username} onChange={e => setNewEmp({ ...newEmp, username: e.target.value })}
                  className="w-full bg-gray-50 border-0 rounded-2xl px-5 py-4 text-sm font-bold focus:ring-2 focus:ring-blue-600 outline-none" placeholder="e.g. rahul_sales" />
              </div>
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Password</label>
                <input type="password" required value={newEmp.password} onChange={e => setNewEmp({ ...newEmp, password: e.target.value })}
                  className="w-full bg-gray-50 border-0 rounded-2xl px-5 py-4 text-sm font-bold focus:ring-2 focus:ring-blue-600 outline-none" placeholder="••••••••" />
              </div>
              <button type="submit" disabled={isSubmitting}
                className="w-full bg-blue-600 text-white font-black py-5 rounded-2xl text-lg hover:bg-gray-900 transition-all disabled:opacity-50 shadow-xl">
                {isSubmitting ? 'Creating...' : 'Create Employee Access'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Edit Cafe Modal */}
      {showEditCafe && editingCafe && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={() => setShowEditCafe(false)} />
          <div className="relative bg-white w-full max-w-md rounded-[32px] shadow-2xl p-10 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-2xl font-black text-gray-900">Edit Café</h3>
                <p className="text-xs text-gray-500 font-bold">{editingCafe.cafeName}</p>
              </div>
              <button onClick={() => setShowEditCafe(false)} className="text-gray-400 hover:text-gray-900"><X size={24} /></button>
            </div>
            
            <form onSubmit={handleUpdateCafe} className="space-y-6">
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Café Name</label>
                <input 
                  type="text" 
                  value={editCafeData.cafeName} 
                  onChange={e => setEditCafeData({ ...editCafeData, cafeName: e.target.value })}
                  className="w-full bg-gray-50 border-0 rounded-2xl px-5 py-4 text-sm font-bold focus:ring-2 focus:ring-blue-600 outline-none" 
                  placeholder="Café Name" 
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Subscription Plan</label>
                <select
                  value={editCafeData.planType}
                  onChange={e => setEditCafeData({ ...editCafeData, planType: Number(e.target.value) })}
                  className="w-full bg-gray-50 border-0 rounded-2xl px-5 py-4 text-sm font-bold focus:ring-2 focus:ring-blue-600 outline-none appearance-none"
                >
                  <option value={500}>₹500 · Basic (QR Only)</option>
                  <option value={1000}>₹1000 · Growth (Customer CRM)</option>
                  <option value={1500}>₹1500 · Complete (Online Payments)</option>
                </select>
              </div>
              
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Reset Password</label>
                <input 
                  type="password" 
                  value={editCafeData.password} 
                  onChange={e => setEditCafeData({ ...editCafeData, password: e.target.value })}
                  className="w-full bg-gray-50 border-0 rounded-2xl px-5 py-4 text-sm font-bold focus:ring-2 focus:ring-blue-600 outline-none" 
                  placeholder="Leave blank to keep unchanged" 
                />
              </div>

              <button type="submit" disabled={isSubmitting}
                className="w-full bg-blue-600 text-white font-black py-5 rounded-2xl text-lg hover:bg-gray-900 transition-all disabled:opacity-50 shadow-xl">
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default OwnerDashboard;
