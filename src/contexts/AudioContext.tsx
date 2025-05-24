import React, { createContext, useContext, useRef, useState } from 'react';
import { Howl } from 'howler';

type SoundType = 'buttonClick' | 'diceRoll' | 'bid' | 'aiBid' | 'win' | 'lose' | 'error' | 'gameStart' | 'newRound' | 'backgroundMusic';

interface AudioContextType {
  isMuted: boolean;
  toggleMute: () => void;
  playSound: (sound: SoundType) => void;
}

const sounds = {
  buttonClick: 'https://cdn.freesound.org/previews/242/242501_355158-lq.mp3',
  diceRoll: 'https://cdn.freesound.org/previews/220/220155_3040044-lq.mp3',
  bid: 'https://cdn.freesound.org/previews/415/415514_5121236-lq.mp3',
  aiBid: 'https://cdn.freesound.org/previews/350/350876_6419915-lq.mp3',
  win: 'https://cdn.freesound.org/previews/320/320655_5260872-lq.mp3',
  lose: 'https://cdn.freesound.org/previews/277/277021_4538545-lq.mp3',
  error: 'https://cdn.freesound.org/previews/142/142608_2494244-lq.mp3',
  gameStart: 'https://cdn.freesound.org/previews/457/457506_9017641-lq.mp3',
  newRound: 'https://cdn.freesound.org/previews/320/320653_5260872-lq.mp3',
  backgroundMusic: 'https://cdn.freesound.org/previews/369/369920_5413578-lq.mp3'
};

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export const AudioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isMuted, setIsMuted] = useState<boolean>(() => {
    const savedMute = localStorage.getItem('isMuted');
    return savedMute ? JSON.parse(savedMute) : false;
  });
  
  const soundInstances = useRef<Record<string, Howl>>({});
  const bgMusicRef = useRef<Howl | null>(null);

  React.useEffect(() => {
    // Initialize background music
    bgMusicRef.current = new Howl({
      src: [sounds.backgroundMusic],
      loop: true,
      volume: 0.3,
      autoplay: false,
    });

    // Play background music if not muted
    if (!isMuted) {
      bgMusicRef.current.play();
    }

    // Preload other sounds
    Object.entries(sounds).forEach(([key, src]) => {
      if (key !== 'backgroundMusic') {
        soundInstances.current[key] = new Howl({
          src: [src],
          volume: key.includes('win') || key.includes('lose') ? 0.5 : 0.3,
        });
      }
    });

    // Cleanup on unmount
    return () => {
      Object.values(soundInstances.current).forEach(sound => sound.stop());
      if (bgMusicRef.current) {
        bgMusicRef.current.stop();
      }
    };
  }, []);

  // Toggle mute state for all sounds
  const toggleMute = () => {
    const newMutedState = !isMuted;
    setIsMuted(newMutedState);
    localStorage.setItem('isMuted', JSON.stringify(newMutedState));
    
    // Toggle background music
    if (bgMusicRef.current) {
      if (newMutedState) {
        bgMusicRef.current.pause();
      } else {
        bgMusicRef.current.play();
      }
    }
  };

  // Play a sound effect
  const playSound = (sound: SoundType) => {
    if (isMuted) return;
    
    if (sound === 'backgroundMusic') {
      if (bgMusicRef.current) {
        bgMusicRef.current.play();
      }
      return;
    }
    
    const soundInstance = soundInstances.current[sound];
    if (soundInstance) {
      soundInstance.play();
    }
  };

  return (
    <AudioContext.Provider value={{ isMuted, toggleMute, playSound }}>
      {children}
      <button 
        className="fixed top-4 left-4 bg-[#8b4513] text-[#e6d2a8] p-2 rounded-full"
        onClick={toggleMute}
      >
        {isMuted ? (
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="3" x2="21" y2="21"></line><path d="M18.36 18.36a9.9 9.9 0 0 1-5.36 1.64 10 10 0 0 1-10-10 9.9 9.9 0 0 1 1.64-5.36"></path><path d="M13.34 13.34A4 4 0 0 0 6.66 6.66"></path></svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 7.78"></path><path d="M5.5 19.5 19.5 5.5"></path><path d="M17.05 11a5.5 5.5 0 0 0-5.05-5.05"></path><path d="M3 3l18 18"></path></svg>
        )}
      </button>
    </AudioContext.Provider>
  );
};

export const useAudio = (): AudioContextType => {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error('useAudio must be used within an AudioProvider');
  }
  return context;
};