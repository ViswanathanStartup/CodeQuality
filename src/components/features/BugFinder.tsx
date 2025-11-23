import { useState, useEffect } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Download, AlertCircle, AlertTriangle, Info, CheckCircle, XCircle } from 'lucide-react';
import { analyzeBugFinder } from '@/services/ai-service';
import { exportBugsToMarkdown, exportBugsToText, downloadFile } from '@/utils/export';
import type { BugFinderResult, Bug } from '@/types';
import type { AIConfig } from '@/types/ai-config';

interface BugFinderProps {
  code: string;
  language: string;
  aiConfig: AIConfig;
  onLoadingChange?: (loading: boolean) => void;
}

const severityConfig = {
  critical: { color: 'red', icon: XCircle, bg: 'bg-red-50', border: 'border-red-300', text: 'text-red-900' },
  high: { color: 'orange', icon: AlertCircle, bg: 'bg-orange-50', border: 'border-orange-300', text: 'text-orange-900' },
  medium: { color: 'yellow', icon: AlertTriangle, bg: 'bg-yellow-50', border: 'border-yellow-300', text: 'text-yellow-900' },
  low: { color: 'blue', icon: Info, bg: 'bg-blue-50', border: 'border-blue-300', text: 'text-blue-900' },
};

export default function BugFinder({ code, language, aiConfig, onLoadingChange }: BugFinderProps) {
  const [result, setResult] = useState<BugFinderResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSeverity, setSelectedSeverity] = useState<string | null>(null);

  useEffect(() => {
    async function fetchBugs() {
      setLoading(true);
      onLoadingChange?.(true);
      setError(null);
      try {
        const data = await analyzeBugFinder(code, language, aiConfig);
        setResult(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
        onLoadingChange?.(false);
      }
    }
    fetchBugs();
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

  const filteredBugs = selectedSeverity
    ? result.bugs.filter(bug => bug.severity === selectedSeverity)
    : result.bugs;

  const handleExport = (format: 'markdown' | 'text') => {
    const content = format === 'markdown' 
      ? exportBugsToMarkdown(result, code, language)
      : exportBugsToText(result, code, language);
    const extension = format === 'markdown' ? 'md' : 'txt';
    const filename = `bug-analysis-${Date.now()}.${extension}`;
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
        <span className="text-xs text-green-700">{result.bugs.length} issues found</span>
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

      {/* Summary Dashboard */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="p-3 cursor-pointer hover:shadow-md transition-shadow" onClick={() => setSelectedSeverity(null)}>
          <div className="text-2xl font-bold text-gray-900">{result.totalCount}</div>
          <div className="text-xs text-gray-600">Total Issues</div>
        </Card>
        <Card 
          className={`p-3 cursor-pointer hover:shadow-md transition-shadow ${selectedSeverity === 'critical' ? 'ring-2 ring-red-500' : ''}`}
          onClick={() => setSelectedSeverity(selectedSeverity === 'critical' ? null : 'critical')}
        >
          <div className="text-2xl font-bold text-red-600">{result.severitySummary.critical}</div>
          <div className="text-xs text-red-700">Critical</div>
        </Card>
        <Card 
          className={`p-3 cursor-pointer hover:shadow-md transition-shadow ${selectedSeverity === 'high' ? 'ring-2 ring-orange-500' : ''}`}
          onClick={() => setSelectedSeverity(selectedSeverity === 'high' ? null : 'high')}
        >
          <div className="text-2xl font-bold text-orange-600">{result.severitySummary.high}</div>
          <div className="text-xs text-orange-700">High</div>
        </Card>
        <Card 
          className={`p-3 cursor-pointer hover:shadow-md transition-shadow ${selectedSeverity === 'medium' ? 'ring-2 ring-yellow-500' : ''}`}
          onClick={() => setSelectedSeverity(selectedSeverity === 'medium' ? null : 'medium')}
        >
          <div className="text-2xl font-bold text-yellow-600">{result.severitySummary.medium}</div>
          <div className="text-xs text-yellow-700">Medium</div>
        </Card>
      </div>

      {/* Bug List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">
            {selectedSeverity ? `${selectedSeverity.toUpperCase()} Issues` : 'All Issues'}
          </h3>
          {selectedSeverity && (
            <button 
              onClick={() => setSelectedSeverity(null)}
              className="text-sm text-primary hover:underline"
            >
              Clear filter
            </button>
          )}
        </div>

        {filteredBugs.length === 0 ? (
          <Card className="p-6 text-center">
            <p className="text-gray-500">No issues found in this category</p>
          </Card>
        ) : (
          filteredBugs.map((bug: Bug) => {
            const config = severityConfig[bug.severity];
            const Icon = config.icon;
            
            return (
              <Card key={bug.id} className={`p-4 border-l-4 ${config.border}`}>
                <div className="flex items-start space-x-3">
                  <Icon className={`w-5 h-5 mt-0.5 ${config.text}`} />
                  <div className="flex-1 space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className={`text-xs font-medium px-2 py-0.5 rounded ${config.bg} ${config.text}`}>
                            {bug.severity.toUpperCase()}
                          </span>
                          <span className="text-xs text-gray-500">Line {bug.lineNumber}</span>
                          <span className="text-xs text-gray-500">• {bug.category}</span>
                        </div>
                        <h4 className="font-semibold text-gray-900 mt-1">{bug.description}</h4>
                      </div>
                    </div>
                    <p className="text-sm text-gray-700">{bug.explanation}</p>
                    <div className="bg-green-50 border border-green-200 rounded p-3">
                      <p className="text-xs font-medium text-green-900 mb-1">✅ Suggested Fix:</p>
                      <pre className="text-xs text-green-800 font-mono whitespace-pre-wrap">
                        {bug.suggestedFix}
                      </pre>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
