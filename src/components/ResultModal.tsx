import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle2, XCircle, Trophy, Zap, Clock } from 'lucide-react';

interface TestResult {
  input: string;
  expected: string;
  actual: string;
  passed: boolean;
  executionTime: number;
  memory?: number;
  status: 'accepted' | 'wrong_answer' | 'runtime_error' | 'compilation_error' | 'time_limit_exceeded';
}

interface ResultModalProps {
  isOpen: boolean;
  onClose: () => void;
  results: TestResult[];
  allPassed: boolean;
  xpEarned: number;
  problemTitle: string;
  submitResult?: {
    totalPassed: number;
    totalTests: number;
    executionTime: number;
    memoryUsed: number;
    status: string;
  };
}

const Confetti: React.FC = () => {
  const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];
  
  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {Array.from({ length: 50 }).map((_, index) => (
        <motion.div
          key={index}
          className="absolute w-2 h-2 rounded-full"
          style={{
            backgroundColor: colors[index % colors.length],
            left: Math.random() * 100 + '%',
            top: -10,
          }}
          initial={{ y: -10, opacity: 1, scale: 1 }}
          animate={{ 
            y: window.innerHeight + 10, 
            opacity: 0, 
            scale: 0,
            rotate: 360 
          }}
          transition={{ 
            duration: 3 + Math.random() * 2, 
            delay: Math.random() * 2,
            ease: "easeOut"
          }}
        />
      ))}
    </div>
  );
};

const ResultModal: React.FC<ResultModalProps> = ({
  isOpen,
  onClose,
  results,
  allPassed,
  xpEarned,
  problemTitle,
  submitResult
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {allPassed && <Confetti />}
          
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 flex items-center justify-center p-4"
            onClick={onClose}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className={`p-6 border-b border-gray-200 dark:border-gray-700 ${
                allPassed 
                  ? 'bg-gradient-to-r from-green-500 to-emerald-500' 
                  : 'bg-gradient-to-r from-red-500 to-pink-500'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {allPassed ? (
                      <CheckCircle2 className="w-8 h-8 text-white" />
                    ) : (
                      <XCircle className="w-8 h-8 text-white" />
                    )}
                    <div>
                      <h2 className="text-2xl font-bold text-white">
                        {allPassed ? 'Congratulations!' : 'Almost There!'}
                      </h2>
                      <p className="text-white/80">
                        {problemTitle}
                      </p>
                    </div>
                  </div>
                  
                  <button
                    onClick={onClose}
                    className="p-2 hover:bg-white/20 rounded-full transition-colors duration-200"
                  >
                    <X className="w-6 h-6 text-white" />
                  </button>
                </div>
                
                {allPassed && xpEarned > 0 && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.3, type: "spring" }}
                    className="mt-4 flex items-center space-x-2 bg-white/20 rounded-lg px-4 py-2 w-fit"
                  >
                    <Trophy className="w-5 h-5 text-yellow-300" />
                    <span className="text-white font-semibold">+{xpEarned} XP Earned!</span>
                    <Zap className="w-5 h-5 text-yellow-300" />
                  </motion.div>
                )}

                {/* LeetCode-style performance metrics */}
                {submitResult && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.4, type: "spring" }}
                    className="mt-4 flex items-center space-x-4 text-white/90 text-sm"
                  >
                    <div className="flex items-center space-x-1">
                      <Clock className="w-4 h-4" />
                      <span>Runtime: {submitResult.executionTime}ms</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Zap className="w-4 h-4" />
                      <span>Memory: {submitResult.memoryUsed}MB</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{submitResult.totalPassed}/{submitResult.totalTests} passed</span>
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Results */}
              <div className="p-6 max-h-96 overflow-y-auto">
                <div className="space-y-4">
                  {results.map((result, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={`p-4 rounded-lg border-2 ${
                        result.passed
                          ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700/30'
                          : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700/30'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          {result.passed ? (
                            <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
                          ) : (
                            <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                          )}
                          <span className="font-semibold text-gray-900 dark:text-white">
                            Test Case {index + 1}
                          </span>
                        </div>
                        
                        <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                          <div className="flex items-center space-x-1">
                            <Clock className="w-4 h-4" />
                            <span>{result.executionTime.toFixed(1)}ms</span>
                          </div>
                          {result.memory && (
                            <div className="flex items-center space-x-1">
                              <Zap className="w-4 h-4" />
                              <span>{result.memory}MB</span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="font-medium text-gray-700 dark:text-gray-300">Input:</span>
                          <code className="ml-2 px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs">
                            {result.input}
                          </code>
                        </div>
                        
                        <div>
                          <span className="font-medium text-gray-700 dark:text-gray-300">Expected:</span>
                          <code className="ml-2 px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs">
                            {result.expected}
                          </code>
                        </div>
                        
                        <div>
                          <span className="font-medium text-gray-700 dark:text-gray-300">Your Output:</span>
                          <code className={`ml-2 px-2 py-1 rounded text-xs ${
                            result.passed
                              ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                              : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
                          }`}>
                            {result.actual}
                          </code>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Footer */}
              <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-slate-700/50">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {results.filter(r => r.passed).length} / {results.length} test cases passed
                  </div>
                  
                  <button
                    onClick={onClose}
                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors duration-200"
                  >
                    Continue
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ResultModal;