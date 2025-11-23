import { useState, useEffect } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Download, Shield, AlertTriangle, Info, AlertCircle, XCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { analyzeSecurity } from '@/services/ai-service';
import { exportSecurityToMarkdown, exportSecurityToText, downloadFile } from '@/utils/export';
import type { SecurityResult, VulnerabilitySeverity, OWASPCategory } from '@/types';
import type { AIConfig } from '@/types/ai-config';

interface SecurityScannerProps {
  code: string;
  language: string;
  aiConfig: AIConfig;
  onLoadingChange?: (loading: boolean) => void;
}

const severityConfig = {
  critical: { bg: 'bg-red-100', text: 'text-red-900', icon: XCircle, label: 'Critical', border: 'border-red-300' },
  high: { bg: 'bg-orange-100', text: 'text-orange-900', icon: AlertCircle, label: 'High', border: 'border-orange-300' },
  medium: { bg: 'bg-yellow-100', text: 'text-yellow-900', icon: AlertTriangle, label: 'Medium', border: 'border-yellow-300' },
  low: { bg: 'bg-blue-100', text: 'text-blue-900', icon: Info, label: 'Low', border: 'border-blue-300' },
  info: { bg: 'bg-gray-100', text: 'text-gray-900', icon: Info, label: 'Info', border: 'border-gray-300' },
};

const categoryLabels: Record<OWASPCategory, string> = {
  'injection': 'Injection',
  'broken-auth': 'Broken Authentication',
  'sensitive-data': 'Sensitive Data Exposure',
  'xxe': 'XML External Entities (XXE)',
  'broken-access': 'Broken Access Control',
  'security-misconfig': 'Security Misconfiguration',
  'xss': 'Cross-Site Scripting (XSS)',
  'insecure-deserialization': 'Insecure Deserialization',
  'vulnerable-components': 'Vulnerable Components',
  'logging-monitoring': 'Insufficient Logging & Monitoring',
};

const getSecurityScoreColor = (score: number) => {
  if (score >= 80) return 'text-green-600';
  if (score >= 60) return 'text-yellow-600';
  if (score >= 40) return 'text-orange-600';
  return 'text-red-600';
};

export default function SecurityScanner({ code, language, aiConfig, onLoadingChange }: SecurityScannerProps) {
  const [result, setResult] = useState<SecurityResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSeverity, setSelectedSeverity] = useState<VulnerabilitySeverity | 'all'>('all');
  const [expandedVuln, setExpandedVuln] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSecurity() {
      setLoading(true);
      onLoadingChange?.(true);
      setError(null);
      try {
        const data = await analyzeSecurity(code, language, aiConfig);
        setResult(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
        onLoadingChange?.(false);
      }
    }
    fetchSecurity();
  }, [code, language, aiConfig, onLoadingChange]);

  const handleExport = (format: 'markdown' | 'text') => {
    if (!result) return;
    const content = format === 'markdown' 
      ? exportSecurityToMarkdown(result, code, language)
      : exportSecurityToText(result, code, language);
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `security-report-${timestamp}.${format === 'markdown' ? 'md' : 'txt'}`;
    downloadFile(content, filename, format);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="text-gray-600">Scanning for security vulnerabilities...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg bg-red-50 border border-red-200 p-6">
        <div className="flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
          <div>
            <h3 className="font-semibold text-red-900">Analysis Failed</h3>
            <p className="text-red-700 mt-1">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!result) return null;

  const filteredVulnerabilities = selectedSeverity === 'all' 
    ? result.vulnerabilities 
    : result.vulnerabilities.filter(v => v.severity === selectedSeverity);

  return (
    <div className="space-y-6">
      {/* Header with Security Score */}
      <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="bg-white p-3 rounded-lg shadow-sm">
              <Shield className="w-8 h-8 text-indigo-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Security Analysis</h2>
              <p className="text-gray-600 mt-1">{result.totalCount} vulnerabilities detected</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600 mb-1">Security Score</p>
            <p className={`text-4xl font-bold ${getSecurityScoreColor(result.securityScore)}`}>
              {result.securityScore}
              <span className="text-xl text-gray-500">/100</span>
            </p>
          </div>
        </div>
      </Card>

      {/* Severity Summary */}
      <div className="grid grid-cols-5 gap-4">
        {(Object.keys(severityConfig) as VulnerabilitySeverity[]).map((severity) => {
          const config = severityConfig[severity];
          const Icon = config.icon;
          const count = result.severitySummary[severity];
          return (
            <Card 
              key={severity}
              className={`cursor-pointer transition-all ${
                selectedSeverity === severity 
                  ? `${config.bg} ${config.border} border-2` 
                  : 'hover:shadow-md border border-gray-200'
              }`}
              onClick={() => setSelectedSeverity(selectedSeverity === severity ? 'all' : severity)}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{config.label}</p>
                  <p className={`text-2xl font-bold ${config.text}`}>{count}</p>
                </div>
                <Icon className={`w-8 h-8 ${config.text}`} />
              </div>
            </Card>
          );
        })}
      </div>

      {/* Export Buttons */}
      <div className="flex space-x-3">
        <Button
          onClick={() => handleExport('markdown')}
          className="flex items-center space-x-2"
          variant="outline"
        >
          <Download className="w-4 h-4" />
          <span>Export as Markdown</span>
        </Button>
        <Button
          onClick={() => handleExport('text')}
          className="flex items-center space-x-2"
          variant="outline"
        >
          <Download className="w-4 h-4" />
          <span>Export as Text</span>
        </Button>
        {selectedSeverity !== 'all' && (
          <Button
            onClick={() => setSelectedSeverity('all')}
            variant="outline"
          >
            Show All ({result.totalCount})
          </Button>
        )}
      </div>

      {/* Vulnerabilities List */}
      <div className="space-y-4">
        {filteredVulnerabilities.length === 0 ? (
          <Card className="bg-green-50 border-green-200">
            <div className="flex items-center space-x-3">
              <Shield className="w-6 h-6 text-green-600" />
              <div>
                <h3 className="font-semibold text-green-900">
                  {selectedSeverity === 'all' 
                    ? 'No vulnerabilities detected' 
                    : `No ${selectedSeverity} severity vulnerabilities`}
                </h3>
                <p className="text-green-700 text-sm">
                  {selectedSeverity === 'all'
                    ? 'Your code appears to be secure based on this analysis.'
                    : 'Try selecting a different severity level or showing all vulnerabilities.'}
                </p>
              </div>
            </div>
          </Card>
        ) : (
          filteredVulnerabilities.map((vuln) => {
            const config = severityConfig[vuln.severity];
            const Icon = config.icon;
            const isExpanded = expandedVuln === vuln.id;

            return (
              <Card key={vuln.id} className={`${config.border} border-l-4`}>
                <div className="space-y-3">
                  {/* Header */}
                  <div 
                    className="flex items-start justify-between cursor-pointer"
                    onClick={() => setExpandedVuln(isExpanded ? null : vuln.id)}
                  >
                    <div className="flex items-start space-x-3 flex-1">
                      <Icon className={`w-5 h-5 ${config.text} mt-1 flex-shrink-0`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="font-semibold text-gray-900">{vuln.title}</h3>
                          <span className={`px-2 py-0.5 text-xs font-medium rounded ${config.bg} ${config.text}`}>
                            {config.label}
                          </span>
                          <span className="px-2 py-0.5 text-xs font-medium rounded bg-gray-100 text-gray-700">
                            {categoryLabels[vuln.category]}
                          </span>
                          {vuln.cwe && (
                            <span className="px-2 py-0.5 text-xs font-medium rounded bg-purple-100 text-purple-700">
                              {vuln.cwe}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">Line {vuln.lineNumber}</p>
                        <p className="text-gray-700 mt-2">{vuln.description}</p>
                      </div>
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="w-5 h-5 text-gray-400 flex-shrink-0" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
                    )}
                  </div>

                  {/* Expanded Details */}
                  {isExpanded && (
                    <div className="space-y-4 pt-3 border-t border-gray-200">
                      {/* Code Snippet */}
                      <div>
                        <h4 className="text-sm font-semibold text-gray-700 mb-2">Vulnerable Code:</h4>
                        <pre className="bg-gray-900 text-gray-100 p-3 rounded-lg text-sm overflow-x-auto">
                          <code>{vuln.codeSnippet}</code>
                        </pre>
                      </div>

                      {/* Impact */}
                      <div>
                        <h4 className="text-sm font-semibold text-gray-700 mb-2">Impact:</h4>
                        <p className="text-gray-700 text-sm">{vuln.impact}</p>
                      </div>

                      {/* Remediation */}
                      <div>
                        <h4 className="text-sm font-semibold text-gray-700 mb-2">Remediation:</h4>
                        <p className="text-gray-700 text-sm whitespace-pre-line">{vuln.remediation}</p>
                      </div>

                      {/* References */}
                      {vuln.references.length > 0 && (
                        <div>
                          <h4 className="text-sm font-semibold text-gray-700 mb-2">References:</h4>
                          <ul className="list-disc list-inside space-y-1">
                            {vuln.references.map((ref, idx) => (
                              <li key={idx} className="text-sm text-blue-600 hover:underline">
                                <a href={ref} target="_blank" rel="noopener noreferrer">{ref}</a>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </Card>
            );
          })
        )}
      </div>

      {/* Recommendations */}
      {result.recommendations.length > 0 && (
        <Card className="bg-blue-50 border-blue-200">
          <h3 className="font-semibold text-blue-900 mb-3 flex items-center space-x-2">
            <Info className="w-5 h-5" />
            <span>Security Recommendations</span>
          </h3>
          <ul className="space-y-2">
            {result.recommendations.map((rec, index) => (
              <li key={index} className="flex items-start space-x-2 text-blue-800">
                <span className="text-blue-600 font-bold mt-0.5">•</span>
                <span className="text-sm">{rec}</span>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {/* OWASP Category Summary */}
      {result.totalCount > 0 && (
        <Card>
          <h3 className="font-semibold text-gray-900 mb-4">OWASP Top 10 Categories</h3>
          <div className="grid grid-cols-2 gap-3">
            {(Object.entries(result.categorySummary) as [OWASPCategory, number][])
              .filter(([, count]) => count > 0)
              .map(([category, count]) => (
                <div key={category} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-700">{categoryLabels[category]}</span>
                  <span className="px-2 py-1 bg-gray-200 text-gray-900 rounded font-semibold text-sm">
                    {count}
                  </span>
                </div>
              ))}
          </div>
        </Card>
      )}
    </div>
  );
}
