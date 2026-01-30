import React, { useState, useEffect, useCallback } from 'react';
import { UserPlus, RefreshCw, LogOut, Ticket, Copy, Check, X } from 'lucide-react';
import MatchTable from '../components/MatchTable';
import StatCard from '../components/StatCard';
import Leaderboard from '../components/Leaderboard';
import FriendSearchModal from '../components/FriendSearchModal';
import { api } from '../api/clash';

const Dashboard = ({ user, onLogout }) => {
  const [matches, setMatches] = useState([]);
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  
  // Modal States
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [inviteData, setInviteData] = useState(null);
  const [copied, setCopied] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [matchData, friendData] = await Promise.all([
        api.getMatches(), // Updated to use the new secure endpoint
        api.getFriends(user.id)
      ]);
      setMatches(matchData);
      setFriends(friendData);
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSync = async () => {
    setSyncing(true);
    try {
      await api.syncBattles(user.player_tag);
      await fetchData();
    } finally {
      setSyncing(false);
    }
  };

  const handleCreateInvite = async () => {
    try {
      const data = await api.createInvite();
      setInviteData(data);
      setIsInviteOpen(true);
      setCopied(false);
    } catch (err) {
      console.error("Failed to create invite", err);
    }
  };

  const copyToClipboard = () => {
    if (inviteData?.token) {
      navigator.clipboard.writeText(inviteData.token);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans">
      {/* --- Header --- */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 h-16 flex justify-between items-center">
          <div className="flex items-center gap-3">
             <h1 className="font-black text-xl tracking-tight text-blue-500">CLASH<span className="text-white">FRIENDS</span></h1>
             <span className="bg-slate-800 text-xs px-2 py-1 rounded-md text-slate-400 font-mono hidden sm:block">{user.player_tag}</span>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={handleSync} disabled={syncing} className="p-2 hover:bg-slate-800 rounded-lg transition-colors text-slate-400 hover:text-white" title="Sync Battles">
              <RefreshCw className={`w-5 h-5 ${syncing ? 'animate-spin' : ''}`} />
            </button>
            <button onClick={onLogout} className="p-2 hover:bg-red-900/20 text-red-500 rounded-lg transition-colors" title="Sign Out">
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* --- Main Content --- */}
      <main className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Stats & Matches */}
          <div className="lg:col-span-2 space-y-6">
            <StatCard matches={matches} playerTag={user.player_tag} />
            
            <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden shadow-xl">
              <div className="p-6 border-b border-slate-700 flex justify-between items-center bg-slate-800/50">
                <h2 className="text-lg font-bold text-white">Match History</h2>
                <span className="text-xs font-mono text-slate-500">Last 50 Battles</span>
              </div>
              <div className="p-6">
                {loading ? (
                  <div className="flex justify-center py-8 text-slate-500 animate-pulse">Loading battle data...</div>
                ) : (
                  <MatchTable matches={matches} playerTag={user.player_tag} />
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Actions & Leaderboard */}
          <div className="space-y-6">
            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={() => setIsSearchOpen(true)} 
                className="py-4 bg-blue-600 hover:bg-blue-500 rounded-xl font-bold flex flex-col items-center justify-center gap-1 transition-all shadow-lg shadow-blue-900/20 active:scale-95"
              >
                <UserPlus className="w-5 h-5" /> 
                <span className="text-xs">Add Rival</span>
              </button>
              
              <button 
                onClick={handleCreateInvite} 
                className="py-4 bg-emerald-600 hover:bg-emerald-500 rounded-xl font-bold flex flex-col items-center justify-center gap-1 transition-all shadow-lg shadow-emerald-900/20 active:scale-95"
              >
                <Ticket className="w-5 h-5" /> 
                <span className="text-xs">Invite Friend</span>
              </button>
            </div>

            <Leaderboard matches={matches} friends={friends} playerTag={user.player_tag} />
          </div>
        </div>
      </main>

      {/* --- Search Modal --- */}
      <FriendSearchModal 
        isOpen={isSearchOpen} 
        onClose={() => setIsSearchOpen(false)} 
        currentUser={user} 
        onFriendAdded={fetchData}
      />

      {/* --- Invite Modal (Inline) --- */}
      {isInviteOpen && inviteData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm" onClick={() => setIsInviteOpen(false)} />
          <div className="relative w-full max-w-sm bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl p-6 animate-in fade-in zoom-in duration-200">
            <button 
              onClick={() => setIsInviteOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="text-center mb-6">
              <div className="w-12 h-12 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-3">
                <Ticket className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white">Invite a Friend</h3>
              <p className="text-slate-400 text-sm mt-1">
                Share this code. When they sign up, you'll automatically become friends!
              </p>
            </div>

            <div className="bg-slate-900 border border-slate-700 rounded-xl p-4 flex items-center justify-between gap-4 mb-4">
              <code className="text-xl font-mono font-bold text-emerald-400 tracking-wider">
                {inviteData.token}
              </code>
              <button 
                onClick={copyToClipboard}
                className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
              >
                {copied ? <Check className="w-5 h-5 text-emerald-500" /> : <Copy className="w-5 h-5" />}
              </button>
            </div>
            
            <div className="text-center text-xs text-slate-500">
              Expires in 24 hours
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;