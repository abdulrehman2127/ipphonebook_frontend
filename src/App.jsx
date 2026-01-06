import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/home/Home';
import WriteXML from './pages/writexml/WriteXML';
import ShowXML from './pages/showxml/ShowXML';
import Login from './pages/login/Login';
import ProtectedRoute from './auth/ProtectedRoute';
import AdminRoute from './auth/AdminRoute';
import './App.css';

function App() {
  return (
    <Router>
      <div className="app">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route 
            path="/" 
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            } 
          />
          {/* Currently disabled */}
          {/* <Route 
            path="/write-xml" 
            element={
              <ProtectedRoute>
                <AdminRoute>
                  <WriteXML />
                </AdminRoute>
              </ProtectedRoute>
            } 
          /> */}
          <Route 
            path="/show-xml" 
            element={
              <ProtectedRoute>
                <ShowXML />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
