import { useState } from 'react';
import { Code2 } from 'lucide-react';
import { FEATURES, FeatureType } from './types';
import { type AIConfig } from './types/ai-config';
import { Select } from './components/ui/select';
import { Button } from './components/ui/button';
import { ToastContainer } from './components/ui/toast';
import AIConfigPanel from './components/AIConfigPanel';
import CodeEditor from './components/CodeEditor';
import CodeExplainer from './components/features/CodeExplainer';
import BugFinder from './components/features/BugFinder';
import RefactoringSuggester from './components/features/RefactoringSuggester';
import CodeSmellDetector from './components/features/CodeSmellDetector';
import CodeComplexityAnalyzer from './components/features/CodeComplexityAnalyzer';
import SecurityScanner from './components/features/SecurityScanner';
import { detectLanguage } from './utils/language-detector';

interface Toast {
  id: string;
  message: string;
  type?: 'success' | 'error' | 'warning' | 'info';
}

function App() {
  const [selectedFeature, setSelectedFeature] = useState<FeatureType>('explainer');
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [showResults, setShowResults] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [aiConfig, setAiConfig] = useState<AIConfig>({
    provider: 'openai',
    model: 'gpt-4o-mini',
    apiKey: '',
  });

  const showToast = (message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info') => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, message, type }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  const handleCodeChange = (newCode: string) => {
    setCode(newCode);
    
    // Auto-detect language when code is pasted (significant content change)
    if (newCode.length > code.length + 10) { // Likely a paste operation
      const detectedLanguage = detectLanguage(newCode);
      if (detectedLanguage !== language) {
        setLanguage(detectedLanguage);
      }
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check file size (max 1MB)
    if (file.size > 1024 * 1024) {
      showToast('File size must be less than 1MB', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setCode(content);
      
      // Detect language from file extension
      const extension = file.name.split('.').pop()?.toLowerCase();
      const languageMap: Record<string, string> = {
        'js': 'javascript',
        'jsx': 'javascript',
        'ts': 'typescript',
        'tsx': 'typescript',
        'py': 'python',
        'java': 'java',
        'cs': 'csharp',
        'cpp': 'cpp',
        'cc': 'cpp',
        'cxx': 'cpp',
        'go': 'go',
        'rs': 'rust',
        'rb': 'ruby',
        'php': 'php',
      };
      
      if (extension && languageMap[extension]) {
        setLanguage(languageMap[extension]);
      } else {
        // Fallback to content-based detection
        const detectedLanguage = detectLanguage(content);
        setLanguage(detectedLanguage);
      }
      
      setShowResults(false);
    };
    
    reader.onerror = () => {
      showToast('Error reading file. Please try again.', 'error');
    };
    
    reader.readAsText(file);
    
    // Reset input so same file can be uploaded again
    event.target.value = '';
  };

  const handleAnalyze = () => {
    if (!code.trim()) {
      showToast('Please enter some code to analyze', 'warning');
      return;
    }

    // Check if API key is required but not provided
    if (!aiConfig.apiKey) {
      showToast(`Please enter your ${aiConfig.provider.toUpperCase()} API key in the AI Configuration section`, 'error');
      return;
    }

    // Immediately show results panel - feature components handle their own loading
    setShowResults(true);
  };

  const handleClear = () => {
    setCode('');
    setShowResults(false);
  };

  const currentFeature = FEATURES.find(f => f.value === selectedFeature);

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white sticky top-0 z-50">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <Code2 className="w-8 h-8 text-primary" />
              <div>
                <h1 className="text-xl font-semibold text-gray-900">CodeQuality</h1>
                <p className="text-xs text-gray-500">AI-Powered Code Analysis</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                {currentFeature?.icon} {currentFeature?.label}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* AI Configuration Panel */}
        <div className="mb-6">
          <AIConfigPanel config={aiConfig} onChange={setAiConfig} />
        </div>

        {/* Control Panel */}
        <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Feature Selector */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Analysis Type
              </label>
              <Select
                value={selectedFeature}
                onChange={(e) => {
                  setSelectedFeature(e.target.value as FeatureType);
                  setShowResults(false);
                }}
                className="w-full"
              >
                {FEATURES.map((feature) => (
                  <option key={feature.value} value={feature.value}>
                    {feature.icon} {feature.label} - {feature.description}
                  </option>
                ))}
              </Select>
            </div>

            {/* Language Selector */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Language
              </label>
              <Select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full"
              >
                <option value="javascript">JavaScript</option>
                <option value="typescript">TypeScript</option>
                <option value="python">Python</option>
                <option value="java">Java</option>
                <option value="csharp">C#</option>
                <option value="cpp">C++</option>
                <option value="go">Go</option>
                <option value="rust">Rust</option>
                <option value="ruby">Ruby</option>
                <option value="php">PHP</option>
              </Select>
            </div>

            {/* Actions */}
            <div className="flex items-end space-x-2">
              <Button
                onClick={handleAnalyze}
                disabled={!code.trim() || isAnalyzing}
                className="flex-1"
              >
                {isAnalyzing ? 'Analyzing...' : 'Analyze Code'}
              </Button>
              <Button
                onClick={handleClear}
                variant="outline"
              >
                Clear
              </Button>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Code Editor */}
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
            <div className="bg-gray-50 border-b border-gray-200 px-4 py-3">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-semibold text-gray-900">Code Input</h2>
                  <p className="text-xs text-gray-500 mt-1">
                    Paste your code or upload a file
                  </p>
                </div>
                <div>
                  <input
                    type="file"
                    id="file-upload"
                    className="hidden"
                    accept=".js,.jsx,.ts,.tsx,.py,.java,.cs,.cpp,.cc,.cxx,.go,.rs,.rb,.php,.c,.h"
                    onChange={handleFileUpload}
                  />
                  <Button
                    onClick={() => document.getElementById('file-upload')?.click()}
                    variant="outline"
                    className="text-xs h-8 px-3"
                  >
                    📁 Upload File
                  </Button>
                </div>
              </div>
            </div>
            <CodeEditor
              value={code}
              onChange={handleCodeChange}
              language={language}
            />
          </div>

          {/* Results Panel */}
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
            <div className="bg-gray-50 border-b border-gray-200 px-4 py-3">
              <h2 className="text-sm font-semibold text-gray-900">Analysis Results</h2>
              <p className="text-xs text-gray-500 mt-1">
                {showResults ? 'Review the analysis below' : 'Results will appear here after analysis'}
              </p>
            </div>
            <div className="p-4 min-h-[600px] max-h-[600px] overflow-y-auto">
              {!code.trim() ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <div className="text-6xl mb-4 opacity-40">{currentFeature?.icon}</div>
                  <h3 className="text-lg font-medium text-gray-400 mb-2">
                    No Code to Analyze
                  </h3>
                  <p className="text-sm text-gray-400 max-w-md">
                    Paste your code in the editor to enable analysis and see results here.
                  </p>
                </div>
              ) : !showResults ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <div className="text-6xl mb-4">{currentFeature?.icon}</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {currentFeature?.label}
                  </h3>
                  <p className="text-sm text-gray-500 max-w-md">
                    {currentFeature?.description}. Click "Analyze Code" to get started.
                  </p>
                </div>
              ) : (
                <>
                  {selectedFeature === 'explainer' && (
                    <CodeExplainer 
                      code={code} 
                      language={language} 
                      aiConfig={aiConfig}
                      onLoadingChange={setIsAnalyzing}
                    />
                  )}
                  {selectedFeature === 'bugs' && (
                    <BugFinder 
                      code={code} 
                      language={language} 
                      aiConfig={aiConfig}
                      onLoadingChange={setIsAnalyzing}
                    />
                  )}
                  {selectedFeature === 'refactor' && (
                    <RefactoringSuggester 
                      code={code} 
                      language={language} 
                      aiConfig={aiConfig}
                      onLoadingChange={setIsAnalyzing}
                    />
                  )}
                  {selectedFeature === 'smells' && (
                    <CodeSmellDetector 
                      code={code} 
                      language={language} 
                      aiConfig={aiConfig}
                      onLoadingChange={setIsAnalyzing}
                    />
                  )}
                  {selectedFeature === 'complexity' && (
                    <CodeComplexityAnalyzer 
                      code={code} 
                      language={language} 
                      aiConfig={aiConfig}
                      onLoadingChange={setIsAnalyzing}
                    />
                  )}
                  {selectedFeature === 'security' && (
                    <SecurityScanner 
                      code={code} 
                      language={language} 
                      aiConfig={aiConfig}
                      onLoadingChange={setIsAnalyzing}
                    />
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </main>
      
      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}

export default App;
