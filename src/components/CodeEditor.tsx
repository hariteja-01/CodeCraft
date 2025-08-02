import React, { Suspense, lazy } from 'react';
import { useTheme } from '../contexts/ThemeContext';

// Lazy load Monaco Editor to improve initial load time
const Editor = lazy(() => import('@monaco-editor/react'));

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  language?: string;
  height?: string;
  readOnly?: boolean;
}

const CodeEditor: React.FC<CodeEditorProps> = ({
  value,
  onChange,
  language = 'cpp',
  height = '400px',
  readOnly = false
}) => {
  const { theme } = useTheme();

  const handleEditorChange = (value: string | undefined) => {
    onChange(value || '');
  };

  const editorOptions = {
    readOnly,
    minimap: { enabled: false },
    fontSize: 14,
    lineNumbers: 'on' as const,
    folding: false, // Disabled for performance
    automaticLayout: true,
    wordWrap: 'on' as const,
    scrollBeyondLastLine: false,
    renderWhitespace: 'none' as const, // Disabled for performance
    cursorBlinking: 'smooth' as const,
    smoothScrolling: false, // Disabled for performance
    contextmenu: false, // Disabled for performance
    quickSuggestions: false, // Disabled for performance
    suggestOnTriggerCharacters: false, // Disabled for performance
    tabSize: 2,
    insertSpaces: true,
    renderLineHighlight: 'line' as const, // Simplified for performance
    selectionHighlight: false,
    occurrencesHighlight: false,
    bracketPairColorization: {
      enabled: false // Disabled for performance
    },
    // Simplified features for better performance
    autoIndent: 'advanced' as const,
    formatOnPaste: false, // Disabled for performance
    formatOnType: false, // Disabled for performance
    showFoldingControls: 'never' as const,
    matchBrackets: 'never' as const, // Disabled for performance
    autoClosingBrackets: 'never' as const, // Disabled for performance
    autoClosingQuotes: 'never' as const, // Disabled for performance
    autoSurround: 'never' as const, // Disabled for performance
    // Additional performance optimizations
    renderValidationDecorations: 'off' as const,
    renderControlCharacters: false,
    renderIndentGuides: false,
    guides: {
      indentation: false
    },
    lightbulb: {
      enabled: false
    },
    codeActionsOnSave: {
      'source.fixAll': false,
      'source.organizeImports': false
    }
  };
  return (
    <div className="rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
      <Suspense fallback={
        <div className="flex items-center justify-center" style={{ height }}>
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Loading Editor...</div>
          </div>
        </div>
      }>
        <Editor
          height={height}
          language={language}
          value={value}
          onChange={handleEditorChange}
          theme={theme === 'dark' ? 'vs-dark' : 'light'}
          options={editorOptions}
          loading={<div className="text-center p-4">Loading Monaco Editor...</div>}
        />
      </Suspense>
    </div>
  );
};

export default CodeEditor;