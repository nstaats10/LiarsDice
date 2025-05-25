import React, { useState, useEffect } from 'react';
import DiceDisplay from './DiceDisplay';
import GameControls from './GameControls';
import GameLog from './GameLog';
import PlayerStats from './PlayerStats';
import AdBanner from './AdBanner';
import { useAudio } from '../contexts/AudioContext';
import { calculateAIMove, evaluateBid } from '../utils/gameLogic';

interface Bid {
  quantity: number;
  value: number;
}

interface GameState {
  playerDice: number[];
  aiDice: number[];
  playerDiceCount: number;
  aiDiceCount: number;
  currentBid: Bid | null;
  lastBidder: 'player' | 'ai' | null;
  diceLossAnimationTarget: 'player' | 'ai' | null; // NEW: Separate state for animation
  gameLog: string[];
  gameOver: boolean;
  winner: 'player' | 'ai' | null;
  roundCount: number;
}

const GameBoard: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>({
    playerDice: [],
    aiDice: [],
    playerDiceCount: 5,
    aiDiceCount: 5,
    currentBid: null,
    lastBidder: null,
    diceLossAnimationTarget: null, // NEW
    gameLog: ["Game started. You go first."],
    gameOver: false,
    winner: null,
    roundCount: 1
  });

  const { playSound } = useAudio();

  // Initialize or reset the game
  const initGame = () => {
    const newPlayerDice = rollDice(5);
    const newAiDice = rollDice(5);

    setGameState({
      playerDice: newPlayerDice,
      aiDice: newAiDice,
      playerDiceCount: 5,
      aiDiceCount: 5,
      currentBid: null,
      lastBidder: null,
      diceLossAnimationTarget: null,
      gameLog: ["New game started. You go first."],
      gameOver: false,
      winner: null,
      roundCount: 1
    });

    playSound('gameStart');
  };

  // Generate random dice values
  const rollDice = (count: number): number[] => {
    return Array.from({ length: count }, () => Math.floor(Math.random() * 6) + 1);
  };

  // Start a new round after a bluff is called
  const startNewRound = () => {
    const { playerDiceCount, aiDiceCount } = gameState;

    if (playerDiceCount === 0 || aiDiceCount === 0) {
      setGameState(prev => ({
        ...prev,
        gameOver: true,
        winner: playerDiceCount > 0 ? 'player' : 'ai'
      }));
      playSound(playerDiceCount > 0 ? 'win' : 'lose');
      return;
    }

    const newPlayerDice = rollDice(playerDiceCount);
    const newAiDice = rollDice(aiDiceCount);

    setGameState(prev => ({
      ...prev,
      playerDice: newPlayerDice,
      aiDice: newAiDice,
      currentBid: null,
      lastBidder: null,
      diceLossAnimationTarget: null,
      gameLog: [...prev.gameLog, `Round ${prev.roundCount + 1} begins.`],
      roundCount: prev.roundCount + 1
    }));

    playSound('newRound');
  };

  // Player makes a bid
  const handlePlayerBid = (quantity: number, value: number) => {
    if (gameState.gameOver) return;

    const { currentBid } = gameState;

    // Validate bid
    if (currentBid) {
      const isValidBid = 
        (quantity > currentBid.quantity) || 
        (quantity === currentBid.quantity && value > currentBid.value);

      if (!isValidBid) {
        playSound('error');
        return;
      }
    }

    const newBid = { quantity, value };

    setGameState(prev => ({
      ...prev,
      currentBid: newBid,
      lastBidder: 'player',
      gameLog: [...prev.gameLog, `You bid ${quantity} ${value}'s.`]
    }));

    playSound('bid');

    // AI turn after a short delay
    setTimeout(() => aiTurn(newBid), 1500);
  };

  // AI makes a move (bid or call bluff)
  const aiTurn = (playerBid: Bid) => {
    if (gameState.gameOver) return;

    const { playerDiceCount, aiDiceCount, aiDice, currentBid } = gameState;
    const totalDice = playerDiceCount + aiDiceCount;

    const aiDecision = calculateAIMove(aiDice, totalDice, currentBid);

    if (aiDecision.callBluff) {
      handleBluffCalled('ai');
    } else {
      const newBid = { 
        quantity: aiDecision.quantity, 
        value: aiDecision.value 
      };

      setGameState(prev => ({
        ...prev,
        currentBid: newBid,
        lastBidder: 'ai',
        gameLog: [...prev.gameLog, `AI bids ${newBid.quantity} ${newBid.value}'s.`]
      }));

      playSound('aiBid');
    }
  };

  // Player calls bluff
  const handlePlayerCallBluff = () => {
    if (gameState.gameOver || !gameState.currentBid || gameState.lastBidder === 'player') return;
    handleBluffCalled('player');
  };

  // Handle bluff being called by either player or AI
  const handleBluffCalled = (caller: 'player' | 'ai') => {
    if (!gameState.currentBid) return;

    const { playerDice, aiDice, currentBid } = gameState;
    const allDice = [...playerDice, ...aiDice];
    const result = evaluateBid(allDice, currentBid);

    let newPlayerDiceCount = gameState.playerDiceCount;
    let newAiDiceCount = gameState.aiDiceCount;

    let logMessage = '';
    let loser: 'player' | 'ai' = 'ai';

    // Evaluate the outcome of the bluff
    if (caller === 'player') {
      logMessage = `You called bluff on AI's bid of ${currentBid.quantity} ${currentBid.value}'s.`;

      if (result.bidSucceeded) {
        logMessage += ` There were actually ${result.actualCount} ${currentBid.value}'s. You lose a die!`;
        newPlayerDiceCount--;
        loser = 'player';
        playSound('lose');
      } else {
        logMessage += ` There were actually ${result.actualCount} ${currentBid.value}'s. AI loses a die!`;
        newAiDiceCount--;
        loser = 'ai';
        playSound('win');
      }
    } else {
      logMessage = `AI called bluff on your bid of ${currentBid.quantity} ${currentBid.value}'s.`;

      if (result.bidSucceeded) {
        logMessage += ` There were actually ${result.actualCount} ${currentBid.value}'s. AI loses a die!`;
        newAiDiceCount--;
        loser = 'ai';
        playSound('win');
      } else {
        logMessage += ` There were actually ${result.actualCount} ${currentBid.value}'s. You lose a die!`;
        newPlayerDiceCount--;
        loser = 'player';
        playSound('lose');
      }
    }

    // Update game state and trigger animation
    setGameState(prev => ({
      ...prev,
      playerDiceCount: newPlayerDiceCount,
      aiDiceCount: newAiDiceCount,
      gameLog: [...prev.gameLog, logMessage],
      currentBid: null,
      lastBidder: null,
      diceLossAnimationTarget: loser
    }));

    // Animate dice removal and start new round
    setTimeout(() => {
      const newPlayerDice = playerDice.slice(0, newPlayerDiceCount);
      const newAiDice = aiDice.slice(0, newAiDiceCount);

      setGameState(prev => ({
        ...prev,
        playerDice: newPlayerDice,
        aiDice: newAiDice,
        diceLossAnimationTarget: null
      }));

      startNewRound();
    }, 1000);
  };

  // Start a new game
  const handleNewGame = () => {
    initGame();
  };

  // Initialize game on component mount
  useEffect(() => {
    initGame();
  }, []);

  return (
    <div className="flex flex-col lg:flex-row gap-4 justify-center">
      <div className="game-panel lg:w-3/4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="w-full md:w-1/2">
            <h2 className="text-2xl text-[#5d4037] font-bold">Your Dice</h2>
            <DiceDisplay 
              dice={gameState.playerDice} 
              isHidden={false}
              diceToRemove={gameState.diceLossAnimationTarget === 'player' ? 1 : undefined}
              onDiceRemoved={(newDice) => setGameState(prev => ({ ...prev, playerDice: newDice }))}
            />
          </div>
          <div className="w-full md:w-1/2">
            <h2 className="text-2xl text-[#5d4037] font-bold">AI's Dice</h2>
            <DiceDisplay 
              dice={gameState.aiDice} 
              isHidden={true}
              diceToRemove={gameState.diceLossAnimationTarget === 'ai' ? 1 : undefined}
              onDiceRemoved={(newDice) => setGameState(prev => ({ ...prev, aiDice: newDice }))}
            />
          </div>
        </div>
        <GameLog messages={gameState.gameLog} />
        <div className="text-xl font-bold mt-3 text-[#5d4037] border-t-2 border-[#8b4513] pt-2">
          You: {gameState.playerDiceCount} dice | AI: {gameState.aiDiceCount} dice
        </div>
        <GameControls 
          onMakeBid={handlePlayerBid}
          onCallBluff={handlePlayerCallBluff}
          onNewGame={handleNewGame}
          currentBid={gameState.currentBid}
          isGameOver={gameState.gameOver}
          lastBidder={gameState.lastBidder}
        />
      </div>
      <div className="lg:w-1/4">
        <AdBanner position="sidebar" />
        <div className="game-panel mt-4">
          <PlayerStats 
            wins={localStorage.getItem('playerWins') || '0'} 
            losses={localStorage.getItem('playerLosses') || '0'} 
            roundsPlayed={gameState.roundCount} 
          />
        </div>
      </div>
    </div>
  );
};

export default GameBoard;

