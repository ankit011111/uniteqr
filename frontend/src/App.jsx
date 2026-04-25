import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { OrderProvider } from './context/OrderContext';
import { Toaster } from 'react-hot-toast';

// Public
import HomePage from './pages/HomePage';

// Employee
import EmployeeLogin from './pages/employee/EmployeeLogin';
import EmployeeDashboard from './pages/employee/EmployeeDashboard';
import CreateCafe from './pages/employee/CreateCafe';

// Owner
import OwnerDashboard from './pages/owner/OwnerDashboard';

// Admin
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminOrders from './pages/admin/AdminOrders';
import AdminMenu from './pages/admin/AdminMenu';
import AdminAnalytics from './pages/admin/AdminAnalytics';
import AdminQR from './pages/admin/AdminQR';

// Customer
import CustomerMenu from './pages/customer/CustomerMenu';
import OrderStatus from './pages/customer/OrderStatus';

const PrivateRoute = ({ children, role }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/admin/login" replace />;
  if (role && user.role !== role) return <Navigate to="/" replace />;
  return children;
};

const App = () => (
  <AuthProvider>
    <OrderProvider>
      <BrowserRouter>
        <Toaster position="top-center" />
        <Routes>
        {/* Customer */}
        <Route path="/cafe/:cafeId/table/:tableNumber" element={<CustomerMenu />} />
        <Route path="/order/:orderId" element={<OrderStatus />} />

        {/* Employee / Owner */}
        <Route path="/employee/login" element={<EmployeeLogin />} />
        <Route path="/employee" element={<PrivateRoute role="EMPLOYEE"><EmployeeDashboard /></PrivateRoute>} />
        <Route path="/employee/create-cafe" element={<PrivateRoute role="EMPLOYEE"><CreateCafe /></PrivateRoute>} />
        <Route path="/owner" element={<PrivateRoute role="OWNER"><OwnerDashboard /></PrivateRoute>} />

        {/* Admin */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<PrivateRoute role="ADMIN"><AdminDashboard /></PrivateRoute>} />
        <Route path="/admin/orders" element={<PrivateRoute role="ADMIN"><AdminOrders /></PrivateRoute>} />
        <Route path="/admin/menu" element={<PrivateRoute role="ADMIN"><AdminMenu /></PrivateRoute>} />
        <Route path="/admin/analytics" element={<PrivateRoute role="ADMIN"><AdminAnalytics /></PrivateRoute>} />
        <Route path="/admin/qr" element={<PrivateRoute role="ADMIN"><AdminQR /></PrivateRoute>} />

        {/* Default / Public */}
        <Route path="/" element={<HomePage />} />
      </Routes>
      </BrowserRouter>
    </OrderProvider>
  </AuthProvider>
);

export default App;
