import React from 'react';
import Editor from '@monaco-editor/react';
import { useTheme } from '../contexts/ThemeContext';

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
    folding: true,
    automaticLayout: true,
    wordWrap: 'on' as const,
    scrollBeyondLastLine: false,
    renderWhitespace: 'boundary' as const,
    cursorBlinking: 'smooth' as const,
    smoothScrolling: true,
    contextmenu: true,
    quickSuggestions: true,
    suggestOnTriggerCharacters: true,
    tabSize: 2,
    insertSpaces: true,
    renderLineHighlight: 'all' as const,
    selectionHighlight: false,
    occurrencesHighlight: false,
    bracketPairColorization: {
      enabled: true
    },
    // Enhanced features
    autoIndent: 'full' as const,
    formatOnPaste: true,
    formatOnType: true,
    showFoldingControls: 'always' as const,
    matchBrackets: 'always' as const,
    autoClosingBrackets: 'always' as const,
    autoClosingQuotes: 'always' as const,
    autoSurround: 'languageDefined' as const
  };
  return (
    <div className="rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
      <Editor
        height={height}
        language={language}
        value={value}
        onChange={handleEditorChange}
        theme={theme === 'dark' ? 'vs-dark' : 'light'}
        options={editorOptions}
      />
    </div>
  );
};

export default CodeEditor;