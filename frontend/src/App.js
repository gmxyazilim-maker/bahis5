import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "./components/ui/sonner";
import { AuthProvider, useAuth } from "./context/AuthContext";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import AdminLayout from "./layouts/AdminLayout";
import UserLayout from "./layouts/UserLayout";
import AdminDashboard from "./pages/admin/Dashboard";
import AdminCoupons from "./pages/admin/Coupons";
import AdminUsers from "./pages/admin/Users";
import AdminWithdrawals from "./pages/admin/Withdrawals";
import AdminTaxPayments from "./pages/admin/TaxPayments";
import AdminWesternUnion from "./pages/admin/WesternUnion";
import AdminMasak from "./pages/admin/Masak";
import AdminActivations from "./pages/admin/Activations";
import AdminSettings from "./pages/admin/Settings";
import UserDashboard from "./pages/user/Dashboard";
import UserCoupon from "./pages/user/Coupon";
import UserWithdraw from "./pages/user/Withdraw";
import "./App.css";

const ProtectedRoute = ({ children, requiredRole }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen bg-void-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gold-500"></div>
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to={user.role === 'admin' ? '/admin' : '/dashboard'} replace />;
  }
  
  return children;
};

function AppRoutes() {
  const { user } = useAuth();
  
  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to={user.role === 'admin' ? '/admin' : '/dashboard'} /> : <LoginPage />} />
      <Route path="/register" element={user ? <Navigate to="/dashboard" /> : <RegisterPage />} />
      
      {/* Admin Routes */}
      <Route path="/admin" element={<ProtectedRoute requiredRole="admin"><AdminLayout /></ProtectedRoute>}>
        <Route index element={<AdminDashboard />} />
        <Route path="coupons" element={<AdminCoupons />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="withdrawals" element={<AdminWithdrawals />} />
        <Route path="tax-payments" element={<AdminTaxPayments />} />
        <Route path="western-union" element={<AdminWesternUnion />} />
        <Route path="masak" element={<AdminMasak />} />
        <Route path="activations" element={<AdminActivations />} />
        <Route path="settings" element={<AdminSettings />} />
      </Route>
      
      {/* User Routes */}
      <Route path="/dashboard" element={<ProtectedRoute requiredRole="user"><UserLayout /></ProtectedRoute>}>
        <Route index element={<UserDashboard />} />
        <Route path="coupon" element={<UserCoupon />} />
        <Route path="withdraw" element={<UserWithdraw />} />
      </Route>
      
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
        <Toaster position="top-right" richColors />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
