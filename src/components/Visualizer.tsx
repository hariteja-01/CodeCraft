import React, { useRef, useEffect, useState, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Box, Sphere, Line } from '@react-three/drei';
import { Problem } from '../data/problems';
import * as THREE from 'three';
import { motion } from 'framer-motion';

interface VisualizerProps {
  problem: Problem;
  code: string;
}

interface CodeAnalysis {
  variables: { name: string; value: any; type: string; line: number }[];
  loops: { type: string; iterations: number; line: number }[];
  conditions: { condition: string; result: boolean; line: number }[];
  operations: { operation: string; line: number; target?: number }[];
  currentLine: number;
  arrayAccesses: { index: number; operation: string; line: number }[];
  functions: { name: string; params: string[]; line: number }[];
}

const AnimatedBox: React.FC<{ 
  position: [number, number, number]; 
  color: string; 
  value: any; 
  isActive: boolean;
  scale?: number;
  glowIntensity?: number;
}> = ({ position, color, value, isActive, scale = 1, glowIntensity = 0 }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  
  useFrame((state) => {
    if (meshRef.current) {
      if (isActive) {
        meshRef.current.rotation.y += 0.03;
        meshRef.current.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * 3) * 0.15);
      } else {
        meshRef.current.rotation.y += 0.005;
        meshRef.current.scale.setScalar(hovered ? 1.1 : 1);
      }
    }
  });

  return (
    <group position={position}>
      <Box 
        ref={meshRef} 
        args={[scale, scale, scale * 0.3]}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <meshStandardMaterial 
          color={color} 
          transparent 
          opacity={isActive ? 0.9 : 0.7}
          emissive={isActive ? color : hovered ? color : '#000000'}
          emissiveIntensity={isActive ? 0.3 : hovered ? 0.1 : 0}
          roughness={0.3}
          metalness={0.7}
        />
      </Box>
      
      {/* Glow effect for active elements */}
      {(isActive || glowIntensity > 0) && (
        <Sphere args={[scale * 0.8]} position={[0, 0, 0]}>
          <meshBasicMaterial 
            color={color} 
            transparent 
            opacity={0.2} 
            side={THREE.BackSide}
          />
        </Sphere>
      )}
      
      <Text
        position={[0, 0, scale * 0.2]}
        fontSize={0.25 * scale}
        color="white"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.02}
        outlineColor="black"
        font="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@700&display=swap"
      >
        {value?.toString() || '?'}
      </Text>
    </group>
  );
};

