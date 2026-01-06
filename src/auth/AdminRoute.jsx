import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { isAdmin } from './authService';

function AdminRoute({ children }) {
  const [adminStatus, setAdminStatus] = useState(null);

  useEffect(() => {
    checkAdmin();
  }, []);

  const checkAdmin = async () => {
    const admin = await isAdmin();
    setAdminStatus(admin);
  };

  if (adminStatus === null) {
    return <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh',
      fontSize: '18px',
      color: '#2c3e50'
    }}>Loading...</div>;
  }

  if (!adminStatus) {
    return <Navigate to="/" replace />;
  }
  
  return children;
}

export default AdminRoute;
