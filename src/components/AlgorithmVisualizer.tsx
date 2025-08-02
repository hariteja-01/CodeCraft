import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, RotateCcw, Settings, ChevronLeft, ChevronRight, Sliders } from 'lucide-react';

interface AlgorithmVisualizerProps {
  algorithm: string;
  initialData?: any;
}

interface VisualizationState {
  isPlaying: boolean;
  currentStep: number;
  totalSteps: number;
  speed: number;
  data: any;
  history: any[];
  currentIndex: number;
}

const AlgorithmVisualizer: React.FC<AlgorithmVisualizerProps> = ({ algorithm, initialData }) => {
  const [state, setState] = useState<VisualizationState>({
    isPlaying: false,
    currentStep: 0,
    totalSteps: 0,
    speed: 1000,
    data: initialData || getDefaultData(algorithm),
    history: [],
    currentIndex: 0
  });

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  function getDefaultData(alg: string) {
    switch (alg) {
      case 'two-sum':
        return { array: [2, 7, 11, 15], target: 9, currentIndex: 0, found: [] };
      case 'binary-search':
        return { array: [-1, 0, 3, 5, 9, 12], target: 9, left: 0, right: 5, mid: 0 };
      case 'n-queens':
        return { n: 4, board: Array(4).fill(null).map(() => Array(4).fill(0)), currentRow: 0 };
      case 'merge-intervals':
        return { intervals: [[1, 3], [2, 6], [8, 10], [15, 18]], merged: [], currentIndex: 0 };
      case 'maximum-subarray':
        return { array: [-2, 1, -3, 4, -1, 2, 1, -5, 4], currentSum: 0, maxSum: 0, start: 0, end: 0 };
      case 'sudoku':
        return { 
          grid: [
            [5,3,0,0,7,0,0,0,0],
            [6,0,0,1,9,5,0,0,0],
            [0,9,8,0,0,0,0,6,0],
            [8,0,0,0,6,0,0,0,3],
            [4,0,0,8,0,3,0,0,1],
            [7,0,0,0,2,0,0,0,6],
            [0,6,0,0,0,0,2,8,0],
            [0,0,0,4,1,9,0,0,5],
            [0,0,0,0,8,0,0,7,9]
          ],
          currentCell: [0, 0]
        };
      case 'dijkstra':
        return { 
          graph: {
            nodes: ['A', 'B', 'C', 'D', 'E'],
            edges: [
              { from: 'A', to: 'B', weight: 4 },
              { from: 'A', to: 'C', weight: 2 },
              { from: 'B', to: 'C', weight: 1 },
              { from: 'B', to: 'D', weight: 5 },
              { from: 'C', to: 'D', weight: 8 },
              { from: 'C', to: 'E', weight: 10 },
              { from: 'D', to: 'E', weight: 2 }
            ]
          },
          distances: {},
          visited: [],
          current: 'A'
        };
      case 'longest-increasing-subsequence':
        return { array: [10, 22, 9, 33, 21, 50, 41, 60], lis: [], currentIndex: 0 };
      case 'sliding-window-maximum':
        return { array: [1, 3, -1, -3, 5, 3, 6, 7], windowSize: 3, currentWindow: [], maxValues: [] };
      default:
        return {};
    }
  }

  const algorithms = {
    'two-sum': {
      name: 'Two Sum',
      description: 'Find two numbers that add up to target',
      execute: executeTwoSum,
      render: renderTwoSum
    },
    'binary-search': {
      name: 'Binary Search',
      description: 'Search in sorted array',
      execute: executeBinarySearch,
      render: renderBinarySearch
    },
    'n-queens': {
      name: 'N-Queens',
      description: 'Place queens on chessboard',
      execute: executeNQueens,
      render: renderNQueens
    },
    'merge-intervals': {
      name: 'Merge Intervals',
      description: 'Merge overlapping intervals',
      execute: executeMergeIntervals,
      render: renderMergeIntervals
    },
    'maximum-subarray': {
      name: 'Maximum Subarray',
      description: 'Find subarray with max sum',
      execute: executeMaximumSubarray,
      render: renderMaximumSubarray
    },
    'sudoku': {
      name: 'Sudoku Solver',
      description: 'Solve Sudoku puzzle',
      execute: executeSudoku,
      render: renderSudoku
    },
    'dijkstra': {
      name: 'Dijkstra',
      description: 'Find shortest path',
      execute: executeDijkstra,
      render: renderDijkstra
    },
    'longest-increasing-subsequence': {
      name: 'Longest Increasing Subsequence',
      description: 'Find longest increasing subsequence',
      execute: executeLIS,
      render: renderLIS
    },
    'sliding-window-maximum': {
      name: 'Sliding Window Maximum',
      description: 'Find max in sliding window',
      execute: executeSlidingWindow,
      render: renderSlidingWindow
    }
  };

  const currentAlgorithm = algorithms[algorithm as keyof typeof algorithms];

  useEffect(() => {
    if (state.isPlaying) {
      intervalRef.current = setInterval(() => {
        setState(prev => {
          if (prev.currentStep >= prev.totalSteps) {
            return { ...prev, isPlaying: false };
          }
          return { ...prev, currentStep: prev.currentStep + 1 };
        });
      }, state.speed);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [state.isPlaying, state.speed, state.totalSteps]);

  // Generate execution steps when data changes
  useEffect(() => {
    if (currentAlgorithm && state.data) {
      const steps = currentAlgorithm.execute(state.data);
      setState(prev => ({
        ...prev,
        totalSteps: steps.length,
        history: steps
      }));
    }
  }, [state.data, currentAlgorithm]);

  const handlePlayPause = () => {
    setState(prev => ({ ...prev, isPlaying: !prev.isPlaying }));
  };

  const handleReset = () => {
    setState(prev => ({
      ...prev,
      isPlaying: false,
      currentStep: 0,
      data: getDefaultData(algorithm),
      history: []
    }));
  };

  const handleSpeedChange = (newSpeed: number) => {
    setState(prev => ({ ...prev, speed: newSpeed }));
  };

  const handleDataChange = (newData: any) => {
    setState(prev => ({
      ...prev,
      data: newData,
      currentStep: 0,
      history: []
    }));
  };

  const handleStepForward = () => {
    setState(prev => ({
      ...prev,
      currentStep: Math.min(prev.currentStep + 1, prev.totalSteps)
    }));
  };

  const handleStepBackward = () => {
    setState(prev => ({
      ...prev,
      currentStep: Math.max(prev.currentStep - 1, 0)
    }));
  };

  return (
    <div className="bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 rounded-xl p-6 border border-blue-500/20">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
          <h3 className="text-lg font-bold text-white">{currentAlgorithm?.name}</h3>
          <span className="text-sm text-blue-300">{currentAlgorithm?.description}</span>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={handleStepBackward}
            disabled={state.currentStep === 0}
            className="p-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg disabled:opacity-50 transition-colors duration-200"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          
          <button
            onClick={handlePlayPause}
            className="flex items-center space-x-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200"
          >
            {state.isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            <span className="text-sm font-medium">{state.isPlaying ? 'Pause' : 'Play'}</span>
          </button>
          
          <button
            onClick={handleStepForward}
            disabled={state.currentStep >= state.totalSteps}
            className="p-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg disabled:opacity-50 transition-colors duration-200"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          
          <button
            onClick={handleReset}
            className="flex items-center space-x-2 px-3 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors duration-200"
          >
            <RotateCcw className="w-4 h-4" />
            <span className="text-sm font-medium">Reset</span>
          </button>
        </div>
      </div>

      {/* Controls */}
      <div className="mb-6 p-4 bg-black/40 rounded-lg">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-white font-semibold flex items-center">
            <Settings className="w-4 h-4 mr-2" />
            Controls
          </h4>
          <div className="text-sm text-gray-300">
            Step {state.currentStep} / {state.totalSteps}
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Speed Control */}
          <div>
            <label className="text-sm text-gray-300 mb-2 block">Speed</label>
            <input
              type="range"
              min="100"
              max="3000"
              step="100"
              value={state.speed}
              onChange={(e) => handleSpeedChange(Number(e.target.value))}
              className="w-full"
            />
            <div className="text-xs text-gray-400 mt-1">{state.speed}ms</div>
          </div>
          
          {/* Algorithm-specific controls */}
          {renderControls(algorithm, state.data, handleDataChange)}
        </div>
      </div>

      {/* Visualization */}
      <div className="bg-black/40 rounded-lg p-4 min-h-96">
        {currentAlgorithm?.render(state.data, state.currentStep, state.history[state.currentStep])}
      </div>

      {/* Progress Bar */}
      <div className="mt-4">
        <div className="flex justify-between text-sm text-gray-300 mb-2">
          <span>Progress</span>
          <span>{Math.round((state.currentStep / state.totalSteps) * 100)}%</span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2">
          <motion.div
            className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${(state.currentStep / state.totalSteps) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>
    </div>
  );
};

// Algorithm execution functions
function executeTwoSum(data: any): any[] {
  const { array, target } = data;
  const steps = [];
  const numMap = new Map();
  
  for (let i = 0; i < array.length; i++) {
    steps.push({
      type: 'check',
      index: i,
      value: array[i],
      complement: target - array[i],
      found: numMap.has(target - array[i])
    });
    
    if (numMap.has(target - array[i])) {
      steps.push({
        type: 'found',
        indices: [numMap.get(target - array[i]), i],
        values: [array[numMap.get(target - array[i])], array[i]]
      });
      break;
    }
    
    numMap.set(array[i], i);
  }
  
  return steps;
}

function executeBinarySearch(data: any): any[] {
  const { array, target } = data;
  const steps = [];
  let left = 0;
  let right = array.length - 1;
  
  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    steps.push({
      type: 'check',
      left,
      right,
      mid,
      value: array[mid],
      found: array[mid] === target
    });
    
    if (array[mid] === target) {
      steps.push({
        type: 'found',
        index: mid,
        value: array[mid]
      });
      break;
    } else if (array[mid] < target) {
      left = mid + 1;
    } else {
      right = mid - 1;
    }
  }
  
  return steps;
}

// Rendering functions
function renderTwoSum(data: any, step: number, stepData?: any) {
  const { array, target } = data;
  
  return (
    <div className="space-y-4">
      <div className="text-center">
        <h4 className="text-white font-semibold mb-2">Target: {target}</h4>
        <div className="flex justify-center space-x-2">
          {array.map((value: number, index: number) => (
            <motion.div
              key={index}
              className={`w-12 h-12 rounded-lg border-2 flex items-center justify-center font-bold text-white ${
                stepData?.type === 'check' && stepData.index === index ? 'bg-green-500 border-green-400' :
                stepData?.type === 'found' && (stepData.indices?.includes(index) || stepData.values?.includes(value)) ? 'bg-purple-500 border-purple-400' :
                step > index ? 'bg-blue-500 border-blue-400' :
                'bg-gray-600 border-gray-500'
              }`}
              whileHover={{ scale: 1.1 }}
            >
              {value}
            </motion.div>
          ))}
        </div>
      </div>
      
      <div className="text-center text-sm text-gray-300">
        {stepData?.type === 'check' && (
          <div>
            Checking index {stepData.index}: {stepData.value} + {stepData.complement} = {target}
            {stepData.found && ' ✓ Found!'}
          </div>
        )}
        {stepData?.type === 'found' && (
          <div className="text-green-400 font-semibold">
            Solution found! Indices: [{stepData.indices.join(', ')}]
          </div>
        )}
        {!stepData && step === 0 && (
          <div>Starting Two Sum algorithm...</div>
        )}
        {!stepData && step > 0 && step >= array.length && (
          <div>Search complete</div>
        )}
      </div>
    </div>
  );
}

function renderBinarySearch(data: any, step: number, stepData?: any) {
  const { array, target } = data;
  
  return (
    <div className="space-y-4">
      <div className="text-center">
        <h4 className="text-white font-semibold mb-2">Target: {target}</h4>
        <div className="flex justify-center space-x-1">
          {array.map((value: number, index: number) => (
            <motion.div
              key={index}
              className={`w-10 h-10 rounded border flex items-center justify-center text-xs font-bold text-white ${
                stepData?.type === 'check' && stepData.mid === index ? 'bg-green-500 border-green-400' :
                stepData?.type === 'check' && index >= stepData.left && index <= stepData.right ? 'bg-blue-500 border-blue-400' :
                stepData?.type === 'found' && stepData.index === index ? 'bg-purple-500 border-purple-400' :
                'bg-gray-600 border-gray-500'
              }`}
              whileHover={{ scale: 1.05 }}
            >
              {value}
            </motion.div>
          ))}
        </div>
      </div>
      
      <div className="text-center text-sm text-gray-300">
        {stepData?.type === 'check' && (
          <div>
            Checking mid: {stepData.mid} (value: {stepData.value})
            <br />
            Left: {stepData.left}, Right: {stepData.right}
            {stepData.found && ' ✓ Found!'}
          </div>
        )}
        {stepData?.type === 'found' && (
          <div className="text-green-400 font-semibold">
            Target found at index {stepData.index}!
          </div>
        )}
        {!stepData && step === 0 && (
          <div>Starting Binary Search...</div>
        )}
      </div>
    </div>
  );
}

function renderControls(algorithm: string, data: any, onChange: (data: any) => void) {
  switch (algorithm) {
    case 'two-sum':
      return (
        <>
          <div>
            <label className="text-sm text-gray-300 mb-2 block">Array</label>
            <input
              type="text"
              value={data.array.join(',')}
              onChange={(e) => onChange({
                ...data,
                array: e.target.value.split(',').map(Number).filter(n => !isNaN(n))
              })}
              className="w-full px-3 py-2 bg-gray-700 text-white rounded border border-gray-600"
              placeholder="2,7,11,15"
            />
          </div>
          <div>
            <label className="text-sm text-gray-300 mb-2 block">Target</label>
            <input
              type="number"
              value={data.target}
              onChange={(e) => onChange({ ...data, target: Number(e.target.value) })}
              className="w-full px-3 py-2 bg-gray-700 text-white rounded border border-gray-600"
            />
          </div>
        </>
      );
    case 'binary-search':
      return (
        <>
          <div>
            <label className="text-sm text-gray-300 mb-2 block">Array</label>
            <input
              type="text"
              value={data.array.join(',')}
              onChange={(e) => onChange({
                ...data,
                array: e.target.value.split(',').map(Number).filter(n => !isNaN(n)).sort((a, b) => a - b)
              })}
              className="w-full px-3 py-2 bg-gray-700 text-white rounded border border-gray-600"
              placeholder="-1,0,3,5,9,12"
            />
          </div>
          <div>
            <label className="text-sm text-gray-300 mb-2 block">Target</label>
            <input
              type="number"
              value={data.target}
              onChange={(e) => onChange({ ...data, target: Number(e.target.value) })}
              className="w-full px-3 py-2 bg-gray-700 text-white rounded border border-gray-600"
            />
          </div>
        </>
      );
    case 'n-queens':
      return (
        <div>
          <label className="text-sm text-gray-300 mb-2 block">Board Size (N)</label>
          <input
            type="range"
            min="4"
            max="8"
            value={data.n}
            onChange={(e) => onChange({
              ...data,
              n: Number(e.target.value),
              board: Array(Number(e.target.value)).fill(null).map(() => Array(Number(e.target.value)).fill(0))
            })}
            className="w-full"
          />
          <div className="text-xs text-gray-400 mt-1">{data.n}x{data.n} board</div>
        </div>
      );
    case 'merge-intervals':
      return (
        <div>
          <label className="text-sm text-gray-300 mb-2 block">Intervals</label>
          <input
            type="text"
            value={data.intervals.map((i: number[]) => `[${i[0]},${i[1]}]`).join(',')}
            onChange={(e) => {
              const intervals = e.target.value.match(/\[(\d+),(\d+)\]/g)?.map(s => {
                const match = s.match(/\[(\d+),(\d+)\]/);
                return [Number(match![1]), Number(match![2])];
              }) || [];
              onChange({ ...data, intervals });
            }}
            className="w-full px-3 py-2 bg-gray-700 text-white rounded border border-gray-600"
            placeholder="[1,3],[2,6],[8,10],[15,18]"
          />
        </div>
      );
    case 'maximum-subarray':
      return (
        <div>
          <label className="text-sm text-gray-300 mb-2 block">Array</label>
          <input
            type="text"
            value={data.array.join(',')}
            onChange={(e) => onChange({
              ...data,
              array: e.target.value.split(',').map(Number).filter(n => !isNaN(n))
            })}
            className="w-full px-3 py-2 bg-gray-700 text-white rounded border border-gray-600"
            placeholder="-2,1,-3,4,-1,2,1,-5,4"
          />
        </div>
      );
    case 'sliding-window-maximum':
      return (
        <>
          <div>
            <label className="text-sm text-gray-300 mb-2 block">Array</label>
            <input
              type="text"
              value={data.array.join(',')}
              onChange={(e) => onChange({
                ...data,
                array: e.target.value.split(',').map(Number).filter(n => !isNaN(n))
              })}
              className="w-full px-3 py-2 bg-gray-700 text-white rounded border border-gray-600"
              placeholder="1,3,-1,-3,5,3,6,7"
            />
          </div>
          <div>
            <label className="text-sm text-gray-300 mb-2 block">Window Size</label>
            <input
              type="range"
              min="1"
              max={data.array.length}
              value={data.windowSize}
              onChange={(e) => onChange({ ...data, windowSize: Number(e.target.value) })}
              className="w-full"
            />
            <div className="text-xs text-gray-400 mt-1">Size: {data.windowSize}</div>
          </div>
        </>
      );
    case 'longest-increasing-subsequence':
      return (
        <div>
          <label className="text-sm text-gray-300 mb-2 block">Array</label>
          <input
            type="text"
            value={data.array.join(',')}
            onChange={(e) => onChange({
              ...data,
              array: e.target.value.split(',').map(Number).filter(n => !isNaN(n))
            })}
            className="w-full px-3 py-2 bg-gray-700 text-white rounded border border-gray-600"
            placeholder="10,22,9,33,21,50,41,60"
          />
        </div>
      );
    default:
      return null;
  }
}

// Placeholder functions for other algorithms
function executeNQueens(data: any): any[] {
  const { n, board } = data;
  const steps = [];
  
  function isSafe(board: number[][], row: number, col: number): boolean {
    // Check row
    for (let x = 0; x < col; x++) {
      if (board[row][x] === 1) return false;
    }
    
    // Check upper diagonal
    for (let i = row, j = col; i >= 0 && j >= 0; i--, j--) {
      if (board[i][j] === 1) return false;
    }
    
    // Check lower diagonal
    for (let i = row, j = col; i < n && j >= 0; i++, j--) {
      if (board[i][j] === 1) return false;
    }
    
    return true;
  }
  
  function solveNQueens(board: number[][], col: number): boolean {
    if (col >= n) return true;
    
    for (let row = 0; row < n; row++) {
      steps.push({
        type: 'try',
        row,
        col,
        safe: isSafe(board, row, col)
      });
      
      if (isSafe(board, row, col)) {
        board[row][col] = 1;
        steps.push({
          type: 'place',
          row,
          col
        });
        
        if (solveNQueens(board, col + 1)) {
          return true;
        }
        
        board[row][col] = 0;
        steps.push({
          type: 'backtrack',
          row,
          col
        });
      }
    }
    
    return false;
  }
  
  solveNQueens(board, 0);
  return steps;
}
function executeMergeIntervals(data: any): any[] {
  const { intervals } = data;
  const steps = [];
  
  if (intervals.length === 0) return steps;
  
  // Sort intervals by start time
  const sorted = [...intervals].sort((a, b) => a[0] - b[0]);
  const merged = [sorted[0]];
  
  steps.push({
    type: 'start',
    interval: sorted[0]
  });
  
  for (let i = 1; i < sorted.length; i++) {
    const current = sorted[i];
    const last = merged[merged.length - 1];
    
    steps.push({
      type: 'check',
      current,
      last,
      overlap: current[0] <= last[1]
    });
    
    if (current[0] <= last[1]) {
      // Merge intervals
      last[1] = Math.max(last[1], current[1]);
      steps.push({
        type: 'merge',
        result: last
      });
    } else {
      // Add new interval
      merged.push(current);
      steps.push({
        type: 'add',
        interval: current
      });
    }
  }
  
  steps.push({
    type: 'complete',
    result: merged
  });
  
  return steps;
}
function executeMaximumSubarray(data: any): any[] {
  const { array } = data;
  const steps = [];
  
  let currentSum = 0;
  let maxSum = array[0];
  let start = 0;
  let end = 0;
  let tempStart = 0;
  
  steps.push({
    type: 'init',
    currentSum: 0,
    maxSum: array[0]
  });
  
  for (let i = 0; i < array.length; i++) {
    currentSum += array[i];
    
    steps.push({
      type: 'add',
      index: i,
      value: array[i],
      currentSum,
      maxSum
    });
    
    if (currentSum > maxSum) {
      maxSum = currentSum;
      start = tempStart;
      end = i;
      
      steps.push({
        type: 'update_max',
        maxSum,
        start,
        end
      });
    }
    
    if (currentSum < 0) {
      currentSum = 0;
      tempStart = i + 1;
      
      steps.push({
        type: 'reset',
        currentSum: 0,
        tempStart: i + 1
      });
    }
  }
  
  steps.push({
    type: 'complete',
    maxSum,
    start,
    end,
    subarray: array.slice(start, end + 1)
  });
  
  return steps;
}
function executeSudoku(data: any): any[] {
  const { grid } = data;
  const steps = [];
  
  function isValid(grid: number[][], row: number, col: number, num: number): boolean {
    // Check row
    for (let x = 0; x < 9; x++) {
      if (grid[row][x] === num) return false;
    }
    
    // Check column
    for (let x = 0; x < 9; x++) {
      if (grid[x][col] === num) return false;
    }
    
    // Check 3x3 box
    const startRow = Math.floor(row / 3) * 3;
    const startCol = Math.floor(col / 3) * 3;
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        if (grid[i + startRow][j + startCol] === num) return false;
      }
    }
    
    return true;
  }
  
  function solveSudoku(grid: number[][]): boolean {
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        if (grid[row][col] === 0) {
          for (let num = 1; num <= 9; num++) {
            steps.push({
              type: 'try',
              row,
              col,
              num,
              valid: isValid(grid, row, col, num)
            });
            
            if (isValid(grid, row, col, num)) {
              grid[row][col] = num;
              steps.push({
                type: 'place',
                row,
                col,
                num
              });
              
              if (solveSudoku(grid)) {
                return true;
              }
              
              grid[row][col] = 0;
              steps.push({
                type: 'backtrack',
                row,
                col
              });
            }
          }
          return false;
        }
      }
    }
    return true;
  }
  
  solveSudoku(grid);
  return steps;
}
function executeDijkstra(data: any): any[] {
  const { graph } = data;
  const steps = [];
  
  const distances = {};
  const visited = new Set();
  const previous = {};
  
  // Initialize distances
  graph.nodes.forEach(node => {
    distances[node] = Infinity;
    previous[node] = null;
  });
  
  distances['A'] = 0; // Start node
  
  steps.push({
    type: 'init',
    startNode: 'A',
    distances: { ...distances }
  });
  
  while (visited.size < graph.nodes.length) {
    // Find unvisited node with minimum distance
    let minNode = null;
    let minDistance = Infinity;
    
    for (const node of graph.nodes) {
      if (!visited.has(node) && distances[node] < minDistance) {
        minDistance = distances[node];
        minNode = node;
      }
    }
    
    if (minNode === null) break;
    
    visited.add(minNode);
    steps.push({
      type: 'visit',
      node: minNode,
      distance: distances[minNode]
    });
    
    // Update distances to neighbors
    for (const edge of graph.edges) {
      if (edge.from === minNode && !visited.has(edge.to)) {
        const newDistance = distances[minNode] + edge.weight;
        
        if (newDistance < distances[edge.to]) {
          distances[edge.to] = newDistance;
          previous[edge.to] = minNode;
          
          steps.push({
            type: 'update',
            from: minNode,
            to: edge.to,
            weight: edge.weight,
            newDistance
          });
        }
      }
    }
  }
  
  // Reconstruct shortest path
  const path = [];
  let current = 'E'; // End node
  while (current !== null) {
    path.unshift(current);
    current = previous[current];
  }
  
  steps.push({
    type: 'complete',
    distances,
    path
  });
  
  return steps;
}
function executeLIS(data: any): any[] {
  const { array } = data;
  const steps = [];
  
  if (array.length === 0) return steps;
  
  const dp = new Array(array.length).fill(1);
  const prev = new Array(array.length).fill(-1);
  
  steps.push({
    type: 'init',
    dp: [...dp]
  });
  
  for (let i = 1; i < array.length; i++) {
    steps.push({
      type: 'check',
      index: i,
      value: array[i]
    });
    
    for (let j = 0; j < i; j++) {
      if (array[i] > array[j] && dp[j] + 1 > dp[i]) {
        dp[i] = dp[j] + 1;
        prev[i] = j;
        
        steps.push({
          type: 'update',
          index: i,
          value: array[i],
          prevIndex: j,
          prevValue: array[j],
          newLength: dp[i]
        });
      }
    }
  }
  
  // Find the maximum length
  let maxIndex = 0;
  for (let i = 1; i < array.length; i++) {
    if (dp[i] > dp[maxIndex]) {
      maxIndex = i;
    }
  }
  
  // Reconstruct the sequence
  const sequence = [];
  let current = maxIndex;
  while (current !== -1) {
    sequence.unshift(array[current]);
    current = prev[current];
  }
  
  steps.push({
    type: 'complete',
    maxLength: dp[maxIndex],
    sequence
  });
  
  return steps;
}
function executeSlidingWindow(data: any): any[] {
  const { array, windowSize } = data;
  const steps = [];
  const result = [];
  const deque = [];
  
  steps.push({
    type: 'init',
    windowSize
  });
  
  for (let i = 0; i < array.length; i++) {
    // Remove elements outside the window
    while (deque.length > 0 && deque[0] <= i - windowSize) {
      deque.shift();
      steps.push({
        type: 'remove_outside',
        index: i - windowSize
      });
    }
    
    // Remove smaller elements from the back
    while (deque.length > 0 && array[deque[deque.length - 1]] <= array[i]) {
      deque.pop();
      steps.push({
        type: 'remove_smaller',
        index: deque[deque.length - 1]
      });
    }
    
    // Add current element
    deque.push(i);
    steps.push({
      type: 'add',
      index: i,
      value: array[i]
    });
    
    // Add maximum to result if window is full
    if (i >= windowSize - 1) {
      result.push(array[deque[0]]);
      steps.push({
        type: 'result',
        window: array.slice(i - windowSize + 1, i + 1),
        max: array[deque[0]]
      });
    }
  }
  
  steps.push({
    type: 'complete',
    result
  });
  
  return steps;
}