const ParticleSystem: React.FC<{ active: boolean; color: string }> = ({ active, color }) => {
  const particlesRef = useRef<THREE.Points>(null);
  const particleCount = 50;
  
  const particles = useMemo(() => {
    const positions = new Float32Array(particleCount * 3);
    const velocities = new Float32Array(particleCount * 3);
    
    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 10;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 10;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 10;
      
      velocities[i * 3] = (Math.random() - 0.5) * 0.02;
      velocities[i * 3 + 1] = (Math.random() - 0.5) * 0.02;
      velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.02;
    }
    
    return { positions, velocities };
  }, []);
  
  useFrame(() => {
    if (particlesRef.current && active) {
      const positions = particlesRef.current.geometry.attributes.position.array as Float32Array;
      
      for (let i = 0; i < particleCount; i++) {
        positions[i * 3] += particles.velocities[i * 3];
        positions[i * 3 + 1] += particles.velocities[i * 3 + 1];
        positions[i * 3 + 2] += particles.velocities[i * 3 + 2];
        
        // Reset particles that go too far
        if (Math.abs(positions[i * 3]) > 5) particles.velocities[i * 3] *= -1;
        if (Math.abs(positions[i * 3 + 1]) > 5) particles.velocities[i * 3 + 1] *= -1;
        if (Math.abs(positions[i * 3 + 2]) > 5) particles.velocities[i * 3 + 2] *= -1;
      }
      
      particlesRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  if (!active) return null;

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particleCount}
          array={particles.positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial color={color} size={0.05} transparent opacity={0.6} />
    </points>
  );
};

const ArrayVisualizer: React.FC<{ 
  values: number[]; 
  analysis: CodeAnalysis;
  highlightIndices?: number[];
}> = ({ values, analysis, highlightIndices = [] }) => {
  const [animatingIndices, setAnimatingIndices] = useState<Set<number>>(new Set());
  const [accessedIndices, setAccessedIndices] = useState<Set<number>>(new Set());

  useEffect(() => {
    const newAnimating = new Set<number>();
    const newAccessed = new Set<number>();
    
    analysis.arrayAccesses.forEach(access => {
      if (access.index >= 0 && access.index < values.length) {
        newAnimating.add(access.index);
        newAccessed.add(access.index);
      }
    });
    
    analysis.operations.forEach(op => {
      if (op.target !== undefined && op.target >= 0 && op.target < values.length) {
        newAnimating.add(op.target);
      }
    });
    
    setAnimatingIndices(newAnimating);
    setAccessedIndices(prev => new Set([...prev, ...newAccessed]));
    
    // Clear animations after 2 seconds
    const timeout = setTimeout(() => {
      setAnimatingIndices(new Set());
    }, 2000);
    
    return () => clearTimeout(timeout);
  }, [analysis, values.length]);

  return (
    <group>
      {/* Array visualization */}
      {values.map((value, index) => {
        const isHighlighted = highlightIndices.includes(index);
        const isAnimating = animatingIndices.has(index);
        const wasAccessed = accessedIndices.has(index);
        
        let color = '#6b7280'; // default gray
        if (isHighlighted) color = '#ef4444'; // red for highlighted
        else if (isAnimating) color = '#10b981'; // green for currently animating
        else if (wasAccessed) color = '#3b82f6'; // blue for previously accessed
        else if (value > 0) color = '#8b5cf6'; // purple for positive values
        
        return (
          <AnimatedBox
            key={`${index}-${value}`}
            position={[index * 2.5 - (values.length * 2.5) / 2, 0, 0]}
            color={color}
            value={value}
            isActive={isAnimating}
            scale={1.2}
            glowIntensity={isAnimating ? 1 : 0}
          />
        );
      })}
      
      {/* Index labels */}
      {values.map((_, index) => (
        <Text
          key={`index-${index}`}
          position={[index * 2.5 - (values.length * 2.5) / 2, -2, 0]}
          fontSize={0.3}
          color="#9ca3af"
          anchorX="center"
          anchorY="middle"
        >
          [{index}]
        </Text>
      ))}

      {/* Variable indicators */}
      {analysis.variables.map((variable, idx) => (
        <group key={`${variable.name}-${idx}`} position={[-5, 3 - idx * 0.8, 0]}>
          <Text
            fontSize={0.35}
            color="#f59e0b"
            anchorX="left"
            anchorY="middle"
            outlineWidth={0.02}
            outlineColor="black"
          >
            {variable.name} = {variable.value} (line {variable.line})
          </Text>
        </group>
      ))}
      
      {/* Loop indicators */}
      {analysis.loops.map((loop, idx) => (
        <group key={`loop-${idx}`} position={[5, 3 - idx * 0.8, 0]}>
          <Text
            fontSize={0.3}
            color="#8b5cf6"
            anchorX="left"
            anchorY="middle"
            outlineWidth={0.02}
            outlineColor="black"
          >
            {loop.type} loop (line {loop.line})
          </Text>
        </group>
      ))}
      
      {/* Particle effects for active operations */}
      <ParticleSystem 
        active={animatingIndices.size > 0} 
        color="#10b981" 
      />
    </group>
  );
};

const TreeVisualizer: React.FC<{ analysis: CodeAnalysis }> = ({ analysis }) => {
  const positions = [
    [0, 3, 0],
    [-3, 1, 0], [3, 1, 0],
    [-4, -1, 0], [-2, -1, 0], [2, -1, 0], [4, -1, 0]
  ] as [number, number, number][];

  const [activeNodes, setActiveNodes] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (analysis.operations.length > 0) {
      const newActive = new Set<number>();
      analysis.operations.forEach((_, idx) => {
        if (idx < positions.length) {
          newActive.add(idx);
        }
      });
      setActiveNodes(newActive);
      
      const timeout = setTimeout(() => setActiveNodes(new Set()), 2000);
      return () => clearTimeout(timeout);
    }
  }, [analysis.operations]);

  return (
    <group>
      {/* Tree nodes */}
      {positions.map((pos, index) => (
        <AnimatedBox
          key={index}
          position={pos}
          color={activeNodes.has(index) ? "#10b981" : "#3b82f6"}
          value={index + 1}
          isActive={activeNodes.has(index)}
          scale={1}
        />
      ))}
      
      {/* Tree edges */}
      <Line points={[positions[0], positions[1]]} color="#6b7280" lineWidth={3} />
      <Line points={[positions[0], positions[2]]} color="#6b7280" lineWidth={3} />
      <Line points={[positions[1], positions[3]]} color="#6b7280" lineWidth={3} />
      <Line points={[positions[1], positions[4]]} color="#6b7280" lineWidth={3} />
      <Line points={[positions[2], positions[5]]} color="#6b7280" lineWidth={3} />
      <Line points={[positions[2], positions[6]]} color="#6b7280" lineWidth={3} />
      
      {/* Algorithm info */}
      <Text
        position={[0, -3, 0]}
        fontSize={0.4}
        color="#f59e0b"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.02}
        outlineColor="black"
      >
        Tree Traversal: {analysis.operations.length} operations
      </Text>
    </group>
  );
};

