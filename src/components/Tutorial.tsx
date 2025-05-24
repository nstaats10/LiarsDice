import React from 'react';
import { X } from 'lucide-react';

interface TutorialProps {
  onClose: () => void;
}

const Tutorial: React.FC<TutorialProps> = ({ onClose }) => {
  return (
    <div className="game-panel relative">
      <button 
        onClick={onClose}
        className="absolute top-2 right-2 text-[#a83232] hover:text-[#782424]"
      >
        <X size={24} />
      </button>
      
      <h2 className="text-3xl text-center mb-4 text-[#5d4037]">How to Play Liar's Dice</h2>
      
      <div className="space-y-6">
        <section>
          <h3 className="text-xl font-bold mb-2 text-[#8b4513]">Game Objective</h3>
          <p>Be the last player with dice remaining. Each time you lose a round, you lose one die.</p>
        </section>
        
        <section>
          <h3 className="text-xl font-bold mb-2 text-[#8b4513]">Game Rules</h3>
          <ol className="list-decimal pl-6 space-y-2">
            <li>Each player starts with 5 dice.</li>
            <li>All players roll their dice at the beginning of each round, keeping their dice hidden from opponents.</li>
            <li>Players take turns making increasingly higher bids about the dice in play.</li>
            <li>A bid consists of a quantity and a value (e.g., "three 4's").</li>
            <li>Each new bid must be higher than the previous bid, by either:</li>
            <ul className="list-disc pl-6 my-1">
              <li>Increasing the quantity (e.g., "four 4's" beats "three 4's")</li>
              <li>Keeping the same quantity but increasing the value (e.g., "three 5's" beats "three 4's")</li>
            </ul>
            <li>Instead of raising a bid, a player can call "bluff" on the previous bid.</li>
            <li>When a bluff is called, all dice are revealed:</li>
            <ul className="list-disc pl-6 my-1">
              <li>If the bid was accurate or underestimated (there are at least as many of the stated value as were bid), the player who called the bluff loses a die.</li>
              <li>If the bid was overestimated, the player who made the bid loses a die.</li>
            </ul>
            <li>The player who lost a die starts the next round.</li>
          </ol>
        </section>
        
        <section>
          <h3 className="text-xl font-bold mb-2 text-[#8b4513]">Strategy Tips</h3>
          <ul className="list-disc pl-6 space-y-1">
            <li>Pay attention to your own dice to make more accurate bids.</li>
            <li>The more dice of a particular value you have, the safer it is to bid on that value.</li>
            <li>As the round progresses and the bids get higher, the likelihood of a bluff increases.</li>
            <li>If a bid seems suspiciously high, consider calling a bluff.</li>
            <li>Sometimes making a truthful but aggressive bid can convince your opponent you're bluffing.</li>
          </ul>
        </section>
      </div>
    </div>
  );
};

export default Tutorial;