import React, { useState } from 'react';
import { useAudio } from '../contexts/AudioContext';

interface Bid {
  quantity: number;
  value: number;
}

interface GameControlsProps {
  onMakeBid: (quantity: number, value: number) => void;
  onCallBluff: () => void;
  onNewGame: () => void;
  currentBid: Bid | null;
  isGameOver: boolean;
  lastBidder: 'player' | 'ai' | null;
}

const GameControls: React.FC<GameControlsProps> = ({ 
  onMakeBid, 
  onCallBluff, 
  onNewGame,
  currentBid, 
  isGameOver,
  lastBidder
}) => {
  const [quantity, setQuantity] = useState<number>(1);
  const [value, setValue] = useState<number>(1);
  const { playSound } = useAudio();

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseInt(e.target.value);
    if (isNaN(newValue) || newValue < 1) return;
    setQuantity(newValue);
  };

  const handleValueChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newValue = parseInt(e.target.value);
    setValue(newValue);
  };

  const handleMakeBid = () => {
    playSound('buttonClick');
    onMakeBid(quantity, value);
  };

  const handleCallBluff = () => {
    playSound('buttonClick');
    onCallBluff();
  };

  // Suggestions for valid bids based on current bid
  const getSuggestedBid = (): { quantity: number, value: number } => {
    if (!currentBid) return { quantity: 1, value: 1 };
    
    // If current value is 6, increment quantity and reset value to 1
    if (currentBid.value === 6) {
      return { quantity: currentBid.quantity + 1, value: 1 };
    }
    // Otherwise, keep quantity the same and increment value
    return { quantity: currentBid.quantity, value: currentBid.value + 1 };
  };

  const suggested = getSuggestedBid();
  
  // Update local state when the current bid changes to show better suggestions
  React.useEffect(() => {
    if (currentBid) {
      const suggested = getSuggestedBid();
      setQuantity(suggested.quantity);
      setValue(suggested.value);
    }
  }, [currentBid]);

  return (
    <div className="mt-6 p-4 bg-[#5d4037] bg-opacity-20 rounded-lg">
      {isGameOver ? (
        <div className="text-center">
          <h3 className="text-2xl mb-4 text-[#5d4037]">Game Over!</h3>
          <button 
            className="wooden-btn text-xl py-3 px-6"
            onClick={onNewGame}
          >
            Start New Game
          </button>
        </div>
      ) : (
        <div className="flex flex-col sm:flex-row justify-center gap-4 items-center">
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div>
              <label className="block text-[#5d4037] mb-1">Quantity:</label>
              <input 
                type="number" 
                min={currentBid ? Math.max(currentBid.quantity, 1) : 1}
                value={quantity}
                onChange={handleQuantityChange}
                className="w-24 px-3 py-2 rounded border-2 border-[#8b4513]"
              />
            </div>
            
            <div>
              <label className="block text-[#5d4037] mb-1">Value:</label>
              <select 
                value={value}
                onChange={handleValueChange}
                className="w-24 px-3 py-2 rounded border-2 border-[#8b4513]"
              >
                <option value={1}>⚀ One</option>
                <option value={2}>⚁ Two</option>
                <option value={3}>⚂ Three</option>
                <option value={4}>⚃ Four</option>
                <option value={5}>⚄ Five</option>
                <option value={6}>⚅ Six</option>
              </select>
            </div>
          </div>
          
          <div className="flex flex-row gap-3">
            <button 
              className="wooden-btn"
              onClick={handleMakeBid}
              disabled={lastBidder === 'player'}
            >
              Make Bid
            </button>
            
            <button 
              className="wooden-btn bg-[#a83232] border-[#782424]"
              onClick={handleCallBluff}
              disabled={!currentBid || lastBidder === 'player'}
            >
              Call Bluff
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default GameControls;