const MatrixVisualizer: React.FC<{ 
  matrix: string[][]; 
  analysis: CodeAnalysis;
}> = ({ matrix, analysis }) => {
  const [activePositions, setActivePositions] = useState<Set<string>>(new Set());

  useEffect(() => {
    const newActive = new Set<string>();
    analysis.operations.forEach(op => {
      const match = op.operation.match(/\[(\d+)\]\[(\d+)\]/);
      if (match) {
        const row = parseInt(match[1]);
        const col = parseInt(match[2]);
        if (row < matrix.length && col < matrix[0].length) {
          newActive.add(`${row}-${col}`);
        }
      }
    });
    
    setActivePositions(newActive);
    
    const timeout = setTimeout(() => setActivePositions(new Set()), 2000);
    return () => clearTimeout(timeout);
  }, [analysis.operations, matrix]);

  return (
    <group>
      {matrix.map((row, rowIndex) =>
        row.map((cell, colIndex) => {
          const key = `${rowIndex}-${colIndex}`;
          const isActive = activePositions.has(key);
          
          let color = '#e5e7eb'; // default light gray
          if (cell === 'Q') color = '#f59e0b'; // gold for queens
          else if (cell === '.') color = '#6b7280'; // gray for empty
          else if (isActive) color = '#10b981'; // green for active
          
          return (
            <AnimatedBox
              key={key}
              position={[
                colIndex * 1.5 - (row.length * 1.5) / 2,
                -rowIndex * 1.5 + (matrix.length * 1.5) / 2,
                0
              ]}
              color={color}
              value={cell}
              isActive={isActive}
              scale={1}
            />
          );
        })
      )}
      
      {/* Matrix info */}
      <Text
        position={[0, -4, 0]}
        fontSize={0.4}
        color="#8b5cf6"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.02}
        outlineColor="black"
      >
        {matrix.length}x{matrix[0]?.length || 0} Matrix
      </Text>
    </group>
  );
};

