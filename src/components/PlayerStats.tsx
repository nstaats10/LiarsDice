import React from 'react';
import { Trophy, Skull } from 'lucide-react';

interface PlayerStatsProps {
  wins: string;
  losses: string;
  roundsPlayed: number;
}

const PlayerStats: React.FC<PlayerStatsProps> = ({ wins, losses, roundsPlayed }) => {
  const totalGames = parseInt(wins) + parseInt(losses);
  const winRate = totalGames > 0 ? Math.round((parseInt(wins) / totalGames) * 100) : 0;

  return (
    <div className="p-3">
      <h3 className="text-xl text-[#5d4037] font-bold mb-3">Player Stats</h3>
      
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="flex items-center">
            <Trophy size={18} className="text-[#ffd700] mr-2" />
            Wins:
          </span>
          <span className="font-bold">{wins}</span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="flex items-center">
            <Skull size={18} className="text-[#a83232] mr-2" />
            Losses:
          </span>
          <span className="font-bold">{losses}</span>
        </div>
        
        <div className="flex justify-between items-center">
          <span>Win Rate:</span>
          <span className="font-bold">{winRate}%</span>
        </div>
        
        <div className="mt-3 pt-2 border-t border-[#8b4513]">
          <div className="flex justify-between items-center">
            <span>Current Round:</span>
            <span className="font-bold">{roundsPlayed}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlayerStats;