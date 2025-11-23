import { useState, useEffect } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Download, CheckCircle } from 'lucide-react';
import { analyzeCodeExplainer } from '@/services/ai-service';
import { exportExplainerToMarkdown, exportExplainerToText, downloadFile } from '@/utils/export';
import type { ExplainerResult } from '@/types';
import type { AIConfig } from '@/types/ai-config';

interface CodeExplainerProps {
  code: string;
  language: string;
  aiConfig: AIConfig;
  onLoadingChange?: (loading: boolean) => void;
}

export default function CodeExplainer({ code, language, aiConfig, onLoadingChange }: CodeExplainerProps) {
  const [result, setResult] = useState<ExplainerResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchExplanation() {
      setLoading(true);
      onLoadingChange?.(true);
      setError(null);
      try {
        const data = await analyzeCodeExplainer(code, language, aiConfig);
        setResult(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
        onLoadingChange?.(false);
      }
    }
    fetchExplanation();
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
      ? exportExplainerToMarkdown(result, code, language)
      : exportExplainerToText(result, code, language);
    const extension = format === 'markdown' ? 'md' : 'txt';
    const filename = `code-explanation-${Date.now()}.${extension}`;
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
        <span className="text-xs text-green-700">{result.explanations.length} explanations generated</span>
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

      {/* Summary */}
      <Card className="p-4 bg-blue-50 border-blue-200">
        <h3 className="font-semibold text-blue-900 mb-2">📖 Summary</h3>
        <p className="text-sm text-blue-800">{result.summary}</p>
      </Card>

      {/* Line by Line Explanations */}
      <div className="space-y-3">
        <h3 className="font-semibold text-gray-900">Line-by-Line Explanation</h3>
        {result.explanations.map((exp) => (
          <Card key={exp.lineNumber} className="p-4 hover:shadow-md transition-shadow">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-sm font-medium">
                {exp.lineNumber}
              </div>
              <div className="flex-1 space-y-2">
                <div className="bg-gray-50 p-2 rounded font-mono text-sm text-gray-800">
                  {exp.code}
                </div>
                <div>
                  <p className="text-sm text-gray-700 mb-1">
                    <span className="font-medium">What it does:</span> {exp.explanation}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Why:</span> {exp.why}
                  </p>
                  {exp.issues && exp.issues.length > 0 && (
                    <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded">
                      <p className="text-xs font-medium text-yellow-800 mb-1">⚠️ Potential Issues:</p>
                      <ul className="text-xs text-yellow-700 list-disc list-inside">
                        {exp.issues.map((issue, idx) => (
                          <li key={idx}>{issue}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
