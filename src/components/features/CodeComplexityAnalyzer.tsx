import { useState, useEffect } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Download, CheckCircle, AlertTriangle, TrendingUp, AlertCircle } from 'lucide-react';
import { analyzeCodeComplexity } from '@/services/ai-service';
import { exportComplexityToMarkdown, exportComplexityToText, downloadFile } from '@/utils/export';
import type { ComplexityResult } from '@/types';
import type { AIConfig } from '@/types/ai-config';

interface CodeComplexityAnalyzerProps {
  code: string;
  language: string;
  aiConfig: AIConfig;
  onLoadingChange?: (loading: boolean) => void;
}

const getComplexityColor = (complexity: number) => {
  if (complexity >= 20) return { bg: 'bg-red-100', text: 'text-red-900', label: 'Very High', icon: AlertCircle };
  if (complexity >= 10) return { bg: 'bg-orange-100', text: 'text-orange-900', label: 'High', icon: AlertTriangle };
  if (complexity >= 5) return { bg: 'bg-yellow-100', text: 'text-yellow-900', label: 'Medium', icon: TrendingUp };
  return { bg: 'bg-green-100', text: 'text-green-900', label: 'Low', icon: CheckCircle };
};

const getMaintainabilityColor = (score: number) => {
  if (score >= 80) return 'text-green-600';
  if (score >= 60) return 'text-yellow-600';
  if (score >= 40) return 'text-orange-600';
  return 'text-red-600';
};

