import React from 'react';
import { Trophy, Swords, User } from 'lucide-react';

const Leaderboard = ({ matches, friends, playerTag }) => {
  const friendTags = new Set(friends.map(f => f.player_tag));
  
  const h2hStats = matches.reduce((acc, match) => {
    const oppTag = match.player_1_tag === playerTag ? match.player_2_tag : match.player_1_tag;
    if (friendTags.has(oppTag)) {
      if (!acc[oppTag]) acc[oppTag] = { wins: 0, losses: 0, tag: oppTag, username: friends.find(f => f.player_tag === oppTag)?.username || 'Rival' };
      if (match.winner_tag === playerTag) acc[oppTag].wins++;
      else if (match.winner_tag) acc[oppTag].losses++;
    }
    return acc;
  }, {});

  const sorted = Object.values(h2hStats).sort((a, b) => b.wins - a.wins);

  return (
    <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden shadow-xl">
      <div className="p-4 bg-slate-700/30 border-b border-slate-700 flex items-center gap-2">
        <Trophy className="w-5 h-5 text-yellow-500" />
        <h3 className="font-bold text-sm uppercase tracking-wider">H2H Standings</h3>
      </div>
      <div className="divide-y divide-slate-700">
        {sorted.length > 0 ? sorted.map((s) => (
          <div key={s.tag} className="p-4 flex items-center justify-between hover:bg-slate-700/50 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center border border-slate-500"><User className="w-5 h-5 text-slate-300" /></div>
              <div><p className="font-bold text-sm">{s.username}</p><p className="text-[10px] font-mono text-slate-500">{s.tag}</p></div>
            </div>
            <div className="flex gap-3 text-center">
              <div><p className="text-[10px] text-slate-500 font-bold">W</p><p className="text-green-400 font-black">{s.wins}</p></div>
              <div className="w-px h-8 bg-slate-700 my-auto"></div>
              <div><p className="text-[10px] text-slate-500 font-bold">L</p><p className="text-red-400 font-black">{s.losses}</p></div>
            </div>
          </div>
        )) : <div className="p-8 text-center text-slate-500 text-sm italic">Add friends to see rivalries</div>}
      </div>
    </div>
  );
};

export default Leaderboard;