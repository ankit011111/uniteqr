import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard, ShoppingBag, UtensilsCrossed,
  BarChart2, QrCode, LogOut, Menu, X, Users
} from 'lucide-react';
import { useState } from 'react';

const AdminLayout = ({ children, title }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const planType = user?.planType || 500;

  const navItems = [
    { to: '/admin', icon: LayoutDashboard, label: 'Dashboard', exact: true },
    { to: '/admin/orders', icon: ShoppingBag, label: 'Orders' },
    { to: '/admin/menu', icon: UtensilsCrossed, label: 'Menu' },
    { to: '/admin/analytics', icon: BarChart2, label: 'Analytics' },
    { to: '/admin/qr', icon: QrCode, label: 'QR Codes' },
    ...(planType >= 1000 ? [{ to: '/admin/customers', icon: Users, label: 'Customers' }] : []),
  ];

  const handleLogout = () => { logout(); navigate('/admin/login'); };

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar overlay (mobile) */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-20 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed top-0 left-0 h-full w-64 bg-white shadow-xl z-30 transform transition-transform duration-300
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:z-auto`}>
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <div>
            <h1 className="text-xl font-bold text-orange-600">UniteQR</h1>
            <p className="text-xs text-gray-500 truncate">{user?.cafeName}</p>
            <span className={`inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
              planType >= 1500 ? 'bg-red-100 text-red-600' :
              planType >= 1000 ? 'bg-yellow-100 text-yellow-600' :
              'bg-green-100 text-green-600'
            }`}>₹{planType} Plan</span>
          </div>
          <button className="lg:hidden text-gray-500" onClick={() => setSidebarOpen(false)}>
            <X size={20} />
          </button>
        </div>

        <nav className="p-4 space-y-1 flex-1 overflow-y-auto">
          {navItems.map(({ to, icon: Icon, label, exact }) => (
            <NavLink
              key={to}
              to={to}
              end={exact}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all
                ${isActive ? 'bg-orange-50 text-orange-600' : 'text-gray-600 hover:bg-gray-50'}`
              }
              onClick={() => setSidebarOpen(false)}
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-100 mt-auto">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-all"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header className="bg-white border-b border-gray-200 px-4 py-4 flex items-center gap-4">
          <button className="lg:hidden text-gray-600" onClick={() => setSidebarOpen(true)}>
            <Menu size={22} />
          </button>
          <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
        </header>

        <main className="flex-1 p-4 lg:p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
