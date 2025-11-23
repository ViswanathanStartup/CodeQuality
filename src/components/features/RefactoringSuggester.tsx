import { useState, useEffect } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Download, Sparkles, TrendingUp, Zap, CheckCircle } from 'lucide-react';
import { analyzeCodeRefactoring } from '@/services/ai-service';
import { exportRefactoringToMarkdown, exportRefactoringToText, downloadFile } from '@/utils/export';
import type { RefactorResult, RefactorSuggestion } from '@/types';
import type { AIConfig } from '@/types/ai-config';

interface RefactoringSuggesterProps {
  code: string;
  language: string;
  aiConfig: AIConfig;
  onLoadingChange?: (loading: boolean) => void;
}

const priorityConfig = {
  high: { color: 'purple', icon: Sparkles, bg: 'bg-purple-50', border: 'border-purple-300', text: 'text-purple-900', badge: 'bg-purple-100' },
  medium: { color: 'blue', icon: TrendingUp, bg: 'bg-blue-50', border: 'border-blue-300', text: 'text-blue-900', badge: 'bg-blue-100' },
  low: { color: 'gray', icon: Zap, bg: 'bg-gray-50', border: 'border-gray-300', text: 'text-gray-900', badge: 'bg-gray-100' },
};

export default function RefactoringSuggester({ code, language, aiConfig, onLoadingChange }: RefactoringSuggesterProps) {
  const [result, setResult] = useState<RefactorResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchRefactorings() {
      setLoading(true);
      onLoadingChange?.(true);
      setError(null);
      try {
        const data = await analyzeCodeRefactoring(code, language, aiConfig);
        setResult(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
        onLoadingChange?.(false);
      }
    }
    fetchRefactorings();
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

  const toggleExpanded = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const handleExport = (format: 'markdown' | 'text') => {
    const content = format === 'markdown' 
      ? exportRefactoringToMarkdown(result, code, language)
      : exportRefactoringToText(result, code, language);
    const extension = format === 'markdown' ? 'md' : 'txt';
    const filename = `refactoring-analysis-${Date.now()}.${extension}`;
    downloadFile(content, filename, format);
  };

  return (
    <div className="space-y-4">
      {/* Analysis Complete Banner */}
      <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
        <div className="flex items-center space-x-2">
          <CheckCircle className="w-5 h-5 text-green-600" />
          <span className="text-sm font-medium text-green-900">Analysis Complete</span>
        </div>
        <span className="text-xs text-green-700">Quality Score: {result.overallScore}/100</span>
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

      {/* Overall Score */}
      <Card className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-gray-900 mb-1">Code Quality Score</h3>
            <p className="text-sm text-gray-600">{result.suggestions.length} improvement suggestions found</p>
          </div>
          <div className="text-right">
            <div className={`text-4xl font-bold ${getScoreColor(result.overallScore)}`}>
              {result.overallScore}
            </div>
            <div className="text-xs text-gray-600">out of 100</div>
          </div>
        </div>
      </Card>

      {/* Suggestions */}
      <div className="space-y-3">
        <h3 className="font-semibold text-gray-900">Refactoring Suggestions</h3>
        {result.suggestions.map((suggestion: RefactorSuggestion) => {
          const config = priorityConfig[suggestion.priority];
          const Icon = config.icon;
          const isExpanded = expandedId === suggestion.id;

          return (
            <Card key={suggestion.id} className={`border-l-4 ${config.border} overflow-hidden`}>
              <div className="p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    <Icon className={`w-5 h-5 mt-0.5 ${config.text}`} />
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded ${config.badge} ${config.text}`}>
                          {suggestion.priority.toUpperCase()} IMPACT
                        </span>
                        <span className="text-xs text-gray-500">
                          Lines: {suggestion.lineNumbers.join(', ')}
                        </span>
                      </div>
                      <h4 className="font-semibold text-gray-900">{suggestion.title}</h4>
                      <p className="text-sm text-gray-600 mt-1">{suggestion.description}</p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => toggleExpanded(suggestion.id)}
                  >
                    {isExpanded ? 'Hide Details' : 'Show Details'}
                  </Button>
                </div>

                {isExpanded && (
                  <div className="space-y-3 pt-3 border-t border-gray-200">
                    {/* Impact */}
                    <div>
                      <p className="text-xs font-medium text-gray-700 mb-1">💡 Impact:</p>
                      <p className="text-sm text-gray-600">{suggestion.impact}</p>
                    </div>

                    {/* Benefits */}
                    <div>
                      <p className="text-xs font-medium text-gray-700 mb-1">✨ Benefits:</p>
                      <ul className="text-sm text-gray-600 list-disc list-inside space-y-1">
                        {suggestion.benefits.map((benefit, idx) => (
                          <li key={idx}>{benefit}</li>
                        ))}
                      </ul>
                    </div>

                    {/* Before & After */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <p className="text-xs font-medium text-red-700 mb-1">❌ Before:</p>
                        <pre className="text-xs bg-red-50 border border-red-200 rounded p-2 font-mono whitespace-pre-wrap overflow-x-auto">
                          {suggestion.before}
                        </pre>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-green-700 mb-1">✅ After:</p>
                        <pre className="text-xs bg-green-50 border border-green-200 rounded p-2 font-mono whitespace-pre-wrap overflow-x-auto">
                          {suggestion.after}
                        </pre>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