function renderNQueens(data: any, step: number, stepData?: any) {
  const { n, board } = data;
  
  return (
    <div className="space-y-4">
      <div className="text-center">
        <h4 className="text-white font-semibold mb-4">N-Queens ({n}x{n})</h4>
        <div className="inline-grid gap-1" style={{ gridTemplateColumns: `repeat(${n}, 1fr)` }}>
          {board.map((row: number[], rowIndex: number) =>
            row.map((cell: number, colIndex: number) => (
              <motion.div
                key={`${rowIndex}-${colIndex}`}
                className={`w-12 h-12 border-2 flex items-center justify-center text-white font-bold ${
                  (rowIndex + colIndex) % 2 === 0 
                    ? 'bg-gray-700 border-gray-600' 
                    : 'bg-gray-800 border-gray-600'
                } ${
                  cell === 1 ? 'bg-purple-600 border-purple-400' : ''
                } ${
                  stepData?.type === 'try' && stepData.row === rowIndex && stepData.col === colIndex ? 'bg-yellow-500 border-yellow-400' : ''
                } ${
                  stepData?.type === 'place' && stepData.row === rowIndex && stepData.col === colIndex ? 'bg-green-500 border-green-400' : ''
                } ${
                  stepData?.type === 'backtrack' && stepData.row === rowIndex && stepData.col === colIndex ? 'bg-red-500 border-red-400' : ''
                }`}
                whileHover={{ scale: 1.1 }}
              >
                {cell === 1 ? '👑' : ''}
              </motion.div>
            ))
          )}
        </div>
      </div>
      
      <div className="text-center text-sm text-gray-300">
        {stepData?.type === 'try' && (
          <div>
            Trying position ({stepData.row}, {stepData.col}) - {stepData.safe ? 'Safe' : 'Not Safe'}
          </div>
        )}
        {stepData?.type === 'place' && (
          <div className="text-green-400">
            Placed queen at ({stepData.row}, {stepData.col})
          </div>
        )}
        {stepData?.type === 'backtrack' && (
          <div className="text-red-400">
            Backtracking from ({stepData.row}, {stepData.col})
          </div>
        )}
        {!stepData && step === 0 && (
          <div>Starting N-Queens backtracking...</div>
        )}
      </div>
    </div>
  );
}

