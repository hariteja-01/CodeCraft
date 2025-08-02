import React, { useState, useEffect, Suspense, lazy } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getProblemById } from '../data/problems';
import { useGame } from '../contexts/GameContext';
import ResultModal from '../components/ResultModal';
import { Play, RotateCcw, Lightbulb, Clock, Trophy, ArrowLeft, Zap, Brain } from 'lucide-react';
import { CppCodeExecutor, CodeAnalyzer } from '../utils/codeExecutor';

// Lazy load components for better performance
const CodeEditor = lazy(() => import('../components/CodeEditor'));
const Visualizer = lazy(() => import('../components/Visualizer'));
const LiveCodeVisualizer = lazy(() => import('../components/LiveCodeVisualizer'));

const ProblemView: React.FC = () => {
  const { problemId } = useParams<{ problemId: string }>();
  const navigate = useNavigate();
  const { addXP, markProblemSolved, updateStreak } = useGame();
  
  const problem = problemId ? getProblemById(problemId) : null;
  
  const [code, setCode] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [showHints, setShowHints] = useState(false);
  const [currentHint, setCurrentHint] = useState(0);
  const [testResults, setTestResults] = useState<any[]>([]);
  const [showResult, setShowResult] = useState(false);
  const [allPassed, setAllPassed] = useState(false);
  const [showLiveVisualizer, setShowLiveVisualizer] = useState(true);
  const [codeAnalysis, setCodeAnalysis] = useState<any>(null);
  const [compileResult, setCompileResult] = useState<any>(null);
  const [submitResult, setSubmitResult] = useState<any>(null);
  const [isCompiling, setIsCompiling] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (problem) {
      setCode(problem.starterCode);
    }
  }, [problem]);

  // Real-time code analysis and compilation check
  useEffect(() => {
    if (code && code.trim().length > 0) {
      const analysis = CodeAnalyzer.analyzeCode(code);
      setCodeAnalysis(analysis);
      
      // Only show compilation result if there are actual errors
      const compileResult = CppCodeExecutor.compileOnly(code, problem?.id || '');
      if (compileResult.errors.length > 0 || compileResult.success) {
        setCompileResult(compileResult);
      }
    }
  }, [code, problem?.id]);

  if (!problem) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Problem not found
          </h1>
          <button
            onClick={() => navigate('/learn')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-300"
          >
            Back to Learn
          </button>
        </div>
      </div>
    );
  }

  const handleCompile = async () => {
    setIsCompiling(true);
    setCompileResult(null);
    
    try {
      const result = CppCodeExecutor.compileOnly(code, problem.id);
      setCompileResult(result);
    } catch (error) {
      console.error('Compilation error:', error);
      setCompileResult({
        success: false,
        errors: ['Compilation failed'],
        warnings: []
      });
    } finally {
      setIsCompiling(false);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setSubmitResult(null);
    
    try {
      // Analyze the code first
      const analysis = CodeAnalyzer.analyzeCode(code);
      setCodeAnalysis(analysis);
      
      // Submit the solution (includes compilation check)
      const result = CppCodeExecutor.submitSolution(code, problem.id, problem.testCases);
      setSubmitResult(result);
      
      // Set results for the modal
      setTestResults(result.results);
      setAllPassed(result.status === 'accepted');
      
      if (result.status === 'accepted') {
        addXP(problem.xpReward);
        markProblemSolved(problem.id);
        updateStreak();
      }
      
      setShowResult(true);
    } catch (error) {
      console.error('Submission error:', error);
      setSubmitResult({
        results: [],
        totalPassed: 0,
        totalTests: problem.testCases.length,
        executionTime: 0,
        memoryUsed: 0,
        status: 'runtime_error'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetCode = () => {
    setCode(problem.starterCode);
  };

  const getDifficultyColor = () => {
    switch (problem.difficulty) {
      case 'Easy':
        return 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30';
      case 'Medium':
        return 'text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/30';
      case 'Hard':
        return 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30';
      default:
        return 'text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30';
    }
  };

  return (
    <div className="min-h-screen pt-16 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => navigate('/learn')}
              className="flex items-center space-x-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors duration-300"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Back to Learn</span>
            </button>
            
            <div className="flex items-center space-x-4">
              <div className={`px-3 py-1 rounded-full text-sm font-semibold ${getDifficultyColor()}`}>
                {problem.difficulty}
              </div>
              <div className="flex items-center space-x-1 text-sm text-gray-600 dark:text-gray-400">
                <Trophy className="w-4 h-4" />
                <span>{problem.xpReward} XP</span>
              </div>
            </div>
          </div>
          
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            {problem.title}
          </h1>
          
          <div className="flex flex-wrap gap-2">
            {problem.tags.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 text-sm font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-md"
              >
                {tag}
              </span>
            ))}
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Panel - Problem Description */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-6"
          >
            {/* Problem Description */}
            <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 dark:border-slate-700/30">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Problem Description</h2>
              <div className="prose dark:prose-invert max-w-none">
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">
                  {problem.description}
                </p>
              </div>
            </div>

            {/* Examples */}
            <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 dark:border-slate-700/30">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Examples</h2>
              <div className="space-y-4">
                {problem.examples.map((example, index) => (
                  <div key={index} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                    <div className="mb-2">
                      <span className="font-semibold text-gray-700 dark:text-gray-300">Input:</span>
                      <code className="ml-2 px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-sm">
                        {example.input}
                      </code>
                    </div>
                    <div className="mb-2">
                      <span className="font-semibold text-gray-700 dark:text-gray-300">Output:</span>
                      <code className="ml-2 px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-sm">
                        {example.output}
                      </code>
                    </div>
                    {example.explanation && (
                      <div>
                        <span className="font-semibold text-gray-700 dark:text-gray-300">Explanation:</span>
                        <span className="ml-2 text-gray-600 dark:text-gray-400">{example.explanation}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Constraints */}
            <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 dark:border-slate-700/30">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Constraints</h2>
              <ul className="space-y-2">
                {problem.constraints.map((constraint, index) => (
                  <li key={index} className="text-gray-700 dark:text-gray-300">
                    • {constraint}
                  </li>
                ))}
              </ul>
            </div>

            {/* Hints */}
            <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 dark:border-slate-700/30">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Hints</h2>
                <button
                  onClick={() => setShowHints(!showHints)}
                  className="flex items-center space-x-2 px-3 py-1 rounded-lg bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 hover:bg-yellow-200 dark:hover:bg-yellow-900/50 transition-colors duration-300"
                >
                  <Lightbulb className="w-4 h-4" />
                  <span className="text-sm font-medium">
                    {showHints ? 'Hide' : 'Show'} Hints
                  </span>
                </button>
              </div>
              
              {showHints && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-3"
                >
                  {problem.hints.map((hint, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={`p-3 rounded-lg border-l-4 ${
                        index <= currentHint
                          ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-500 text-blue-700 dark:text-blue-300'
                          : 'bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400'
                      }`}
                    >
                      <span className="font-medium">Hint {index + 1}:</span> {hint}
                    </motion.div>
                  ))}
                  
                  {currentHint < problem.hints.length - 1 && (
                    <button
                      onClick={() => setCurrentHint(currentHint + 1)}
                      className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
                    >
                      Show next hint
                    </button>
                  )}
                </motion.div>
              )}
            </div>
          </motion.div>

          {/* Right Panel - Code Editor and Visualizer */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="space-y-6"
          >
            {/* Visualization Toggle */}
            <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl p-4 border border-white/20 dark:border-slate-700/30">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Live Visualization</h2>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setShowLiveVisualizer(true)}
                    className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors duration-200 ${
                      showLiveVisualizer
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    <Brain className="w-4 h-4 inline mr-1" />
                    Code Flow
                  </button>
                  <button
                    onClick={() => setShowLiveVisualizer(false)}
                    className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors duration-200 ${
                      !showLiveVisualizer
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    <Zap className="w-4 h-4 inline mr-1" />
                    3D View
                  </button>
                </div>
              </div>
              
              <Suspense fallback={
                <div className="h-80 flex items-center justify-center">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Loading Visualizer...</div>
                  </div>
                </div>
              }>
                {showLiveVisualizer ? (
                  <LiveCodeVisualizer 
                    code={code} 
                    problemId={problem.id} 
                    isRunning={isRunning} 
                  />
                ) : (
                  <Visualizer problem={problem} code={code} />
                )}
              </Suspense>
            </div>

            {/* Code Editor */}
            <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 dark:border-slate-700/30">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Code Editor</h2>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleResetCode}
                    className="flex items-center space-x-2 px-3 py-1 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-300"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span className="text-sm font-medium">Reset</span>
                  </button>
                </div>
              </div>
              
              <Suspense fallback={
                <div className="h-96 flex items-center justify-center border border-gray-200 dark:border-gray-700 rounded-lg">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Loading Code Editor...</div>
                  </div>
                </div>
              }>
                <CodeEditor
                  value={code}
                  onChange={setCode}
                  language="cpp"
                  height="400px"
                />
              </Suspense>
              
              <div className="flex items-center justify-between mt-4">
                <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4" />
                    <span>Auto-save enabled</span>
                  </div>
                  
                  {/* Real-time compilation status */}
                  {compileResult && (
                    <div className={`flex items-center space-x-2 px-2 py-1 rounded text-xs ${
                      compileResult.success 
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                        : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300'
                    }`}>
                      <div className={`w-2 h-2 rounded-full ${
                        compileResult.success ? 'bg-green-500' : 'bg-yellow-500'
                      }`}></div>
                      <span>{compileResult.success ? 'Compiled' : 'Has Issues'}</span>
                    </div>
                  )}
                </div>
                
                <div className="flex items-center space-x-3">
                  {/* Compile Button */}
                  <button
                    onClick={handleCompile}
                    disabled={isCompiling}
                    className="flex items-center space-x-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  >
                    <div className={`w-4 h-4 ${isCompiling ? 'animate-spin border-2 border-white border-t-transparent rounded-full' : ''}`}></div>
                    <span>{isCompiling ? 'Compiling...' : 'Compile'}</span>
                  </button>
                  
                  {/* Submit Button */}
                  <button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="flex items-center space-x-2 px-6 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold rounded-lg hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  >
                    <Play className="w-4 h-4" />
                    <span>{isSubmitting ? 'Submitting...' : 'Submit'}</span>
                  </button>
                </div>
              </div>

              {/* Compilation Result Panel */}
              {compileResult && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`mt-4 p-4 rounded-lg border ${
                    compileResult.success 
                      ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20'
                      : 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-gray-900 dark:text-white">Compilation Result</h4>
                    <div className={`px-2 py-1 rounded text-xs font-medium ${
                      compileResult.success 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                        : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                    }`}>
                      {compileResult.success ? 'Success' : 'Failed'}
                    </div>
                  </div>
                  
                  {compileResult.errors.length > 0 && (
                    <div className="mb-3">
                      <h5 className="text-sm font-medium text-red-600 dark:text-red-400 mb-2">Errors:</h5>
                      <ul className="space-y-1">
                        {compileResult.errors.map((error: string, index: number) => (
                          <li key={index} className="text-sm text-red-600 dark:text-red-400 flex items-start">
                            <span className="mr-2">❌</span>
                            {error}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {compileResult.warnings.length > 0 && (
                    <div className="mb-3">
                      <h5 className="text-sm font-medium text-yellow-600 dark:text-yellow-400 mb-2">Warnings:</h5>
                      <ul className="space-y-1">
                        {compileResult.warnings.map((warning: string, index: number) => (
                          <li key={index} className="text-sm text-yellow-600 dark:text-yellow-400 flex items-start">
                            <span className="mr-2">⚠️</span>
                            {warning}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {compileResult.success && (
                    <div className="text-sm text-green-600 dark:text-green-400">
                      ✅ Code compiled successfully! Ready to submit.
                    </div>
                  )}
                </motion.div>
              )}

              {/* Code Analysis Panel */}
              {codeAnalysis && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 p-4 rounded-lg border"
                >
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-gray-900 dark:text-white">Code Analysis</h4>
                    <div className={`px-2 py-1 rounded text-xs font-medium ${
                      codeAnalysis.isValid 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                        : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                    }`}>
                      {codeAnalysis.isValid ? 'Valid' : 'Needs Review'}
                    </div>
                  </div>
                  
                  {codeAnalysis.issues.length > 0 && (
                    <div className="mb-3">
                      <h5 className="text-sm font-medium text-red-600 dark:text-red-400 mb-2">Issues Found:</h5>
                      <ul className="space-y-1">
                        {codeAnalysis.issues.map((issue: string, index: number) => (
                          <li key={index} className="text-sm text-red-600 dark:text-red-400 flex items-start">
                            <span className="mr-2">•</span>
                            {issue}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {codeAnalysis.suggestions.length > 0 && (
                    <div className="mb-3">
                      <h5 className="text-sm font-medium text-blue-600 dark:text-blue-400 mb-2">Suggestions:</h5>
                      <ul className="space-y-1">
                        {codeAnalysis.suggestions.map((suggestion: string, index: number) => (
                          <li key={index} className="text-sm text-blue-600 dark:text-blue-400 flex items-start">
                            <span className="mr-2">💡</span>
                            {suggestion}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    <span className="font-medium">Complexity:</span> {codeAnalysis.complexity}
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Result Modal */}
      {showResult && (
        <ResultModal
          isOpen={showResult}
          onClose={() => setShowResult(false)}
          results={testResults}
          allPassed={allPassed}
          xpEarned={allPassed ? problem.xpReward : 0}
          problemTitle={problem.title}
          submitResult={submitResult}
        />
      )}
    </div>
  );
};

export default ProblemView;