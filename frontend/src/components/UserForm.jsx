import React, { useState } from 'react';
// Ensure axios is installed or use fetch. 
// If you don't have an API helper yet, we'll use inline fetch for now.

const UserForm = ({ onLogin }) => {
  const [tag, setTag] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // format tag (ensure uppercase and starts with #)
    let formattedTag = tag.toUpperCase();
    if (!formattedTag.startsWith('#')) {
      formattedTag = '#' + formattedTag;
    }

    try {
      // 1. Attempt to create/fetch user from Backend
      const response = await fetch('http://localhost:8000/users/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          username: "Guest", // Default username for now
          player_tag: formattedTag 
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to login. Check the tag or backend connection.');
      }

      const userData = await response.json();
      
      // 2. Pass successful user data up to App.js
      onLogin(userData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="p-8 bg-white rounded-lg shadow-md w-96">
        <h1 className="mb-6 text-2xl font-bold text-center text-blue-600">CR Tracker</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Player Tag</label>
            <input
            type="text"
            value={tag}
            onChange={(e) => setTag(e.target.value)}
            placeholder="#P990V0"
            // ADD: text-gray-900 to ensure text is visible
            className="w-full p-2 mt-1 text-gray-900 border rounded focus:ring-blue-500 focus:border-blue-500"
            required
            />
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 text-white bg-blue-600 rounded hover:bg-blue-700 disabled:bg-blue-300"
          >
            {loading ? 'Loading...' : 'Track My Stats'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default UserForm;