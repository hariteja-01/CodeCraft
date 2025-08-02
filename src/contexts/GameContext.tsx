import React, { createContext, useContext, useState, useEffect } from 'react';
import { useWebSocket } from '../hooks/useWebSocket';

interface UserProgress {
  xp: number;
  level: number;
  solvedProblems: string[];
  streak: number;
  achievements: string[];
}

interface GameContextType {
  userProgress: UserProgress;
  addXP: (amount: number) => void;
  markProblemSolved: (problemId: string) => void;
  updateStreak: () => void;
  resetProgress: () => void;
  isOnline: boolean;
  connectedUsers: number;
  joinRoom: (roomId: string) => void;
  leaveRoom: (roomId: string) => void;
  sendCode: (roomId: string, code: string) => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isOnline, connectedUsers, joinRoom, leaveRoom, sendCode, manualConnect } = useWebSocket({
    autoConnect: false, // Don't auto-connect to avoid connection errors
    reconnection: true
  });

  const [userProgress, setUserProgress] = useState<UserProgress>(() => {
    const saved = localStorage.getItem('codecraft-progress');
    return saved ? JSON.parse(saved) : {
      xp: 0,
      level: 1,
      solvedProblems: [],
      streak: 0,
      achievements: []
    };
  });

  useEffect(() => {
    localStorage.setItem('codecraft-progress', JSON.stringify(userProgress));
  }, [userProgress]);

  const addXP = (amount: number) => {
    setUserProgress(prev => {
      const newXP = prev.xp + amount;
      const newLevel = Math.floor(newXP / 1000) + 1;
      return {
        ...prev,
        xp: newXP,
        level: Math.max(prev.level, newLevel)
      };
    });
  };

  const markProblemSolved = (problemId: string) => {
    setUserProgress(prev => ({
      ...prev,
      solvedProblems: [...new Set([...prev.solvedProblems, problemId])]
    }));
  };

  const updateStreak = () => {
    setUserProgress(prev => ({
      ...prev,
      streak: prev.streak + 1
    }));
  };

  const resetProgress = () => {
    const initialProgress = {
      xp: 0,
      level: 1,
      solvedProblems: [],
      streak: 0,
      achievements: []
    };
    setUserProgress(initialProgress);
    localStorage.setItem('codecraft-progress', JSON.stringify(initialProgress));
  };
  return (
    <GameContext.Provider value={{ 
      userProgress, 
      addXP, 
      markProblemSolved, 
      updateStreak, 
      resetProgress,
      isOnline,
      connectedUsers,
      joinRoom,
      leaveRoom,
      sendCode
    }}>
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within GameProvider');
  }
  return context;
};