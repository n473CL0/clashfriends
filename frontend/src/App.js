import React, { useState, useEffect } from 'react';
import LoginForm from './components/LoginForm';
import SignupForm from './components/SignupForm';
import Dashboard from './pages/Dashboard';
import { api } from './api/clash';

function App() {
  const [user, setUser] = useState(null);
  const [view, setView] = useState('login'); // 'login', 'signup', 'dashboard'
  const [loading,SF] = useState(true);

  // 1. Check for existing session on startup
  useEffect(() => {
    const checkAuth = async () => {
      const savedUser = localStorage.getItem('clash_user');
      if (savedUser) {
        try {
          // Verify token is still valid by fetching latest user data
          // (The interceptor in api/clash.js handles the token injection)
          const latestUser = await api.getMe();
          const tokenData = JSON.parse(savedUser);
          
          setUser({ ...latestUser, ...tokenData });
          setView('dashboard');
        } catch (err) {
          // Token expired or invalid
          console.log("Session expired");
          localStorage.removeItem('clash_user');
        }
      }
      setLoading(false);
    };
    checkAuth();
  }, []);

  // 2. Handlers
  const handleLogin = (userData) => {
    setUser(userData);
    setView('dashboard');
  };

  const handleLogout = () => {
    localStorage.removeItem('clash_user');
    setUser(null);
    setView('login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-slate-500">
        Loading...
      </div>
    );
  }

  // 3. Render View Controller
  return (
    <div className="font-sans antialiased text-slate-100 bg-slate-900 min-h-screen">
      {user ? (
        <Dashboard user={user} onLogout={handleLogout} />
      ) : view === 'signup' ? (
        <SignupForm 
          onSignupSuccess={handleLogin} 
          onSwitchToLogin={() => setView('login')} 
        />
      ) : (
        <LoginForm 
          onLogin={handleLogin} 
          onSwitchToSignup={() => setView('signup')} 
        />
      )}
    </div>
  );
}

export default App;