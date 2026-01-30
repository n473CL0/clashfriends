import React from 'react';
import { Trophy, Users, Shield } from 'lucide-react';

const PlayerProfileCard = ({ user }) => {
  return (
    <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl border border-slate-700 p-6 shadow-xl relative overflow-hidden group">
        
        {/* Background Decoration */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>

        <div className="flex items-center gap-5 relative z-10">
            {/* Avatar Placeholder */}
            <div className="w-16 h-16 rounded-full bg-slate-700 border-2 border-slate-600 flex items-center justify-center shrink-0 shadow-lg">
                <span className="text-2xl font-black text-slate-400">
                    {user.username ? user.username.charAt(0).toUpperCase() : '?'}
                </span>
            </div>

            <div className="space-y-1">
                <h3 className="text-xl font-bold text-white tracking-tight">
                    {user.username || "Unknown Player"}
                </h3>
                <p className="text-xs text-slate-400 font-mono bg-slate-800/80 px-2 py-0.5 rounded-md inline-block">
                    {user.player_tag}
                </p>
            </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-4">
            <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-700/50 flex flex-col gap-1">
                <div className="flex items-center gap-1.5 text-yellow-500 text-xs font-bold uppercase tracking-wider">
                    <Trophy className="w-3.5 h-3.5" /> Trophies
                </div>
                <div className="text-2xl font-black text-white">
                    {user.trophies?.toLocaleString() || 0}
                </div>
            </div>

            <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-700/50 flex flex-col gap-1">
                <div className="flex items-center gap-1.5 text-blue-400 text-xs font-bold uppercase tracking-wider">
                    <Shield className="w-3.5 h-3.5" /> Clan
                </div>
                <div className="text-lg font-bold text-white truncate">
                    {user.clan_name || "No Clan"}
                </div>
            </div>
        </div>
    </div>
  );
};

export default PlayerProfileCard;