function renderMergeIntervals(data: any, step: number, stepData?: any) {
  const { intervals } = data;
  
  return (
    <div className="space-y-4">
      <div className="text-center">
        <h4 className="text-white font-semibold mb-4">Merge Intervals</h4>
        <div className="space-y-2">
          {intervals.map((interval: number[], index: number) => (
            <motion.div
              key={index}
              className={`flex items-center justify-center space-x-2 p-2 rounded ${
                stepData?.type === 'check' && (stepData.current === interval || stepData.last === interval) ? 'bg-blue-600' :
                stepData?.type === 'merge' && stepData.result === interval ? 'bg-green-600' :
                stepData?.type === 'add' && stepData.interval === interval ? 'bg-purple-600' :
                'bg-gray-700'
              }`}
              whileHover={{ scale: 1.02 }}
            >
              <span className="text-white font-mono">
                [{interval[0]}, {interval[1]}]
              </span>
            </motion.div>
          ))}
        </div>
      </div>
      
      <div className="text-center text-sm text-gray-300">
        {stepData?.type === 'check' && (
          <div>
            Checking overlap: [{stepData.current[0]}, {stepData.current[1]}] with [{stepData.last[0]}, {stepData.last[1]}]
            {stepData.overlap ? ' ✓ Overlapping' : ' ✗ No overlap'}
          </div>
        )}
        {stepData?.type === 'merge' && (
          <div className="text-green-400">
            Merged to: [{stepData.result[0]}, {stepData.result[1]}]
          </div>
        )}
        {stepData?.type === 'add' && (
          <div className="text-purple-400">
            Added new interval: [{stepData.interval[0]}, {stepData.interval[1]}]
          </div>
        )}
        {!stepData && step === 0 && (
          <div>Starting interval merging...</div>
        )}
      </div>
    </div>
  );
}

