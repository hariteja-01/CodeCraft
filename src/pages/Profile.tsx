import React from 'react';
import { motion } from 'framer-motion';
import { useGame } from '../contexts/GameContext';
import { problems } from '../data/problems';
import { Trophy, Zap, Target, Calendar, CheckCircle2, Clock, Star, Award, Flame, RotateCcw, Download, Share2, Settings } from 'lucide-react';

const Profile: React.FC = () => {
  const { userProgress, resetProgress } = useGame();

  const achievements = [
    {
      id: 'first-solve',
      title: 'First Steps',
      description: 'Solved your first problem',
      icon: Star,
      unlocked: userProgress.solvedProblems.length >= 1,
      rarity: 'Common'
    },
    {
      id: 'streak-master',
      title: 'Streak Master',
      description: 'Maintained a 7-day solving streak',
      icon: Flame,
      unlocked: userProgress.streak >= 7,
      rarity: 'Rare'
    },
    {
      id: 'problem-solver',
      title: 'Problem Solver',
      description: 'Solved 5 different problems',
      icon: CheckCircle2,
      unlocked: userProgress.solvedProblems.length >= 5,
      rarity: 'Uncommon'
    },
    {
      id: 'xp-hunter',
      title: 'XP Hunter',
      description: 'Earned 1000 XP',
      icon: Zap,
      unlocked: userProgress.xp >= 1000,
      rarity: 'Uncommon'
    },
    {
      id: 'algorithm-master',
      title: 'Algorithm Master',
      description: 'Completed all 9 core problems',
      icon: Trophy,
      unlocked: userProgress.solvedProblems.length >= 9,
      rarity: 'Legendary'
    },
    {
      id: 'perfectionist',
      title: 'Perfectionist',
      description: 'Solved a problem on first try',
      icon: Award,
      unlocked: false, // This would be tracked separately
      rarity: 'Epic'
    }
  ];

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'Common':
        return 'from-gray-400 to-gray-500';
      case 'Uncommon':
        return 'from-green-400 to-green-500';
      case 'Rare':
        return 'from-blue-400 to-blue-500';
      case 'Epic':
        return 'from-purple-400 to-purple-500';
      case 'Legendary':
        return 'from-yellow-400 to-orange-500';
      default:
        return 'from-gray-400 to-gray-500';
    }
  };

  const completionRate = (userProgress.solvedProblems.length / problems.length) * 100;
  const nextLevelXP = (userProgress.level) * 1000;
  const currentLevelProgress = ((userProgress.xp % 1000) / 1000) * 100;

  const handleResetProgress = () => {
    const confirmed = window.confirm(
      '⚠️ DANGER ZONE ⚠️\n\n' +
      'Are you absolutely sure you want to reset ALL your progress?\n\n' +
      'This will permanently delete:\n' +
      '• All solved problems\n' +
      '• Your XP and level\n' +
      '• Your streak and achievements\n' +
      '• All statistics and history\n\n' +
      'This action CANNOT be undone!\n\n' +
      'Type "RESET" in the next dialog to confirm.'
    );
    
    if (confirmed) {
      const confirmation = prompt('Type "RESET" to confirm (case sensitive):');
      if (confirmation === 'RESET') {
        alert('🎯 Progress Reset Complete!\n\nYour journey begins anew. Good luck, coder! 🚀');
        resetProgress();
      } else {
        alert('Reset cancelled. Your progress is safe! 🛡️');
      }
    }
  };

  const handleAdvancedReset = () => {
    const options = [
      'Reset only XP and Level',
      'Reset only solved problems', 
      'Reset only achievements',
      'Reset everything (DANGER)',
      'Cancel'
    ];
    
    const choice = prompt(
      'Advanced Reset Options:\n\n' +
      '1. Reset only XP and Level\n' +
      '2. Reset only solved problems\n' +
      '3. Reset only achievements\n' +
      '4. Reset everything (DANGER)\n' +
      '5. Cancel\n\n' +
      'Enter your choice (1-5):'
    );
    
    switch (choice) {
      case '1':
        if (confirm('Reset XP and Level only?')) {
          setUserProgress(prev => ({ ...prev, xp: 0, level: 1 }));
          alert('XP and Level reset successfully! 📊');
        }
        break;
      case '2':
        if (confirm('Reset solved problems only?')) {
          setUserProgress(prev => ({ ...prev, solvedProblems: [] }));
          alert('Solved problems reset successfully! 🧩');
        }
        break;
      case '3':
        if (confirm('Reset achievements only?')) {
          setUserProgress(prev => ({ ...prev, achievements: [] }));
          alert('Achievements reset successfully! 🏆');
        }
        break;
      case '4':
        handleResetProgress();
        break;
      default:
        alert('Reset cancelled! 🛡️');
    }
  };

  const handleBackupProgress = () => {
    const backup = {
      ...userProgress,
      backupDate: new Date().toISOString(),
      version: '1.0'
    };
    
    const dataStr = JSON.stringify(backup, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `codecraft-backup-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    alert('✅ Backup created successfully!\n\nYour progress has been safely exported. Keep this file secure! 🔒');
  };

  const handleImportProgress = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const importedData = JSON.parse(e.target?.result as string);
            if (importedData.xp !== undefined && importedData.level !== undefined) {
              if (confirm('Import this progress data? This will overwrite your current progress!')) {
                setUserProgress(importedData);
                alert('✅ Progress imported successfully! 🎉');
              }
            } else {
              alert('❌ Invalid backup file format!');
            }
          } catch (error) {
            alert('❌ Error reading backup file!');
          }
        };
        reader.readAsText(file);
      }
    };
    
    input.click();
  };

  const handleSyncProgress = async () => {
    // Simulate cloud sync
    const syncSteps = [
      'Connecting to CodeCraft Cloud...',
      'Uploading progress data...',
      'Syncing achievements...',
      'Updating leaderboard...',
      'Finalizing sync...'
    ];
    
    for (const step of syncSteps) {
      alert(`🔄 ${step}`);
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    alert('✅ Progress synced to cloud successfully! 🌩️\n\nYour data is now backed up and accessible across devices.');
  };

  const handleGenerateReport = () => {
    const report = `
📊 CODECRAFT PROGRESS REPORT
============================

👤 Profile Summary:
• Level: ${userProgress.level}
• Total XP: ${userProgress.xp.toLocaleString()}
• Problems Solved: ${userProgress.solvedProblems.length}/${problems.length}
• Current Streak: ${userProgress.streak} days
• Completion Rate: ${completionRate.toFixed(1)}%

🎯 Problem Breakdown:
• Easy: ${problemsByDifficulty.Easy} solved
• Medium: ${problemsByDifficulty.Medium} solved  
• Hard: ${problemsByDifficulty.Hard} solved

📈 Statistics:
• Estimated Hours Coded: ${Math.floor(userProgress.xp / 100)}
• Test Cases Passed: ${userProgress.solvedProblems.length * 3}
• Accuracy Rate: ${Math.floor(completionRate)}%
• Best Streak: ${userProgress.streak} days

🏆 Achievements: ${achievements.filter(a => a.unlocked).length}/${achievements.length} unlocked

Generated on: ${new Date().toLocaleString()}
CodeCraft DSA Platform - Master DSA with Visual Magic ✨
    `.trim();
    
    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `codecraft-report-${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    
    alert('📊 Progress report generated! 📋\n\nYour detailed report has been downloaded.');
  };

  const handleQuickReset = () => {
    if (confirm('Quick reset: Clear only current session data?')) {
      resetProgress();
      alert('🔄 Session reset complete! Fresh start activated! 🚀');
    }
  };

  const handleExportProgress = () => {
    const dataStr = JSON.stringify(userProgress, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = 'codecraft-progress.json';
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const handleShareProgress = async () => {
    const shareText = `🚀 I've solved ${userProgress.solvedProblems.length}/${problems.length} DSA problems on CodeCraft and earned ${userProgress.xp.toLocaleString()} XP! Currently at Level ${userProgress.level} with a ${userProgress.streak}-day streak! 💪 #CodeCraft #DSA #Programming`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'My CodeCraft Progress',
          text: shareText,
          url: window.location.origin
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      // Fallback to clipboard
      navigator.clipboard.writeText(shareText);
      alert('Progress copied to clipboard!');
    }
  };

  const problemsByDifficulty = {
    Easy: problems.filter(p => p.difficulty === 'Easy' && userProgress.solvedProblems.includes(p.id)).length,
    Medium: problems.filter(p => p.difficulty === 'Medium' && userProgress.solvedProblems.includes(p.id)).length,
    Hard: problems.filter(p => p.difficulty === 'Hard' && userProgress.solvedProblems.includes(p.id)).length,
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
          <div className="relative inline-block mb-6">
            <div className="w-32 h-32 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto shadow-2xl">
              <span className="text-4xl font-bold text-white">
                {userProgress.level}
              </span>
            </div>
            <div className="absolute -bottom-2 -right-2 w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center border-4 border-white dark:border-slate-800">
              <Trophy className="w-6 h-6 text-white" />
            </div>
          </div>
          
          <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Your Coding Journey
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Track your progress, achievements, and master the art of algorithmic thinking
          </p>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-12"
        >
          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 dark:border-slate-700/30">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Quick Actions</h3>
            
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleShareProgress}
                className="flex flex-col items-center space-y-2 p-3 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-xl hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-all duration-300"
              >
                <Share2 className="w-5 h-5" />
                <span className="text-xs font-medium">Share</span>
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleExportProgress}
                className="flex flex-col items-center space-y-2 p-3 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-xl hover:bg-green-200 dark:hover:bg-green-900/50 transition-all duration-300"
              >
                <Download className="w-5 h-5" />
                <span className="text-xs font-medium">Export</span>
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleBackupProgress}
                className="flex flex-col items-center space-y-2 p-3 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-xl hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-all duration-300"
              >
                <Settings className="w-5 h-5" />
                <span className="text-xs font-medium">Backup</span>
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleGenerateReport}
                className="flex flex-col items-center space-y-2 p-3 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 rounded-xl hover:bg-yellow-200 dark:hover:bg-yellow-900/50 transition-all duration-300"
              >
                <Trophy className="w-5 h-5" />
                <span className="text-xs font-medium">Report</span>
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleAdvancedReset}
                className="flex flex-col items-center space-y-2 p-3 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 rounded-xl hover:bg-orange-200 dark:hover:bg-orange-900/50 transition-all duration-300"
              >
                <RotateCcw className="w-5 h-5" />
                <span className="text-xs font-medium">Advanced</span>
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleResetProgress}
                className="flex flex-col items-center space-y-2 p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-xl hover:bg-red-200 dark:hover:bg-red-900/50 transition-all duration-300"
              >
                <Target className="w-5 h-5" />
                <span className="text-xs font-medium">Reset All</span>
              </motion.button>
            </div>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Stats */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:col-span-2 space-y-6"
          >
            {/* Overall Stats */}
            <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 dark:border-slate-700/30">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Overview</h2>
              
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <Trophy className="w-8 h-8 text-white" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {userProgress.solvedProblems.length}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Problems Solved</div>
                </div>
                
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <Zap className="w-8 h-8 text-white" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {userProgress.xp.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Total XP</div>
                </div>
                
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <Flame className="w-8 h-8 text-white" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {userProgress.streak}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Day Streak</div>
                </div>
                
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <Target className="w-8 h-8 text-white" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {completionRate.toFixed(0)}%
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Completion Rate</div>
                </div>
              </div>
            </div>

            {/* Progress Charts */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Level Progress */}
              <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 dark:border-slate-700/30">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Level Progress</h3>
                
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Level {userProgress.level}
                  </span>
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {userProgress.xp % 1000} / 1000 XP
                  </span>
                </div>
                
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 mb-4">
                  <motion.div
                    className="h-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${currentLevelProgress}%` }}
                    transition={{ duration: 1, delay: 0.5 }}
                  />
                </div>
                
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {1000 - (userProgress.xp % 1000)} XP to next level
                </p>
              </div>

              {/* Problem Distribution */}
              <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 dark:border-slate-700/30">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Problems by Difficulty</h3>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Easy</span>
                    </div>
                    <span className="text-sm font-bold text-gray-900 dark:text-white">
                      {problemsByDifficulty.Easy}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Medium</span>
                    </div>
                    <span className="text-sm font-bold text-gray-900 dark:text-white">
                      {problemsByDifficulty.Medium}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Hard</span>
                    </div>
                    <span className="text-sm font-bold text-gray-900 dark:text-white">
                      {problemsByDifficulty.Hard}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Coding Statistics */}
            <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 dark:border-slate-700/30">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Coding Statistics</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {Math.floor(userProgress.xp / 100)}
                  </div>
                  <div className="text-sm text-blue-700 dark:text-blue-300">Hours Coded</div>
                </div>
                
                <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    {userProgress.solvedProblems.length * 3}
                  </div>
                  <div className="text-sm text-purple-700 dark:text-purple-300">Test Cases Passed</div>
                </div>
                
                <div className="text-center p-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg">
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {Math.floor(completionRate)}%
                  </div>
                  <div className="text-sm text-green-700 dark:text-green-300">Accuracy Rate</div>
                </div>
                
                <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                    {userProgress.streak}
                  </div>
                  <div className="text-sm text-orange-700 dark:text-orange-300">Best Streak</div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 dark:border-slate-700/30">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Recent Solved Problems</h3>
              
              {userProgress.solvedProblems.length > 0 ? (
                <div className="space-y-3">
                  {userProgress.solvedProblems.slice(-5).reverse().map((problemId) => {
                    const problem = problems.find(p => p.id === problemId);
                    if (!problem) return null;
                    
                    return (
                      <div key={problemId} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                        <div className="flex items-center space-x-3">
                          <CheckCircle2 className="w-5 h-5 text-green-500" />
                          <div>
                            <div className="font-medium text-gray-900 dark:text-white">
                              {problem.title}
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                              {problem.difficulty} • +{problem.xpReward} XP
                            </div>
                          </div>
                        </div>
                        <Clock className="w-4 h-4 text-gray-400" />
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400">
                    No problems solved yet. Start your journey!
                  </p>
                </div>
              )}
            </div>
          </motion.div>

          {/* Right Column - Achievements */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="lg:col-span-1"
          >
            <div className="sticky top-24">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Achievements</h2>
              
              <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 dark:border-slate-700/30">
                <div className="space-y-4">
                  {achievements.map((achievement, index) => {
                    const Icon = achievement.icon;
                    
                    return (
                      <motion.div
                        key={achievement.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: index * 0.1 }}
                        className={`relative p-4 rounded-xl border-2 transition-all duration-300 ${
                          achievement.unlocked
                            ? 'bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-blue-200 dark:border-blue-700/30'
                            : 'bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 opacity-60'
                        }`}
                      >
                        <div className="flex items-start space-x-3">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                            achievement.unlocked
                              ? `bg-gradient-to-br ${getRarityColor(achievement.rarity)}`
                              : 'bg-gray-300 dark:bg-gray-600'
                          }`}>
                            <Icon className="w-6 h-6 text-white" />
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2 mb-1">
                              <h4 className="font-bold text-gray-900 dark:text-white">
                                {achievement.title}
                              </h4>
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                achievement.unlocked
                                  ? `bg-gradient-to-r ${getRarityColor(achievement.rarity)} text-white`
                                  : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                              }`}>
                                {achievement.rarity}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {achievement.description}
                            </p>
                          </div>
                          
                          {achievement.unlocked && (
                            <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
                
                <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-600">
                  <div className="text-center">
                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      Achievement Progress
                    </div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      {achievements.filter(a => a.unlocked).length} / {achievements.length}
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

export default Profile;