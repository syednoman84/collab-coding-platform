import { BrowserRouter as Router, Routes, Route, Navigate, Link, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './auth/AuthContext';
import AdminQuestionManager from './components/AdminQuestionManager';
import LoginSignupForm from './components/LoginSignupForm';
import UserApp from './UserApp';

function ProtectedRoute({ children, role }) {
  const { user, loading } = useAuth();

  if (loading) return <div>Loading...</div>;

  if (!user) return <Navigate to="/login" />;
  if (role && user.role !== role) return <Navigate to="/" />;
  if (!role && user.role === 'admin') return <Navigate to="/admin/questions" />;

  return children;
}

function NavBar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div style={{ padding: '10px', borderBottom: '1px solid #ccc', marginBottom: '20px' }}>
      {user && (
        <>
          <span style={{ marginRight: '15px' }}>
            Logged in as: <strong>{user.username}</strong> ({user.role})
          </span>
          {user.role === 'admin' && (
            <Link to="/admin/questions" style={{ marginRight: '10px' }}>Questions</Link>
          )}
          <button onClick={handleLogout}>Logout</button>
        </>
      )}
    </div>
  );
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginSignupForm />} />

      <Route
        path="/admin/questions"
        element={
          <ProtectedRoute role="admin">
            <NavBar />
            <AdminQuestionManager />
          </ProtectedRoute>
        }
      />

      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <NavBar />
            <UserApp />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default function App() {
  return (
    <Router>                  {/* ✅ Router is OUTSIDE AuthProvider */}
      <AuthProvider>          {/* ✅ All routes inside Router context */}
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}
