import React, { useState } from 'react';
import { api } from '../api/clash';
import { Hash, Save, LogOut, Loader2 } from 'lucide-react';

const LinkTagForm = ({ token, onLink, onLogout }) => {
  const [tag, setTag] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Prepend # if user followed instructions and only typed numbers
    let formattedTag = tag.toUpperCase().trim();
    if (!formattedTag.startsWith('#')) {
      formattedTag = '#' + formattedTag;
    }

    try {
      const updatedUser = await api.linkTag(formattedTag, token);
      onLink(updatedUser);
    } catch (err) {
      setError(err.response?.data?.detail || 'Could not verify tag.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900 p-4">
      <div className="w-full max-w-md bg-slate-800 rounded-2xl shadow-xl border border-slate-700 p-8 text-center">
        <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Hash className="w-8 h-8 text-blue-500" />
        </div>
        
        <h2 className="text-2xl font-bold text-white mb-2">Connect Clash Royale</h2>
        <p className="text-slate-400 mb-8">Enter your Player Tag to start tracking.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative flex items-center">
            <span className="absolute left-4 text-slate-500 font-mono text-xl select-none">#</span>
            <input
                type="text"
                placeholder="P990V0" 
                value={tag.replace('#', '')} // Visual cleanup if they paste a #
                onChange={(e) => setTag(e.target.value)}
                className="w-full bg-slate-900 border border-slate-600 rounded-xl py-3 pl-8 pr-4 font-mono text-xl uppercase text-white focus:ring-2 focus:ring-blue-500 outline-none"
                required
            />
          </div>
          
          {error && <div className="text-red-400 text-sm">{error}</div>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold flex items-center justify-center gap-2"
          >
             {loading ? <Loader2 className="animate-spin w-5 h-5"/> : <><Save className="w-5 h-5" /> Save Tag</>}
          </button>
        </form>

        <button onClick={onLogout} className="mt-6 text-slate-500 hover:text-slate-400 text-sm flex items-center gap-1 justify-center mx-auto">
            <LogOut className="w-3 h-3" /> Sign Out
        </button>
      </div>
    </div>
  );
};

export default LinkTagForm;