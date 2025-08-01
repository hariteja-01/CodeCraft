import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { problems } from '../data/problems';
import { useGame } from '../contexts/GameContext';
import { Clock, Trophy, Zap, Lock, CheckCircle2, Star } from 'lucide-react';

const Learn: React.FC = () => {
  const { userProgress } = useGame();

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy':
        return 'from-green-500 to-emerald-500';
      case 'Medium':
        return 'from-yellow-500 to-orange-500';
      case 'Hard':
        return 'from-red-500 to-pink-500';
      default:
        return 'from-blue-500 to-purple-500';
    }
  };

  const isUnlocked = (index: number) => {
    return index === 0 || userProgress.solvedProblems.length >= index;
  };

  const isSolved = (problemId: string) => {
    return userProgress.solvedProblems.includes(problemId);
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
          <h1 className="text-5xl lg:text-6xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-6">
            DSA Learning Path
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Master 9 essential Data Structures and Algorithms through interactive visualizations and hands-on coding
          </p>
          
          {/* Progress Stats */}
          <div className="flex flex-wrap justify-center gap-6 mt-8">
            <div className="flex items-center space-x-2 px-4 py-2 rounded-full bg-blue-100 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700/30">
              <Trophy className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <span className="font-semibold text-blue-700 dark:text-blue-300">
                {userProgress.solvedProblems.length}/{problems.length} Solved
              </span>
            </div>
            <div className="flex items-center space-x-2 px-4 py-2 rounded-full bg-amber-100 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-700/30">
              <Zap className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              <span className="font-semibold text-amber-700 dark:text-amber-300">
                {userProgress.xp.toLocaleString()} XP
              </span>
            </div>
            <div className="flex items-center space-x-2 px-4 py-2 rounded-full bg-purple-100 dark:bg-purple-900/30 border border-purple-200 dark:border-purple-700/30">
              <Star className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              <span className="font-semibold text-purple-700 dark:text-purple-300">
                Level {userProgress.level}
              </span>
            </div>
          </div>
        </motion.div>

        {/* Problems Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {problems.map((problem, index) => {
            const unlocked = isUnlocked(index);
            const solved = isSolved(problem.id);
            
            return (
              <motion.div
                key={problem.id}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="group"
              >
                <div className={`relative h-full rounded-2xl overflow-hidden transition-all duration-300 ${
                  unlocked 
                    ? 'hover:scale-105 hover:shadow-xl cursor-pointer' 
                    : 'opacity-60 cursor-not-allowed'
                }`}>
                  {/* Background Gradient */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${getDifficultyColor(problem.difficulty)} opacity-10`}></div>
                  
                  {/* Content */}
                  <div className="relative p-6 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-white/20 dark:border-slate-700/30 h-full flex flex-col">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-2">
                        <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${getDifficultyColor(problem.difficulty)} flex items-center justify-center text-white font-bold text-sm`}>
                          {index + 1}
                        </div>
                        <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          problem.difficulty === 'Easy' 
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                            : problem.difficulty === 'Medium'
                            ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300'
                            : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                        }`}>
                          {problem.difficulty}
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        {solved && (
                          <CheckCircle2 className="w-6 h-6 text-green-500" />
                        )}
                        {!unlocked && (
                          <Lock className="w-6 h-6 text-gray-400" />
                        )}
                      </div>
                    </div>

                    {/* Title and Description */}
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">
                      {problem.title}
                    </h3>
                    
                    <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed mb-4 flex-grow">
                      {problem.description.split('\n')[0].substring(0, 120)}...
                    </p>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {problem.tags.slice(0, 2).map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-1 text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-md"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                        <div className="flex items-center space-x-1">
                          <Zap className="w-4 h-4" />
                          <span>{problem.xpReward} XP</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="w-4 h-4" />
                          <span>~30min</span>
                        </div>
                      </div>
                      
                      {unlocked ? (
                        <Link to={`/learn/${problem.id}`}>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className={`px-4 py-2 rounded-lg font-semibold transition-all duration-300 ${
                              solved
                                ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-900/50'
                                : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-900/50'
                            }`}
                          >
                            {solved ? 'Review' : 'Start'}
                          </motion.button>
                        </Link>
                      ) : (
                        <button
                          disabled
                          className="px-4 py-2 rounded-lg font-semibold bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed"
                        >
                          Locked
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Learning Path Visualization */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="relative"
        >
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Your Learning Journey
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              Progress through carefully crafted challenges that build upon each other
            </p>
          </div>

          {/* Progress Bar */}
          <div className="relative w-full max-w-4xl mx-auto">
            <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${(userProgress.solvedProblems.length / problems.length) * 100}%` }}
                transition={{ duration: 1, delay: 0.5 }}
              />
            </div>
            
            <div className="flex justify-between mt-4 text-sm text-gray-600 dark:text-gray-400">
              <span>Beginner</span>
              <span>Intermediate</span>
              <span>Advanced</span>
              <span>Expert</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Learn;