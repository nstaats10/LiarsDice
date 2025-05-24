import React, { useRef, useEffect } from 'react';

interface GameLogProps {
  messages: string[];
}

const GameLog: React.FC<GameLogProps> = ({ messages }) => {
  const logRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="mt-4">
      <h3 className="text-xl text-[#5d4037] font-bold mb-1">Game Log</h3>
      <div 
        ref={logRef}
        className="bg-[#f5ecd9] border-2 border-[#8b4513] rounded-lg p-3 h-36 overflow-y-auto text-left"
      >
        {messages.map((message, index) => (
          <p 
            key={index} 
            className={`log-text ${index === messages.length - 1 ? 'font-bold' : ''}`}
          >
            {message}
          </p>
        ))}
      </div>
    </div>
  );
};

export default GameLog;