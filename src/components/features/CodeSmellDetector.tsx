import { useState, useEffect } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Download, CheckCircle, AlertTriangle, Flame, Zap } from 'lucide-react';
import { analyzeCodeSmells } from '@/services/ai-service';
import { exportSmellsToMarkdown, exportSmellsToText, downloadFile } from '@/utils/export';
import type { CodeSmellResult, SmellCategory } from '@/types';
import type { AIConfig } from '@/types/ai-config';

interface CodeSmellDetectorProps {
  code: string;
  language: string;
  aiConfig: AIConfig;
  onLoadingChange?: (loading: boolean) => void;
}

const categoryConfig = {
  'bloaters': { 
    label: 'Bloaters', 
    icon: Flame, 
    color: 'red', 
    bg: 'bg-red-50', 
    border: 'border-red-300', 
    text: 'text-red-900',
    badge: 'bg-red-100',
    description: 'Large classes, long methods, excessive parameters'
  },
  'oo-abusers': { 
    label: 'OO Abusers', 
    icon: AlertTriangle, 
    color: 'orange', 
    bg: 'bg-orange-50', 
    border: 'border-orange-300', 
    text: 'text-orange-900',
    badge: 'bg-orange-100',
    description: 'Improper object-oriented design'
  },
  'change-preventers': { 
    label: 'Change Preventers', 
    icon: Zap, 
    color: 'yellow', 
    bg: 'bg-yellow-50', 
    border: 'border-yellow-300', 
    text: 'text-yellow-900',
    badge: 'bg-yellow-100',
    description: 'Code that makes changes difficult'
  },
  'dispensables': { 
    label: 'Dispensables', 
    icon: AlertTriangle, 
    color: 'blue', 
    bg: 'bg-blue-50', 
    border: 'border-blue-300', 
    text: 'text-blue-900',
    badge: 'bg-blue-100',
    description: 'Dead code, unnecessary complexity'
  },
  'couplers': { 
    label: 'Couplers', 
    icon: Zap, 
    color: 'purple', 
    bg: 'bg-purple-50', 
    border: 'border-purple-300', 
    text: 'text-purple-900',
    badge: 'bg-purple-100',
    description: 'Excessive coupling between classes'
  },
};

const getSeverityColor = (severity: number) => {
  if (severity >= 8) return { bg: 'bg-red-100', text: 'text-red-900', label: 'Critical' };
  if (severity >= 6) return { bg: 'bg-orange-100', text: 'text-orange-900', label: 'High' };
  if (severity >= 4) return { bg: 'bg-yellow-100', text: 'text-yellow-900', label: 'Medium' };
  return { bg: 'bg-blue-100', text: 'text-blue-900', label: 'Low' };
};