const CodeAnalyzer = {
  analyze: (code: string): CodeAnalysis => {
    const lines = code.split('\n');
    const analysis: CodeAnalysis = {
      variables: [],
      loops: [],
      conditions: [],
      operations: [],
      currentLine: 0,
      arrayAccesses: [],
      functions: []
    };

    lines.forEach((line, index) => {
      const trimmed = line.trim();
      const lineNumber = index + 1;
      
      if (trimmed.length === 0 || trimmed.startsWith('//')) return;
      
      // Variable declarations and assignments
      const varPatterns = [
        /(?:int|long|double|float|char|string|bool)\s+(\w+)\s*=\s*([^;]+)/g,
        /(\w+)\s*=\s*([^;]+)/g
      ];
      
      varPatterns.forEach(pattern => {
        let match;
        while ((match = pattern.exec(trimmed)) !== null) {
          analysis.variables.push({
            name: match[1],
            value: match[2].trim(),
            type: 'auto',
            line: lineNumber
          });
        }
      });

      // Array access patterns
      const arrayPattern = /(\w+)\[(\d+)\]/g;
      let arrayMatch;
      while ((arrayMatch = arrayPattern.exec(trimmed)) !== null) {
        const index = parseInt(arrayMatch[2]);
        analysis.arrayAccesses.push({
          index: index,
          operation: arrayMatch[0],
          line: lineNumber
        });
        
        analysis.operations.push({
          operation: `Access ${arrayMatch[1]}[${index}]`,
          line: lineNumber,
          target: index
        });
      }

      // Loop detection
      if (trimmed.includes('for') && trimmed.includes('(')) {
        analysis.loops.push({
          type: 'for',
          iterations: 5, // Simulated
          line: lineNumber
        });
      }
      
      if (trimmed.includes('while') && trimmed.includes('(')) {
        analysis.loops.push({
          type: 'while',
          iterations: 3, // Simulated
          line: lineNumber
        });
      }

      // Condition detection
      if (trimmed.includes('if') && trimmed.includes('(')) {
        analysis.conditions.push({
          condition: trimmed,
          result: Math.random() > 0.5,
          line: lineNumber
        });
      }

      // Function calls
      const funcPattern = /(\w+)\s*\(/g;
      let funcMatch;
      while ((funcMatch = funcPattern.exec(trimmed)) !== null) {
        if (!['if', 'for', 'while', 'return'].includes(funcMatch[1])) {
          analysis.functions.push({
            name: funcMatch[1],
            params: [],
            line: lineNumber
          });
        }
      }

      // General operations
      if (trimmed.includes('return') || trimmed.includes('++') || trimmed.includes('--')) {
        analysis.operations.push({
          operation: trimmed,
          line: lineNumber
        });
      }

      analysis.currentLine = lineNumber;
    });

    return analysis;
  }
};

const VisualizationScene: React.FC<{ problem: Problem; code: string }> = ({ problem, code }) => {
  const [analysis, setAnalysis] = useState<CodeAnalysis>({
    variables: [],
    loops: [],
    conditions: [],
    operations: [],
    currentLine: 0,
    arrayAccesses: [],
    functions: []
  });

  useEffect(() => {
    const newAnalysis = CodeAnalyzer.analyze(code);
    setAnalysis(newAnalysis);
  }, [code]);

  const getVisualizationData = () => {
    switch (problem.visualizationType) {
      case 'array':
        if (problem.id === 'two-sum') {
          return { type: 'array', data: [2, 7, 11, 15], highlights: [0, 1] };
        } else if (problem.id === 'binary-search') {
          return { type: 'array', data: [-1, 0, 3, 5, 9, 12], highlights: [4] };
        } else if (problem.id === 'maximum-subarray') {
          return { type: 'array', data: [-2, 1, -3, 4, -1, 2, 1, -5, 4], highlights: [3, 4, 5, 6] };
        } else if (problem.id === 'merge-intervals') {
          return { type: 'array', data: [1, 3, 2, 6, 8, 10, 15, 18], highlights: [0, 1, 2, 3] };
        }
        return { type: 'array', data: [1, 2, 3, 4, 5], highlights: [] };
      
      case 'matrix':
        if (problem.id === 'n-queens') {
          return { 
            type: 'matrix', 
            data: [
              ['.', 'Q', '.', '.'],
              ['.', '.', '.', 'Q'],
              ['Q', '.', '.', '.'],
              ['.', '.', 'Q', '.']
            ]
          };
        } else if (problem.id === 'sudoku-solver') {
          return {
            type: 'matrix',
            data: [
              ['5', '3', '.', '.'],
              ['6', '.', '.', '1'],
              ['.', '9', '8', '.'],
              ['8', '.', '.', '.']
            ]
          };
        }
        return { type: 'matrix', data: [['1', '2'], ['3', '4']] };
      
      case 'tree':
        return { type: 'tree', data: {} };
      
      default:
        return { type: 'array', data: [1, 2, 3, 4, 5], highlights: [] };
    }
  };

  const visualData = getVisualizationData();

  return (
    <>
      <ambientLight intensity={0.4} />
      <pointLight position={[10, 10, 10]} intensity={1} color="#ffffff" />
      <pointLight position={[-10, -10, -10]} intensity={0.5} color="#3b82f6" />
      <directionalLight position={[0, 10, 5]} intensity={0.8} />
      
      {visualData.type === 'array' && (
        <ArrayVisualizer 
          values={visualData.data as number[]} 
          analysis={analysis}
          highlightIndices={(visualData as any).highlights || []}
        />
      )}
      
      {visualData.type === 'matrix' && (
        <MatrixVisualizer 
          matrix={visualData.data as string[][]} 
          analysis={analysis}
        />
      )}
      
      {visualData.type === 'tree' && (
        <TreeVisualizer analysis={analysis} />
      )}
      
      <OrbitControls 
        enableZoom={true} 
        autoRotate={analysis.operations.length === 0} 
        autoRotateSpeed={0.5}
        enablePan={true}
        enableRotate={true}
      />
    </>
  );
};

const Visualizer: React.FC<VisualizerProps> = ({ problem, code }) => {
  const analysis = useMemo(() => CodeAnalyzer.analyze(code), [code]);
  
  return (
    <div className="w-full h-80 bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 rounded-xl overflow-hidden relative border border-blue-500/20">
      <Canvas camera={{ position: [0, 2, 12], fov: 60 }}>
        <VisualizationScene problem={problem} code={code} />
      </Canvas>
      
      {/* Enhanced Code Analysis Overlay */}
      <div className="absolute top-4 right-4 bg-black/80 backdrop-blur-md rounded-xl p-4 max-w-xs border border-blue-500/30">
        <div className="text-blue-300 text-sm font-bold mb-3 flex items-center">
          <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
          Live Code Analysis
        </div>
        <div className="space-y-2 text-xs">
          <div className="flex justify-between text-gray-300">
            <span>Variables:</span>
            <span className="text-yellow-400 font-mono">{analysis.variables.length}</span>
          </div>
          <div className="flex justify-between text-gray-300">
            <span>Operations:</span>
            <span className="text-green-400 font-mono">{analysis.operations.length}</span>
          </div>
          <div className="flex justify-between text-gray-300">
            <span>Array Access:</span>
            <span className="text-blue-400 font-mono">{analysis.arrayAccesses.length}</span>
          </div>
          <div className="flex justify-between text-gray-300">
            <span>Current Line:</span>
            <span className="text-purple-400 font-mono">{analysis.currentLine}</span>
          </div>
          <div className="flex justify-between text-gray-300">
            <span>Loops:</span>
            <span className="text-orange-400 font-mono">{analysis.loops.length}</span>
          </div>
        </div>
        
        {analysis.operations.length > 0 && (
          <div className="mt-3 pt-2 border-t border-gray-600">
            <div className="text-xs text-green-400 font-semibold">🔥 Code Active!</div>
          </div>
        )}
      </div>
      
      {/* Visualization Type Badge */}
      <div className="absolute top-4 left-4 bg-gradient-to-r from-blue-600/80 to-purple-600/80 backdrop-blur-md rounded-xl px-4 py-3 border border-blue-400/30">
        <div className="text-white text-sm font-bold">
          {problem.visualizationType.charAt(0).toUpperCase() + problem.visualizationType.slice(1)} Visualization
        </div>
        <div className="text-blue-200 text-xs mt-1">
          Interactive 3D • Real-time Analysis
        </div>
      </div>
      
      {/* Performance Indicator */}
      <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-sm rounded-lg px-3 py-2">
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${
            analysis.operations.length > 0 ? 'bg-green-400 animate-pulse' : 'bg-gray-400'
          }`}></div>
          <span className="text-white text-xs font-medium">
            {analysis.operations.length > 0 ? 'Executing' : 'Ready'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default Visualizer;