import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Plus, LogOut, Briefcase } from 'lucide-react';

const EmployeeDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/employee/login'); };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between py-5 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
              <Briefcase size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl font-black text-blue-600 tracking-tight">UniteQR</h1>
              <p className="text-[10px] uppercase font-black text-gray-400 tracking-widest">Employee Panel</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-red-500 transition-colors"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>

        {/* Welcome card */}
        <div className="bg-blue-600 rounded-2xl p-6 text-white mb-6">
          <p className="text-blue-100 text-sm mb-1">Welcome back,</p>
          <h2 className="text-2xl font-bold">{user?.username}</h2>
          <p className="text-blue-100 text-sm mt-2">Ready to onboard a new café?</p>
        </div>

        {/* CTA */}
        <Link
          to="/employee/create-cafe"
          className="flex items-center justify-between bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow group"
        >
          <div>
            <h3 className="font-semibold text-gray-900 text-lg group-hover:text-blue-600 transition-colors">Create New Café</h3>
            <p className="text-sm text-gray-500 mt-1">Generate QR codes + admin credentials in 2 minutes</p>
          </div>
          <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center group-hover:bg-blue-600 transition-colors">
            <Plus size={24} className="text-blue-600 group-hover:text-white transition-colors" />
          </div>
        </Link>

        <div className="mt-6 p-4 bg-white rounded-2xl shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-700 mb-2 text-sm">How it works</h3>
          <div className="space-y-3">
            {[
              { step: '1', text: 'Enter café name, phone & table count' },
              { step: '2', text: 'System auto-generates login credentials' },
              { step: '3', text: 'Download QR codes for each table' },
              { step: '4', text: 'Share credentials with café owner' },
            ].map(({ step, text }) => (
              <div key={step} className="flex items-center gap-3">
                <div className="w-7 h-7 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                  {step}
                </div>
                <p className="text-sm text-gray-600">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDashboard;
