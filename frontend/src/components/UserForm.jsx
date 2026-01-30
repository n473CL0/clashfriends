import React, { useState, useEffect } from 'react';
import { api } from '../api/clash';
import { Mail, Lock, ArrowRight, Loader2, Gift } from 'lucide-react';

const UserForm = ({ onLogin, inviteData }) => {
  // Default to SIGNUP (false) if invited, else LOGIN (true)
  const [isLogin, setIsLogin] = useState(!inviteData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  // Force switch to signup if invite data arrives late
  useEffect(() => {
    if (inviteData) setIsLogin(false);
  }, [inviteData]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isLogin) {
        const data = await api.login(formData.email, formData.password);
        onLogin(data.access_token);
      } else {
        await api.signup({
          email: formData.email,
          password: formData.password,
          // If we have invite data, pass the tag directly. 
          // The backend will handle friendship creation based on this tag match.
          player_tag: inviteData?.target_tag 
        });
        
        const loginData = await api.login(formData.email, formData.password);
        onLogin(loginData.access_token);
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || 'Authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900 p-4">
      <div className="w-full max-w-md bg-slate-800 rounded-2xl shadow-xl border border-slate-700 overflow-hidden">
        
        <div className="p-8 text-center border-b border-slate-700 bg-slate-800/50">
          <h1 className="text-3xl font-black tracking-tight text-white mb-2">
            CLASH<span className="text-blue-500">FRIENDS</span>
          </h1>
          {inviteData ? (
             <div className="bg-blue-900/20 text-blue-300 p-3 rounded-xl text-sm border border-blue-500/30 flex flex-col gap-1 items-center">
                <Gift className="w-5 h-5 mb-1" />
                <span>Invited by <strong>{inviteData.creator_username}</strong></span>
                {inviteData.target_tag && (
                    <span className="text-xs opacity-75">Sign up to claim tag <strong>{inviteData.target_tag}</strong></span>
                )}
             </div>
          ) : (
            <p className="text-slate-400 text-sm">
                {isLogin ? 'Welcome back, challenger.' : 'Join the arena.'}
            </p>
          )}
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-4">
          <div className="space-y-4">
            <div className="relative">
              <Mail className="absolute left-3 top-3 w-5 h-5 text-slate-500" />
              <input
                name="email"
                type="email"
                placeholder="Email Address"
                value={formData.email}
                onChange={handleChange}
                className="w-full bg-slate-900 border border-slate-600 rounded-xl py-2.5 pl-10 pr-4 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                required
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-3 top-3 w-5 h-5 text-slate-500" />
              <input
                name="password"
                type="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                className="w-full bg-slate-900 border border-slate-600 rounded-xl py-2.5 pl-10 pr-4 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                required
              />
            </div>
          </div>

          {error && <div className="text-red-400 text-sm text-center bg-red-900/20 p-2 rounded-lg">{error}</div>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all"
          >
            {loading ? <Loader2 className="animate-spin w-5 h-5"/> : (
              <>{isLogin ? 'Log In' : 'Create Account'} <ArrowRight className="w-5 h-5" /></>
            )}
          </button>
        </form>

        <div className="p-4 bg-slate-900/50 border-t border-slate-700 text-center">
          <button 
            onClick={() => { setIsLogin(!isLogin); setError(''); }}
            className="text-slate-400 hover:text-white text-sm transition-colors"
          >
            {isLogin ? "Don't have an account? Sign up" : "Already have an account? Log in"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserForm;