import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Play, Code, Brain, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import AlgorithmVisualizer from '../components/AlgorithmVisualizer';

const AlgorithmVisualizations: React.FC = () => {
  const [selectedAlgorithm, setSelectedAlgorithm] = useState<string | null>(null);

  const algorithms = [
    {
      id: 'two-sum',
      name: 'Two Sum',
      description: 'Find two numbers that add up to target',
      icon: '🔍',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      id: 'binary-search',
      name: 'Binary Search',
      description: 'Search in sorted array efficiently',
      icon: '⚡',
      color: 'from-green-500 to-emerald-500'
    },
    {
      id: 'n-queens',
      name: 'N-Queens',
      description: 'Place queens on chessboard using backtracking',
      icon: '👑',
      color: 'from-purple-500 to-pink-500'
    },
    {
      id: 'merge-intervals',
      name: 'Merge Intervals',
      description: 'Merge overlapping intervals',
      icon: '🔗',
      color: 'from-orange-500 to-red-500'
    },
    {
      id: 'maximum-subarray',
      name: 'Maximum Subarray',
      description: 'Find subarray with maximum sum (Kadane)',
      icon: '📈',
      color: 'from-yellow-500 to-orange-500'
    },
    {
      id: 'sudoku',
      name: 'Sudoku Solver',
      description: 'Solve Sudoku using backtracking',
      icon: '🧩',
      color: 'from-indigo-500 to-purple-500'
    },
    {
      id: 'dijkstra',
      name: 'Dijkstra',
      description: 'Find shortest path in weighted graph',
      icon: '🗺️',
      color: 'from-teal-500 to-cyan-500'
    },
    {
      id: 'longest-increasing-subsequence',
      name: 'Longest Increasing Subsequence',
      description: 'Find longest increasing subsequence',
      icon: '📊',
      color: 'from-pink-500 to-rose-500'
    },
    {
      id: 'sliding-window-maximum',
      name: 'Sliding Window Maximum',
      description: 'Find maximum in sliding window',
      icon: '🪟',
      color: 'from-violet-500 to-purple-500'
    }
  ];

  const selectedAlgo = algorithms.find(algo => algo.id === selectedAlgorithm);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900">
      {/* Header */}
      <div className="bg-black/20 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link
                to="/learn"
                className="flex items-center space-x-2 text-white hover:text-blue-300 transition-colors duration-200"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Back to Learn</span>
              </Link>
              <div className="h-6 w-px bg-white/20"></div>
              <div className="flex items-center space-x-3">
                <Brain className="w-8 h-8 text-blue-400" />
                <div>
                  <h1 className="text-2xl font-bold text-white">Algorithm Visualizations</h1>
                  <p className="text-blue-300 text-sm">Interactive learning with real-time animations</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-gray-300">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span>Live Visualizations</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {!selectedAlgorithm ? (
          // Algorithm Selection Grid
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-white mb-4">
                Choose an Algorithm to Visualize
              </h2>
              <p className="text-gray-300 max-w-2xl mx-auto">
                Explore 9 different algorithms with interactive visualizations. 
                Each algorithm includes real-time animations, step-by-step execution, 
                and dynamic controls to help you understand the concepts better.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {algorithms.map((algorithm, index) => (
                <motion.div
                  key={algorithm.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedAlgorithm(algorithm.id)}
                  className={`bg-gradient-to-br ${algorithm.color} p-6 rounded-xl cursor-pointer border border-white/10 hover:border-white/20 transition-all duration-300 group`}
                >
                  <div className="flex items-center space-x-4">
                    <div className="text-4xl">{algorithm.icon}</div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-white mb-2">
                        {algorithm.name}
                      </h3>
                      <p className="text-white/80 text-sm">
                        {algorithm.description}
                      </p>
                    </div>
                  </div>
                  
                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center space-x-2 text-white/70 text-sm">
                      <Play className="w-4 h-4" />
                      <span>Interactive</span>
                    </div>
                    <div className="flex items-center space-x-2 text-white/70 text-sm">
                      <Code className="w-4 h-4" />
                      <span>Step-by-step</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Features Section */}
            <div className="mt-16 bg-black/20 rounded-xl p-8 border border-white/10">
              <h3 className="text-2xl font-bold text-white mb-6 text-center">
                Interactive Learning Features
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Play className="w-8 h-8 text-white" />
                  </div>
                  <h4 className="text-lg font-semibold text-white mb-2">Real-time Animation</h4>
                  <p className="text-gray-300 text-sm">
                    Watch algorithms execute step-by-step with smooth animations
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Zap className="w-8 h-8 text-white" />
                  </div>
                  <h4 className="text-lg font-semibold text-white mb-2">Dynamic Controls</h4>
                  <p className="text-gray-300 text-sm">
                    Adjust speed, step through execution, and modify input data
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Brain className="w-8 h-8 text-white" />
                  </div>
                  <h4 className="text-lg font-semibold text-white mb-2">Visual Learning</h4>
                  <p className="text-gray-300 text-sm">
                    Understand complex algorithms through intuitive visualizations
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          // Algorithm Visualization
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setSelectedAlgorithm(null)}
                  className="flex items-center space-x-2 text-white hover:text-blue-300 transition-colors duration-200"
                >
                  <ArrowLeft className="w-5 h-5" />
                  <span>Back to Algorithms</span>
                </button>
                <div className="h-6 w-px bg-white/20"></div>
                <div className="flex items-center space-x-3">
                  <div className="text-3xl">{selectedAlgo?.icon}</div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">{selectedAlgo?.name}</h2>
                    <p className="text-blue-300 text-sm">{selectedAlgo?.description}</p>
                  </div>
                </div>
              </div>
            </div>

            <AlgorithmVisualizer 
              algorithm={selectedAlgorithm} 
              initialData={undefined}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default AlgorithmVisualizations; 