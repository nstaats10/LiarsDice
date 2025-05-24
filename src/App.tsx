import React, { useState } from 'react';
import { Volume2, Volume, Skull, HelpCircle, Anchor } from 'lucide-react';
import GameBoard from './components/GameBoard';
import Tutorial from './components/Tutorial';
import AdBanner from './components/AdBanner';
import { AudioProvider } from './contexts/AudioContext';

function App() {
  const [showTutorial, setShowTutorial] = useState(false);

  return (
    <AudioProvider>
      <div className="min-h-screen flex flex-col items-center bg-gradient-to-br from-[#1a2a3a] to-[#000000]">
        <header className="w-full text-center py-8 relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 opacity-20">
            <Anchor size={128} className="text-[#ffd700]" />
          </div>
          <h1 className="text-6xl sm:text-7xl text-[#ffd700] font-bold drop-shadow-[0_4px_4px_rgba(0,0,0,0.8)] relative z-10">
            Liar's Dice
          </h1>
          <h2 className="text-3xl text-[#ffd700] italic mt-4 drop-shadow-[0_4px_4px_rgba(0,0,0,0.8)] relative z-10">
            Pirate Edition
          </h2>
          <div className="w-48 h-1 mt-4 bg-[#ffd700] rounded-full opacity-80"></div>
        </header>

        <main className="flex-1 w-full max-w-4xl px-4 relative mt-8">
          {showTutorial ? (
            <Tutorial onClose={() => setShowTutorial(false)} />
          ) : (
            <GameBoard />
          )}
        </main>

        <footer className="w-full py-6 text-center text-[#ffd700] text-sm bg-[#1a2a3a] bg-opacity-80 backdrop-blur-sm">
          <AdBanner position="footer" />
          <p className="mt-4">&copy; {new Date().getFullYear()} Liar's Dice - Pirate Edition</p>
        </footer>

        <button 
          className="fixed top-4 right-4 bg-[#8b4513] text-[#ffd700] p-3 rounded-full
                     shadow-lg border-2 border-[#ffd700] hover:brightness-110 transition-all
                     backdrop-blur-sm"
          onClick={() => setShowTutorial(!showTutorial)}
        >
          <HelpCircle size={28} />
        </button>
      </div>
    </AudioProvider>
  );
}

export default App