export default function CodeComplexityAnalyzer({ code, language, aiConfig, onLoadingChange }: CodeComplexityAnalyzerProps) {
  const [result, setResult] = useState<ComplexityResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedFunction, setExpandedFunction] = useState<string | null>(null);

  useEffect(() => {
    async function fetchComplexity() {
      setLoading(true);
      onLoadingChange?.(true);
      setError(null);
      try {
        const data = await analyzeCodeComplexity(code, language, aiConfig);
        setResult(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
        onLoadingChange?.(false);
      }
    }
    fetchComplexity();
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
      ? exportComplexityToMarkdown(result, code, language)
      : exportComplexityToText(result, code, language);
    const extension = format === 'markdown' ? 'md' : 'txt';
    const filename = `complexity-analysis-${Date.now()}.${extension}`;
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
        <span className="text-xs text-green-700">{result.functions.length} functions analyzed</span>
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

      {/* Maintainability Index */}
      <Card className="p-6">
        <div className="text-center">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Maintainability Index</h3>
          <div className={`text-5xl font-bold ${getMaintainabilityColor(result.maintainabilityIndex)}`}>
            {result.maintainabilityIndex}
          </div>
          <p className="text-xs text-gray-500 mt-2">out of 100</p>
          <p className="text-xs text-gray-600 mt-3">
            {result.maintainabilityIndex >= 80 ? '✅ Excellent maintainability' :
             result.maintainabilityIndex >= 60 ? '⚠️ Good maintainability' :
             result.maintainabilityIndex >= 40 ? '⚠️ Needs improvement' :
             '❌ Poor maintainability'}
          </p>
        </div>
      </Card>

      {/* Overall Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <Card className="p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">{result.overallMetrics.totalFunctions}</div>
            <div className="text-xs text-gray-600 mt-1">Total Functions</div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">{result.overallMetrics.complexFunctions}</div>
            <div className="text-xs text-gray-600 mt-1">Complex {'>'}10</div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{result.overallMetrics.averageCyclomaticComplexity.toFixed(1)}</div>
            <div className="text-xs text-gray-600 mt-1">Avg Cyclomatic</div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{result.overallMetrics.averageCognitiveComplexity.toFixed(1)}</div>
            <div className="text-xs text-gray-600 mt-1">Avg Cognitive</div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-700">{result.overallMetrics.maxNestingDepth}</div>
            <div className="text-xs text-gray-600 mt-1">Max Nesting</div>
          </div>
        </Card>
      </div>

      {/* Recommendations */}
      {result.recommendations.length > 0 && (
        <Card className="p-4 bg-blue-50 border-blue-200">
          <h3 className="text-sm font-semibold text-blue-900 mb-3">💡 Recommendations</h3>
          <ul className="space-y-2">
            {result.recommendations.map((rec, index) => (
              <li key={index} className="text-sm text-blue-800 flex items-start">
                <span className="mr-2">•</span>
                <span>{rec}</span>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {/* Functions List */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Function Analysis</h3>
        <div className="space-y-3">
          {result.functions.length === 0 ? (
            <Card className="p-6 text-center">
              <p className="text-gray-500">No functions detected in the code</p>
            </Card>
          ) : (
            result.functions.map((func) => {
              const complexityStyle = getComplexityColor(func.cyclomaticComplexity);
              const Icon = complexityStyle.icon;
              const isExpanded = expandedFunction === func.name;

              return (
                <Card key={func.name} className="overflow-hidden border-l-4" style={{ borderLeftColor: func.cyclomaticComplexity >= 10 ? '#f97316' : '#22c55e' }}>
                  <button
                    onClick={() => setExpandedFunction(isExpanded ? null : func.name)}
                    className="w-full p-4 text-left hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3 flex-1">
                        <Icon className={`w-5 h-5 ${complexityStyle.text} mt-0.5`} />
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <h3 className="font-semibold text-gray-900 font-mono text-sm">{func.name}()</h3>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${complexityStyle.bg} ${complexityStyle.text} font-medium`}>
                              {complexityStyle.label}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500">Line {func.lineNumber} • {func.linesOfCode} LOC • {func.parameterCount} params</p>
                        </div>
                      </div>
                      <span className="text-gray-400 ml-2">{isExpanded ? '▲' : '▼'}</span>
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="px-4 pb-4 space-y-4 border-t border-gray-200 pt-4 bg-gray-50">
                      {/* Metrics Grid */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <div className="bg-white p-3 rounded-lg border">
                          <div className="text-xs text-gray-600 mb-1">Cyclomatic</div>
                          <div className={`text-2xl font-bold ${func.cyclomaticComplexity >= 10 ? 'text-orange-600' : 'text-green-600'}`}>
                            {func.cyclomaticComplexity}
                          </div>
                        </div>
                        <div className="bg-white p-3 rounded-lg border">
                          <div className="text-xs text-gray-600 mb-1">Cognitive</div>
                          <div className={`text-2xl font-bold ${func.cognitiveComplexity >= 15 ? 'text-orange-600' : 'text-green-600'}`}>
                            {func.cognitiveComplexity}
                          </div>
                        </div>
                        <div className="bg-white p-3 rounded-lg border">
                          <div className="text-xs text-gray-600 mb-1">Nesting</div>
                          <div className={`text-2xl font-bold ${func.nestingDepth >= 4 ? 'text-orange-600' : 'text-green-600'}`}>
                            {func.nestingDepth}
                          </div>
                        </div>
                        <div className="bg-white p-3 rounded-lg border">
                          <div className="text-xs text-gray-600 mb-1">Parameters</div>
                          <div className={`text-2xl font-bold ${func.parameterCount >= 5 ? 'text-orange-600' : 'text-green-600'}`}>
                            {func.parameterCount}
                          </div>
                        </div>
                      </div>

                      {/* Issues */}
                      {func.issues.length > 0 && (
                        <div>
                          <h4 className="text-sm font-semibold text-gray-900 mb-2">⚠️ Complexity Issues</h4>
                          <ul className="space-y-1">
                            {func.issues.map((issue, index) => (
                              <li key={index} className="text-sm text-gray-700 flex items-start">
                                <span className="text-orange-500 mr-2">•</span>
                                <span>{issue}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Complexity Explanation */}
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <h4 className="text-xs font-semibold text-blue-900 mb-1">📖 Complexity Guide</h4>
                        <div className="text-xs text-blue-800 space-y-1">
                          <p>• <strong>Cyclomatic:</strong> Number of independent paths (1-10: simple, 11-20: moderate, 21+: complex)</p>
                          <p>• <strong>Cognitive:</strong> How hard to understand (0-7: low, 8-14: moderate, 15+: high)</p>
                          <p>• <strong>Nesting:</strong> Maximum depth of nested blocks (1-3: good, 4+: too deep)</p>
                        </div>
                      </div>
                    </div>
                  )}
                </Card>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