function renderMaximumSubarray(data: any, step: number, stepData?: any) {
  const { array } = data;
  
  return (
    <div className="space-y-4">
      <div className="text-center">
        <h4 className="text-white font-semibold mb-4">Maximum Subarray (Kadane's Algorithm)</h4>
        <div className="flex justify-center space-x-2">
          {array.map((value: number, index: number) => (
            <motion.div
              key={index}
              className={`w-12 h-12 rounded-lg border-2 flex items-center justify-center font-bold text-white ${
                stepData?.type === 'add' && stepData.index === index ? 'bg-green-500 border-green-400' :
                stepData?.type === 'update_max' && index >= stepData.start && index <= stepData.end ? 'bg-purple-500 border-purple-400' :
                stepData?.type === 'reset' && index >= stepData.tempStart ? 'bg-red-500 border-red-400' :
                step > index ? 'bg-blue-500 border-blue-400' :
                'bg-gray-600 border-gray-500'
              }`}
              whileHover={{ scale: 1.1 }}
            >
              {value}
            </motion.div>
          ))}
        </div>
      </div>
      
      <div className="text-center text-sm text-gray-300">
        {stepData?.type === 'add' && (
          <div>
            Adding {stepData.value} to current sum: {stepData.currentSum}
          </div>
        )}
        {stepData?.type === 'update_max' && (
          <div className="text-green-400">
            New max sum: {stepData.maxSum} (indices {stepData.start}-{stepData.end})
          </div>
        )}
        {stepData?.type === 'reset' && (
          <div className="text-red-400">
            Resetting current sum to 0
          </div>
        )}
        {!stepData && step === 0 && (
          <div>Starting Kadane's algorithm...</div>
        )}
      </div>
    </div>
  );
}

function renderSudoku(data: any, step: number, stepData?: any) {
  const { grid } = data;
  
  return (
    <div className="space-y-4">
      <div className="text-center">
        <h4 className="text-white font-semibold mb-4">Sudoku Solver</h4>
        <div className="inline-grid gap-1 border-2 border-gray-600" style={{ gridTemplateColumns: 'repeat(9, 1fr)' }}>
          {grid.map((row: number[], rowIndex: number) =>
            row.map((cell: number, colIndex: number) => (
              <motion.div
                key={`${rowIndex}-${colIndex}`}
                className={`w-8 h-8 border border-gray-500 flex items-center justify-center text-xs font-bold text-white ${
                  cell === 0 ? 'bg-gray-800' : 'bg-blue-600'
                } ${
                  (Math.floor(rowIndex / 3) + Math.floor(colIndex / 3)) % 2 === 0 
                    ? 'bg-opacity-20' : 'bg-opacity-10'
                } ${
                  stepData?.type === 'try' && stepData.row === rowIndex && stepData.col === colIndex ? 'bg-yellow-500' : ''
                } ${
                  stepData?.type === 'place' && stepData.row === rowIndex && stepData.col === colIndex ? 'bg-green-500' : ''
                } ${
                  stepData?.type === 'backtrack' && stepData.row === rowIndex && stepData.col === colIndex ? 'bg-red-500' : ''
                }`}
                whileHover={{ scale: 1.2 }}
              >
                {cell === 0 ? '' : cell}
              </motion.div>
            ))
          )}
        </div>
      </div>
      
      <div className="text-center text-sm text-gray-300">
        {stepData?.type === 'try' && (
          <div>
            Trying {stepData.num} at ({stepData.row}, {stepData.col}) - {stepData.valid ? 'Valid' : 'Invalid'}
          </div>
        )}
        {stepData?.type === 'place' && (
          <div className="text-green-400">
            Placed {stepData.num} at ({stepData.row}, {stepData.col})
          </div>
        )}
        {stepData?.type === 'backtrack' && (
          <div className="text-red-400">
            Backtracking from ({stepData.row}, {stepData.col})
          </div>
        )}
        {!stepData && step === 0 && (
          <div>Starting Sudoku solver...</div>
        )}
      </div>
    </div>
  );
}

function renderDijkstra(data: any, step: number, stepData?: any) {
  const { graph } = data;
  
  return (
    <div className="space-y-4">
      <div className="text-center">
        <h4 className="text-white font-semibold mb-4">Dijkstra's Shortest Path</h4>
        <div className="flex justify-center space-x-4">
          {graph.nodes.map((node: string) => (
            <motion.div
              key={node}
              className={`w-16 h-16 rounded-full border-2 flex items-center justify-center text-white font-bold ${
                stepData?.type === 'visit' && stepData.node === node ? 'bg-green-600 border-green-400' :
                stepData?.type === 'update' && (stepData.from === node || stepData.to === node) ? 'bg-yellow-600 border-yellow-400' :
                'bg-blue-600 border-blue-400'
              }`}
              whileHover={{ scale: 1.1 }}
            >
              {node}
            </motion.div>
          ))}
        </div>
        <div className="mt-4 text-sm text-gray-300">
          Finding shortest path from A to E
        </div>
      </div>
      
      <div className="text-center text-sm text-gray-300">
        {stepData?.type === 'visit' && (
          <div className="text-green-400">
            Visiting node {stepData.node} (distance: {stepData.distance})
          </div>
        )}
        {stepData?.type === 'update' && (
          <div className="text-yellow-400">
            Updating distance to {stepData.to}: {stepData.newDistance}
          </div>
        )}
        {!stepData && step === 0 && (
          <div>Starting Dijkstra's algorithm...</div>
        )}
      </div>
    </div>
  );
}

function renderLIS(data: any, step: number, stepData?: any) {
  const { array } = data;
  
  return (
    <div className="space-y-4">
      <div className="text-center">
        <h4 className="text-white font-semibold mb-4">Longest Increasing Subsequence</h4>
        <div className="flex justify-center space-x-2">
          {array.map((value: number, index: number) => (
            <motion.div
              key={index}
              className={`w-12 h-12 rounded-lg border-2 flex items-center justify-center font-bold text-white ${
                stepData?.type === 'check' && stepData.index === index ? 'bg-green-500 border-green-400' :
                stepData?.type === 'update' && stepData.index === index ? 'bg-purple-500 border-purple-400' :
                stepData?.type === 'update' && stepData.prevIndex === index ? 'bg-yellow-500 border-yellow-400' :
                step > index ? 'bg-blue-500 border-blue-400' :
                'bg-gray-600 border-gray-500'
              }`}
              whileHover={{ scale: 1.1 }}
            >
              {value}
            </motion.div>
          ))}
        </div>
      </div>
      
      <div className="text-center text-sm text-gray-300">
        {stepData?.type === 'check' && (
          <div>
            Checking element {stepData.value} at index {stepData.index}
          </div>
        )}
        {stepData?.type === 'update' && (
          <div className="text-green-400">
            Updated LIS length at index {stepData.index}: {stepData.newLength}
          </div>
        )}
        {!stepData && step === 0 && (
          <div>Starting LIS algorithm...</div>
        )}
      </div>
    </div>
  );
}

function renderSlidingWindow(data: any, step: number) {
  const { array, windowSize } = data;
  
  return (
    <div className="space-y-4">
      <div className="text-center">
        <h4 className="text-white font-semibold mb-4">Sliding Window Maximum</h4>
        <div className="flex justify-center space-x-2">
          {array.map((value: number, index: number) => (
            <motion.div
              key={index}
              className={`w-12 h-12 rounded-lg border-2 flex items-center justify-center font-bold text-white ${
                step === index ? 'bg-green-500 border-green-400' :
                step > index ? 'bg-blue-500 border-blue-400' :
                'bg-gray-600 border-gray-500'
              }`}
              whileHover={{ scale: 1.1 }}
            >
              {value}
            </motion.div>
          ))}
        </div>
        <div className="mt-4 text-sm text-gray-300">
          Window Size: {windowSize}
        </div>
      </div>
      
      <div className="text-center text-sm text-gray-300">
        Finding maximum in sliding window...
      </div>
    </div>
  );
}

export default AlgorithmVisualizer; 