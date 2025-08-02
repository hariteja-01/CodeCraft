import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useGame } from '../contexts/GameContext';
import { Swords, Trophy, Clock, Zap, Users, Target, Crown, Medal, Wifi, WifiOff, Play, Pause } from 'lucide-react';

const Arena: React.FC = () => {
  const { userProgress, isOnline, connectedUsers: wsConnectedUsers } = useGame();
  const [selectedMode, setSelectedMode] = useState<'daily' | 'tournament' | 'duel' | 'multiplayer' | null>(null);
  const [connectedUsers, setConnectedUsers] = useState(1247);
  const [activeMatches, setActiveMatches] = useState(89);

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setConnectedUsers(prev => prev + Math.floor(Math.random() * 10) - 5);
      setActiveMatches(prev => Math.max(1, prev + Math.floor(Math.random() * 6) - 3));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const arenaFeatures = [
    {
      id: 'daily',
      title: 'Daily Challenge',
      description: 'Solve the daily problem to maintain your streak and earn bonus XP',
      icon: Target,
      color: 'from-blue-500 to-cyan-500',
      reward: '100-300 XP',
      difficulty: 'Medium',
      participants: '10,234',
      timeLimit: '45 min',
      status: 'Available'
    },
    {
      id: 'tournament',
      title: 'Weekly Tournament',
      description: 'Compete against hundreds of players in timed coding battles',
      icon: Crown,
      color: 'from-purple-500 to-pink-500',
      reward: '500-2000 XP',
      difficulty: 'Hard',
      participants: '2,847',
      timeLimit: '2 hours',
      status: 'Live Now'
    },
    {
      id: 'duel',
      title: '1v1 Duel',
      description: 'Challenge a friend or random opponent to a head-to-head coding battle',
      icon: Swords,
      color: 'from-red-500 to-orange-500',
      reward: '50-500 XP',
      difficulty: 'Easy-Hard',
      participants: 'Find Match',
      timeLimit: '30 min',
      status: 'Ready'
    },
    {
      id: 'multiplayer',
      title: 'Multiplayer Room',
      description: 'Join or create rooms with up to 8 players for collaborative coding',
      icon: Users,
      color: 'from-green-500 to-emerald-500',
      reward: '200-800 XP',
      difficulty: 'Variable',
      participants: `${activeMatches} active`,
      timeLimit: '60 min',
      status: 'New!'
    }
  ];

  const leaderboard = [
    { rank: 1, name: 'CodeMaster_42', xp: 15680, flag: '🇺🇸', streak: 28, status: 'online' },
    { rank: 2, name: 'AlgoNinja', xp: 14230, flag: '🇯🇵', streak: 19, status: 'online' },
    { rank: 3, name: 'DataStructure_Queen', xp: 13890, flag: '🇩🇪', streak: 34, status: 'in-match' },
    { rank: 4, name: 'BinarySearcher', xp: 12450, flag: '🇨🇦', streak: 12, status: 'online' },
    { rank: 5, name: 'DynamicProgrammer', xp: 11980, flag: '🇮🇳', streak: 22, status: 'offline' },
    { rank: 6, name: 'GraphTraverser', xp: 11340, flag: '🇬🇧', streak: 15, status: 'online' },
    { rank: 7, name: 'SortingMaster', xp: 10890, flag: '🇫🇷', streak: 8, status: 'in-match' },
    { rank: 8, name: 'TreeExplorer', xp: 10560, flag: '🇰🇷', streak: 31, status: 'online' }
  ];

  const userRank = 42;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'in-match': return 'bg-yellow-500';
      case 'offline': return 'bg-gray-400';
      default: return 'bg-gray-400';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'Available': return 'text-green-600 dark:text-green-400';
      case 'Live Now': return 'text-red-600 dark:text-red-400 animate-pulse';
      case 'Ready': return 'text-blue-600 dark:text-blue-400';
      case 'New!': return 'text-purple-600 dark:text-purple-400';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  };

  return (
    <div className="min-h-screen pt-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl lg:text-6xl font-bold bg-gradient-to-r from-red-600 via-orange-600 to-yellow-600 bg-clip-text text-transparent mb-6">
            Coding Arena
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-8">
            Test your skills against the best programmers worldwide. Compete, learn, and climb the global leaderboard!
          </p>
          
          {/* Connection Status */}
          <div className="flex flex-wrap justify-center gap-6 mb-6">
            <div className={`flex items-center space-x-2 px-4 py-2 rounded-full border ${
              isOnline 
                ? 'bg-green-100 dark:bg-green-900/30 border-green-200 dark:border-green-700/30' 
                : 'bg-orange-100 dark:bg-orange-900/30 border-orange-200 dark:border-orange-700/30'
            }`}>
              {isOnline ? (
                <Wifi className="w-5 h-5 text-green-600 dark:text-green-400" />
              ) : (
                <WifiOff className="w-5 h-5 text-orange-600 dark:text-orange-400" />
              )}
              <span className={`font-semibold ${
                isOnline 
                  ? 'text-green-700 dark:text-green-300' 
                  : 'text-orange-700 dark:text-orange-300'
              }`}>
                {isOnline ? 'Online' : 'Offline - Multiplayer Unavailable'}
              </span>
            </div>
            
            <div className="flex items-center space-x-2 px-4 py-2 rounded-full bg-blue-100 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700/30">
              <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <span className="font-semibold text-blue-700 dark:text-blue-300">
                {isOnline ? (wsConnectedUsers || connectedUsers).toLocaleString() : 'Demo Mode'} Online
              </span>
            </div>
            
            <div className="flex items-center space-x-2 px-4 py-2 rounded-full bg-purple-100 dark:bg-purple-900/30 border border-purple-200 dark:border-purple-700/30">
              <Play className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              <span className="font-semibold text-purple-700 dark:text-purple-300">
                {activeMatches} Active Matches
              </span>
            </div>
          </div>
          
          {/* User Stats */}
          <div className="flex flex-wrap justify-center gap-6">
            <div className="flex items-center space-x-2 px-4 py-2 rounded-full bg-gradient-to-r from-gold-100 to-yellow-100 dark:from-yellow-900/30 dark:to-orange-900/30 border border-yellow-200 dark:border-yellow-700/30">
              <Trophy className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
              <span className="font-semibold text-yellow-700 dark:text-yellow-300">
                Rank #{userRank}
              </span>
            </div>
            <div className="flex items-center space-x-2 px-4 py-2 rounded-full bg-blue-100 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700/30">
              <Zap className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <span className="font-semibold text-blue-700 dark:text-blue-300">
                {userProgress.xp} XP
              </span>
            </div>
            <div className="flex items-center space-x-2 px-4 py-2 rounded-full bg-green-100 dark:bg-green-900/30 border border-green-200 dark:border-green-700/30">
              <Target className="w-5 h-5 text-green-600 dark:text-green-400" />
              <span className="font-semibold text-green-700 dark:text-green-300">
                {userProgress.streak} Day Streak
              </span>
            </div>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Arena Modes */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mb-8"
            >
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Choose Your Battle</h2>
              
              <div className="space-y-6">
                {arenaFeatures.map((mode, index) => {
                  const Icon = mode.icon;
                  const isSelected = selectedMode === mode.id;
                  
                  return (
                    <motion.div
                      key={mode.id}
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: index * 0.1 }}
                      onClick={() => setSelectedMode(mode.id as any)}
                      className={`relative cursor-pointer group transition-all duration-300 ${
                        isSelected ? 'scale-105' : 'hover:scale-102'
                      }`}
                    >
                      <div className={`absolute inset-0 bg-gradient-to-r ${mode.color} opacity-20 rounded-2xl blur-xl ${
                        isSelected ? 'opacity-30' : 'group-hover:opacity-25'
                      } transition-opacity duration-300`}></div>
                      
                      <div className={`relative p-6 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl border-2 transition-all duration-300 ${
                        isSelected 
                          ? 'border-blue-500 dark:border-blue-400 shadow-xl' 
                          : 'border-white/20 dark:border-slate-700/30 hover:border-blue-300 dark:hover:border-blue-600'
                      }`}>
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center space-x-4">
                            <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${mode.color} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                              <Icon className="w-8 h-8 text-white" />
                            </div>
                            <div>
                              <div className="flex items-center space-x-2 mb-2">
                                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                                  {mode.title}
                                </h3>
                                <span className={`text-sm font-semibold ${getStatusText(mode.status)}`}>
                                  {mode.status}
                                </span>
                              </div>
                              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                                {mode.description}
                              </p>
                            </div>
                          </div>
                          
                          {isSelected && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center"
                            >
                              <div className="w-2 h-2 bg-white rounded-full"></div>
                            </motion.div>
                          )}
                        </div>

                        {/* Mode Stats */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
                          <div className="text-center">
                            <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Reward</div>
                            <div className="font-semibold text-gray-900 dark:text-white">{mode.reward}</div>
                          </div>
                          <div className="text-center">
                            <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Difficulty</div>
                            <div className="font-semibold text-gray-900 dark:text-white">{mode.difficulty}</div>
                          </div>
                          <div className="text-center">
                            <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Players</div>
                            <div className="font-semibold text-gray-900 dark:text-white">{mode.participants}</div>
                          </div>
                          <div className="text-center">
                            <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Time Limit</div>
                            <div className="font-semibold text-gray-900 dark:text-white">{mode.timeLimit}</div>
                          </div>
                        </div>

                        {/* Action Button */}
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          disabled={!isSelected}
                          className={`w-full mt-6 px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                            isSelected
                              ? `bg-gradient-to-r ${mode.color} text-white shadow-lg hover:shadow-xl`
                              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed'
                          }`}
                        >
                          {mode.id === 'duel' ? 'Find Opponent' : 
                           mode.id === 'multiplayer' ? 'Join Room' : 'Enter Arena'}
                        </motion.button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          </div>

          {/* Leaderboard */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="lg:col-span-1"
          >
            <div className="sticky top-24">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Global Leaderboard</h2>
              
              <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 dark:border-slate-700/30">
                <div className="space-y-4">
                  {leaderboard.map((player, index) => (
                    <motion.div
                      key={player.rank}
                      initial={{ opacity: 0, x: 30 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.05 }}
                      className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-300"
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                          player.rank === 1 
                            ? 'bg-yellow-500 text-white' 
                            : player.rank === 2 
                            ? 'bg-gray-400 text-white'
                            : player.rank === 3
                            ? 'bg-orange-600 text-white'
                            : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                        }`}>
                          {player.rank <= 3 ? (
                            player.rank === 1 ? (
                              <Crown className="w-4 h-4" />
                            ) : (
                              <Medal className="w-4 h-4" />
                            )
                          ) : (
                            player.rank
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2">
                            <span className="text-lg">{player.flag}</span>
                            <span className="font-semibold text-gray-900 dark:text-white truncate">
                              {player.name}
                            </span>
                            <div className={`w-2 h-2 rounded-full ${getStatusColor(player.status)}`}></div>
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {player.xp.toLocaleString()} XP • {player.streak} day streak
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* User Position */}
                <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-600">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-700/30">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold text-sm">
                        {userRank}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-semibold text-blue-900 dark:text-blue-100">You</span>
                          <div className="w-2 h-2 rounded-full bg-green-500"></div>
                        </div>
                        <div className="text-sm text-blue-700 dark:text-blue-300">
                          {userProgress.xp.toLocaleString()} XP • {userProgress.streak} day streak
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Arena;