export default function CodeSmellDetector({ code, language, aiConfig, onLoadingChange }: CodeSmellDetectorProps) {
  const [result, setResult] = useState<CodeSmellResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<SmellCategory | null>(null);
  const [expandedSmell, setExpandedSmell] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSmells() {
      setLoading(true);
      onLoadingChange?.(true);
      setError(null);
      try {
        const data = await analyzeCodeSmells(code, language, aiConfig);
        setResult(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
        onLoadingChange?.(false);
      }
    }
    fetchSmells();
  }, [code, language, aiConfig]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
        <h3 className="font-semibold text-red-900 mb-2">❌ Error</h3>
        <p className="text-sm text-red-800">{error}</p>
      </div>
    );
  }

  if (!result) {
    return <div className="text-center py-8 text-gray-500">No results available</div>;
  }

  const handleExport = (format: 'markdown' | 'text') => {
    const content = format === 'markdown' 
      ? exportSmellsToMarkdown(result, code, language)
      : exportSmellsToText(result, code, language);
    const extension = format === 'markdown' ? 'md' : 'txt';
    const filename = `code-smells-${Date.now()}.${extension}`;
    downloadFile(content, filename, format);
  };

  const filteredSmells = selectedCategory 
    ? result.smells.filter(smell => smell.category === selectedCategory)
    : result.smells;

  const getHealthColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-4">
      {/* Analysis Complete Banner */}
      <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
        <div className="flex items-center space-x-2">
          <CheckCircle className="w-5 h-5 text-green-600" />
          <span className="text-sm font-medium text-green-900">Analysis Complete</span>
        </div>
        <span className="text-xs text-green-700">{result.smells.length} code smells detected</span>
      </div>

      {/* Export Buttons */}
      <div className="flex justify-end space-x-2">
        <Button onClick={() => handleExport('markdown')} variant="outline" size="sm">
          <Download className="w-4 h-4 mr-2" />
          Export as Markdown
        </Button>
        <Button onClick={() => handleExport('text')} variant="outline" size="sm">
          <Download className="w-4 h-4 mr-2" />
          Export as Text
        </Button>
      </div>

      {/* Health Score */}
      <Card className="p-6">
        <div className="text-center">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Overall Code Health Score</h3>
          <div className={`text-5xl font-bold ${getHealthColor(result.overallHealthScore)}`}>
            {result.overallHealthScore}
          </div>
          <p className="text-xs text-gray-500 mt-2">out of 100</p>
        </div>
      </Card>

      {/* Category Summary */}
      <div className="grid grid-cols-5 gap-2">
        {Object.entries(result.categorySummary).map(([category, count]) => {
          const config = categoryConfig[category as SmellCategory];
          const Icon = config.icon;
          const isSelected = selectedCategory === category;
          
          return (
            <button
              key={category}
              onClick={() => setSelectedCategory(isSelected ? null : category as SmellCategory)}
              className={`${config.bg} ${config.border} border-2 rounded-lg p-3 transition-all ${
                isSelected ? 'ring-2 ring-primary shadow-md' : 'hover:shadow-sm'
              }`}
            >
              <Icon className={`w-6 h-6 ${config.text} mx-auto mb-1`} />
              <div className={`text-2xl font-bold ${config.text}`}>{count}</div>
              <div className="text-xs font-medium text-gray-700 mt-1">{config.label}</div>
            </button>
          );
        })}
      </div>

      {/* Category Filter Info */}
      {selectedCategory && (
        <div className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-700">
              Filtered by: {categoryConfig[selectedCategory].label}
            </span>
            <span className="text-xs text-gray-500">
              ({categoryConfig[selectedCategory].description})
            </span>
          </div>
          <Button 
            onClick={() => setSelectedCategory(null)} 
            variant="outline" 
            size="sm"
          >
            Clear Filter
          </Button>
        </div>
      )}

      {/* Smells List */}
      <div className="space-y-3">
        {filteredSmells.length === 0 ? (
          <Card className="p-6 text-center">
            <p className="text-gray-500">
              {selectedCategory 
                ? `No ${categoryConfig[selectedCategory].label.toLowerCase()} detected` 
                : 'No code smells detected! Your code looks great! 🎉'}
            </p>
          </Card>
        ) : (
          filteredSmells.map((smell) => {
            const config = categoryConfig[smell.category];
            const Icon = config.icon;
            const isExpanded = expandedSmell === smell.id;
            const severityStyle = getSeverityColor(smell.severity);

            return (
              <Card key={smell.id} className={`${config.border} border-l-4 overflow-hidden`}>
                <button
                  onClick={() => setExpandedSmell(isExpanded ? null : smell.id)}
                  className="w-full p-4 text-left hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1">
                      <Icon className={`w-5 h-5 ${config.text} mt-0.5`} />
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="font-semibold text-gray-900">{smell.title}</h3>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${config.badge} ${config.text}`}>
                            {config.label}
                          </span>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${severityStyle.bg} ${severityStyle.text} font-medium`}>
                            Severity: {smell.severity}/10
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">{smell.description}</p>
                        {smell.lineNumbers.length > 0 && (
                          <p className="text-xs text-gray-500 mt-1">
                            📍 Lines: {smell.lineNumbers.join(', ')}
                          </p>
                        )}
                      </div>
                    </div>
                    <span className="text-gray-400 ml-2">{isExpanded ? '▲' : '▼'}</span>
                  </div>
                </button>

                {isExpanded && (
                  <div className="px-4 pb-4 space-y-4 border-t border-gray-200 pt-4 bg-gray-50">
                    {/* Explanation */}
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900 mb-2">💡 Why This is a Problem</h4>
                      <p className="text-sm text-gray-700 leading-relaxed">{smell.explanation}</p>
                    </div>

                    {/* Remediation */}
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900 mb-2">🔧 How to Fix It</h4>
                      <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{smell.remediation}</p>
                    </div>

                    {/* Example */}
                    {smell.example && (
                      <div>
                        <h4 className="text-sm font-semibold text-gray-900 mb-2">📝 Example</h4>
                        <pre className="text-xs bg-gray-900 text-gray-100 p-3 rounded-md overflow-x-auto">
                          <code>{smell.example}</code>
                        </pre>
                      </div>
                    )}
                  </div>
                )}
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
