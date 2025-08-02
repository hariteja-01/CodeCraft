import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, RotateCcw, Zap, Brain, Code, Eye } from 'lucide-react';

interface LiveCodeVisualizerProps {
  code: string;
  problemId: string;
  isRunning: boolean;
}

interface ExecutionStep {
  type: 'variable' | 'loop' | 'condition' | 'operation' | 'array_access' | 'function_call';
  line: number;
  description: string;
  data?: any;
  duration: number;
}

interface VariableState {
  name: string;
  value: any;
  type: string;
  isActive: boolean;
}

interface ArrayState {
  values: number[];
  activeIndices: number[];
  accessedIndices: number[];
}

const LiveCodeVisualizer: React.FC<LiveCodeVisualizerProps> = ({ code, problemId, isRunning }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [executionSteps, setExecutionSteps] = useState<ExecutionStep[]>([]);
  const [variables, setVariables] = useState<VariableState[]>([]);
  const [arrayState, setArrayState] = useState<ArrayState>({ values: [], activeIndices: [], accessedIndices: [] });
  const [executionTime, setExecutionTime] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Generate execution steps based on code analysis
  const generateExecutionSteps = useMemo(() => {
    const steps: ExecutionStep[] = [];
    const lines = code.split('\n');
    let stepIndex = 0;

    lines.forEach((line, lineIndex) => {
      const trimmed = line.trim();
      if (trimmed.length === 0 || trimmed.startsWith('//')) return;

      // Variable declarations and assignments
      const varPatterns = [
        /(?:int|long|double|float|char|string|bool)\s+(\w+)\s*=\s*([^;]+)/,
        /(\w+)\s*=\s*([^;]+)/
      ];
      
      for (const pattern of varPatterns) {
        const varMatch = trimmed.match(pattern);
        if (varMatch) {
          steps.push({
            type: 'variable',
            line: lineIndex + 1,
            description: `Declaring variable ${varMatch[1]} = ${varMatch[2]}`,
            data: { name: varMatch[1], value: varMatch[2] },
            duration: 1000
          });
          stepIndex++;
          break;
        }
      }

      // Array access with more patterns
      const arrayPatterns = [
        /(\w+)\[(\d+)\]/,
        /(\w+)\[(\w+)\]/,
        /(\w+)\[(\w+)\s*[+\-*/]\s*(\d+)\]/
      ];
      
      for (const pattern of arrayPatterns) {
        const arrayMatch = trimmed.match(pattern);
        if (arrayMatch) {
          steps.push({
            type: 'array_access',
            line: lineIndex + 1,
            description: `Accessing array ${arrayMatch[1]}[${arrayMatch[2]}]`,
            data: { array: arrayMatch[1], index: arrayMatch[2] },
            duration: 800
          });
          stepIndex++;
          break;
        }
      }

      // Loops with more detailed detection
      if (trimmed.includes('for') && trimmed.includes('(')) {
        const loopType = trimmed.includes('int') ? 'for' : 'for-each';
        steps.push({
          type: 'loop',
          line: lineIndex + 1,
          description: `Starting ${loopType} loop`,
          data: { type: loopType },
          duration: 1200
        });
        stepIndex++;
      } else if (trimmed.includes('while') && trimmed.includes('(')) {
        steps.push({
          type: 'loop',
          line: lineIndex + 1,
          description: `Starting while loop`,
          data: { type: 'while' },
          duration: 1200
        });
        stepIndex++;
      }

      // Conditions with more patterns
      if (trimmed.includes('if') && trimmed.includes('(')) {
        const condition = trimmed.replace(/if\s*\(/, '').replace(/\)\s*\{?/, '');
        steps.push({
          type: 'condition',
          line: lineIndex + 1,
          description: `Evaluating condition: ${condition}`,
          data: { condition: condition },
          duration: 900
        });
        stepIndex++;
      } else if (trimmed.includes('else if') && trimmed.includes('(')) {
        const condition = trimmed.replace(/else\s+if\s*\(/, '').replace(/\)\s*\{?/, '');
        steps.push({
          type: 'condition',
          line: lineIndex + 1,
          description: `Evaluating else-if condition: ${condition}`,
          data: { condition: condition },
          duration: 900
        });
        stepIndex++;
      }

      // Operations with more patterns
      const operationPatterns = [
        /return\s+([^;]+)/,
        /(\w+)\+\+/,
        /(\w+)--/,
        /(\w+)\s*[+\-*/=]\s*([^;]+)/
      ];
      
      for (const pattern of operationPatterns) {
        const opMatch = trimmed.match(pattern);
        if (opMatch) {
          steps.push({
            type: 'operation',
            line: lineIndex + 1,
            description: `Executing: ${trimmed}`,
            data: { operation: trimmed },
            duration: 700
          });
          stepIndex++;
          break;
        }
      }

      // Function calls
      const funcMatch = trimmed.match(/(\w+)\s*\([^)]*\)/);
      if (funcMatch && !['if', 'for', 'while', 'return'].includes(funcMatch[1])) {
        steps.push({
          type: 'function_call',
          line: lineIndex + 1,
          description: `Calling function: ${funcMatch[1]}()`,
          data: { function: funcMatch[1] },
          duration: 600
        });
        stepIndex++;
      }
    });

    return steps;
  }, [code]);

  // Initialize problem-specific data
  useEffect(() => {
    const getProblemData = () => {
      switch (problemId) {
        case 'two-sum':
          return { values: [2, 7, 11, 15], target: 9 };
        case 'binary-search':
          return { values: [-1, 0, 3, 5, 9, 12], target: 9 };
        case 'maximum-subarray':
          return { values: [-2, 1, -3, 4, -1, 2, 1, -5, 4] };
        case 'merge-intervals':
          return { values: [1, 3, 2, 6, 8, 10, 15, 18] };
        default:
          return { values: [1, 2, 3, 4, 5], target: 3 };
      }
    };

    const data = getProblemData();
    setArrayState({
      values: data.values,
      activeIndices: [],
      accessedIndices: []
    });

    setExecutionSteps(generateExecutionSteps);
  }, [problemId, generateExecutionSteps]);

  // Real-time code analysis - update as user types
  useEffect(() => {
    const newSteps = generateExecutionSteps;
    setExecutionSteps(newSteps);
    
    // Show typing indicator
    setIsTyping(true);
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
    }, 1000);
    
    // Reset execution if code changes significantly
    if (Math.abs(newSteps.length - executionSteps.length) > 2) {
      setCurrentStep(0);
      setExecutionTime(0);
      setVariables([]);
      setArrayState(prev => ({
        ...prev,
        activeIndices: [],
        accessedIndices: []
      }));
    }
  }, [code, generateExecutionSteps]);

  // Execution simulation
  useEffect(() => {
    if (isPlaying && currentStep < executionSteps.length) {
      const step = executionSteps[currentStep];
      
      // Update variables based on step
      if (step.type === 'variable' && step.data) {
        setVariables(prev => [...prev, {
          name: step.data.name,
          value: step.data.value,
          type: 'auto',
          isActive: true
        }]);
      }

      // Update array state based on step
      if (step.type === 'array_access' && step.data) {
        setArrayState(prev => ({
          ...prev,
          activeIndices: [step.data.index],
          accessedIndices: [...prev.accessedIndices, step.data.index]
        }));
      }

      // Move to next step after duration
      intervalRef.current = setTimeout(() => {
        setCurrentStep(prev => prev + 1);
        setExecutionTime(prev => prev + step.duration);
      }, step.duration);

      return () => {
        if (intervalRef.current) {
          clearTimeout(intervalRef.current);
        }
      };
    }
  }, [isPlaying, currentStep, executionSteps]);

  const handlePlayPause = () => {
    if (isPlaying) {
      setIsPlaying(false);
      if (intervalRef.current) {
        clearTimeout(intervalRef.current);
      }
    } else {
      setIsPlaying(true);
    }
  };

  const handleReset = () => {
    setIsPlaying(false);
    setCurrentStep(0);
    setExecutionTime(0);
    setVariables([]);
    setArrayState(prev => ({
      ...prev,
      activeIndices: [],
      accessedIndices: []
    }));
    if (intervalRef.current) {
      clearTimeout(intervalRef.current);
    }
  };

  const currentStepData = executionSteps[currentStep];
  const hasCodeChanges = code.trim().length > 0 && executionSteps.length > 0;

  return (
    <div className="bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 rounded-xl p-6 border border-blue-500/20">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className={`w-3 h-3 rounded-full ${
            hasCodeChanges ? 'bg-green-400 animate-pulse' : 'bg-yellow-400'
          }`}></div>
          <h3 className="text-lg font-bold text-white">Live Code Execution</h3>
          {hasCodeChanges && (
            <span className="text-xs text-green-300 bg-green-900/30 px-2 py-1 rounded-full">
              Real-time Analysis
            </span>
          )}
          {isTyping && (
            <span className="text-xs text-yellow-300 bg-yellow-900/30 px-2 py-1 rounded-full animate-pulse">
              Typing...
            </span>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={handlePlayPause}
            className="flex items-center space-x-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200"
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            <span className="text-sm font-medium">{isPlaying ? 'Pause' : 'Play'}</span>
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Panel - Execution Flow */}
        <div className="space-y-4">
          <div className="bg-black/40 rounded-lg p-4">
            <h4 className="text-white font-semibold mb-3 flex items-center">
              <Brain className="w-4 h-4 mr-2" />
              Execution Flow
            </h4>
            
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {executionSteps.map((step, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`p-3 rounded-lg border-l-4 transition-all duration-300 ${
                    index === currentStep
                      ? 'bg-blue-600/30 border-blue-400 text-blue-200'
                      : index < currentStep
                      ? 'bg-green-600/20 border-green-400 text-green-200'
                      : 'bg-gray-700/50 border-gray-500 text-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Line {step.line}</span>
                    <span className="text-xs opacity-75">{step.type}</span>
                  </div>
                  <p className="text-xs mt-1">{step.description}</p>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Variables Panel */}
          <div className="bg-black/40 rounded-lg p-4">
            <h4 className="text-white font-semibold mb-3 flex items-center">
              <Code className="w-4 h-4 mr-2" />
              Variables
            </h4>
            
            <div className="space-y-2">
              {variables.map((variable, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={`p-2 rounded border ${
                    variable.isActive
                      ? 'bg-yellow-600/20 border-yellow-400 text-yellow-200'
                      : 'bg-gray-700/50 border-gray-500 text-gray-300'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-mono text-sm">{variable.name}</span>
                    <span className="font-mono text-sm">{variable.value}</span>
                  </div>
                </motion.div>
              ))}
              
              {variables.length === 0 && (
                <div className="text-gray-400 text-sm italic">No variables declared yet</div>
              )}
            </div>
          </div>
        </div>

        {/* Right Panel - Data Visualization */}
        <div className="space-y-4">
          {/* Array Visualization */}
          <div className="bg-black/40 rounded-lg p-4">
            <h4 className="text-white font-semibold mb-3 flex items-center">
              <Eye className="w-4 h-4 mr-2" />
              Data Structure
            </h4>
            
            <div className="flex flex-wrap gap-2 justify-center">
              {arrayState.values.map((value, index) => (
                <motion.div
                  key={index}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className={`relative p-3 rounded-lg border-2 transition-all duration-300 ${
                    arrayState.activeIndices.includes(index)
                      ? 'bg-green-600/30 border-green-400 text-green-200 scale-110'
                      : arrayState.accessedIndices.includes(index)
                      ? 'bg-blue-600/20 border-blue-400 text-blue-200'
                      : 'bg-gray-700/50 border-gray-500 text-gray-300'
                  }`}
                >
                  <div className="text-center">
                    <div className="font-bold text-lg">{value}</div>
                    <div className="text-xs opacity-75">[{index}]</div>
                  </div>
                  
                  {arrayState.activeIndices.includes(index) && (
                    <motion.div
                      className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full"
                      animate={{ scale: [1, 1.5, 1] }}
                      transition={{ duration: 1, repeat: Infinity }}
                    />
                  )}
                </motion.div>
              ))}
            </div>
          </div>

          {/* Current Step Details */}
          {currentStepData && (
            <div className="bg-black/40 rounded-lg p-4">
              <h4 className="text-white font-semibold mb-3">Current Step</h4>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-300 text-sm">Type:</span>
                  <span className="text-blue-300 font-medium capitalize">{currentStepData.type}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-300 text-sm">Line:</span>
                  <span className="text-green-300 font-mono">{currentStepData.line}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-300 text-sm">Duration:</span>
                  <span className="text-yellow-300 font-mono">{currentStepData.duration}ms</span>
                </div>
                
                <div className="mt-3 p-3 bg-blue-600/20 rounded border border-blue-400/30">
                  <p className="text-blue-200 text-sm">{currentStepData.description}</p>
                </div>
              </div>
            </div>
          )}

          {/* Performance Stats */}
          <div className="bg-black/40 rounded-lg p-4">
            <h4 className="text-white font-semibold mb-3 flex items-center">
              <Zap className="w-4 h-4 mr-2" />
              Performance
            </h4>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-300 text-sm">Execution Time:</span>
                <span className="text-green-300 font-mono">{executionTime}ms</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-300 text-sm">Steps Completed:</span>
                <span className="text-blue-300 font-mono">{currentStep}/{executionSteps.length}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-300 text-sm">Progress:</span>
                <span className="text-yellow-300 font-mono">
                  {executionSteps.length > 0 ? Math.round((currentStep / executionSteps.length) * 100) : 0}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveCodeVisualizer; 