export type FeatureType = 'explainer' | 'bugs' | 'refactor' | 'smells' | 'complexity' | 'security';

export interface AnalysisResult {
  type: FeatureType;
  data: ExplainerResult | BugFinderResult | RefactorResult | CodeSmellResult | ComplexityResult | SecurityResult;
}

export interface ExplainerResult {
  explanations: LineExplanation[];
  summary: string;
}

export interface LineExplanation {
  lineNumber: number;
  code: string;
  explanation: string;
  why: string;
  issues?: string[];
}

export interface BugFinderResult {
  bugs: Bug[];
  totalCount: number;
  severitySummary: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
}

export interface Bug {
  id: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  lineNumber: number;
  description: string;
  explanation: string;
  suggestedFix: string;
  category: string;
}

export interface RefactorResult {
  suggestions: RefactorSuggestion[];
  overallScore: number;
}

export interface RefactorSuggestion {
  id: string;
  title: string;
  priority: 'high' | 'medium' | 'low';
  impact: string;
  lineNumbers: number[];
  description: string;
  before: string;
  after: string;
  benefits: string[];
}

export type SmellCategory = 'bloaters' | 'oo-abusers' | 'change-preventers' | 'dispensables' | 'couplers';

export interface CodeSmell {
  id: string;
  title: string;
  category: SmellCategory;
  severity: number; // 1-10 scale
  lineNumbers: number[];
  description: string;
  explanation: string;
  remediation: string;
  example?: string;
}

export interface CodeSmellResult {
  smells: CodeSmell[];
  totalCount: number;
  categorySummary: {
    bloaters: number;
    'oo-abusers': number;
    'change-preventers': number;
    dispensables: number;
    couplers: number;
  };
  overallHealthScore: number; // 0-100
}

export interface FunctionComplexity {
  name: string;
  lineNumber: number;
  cyclomaticComplexity: number;
  cognitiveComplexity: number;
  nestingDepth: number;
  parameterCount: number;
  linesOfCode: number;
  issues: string[];
}

export interface ComplexityResult {
  functions: FunctionComplexity[];
  overallMetrics: {
    averageCyclomaticComplexity: number;
    averageCognitiveComplexity: number;
    maxNestingDepth: number;
    totalFunctions: number;
    complexFunctions: number; // complexity > 10
  };
  maintainabilityIndex: number; // 0-100
  recommendations: string[];
}

export type VulnerabilitySeverity = 'critical' | 'high' | 'medium' | 'low' | 'info';

export type OWASPCategory = 
  | 'injection' 
  | 'broken-auth' 
  | 'sensitive-data' 
  | 'xxe' 
  | 'broken-access' 
  | 'security-misconfig' 
  | 'xss' 
  | 'insecure-deserialization' 
  | 'vulnerable-components' 
  | 'logging-monitoring';

export interface Vulnerability {
  id: string;
  title: string;
  severity: VulnerabilitySeverity;
  category: OWASPCategory;
  description: string;
  lineNumber: number;
  codeSnippet: string;
  impact: string;
  remediation: string;
  references: string[];
  cwe?: string; // Common Weakness Enumeration ID
}

export interface SecurityResult {
  vulnerabilities: Vulnerability[];
  totalCount: number;
  severitySummary: {
    critical: number;
    high: number;
    medium: number;
    low: number;
    info: number;
  };
  categorySummary: Record<OWASPCategory, number>;
  securityScore: number; // 0-100, higher is better
  recommendations: string[];
}

export const SUPPORTED_LANGUAGES = [
  { value: 'javascript', label: 'JavaScript', monaco: 'javascript' },
  { value: 'typescript', label: 'TypeScript', monaco: 'typescript' },
  { value: 'python', label: 'Python', monaco: 'python' },
  { value: 'java', label: 'Java', monaco: 'java' },
  { value: 'csharp', label: 'C#', monaco: 'csharp' },
  { value: 'cpp', label: 'C++', monaco: 'cpp' },
  { value: 'go', label: 'Go', monaco: 'go' },
  { value: 'rust', label: 'Rust', monaco: 'rust' },
  { value: 'ruby', label: 'Ruby', monaco: 'ruby' },
  { value: 'php', label: 'PHP', monaco: 'php' },
];

export const FEATURES = [
  {
    value: 'explainer' as const,
    label: 'Code Explainer',
    description: 'Get line-by-line explanation of your code',
    icon: '📖',
  },
  {
    value: 'bugs' as const,
    label: 'Bug Finder',
    description: 'Find potential bugs and get fixes',
    icon: '🐛',
  },
  {
    value: 'refactor' as const,
    label: 'Code Refactoring',
    description: 'Get suggestions to improve code quality',
    icon: '⚡',
  },
  {
    value: 'smells' as const,
    label: 'Code Smell Detector',
    description: 'Identify design issues and anti-patterns',
    icon: '🦨',
  },
  {
    value: 'complexity' as const,
    label: 'Complexity Analyzer',
    description: 'Measure code complexity and maintainability',
    icon: '📊',
  },
  {
    value: 'security' as const,
    label: 'Security Scanner',
    description: 'Detect security vulnerabilities and OWASP risks',
    icon: '🔒',
  },
];
