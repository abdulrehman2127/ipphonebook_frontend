import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileEdit, Eye, Phone, LogOut, Shield, User } from 'lucide-react';
import { getCurrentUser, logout, isAdmin } from '../../auth/authService';
import './Home.css';

function Home() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [userIsAdmin, setUserIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const user = await getCurrentUser();
      const admin = await isAdmin();
      setCurrentUser(user);
      setUserIsAdmin(admin);
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '18px',
        color: '#2c3e50'
      }}>Loading...</div>
    );
  }

  return (
    <div className="home-container">
      <div className="home-content">
        <div className="user-bar">
          <div className="user-info">
            {userIsAdmin ? <Shield size={20} /> : <User size={20} />}
            <span className="username">{currentUser?.username}</span>
            {userIsAdmin && <span className="admin-badge">Admin</span>}
          </div>
          <button className="logout-button" onClick={handleLogout}>
            <LogOut size={18} />
            Logout
          </button>
        </div>

        <div className="header">
          <Phone className="logo-icon" size={60} />
          <h1 className="title">Corporate Phonebook Manager -- CPM</h1>
          <p className="subtitle">Manage your IP phone directory with ease</p>
        </div>

        <div className="cards-container">
          {/* Temporarily disabled - Write XML card */}
          {/* {userIsAdmin && (
            <div className="feature-card" onClick={() => navigate('/write-xml')}>
              <div className="card-icon-wrapper">
                <FileEdit className="card-icon" size={40} />
              </div>
              <h2 className="card-title">Write XML</h2>
              <p className="card-description">
                Edit phonebook entries using a VS Code-like editor. 
                Input data in JSON format and save directly to the XML file.
              </p>
              <div className="card-footer">
                <span className="card-action">Get Started →</span>
              </div>
            </div>
          )} */}

          <div className="feature-card" onClick={() => navigate('/show-xml')}>
            <div className="card-icon-wrapper">
              <Eye className="card-icon" size={40} />
            </div>
            <h2 className="card-title">Show Phonebook</h2>
            <p className="card-description">
              View the current phonebook entries in a beautifully 
              formatted display{userIsAdmin ? ' with multiple view options' : ''}.
            </p>
            <div className="card-footer">
              <span className="card-action">View Data →</span>
            </div>
          </div>
        </div>

        <div className="features-list">
          <div className="feature-item">
            <span className="feature-dot"></span>
            <span>Real-time synchronization</span>
          </div>
          <div className="feature-item">
            <span className="feature-dot"></span>
            <span>{userIsAdmin ? 'JSON to XML conversion' : 'Easy phonebook access'}</span>
          </div>
          <div className="feature-item">
            <span className="feature-dot"></span>
            <span>{userIsAdmin ? 'Beautiful Monaco Editor' : 'Clean interface'}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
