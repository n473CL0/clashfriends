import React, { useState, useEffect, useCallback } from 'react';
import MatchTable from '../components/MatchTable'; // Assuming this exists based on your file list
import StatCard from '../components/StatCard';     // Assuming this exists based on your file list

const Dashboard = ({ user, onLogout }) => {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState(null);

  // 1. Function to fetch existing matches from DB
  const fetchMatches = useCallback(async () => {
    try {
      const response = await fetch(`http://localhost:8000/players/${user.player_tag.replace('#', '%23')}/matches`);
      if (!response.ok) throw new Error('Failed to fetch history');
      const data = await response.json();
      setMatches(data);
    } catch (err) {
      console.error(err);
      setError('Could not load matches.');
    } finally {
      setLoading(false);
    }
  }, [user.player_tag]);

  // 2. Initial Load
  useEffect(() => {
    fetchMatches();
  }, [fetchMatches]);

  // 3. Sync Function (Calls the new Backend Endpoint)
  const handleSync = async () => {
    setSyncing(true);
    setError(null);
    try {
      // URL Encode the tag (# -> %23)
      const formattedTag = user.player_tag.replace('#', '%23');
      
      const response = await fetch(`http://localhost:8000/sync/${formattedTag}`, {
        method: 'POST',
      });

      if (!response.ok) {
        if (response.status === 403) throw new Error('Clash Royale API rejected the request (Check IP/Key).');
        throw new Error('Sync failed.');
      }

      const result = await response.json();
      alert(`Sync Complete! Added ${result.new_matches_synced} new matches.`);
      
      // Refresh the list immediately
      await fetchMatches();
      
    } catch (err) {
      setError(err.message);
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">
            {user.username}'s Dashboard <span className="text-sm text-gray-500">({user.player_tag})</span>
          </h1>
          <div className="flex gap-4">
            <button
              onClick={handleSync}
              disabled={syncing}
              className={`px-4 py-2 rounded-md text-white font-medium transition-colors ${
                syncing 
                  ? 'bg-blue-300 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {syncing ? 'Syncing...' : 'Sync Battles'}
            </button>
            <button
              onClick={onLogout}
              className="px-4 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Stats Row (Optional - placeholders for now) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatCard title="Total Tracked" value={matches.length} />
          <StatCard title="Recent Win Rate" value={matches.length > 0 ? "Calculating..." : "N/A"} />
          <StatCard title="Last Updated" value={new Date().toLocaleTimeString()} />
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-md border border-red-200">
            {error}
          </div>
        )}

        {/* Match Table */}
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Recent Matches</h3>
          </div>
          {loading ? (
            <div className="p-8 text-center text-gray-500">Loading matches...</div>
          ) : matches.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No matches found. Click <b>"Sync Battles"</b> to fetch data from Clash Royale.
            </div>
          ) : (
            // Passing the raw match data to your existing table component
            <MatchTable matches={matches} userTag={user.player_tag} />
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;