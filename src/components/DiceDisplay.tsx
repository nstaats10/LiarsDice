import React from 'react';
import { motion } from 'framer-motion';

interface DiceDisplayProps {
  dice: number[];
  isHidden: boolean;
  diceToRemove?: number; // Index of dice to remove
  onDiceRemoved?: (newDice: number[]) => void;
}

const DiceDisplay: React.FC<DiceDisplayProps> = ({ dice, isHidden, diceToRemove, onDiceRemoved }) => {
  const diceVariants = {
    hidden: { 
      opacity: 0, 
      y: 20,
      scale: 0.8
    },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        delay: i * 0.1,
        duration: 0.3,
        type: "spring",
        stiffness: 120,
        damping: 10
      }
    }),
    roll: (i: number) => ({
      rotateX: [0, 360, 720],
      rotateY: [0, 360, 720],
      transition: {
        delay: i * 0.1,
        duration: 1,
        ease: "easeInOut"
      }
    }),
    remove: {
      scale: 0,
      opacity: 0,
      transition: {
        duration: 0.3,
        ease: "easeOut"
      }
    }
  };

  const renderDiceFace = (value: number) => {
    if (isHidden) {
      return (
        <div className="flex items-center justify-center h-full">
          <span className="text-2xl text-[#ffd700] font-bold">?</span>
        </div>
      );
    }
    
    const dotPositions = {
      1: ["center"],
      2: ["top-left", "bottom-right"],
      3: ["top-left", "center", "bottom-right"],
      4: ["top-left", "top-right", "bottom-left", "bottom-right"],
      5: ["top-left", "top-right", "center", "bottom-left", "bottom-right"],
      6: ["top-left", "top-right", "middle-left", "middle-right", "bottom-left", "bottom-right"]
    };
    
    const positions = dotPositions[value as keyof typeof dotPositions];
    
    return (
      <div className="relative w-full h-full flex items-center justify-center">
        {positions.map((pos, idx) => {
          let dotClass = "absolute w-3 h-3 bg-[#ffd700] rounded-full shadow-lg";
          
          switch(pos) {
            case "top-left": dotClass += " top-2 left-2"; break;
            case "top-right": dotClass += " top-2 right-2"; break;
            case "middle-left": dotClass += " top-1/2 -translate-y-1/2 left-2"; break;
            case "middle-right": dotClass += " top-1/2 -translate-y-1/2 right-2"; break;
            case "center": dotClass += " top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"; break;
            case "bottom-left": dotClass += " bottom-2 left-2"; break;
            case "bottom-right": dotClass += " bottom-2 right-2"; break;
          }
          
          return <div key={idx} className={dotClass} />;
        })}
      </div>
    );
  };

  // Handle dice removal
  React.useEffect(() => {
    if (diceToRemove !== undefined) {
      const newDice = dice.filter((_, index) => index !== diceToRemove);
      if (onDiceRemoved) {
        onDiceRemoved(newDice);
      }
    }
  }, [diceToRemove, onDiceRemoved]);

  return (
    <div className="dice-container flex gap-4 justify-center p-4">
      {dice.map((value, index) => (
        <motion.div
          key={index}
          className="dice relative w-16 h-16 rounded-lg border-4 border-[#1a2a3a] bg-[#1a2a3a] flex items-center justify-center"
          custom={index}
          initial="hidden"
          animate={diceToRemove === index ? "remove" : "visible"}
          whileHover={{ 
            scale: 1.1,
            boxShadow: "0 0 20px rgba(255, 215, 0, 0.5)"
          }}
          whileTap={{ scale: 0.95 }}
          style={{
            backgroundColor: isHidden ? '#8b4513' : '#1a2a3a',
            borderColor: isHidden ? '#5d4037' : '#1a2a3a'
          }}
        >
          <motion.div 
            variants={diceVariants} 
            animate={diceToRemove === index ? "remove" : "roll"} 
            className="w-full h-full"
          >
            {renderDiceFace(value)}
          </motion.div>
        </motion.div>
      ))}
      {dice.length === 0 && (
        <div className="text-[#ffd700] font-bold text-xl">
          <span className="animate-pulse">No dice left!</span>
        </div>
      )}
    </div>
  );
};

export default DiceDisplay;
