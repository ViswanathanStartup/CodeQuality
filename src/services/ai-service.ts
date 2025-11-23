import type { AIConfig } from '@/types/ai-config';
import type { ExplainerResult, BugFinderResult, RefactorResult, CodeSmellResult, ComplexityResult, SecurityResult } from '@/types';

// Sanitize API key to remove any non-ASCII characters
function sanitizeApiKey(apiKey: string): string {
  return apiKey.trim().replace(/[^\x00-\x7F]/g, '');
}

export async function analyzeCodeExplainer(
  code: string, 
  language: string,
  aiConfig: AIConfig
): Promise<ExplainerResult> {
  const prompt = `You are a code analysis expert. Analyze this ${language} code and provide a line-by-line explanation.

Code:
\`\`\`${language}
${code}
\`\`\`

Provide the response in the following JSON format:
{
  "summary": "A brief 2-3 sentence summary of what this code does",
  "explanations": [
    {
      "lineNumber": 1,
      "code": "actual code line",
      "explanation": "What this line does in simple terms",
      "why": "Why this line is needed",
      "issues": ["optional issue 1", "optional issue 2"]
    }
  ]
}

Focus on clarity and educational value. Include issues array only if there are potential problems.`;

  const response = await callAI(prompt, aiConfig);
  return parseExplainerResponse(response);
}

export async function analyzeBugFinder(
  code: string, 
  language: string,
  aiConfig: AIConfig
): Promise<BugFinderResult> {
  const prompt = `You are a bug detection expert. Analyze this ${language} code for potential bugs and issues.

Code:
\`\`\`${language}
${code}
\`\`\`

Provide the response in the following JSON format:
{
  "bugs": [
    {
      "id": "bug-1",
      "severity": "critical|high|medium|low",
      "lineNumber": 5,
      "description": "Brief description of the bug",
      "explanation": "Detailed explanation of why this is a problem",
      "suggestedFix": "Code example of how to fix it",
      "category": "Category like 'Null Safety', 'Array Safety', etc."
    }
  ],
  "totalCount": 3,
  "severitySummary": {
    "critical": 1,
    "high": 1,
    "medium": 1,
    "low": 0
  }
}

Look for: null pointer issues, array bounds, resource leaks, type mismatches, infinite loops, security issues.`;

  const response = await callAI(prompt, aiConfig);
  return parseBugFinderResponse(response);
}

export async function analyzeCodeRefactoring(
  code: string,
  language: string,
  aiConfig: AIConfig
): Promise<RefactorResult> {
  const prompt = `You are a code analysis expert. Analyze this ${language} code and suggest refactoring improvements.

Code:
\`\`\`${language}
${code}
\`\`\`

Provide the response in the following JSON format:
{
  "overallScore": 75,
  "suggestions": [
    {
      "id": "refactor-1",
      "title": "Brief title of suggestion",
      "priority": "high|medium|low",
      "impact": "Description of the impact",
      "lineNumbers": [5, 6, 7],
      "description": "Detailed description",
      "before": "code before refactoring",
      "after": "code after refactoring",
      "benefits": ["benefit 1", "benefit 2", "benefit 3"]
    }
  ]
}

Consider: DRY principle, naming, complexity, modern features, code organization. Score from 0-100.`;

  const response = await callAI(prompt, aiConfig);
  return parseRefactoringResponse(response);
}

export async function analyzeCodeSmells(
  code: string,
  language: string,
  aiConfig: AIConfig
): Promise<CodeSmellResult> {
  const prompt = `You are a code quality expert specializing in detecting code smells and design issues. Analyze this ${language} code for anti-patterns and design problems.

Code:
\`\`\`${language}
${code}
\`\`\`

Provide the response in the following JSON format:
{
  "smells": [
    {
      "id": "smell-1",
      "title": "Descriptive title of the smell",
      "category": "bloaters|oo-abusers|change-preventers|dispensables|couplers",
      "severity": 7,
      "lineNumbers": [5, 6, 7],
      "description": "Brief description of the issue",
      "explanation": "Detailed explanation of why this is problematic",
      "remediation": "Specific steps to fix this smell",
      "example": "Optional: code example showing the fix"
    }
  ],
  "categorySummary": {
    "bloaters": 2,
    "oo-abusers": 1,
    "change-preventers": 0,
    "dispensables": 1,
    "couplers": 0
  },
  "overallHealthScore": 75
}

Categories:
- bloaters: Large classes, long methods, long parameter lists, primitive obsession
- oo-abusers: Switch statements, refused bequest, alternative classes with different interfaces
- change-preventers: Divergent change, shotgun surgery, parallel inheritance hierarchies
- dispensables: Dead code, speculative generality, duplicate code, lazy class
- couplers: Feature envy, inappropriate intimacy, message chains, middle man

Severity: 1-10 scale (1=minor, 10=critical)
Health Score: 0-100 (0=poor, 100=excellent)`;

  const response = await callAI(prompt, aiConfig);
  return parseCodeSmellResponse(response);
}

export async function analyzeCodeComplexity(
  code: string,
  language: string,
  aiConfig: AIConfig
): Promise<ComplexityResult> {
  const prompt = `Analyze the following ${language} code for complexity metrics. For each function/method, calculate:

1. Cyclomatic Complexity: Number of independent paths (<10 good, 10-20 moderate, >20 high)
2. Cognitive Complexity: Difficulty of understanding (<15 good, 15-25 moderate, >25 high)
3. Nesting Depth: Maximum nesting level (<4 good, 4-6 moderate, >6 high)
4. Parameter Count: Number of parameters (<5 good, 5-7 moderate, >7 high)
5. Lines of Code: Function length (<50 good, 50-100 moderate, >100 high)

Also calculate:
- Maintainability Index: 0-100 score (0=poor, 100=excellent) based on complexity, LOC, and structure
- Overall Metrics: Average cyclomatic, average cognitive, max nesting, total functions, complex functions (>10 cyclomatic)
- Recommendations: Actionable suggestions to reduce complexity

Code to analyze:
\`\`\`${language}
${code}
\`\`\`

Return a JSON response in this exact format:
{
  "functions": [
    {
      "name": "functionName",
      "line": 10,
      "cyclomaticComplexity": 5,
      "cognitiveComplexity": 8,
      "nestingDepth": 3,
      "parameterCount": 2,
      "linesOfCode": 45,
      "issues": ["Too many conditional branches", "Consider extracting method"]
    }
  ],
  "overallMetrics": {
    "averageCyclomaticComplexity": 6.5,
    "averageCognitiveComplexity": 9.2,
    "maxNestingDepth": 4,
    "totalFunctions": 8,
    "complexFunctions": 2
  },
  "maintainabilityIndex": 72,
  "recommendations": [
    "Reduce cyclomatic complexity in fetchData() by extracting validation logic",
    "Break down processResults() into smaller, focused functions"
  ]
}`;

  const response = await callAI(prompt, aiConfig);
  return parseComplexityResponse(response);
}

export async function analyzeSecurity(
  code: string,
  language: string,
  aiConfig: AIConfig
): Promise<SecurityResult> {
  const prompt = `Analyze the following ${language} code for security vulnerabilities based on OWASP Top 10 and common security risks.

For each vulnerability found, provide:
1. Unique ID (e.g., "VULN-001")
2. Title: Brief vulnerability name
3. Severity: critical, high, medium, low, or info
4. Category: One of the OWASP Top 10 categories
5. Description: Clear explanation of the vulnerability
6. Line Number: Where the vulnerability occurs
7. Code Snippet: The vulnerable code section
8. Impact: What could happen if exploited
9. Remediation: How to fix it with specific code examples
10. References: URLs to security resources
11. CWE: Common Weakness Enumeration ID (optional)

OWASP Categories:
- injection: SQL, NoSQL, OS command injection, LDAP injection
- broken-auth: Authentication and session management flaws
- sensitive-data: Unencrypted sensitive data, weak crypto
- xxe: XML External Entity attacks
- broken-access: Improper access controls, IDOR
- security-misconfig: Default configs, verbose errors, open cloud storage
- xss: Cross-site scripting vulnerabilities
- insecure-deserialization: Unsafe deserialization leading to RCE
- vulnerable-components: Using components with known vulnerabilities
- logging-monitoring: Insufficient logging, monitoring, or incident response

Code to analyze:
\`\`\`${language}
${code}
\`\`\`

Calculate:
- Security Score: 0-100 (higher is better, based on severity and count of vulnerabilities)
- Severity Summary: Count of critical, high, medium, low, info
- Category Summary: Count per OWASP category
- Recommendations: Actionable security improvements

Return a JSON response in this exact format:
{
  "vulnerabilities": [
    {
      "id": "VULN-001",
      "title": "SQL Injection Vulnerability",
      "severity": "critical",
      "category": "injection",
      "description": "User input is directly concatenated into SQL query without sanitization",
      "lineNumber": 15,
      "codeSnippet": "query = \\"SELECT * FROM users WHERE id = \\" + userId",
      "impact": "Attacker could execute arbitrary SQL commands, leading to data breach or database manipulation",
      "remediation": "Use parameterized queries or prepared statements:\\nquery = \\"SELECT * FROM users WHERE id = ?\\"\\ndb.query(query, [userId])",
      "references": [
        "https://owasp.org/www-community/attacks/SQL_Injection",
        "https://cwe.mitre.org/data/definitions/89.html"
      ],
      "cwe": "CWE-89"
    }
  ],
  "totalCount": 5,
  "severitySummary": {
    "critical": 1,
    "high": 2,
    "medium": 1,
    "low": 1,
    "info": 0
  },
  "categorySummary": {
    "injection": 2,
    "broken-auth": 1,
    "sensitive-data": 1,
    "xxe": 0,
    "broken-access": 1,
    "security-misconfig": 0,
    "xss": 0,
    "insecure-deserialization": 0,
    "vulnerable-components": 0,
    "logging-monitoring": 0
  },
  "securityScore": 45,
  "recommendations": [
    "Always use parameterized queries to prevent SQL injection",
    "Implement proper input validation and sanitization",
    "Use HTTPS for all data transmission"
  ]
}`;

  const response = await callAI(prompt, aiConfig);
  return parseSecurityResponse(response);
}

// AI Provider API Calls
async function callAI(prompt: string, config: AIConfig): Promise<string> {
  // Validate API key
  if (!config.apiKey || config.apiKey.trim() === '') {
    throw new Error('API key is required. Please enter your API key in the AI Configuration section.');
  }

  try {
    switch (config.provider) {
      case 'openai':
        return await callOpenAI(prompt, config);
      case 'anthropic':
        return await callAnthropic(prompt, config);
      case 'google':
        return await callGoogle(prompt, config);
      default:
        throw new Error(`Unsupported provider: ${config.provider}`);
    }
  } catch (error) {
    if (error instanceof Error) {
      // Re-throw with more context if it's a fetch error
      if (error.message.includes('ISO-8859-1')) {
        throw new Error('Invalid characters in API request. Please check your API key and try again.');
      }
      throw error;
    }
    throw new Error('An unexpected error occurred during API call.');
  }
}

async function callOpenAI(prompt: string, config: AIConfig): Promise<string> {
  const sanitizedKey = sanitizeApiKey(config.apiKey);
  
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${sanitizedKey}`,
    },
    body: JSON.stringify({
      model: config.model,
      messages: [
        {
          role: 'system',
          content: 'You are a helpful code analysis assistant. Always respond with valid JSON.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      response_format: { type: 'json_object' }
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: { message: response.statusText } }));
    throw new Error(`OpenAI API Error: ${error.error?.message || response.statusText}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

async function callAnthropic(prompt: string, config: AIConfig): Promise<string> {
  const sanitizedKey = sanitizeApiKey(config.apiKey);
  
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': sanitizedKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: config.model,
      max_tokens: 4096,
      messages: [
        {
          role: 'user',
          content: prompt + '\n\nIMPORTANT: Respond ONLY with valid JSON, no markdown or additional text.'
        }
      ],
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: { message: response.statusText } }));
    throw new Error(`Anthropic API Error: ${error.error?.message || response.statusText}`);
  }

  const data = await response.json();
  return data.content[0].text;
}

async function callGoogle(prompt: string, config: AIConfig): Promise<string> {
  const sanitizedKey = sanitizeApiKey(config.apiKey);
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${config.model}:generateContent`;
  
  const response = await fetch(`${url}?key=${encodeURIComponent(sanitizedKey)}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [{
        parts: [{
          text: prompt + '\n\nIMPORTANT: Respond ONLY with valid JSON, no markdown or additional text.'
        }]
      }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 4096,
      },
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: { message: response.statusText } }));
    throw new Error(`Google AI Error: ${error.error?.message || response.statusText}`);
  }

  const data = await response.json();
  return data.candidates[0].content.parts[0].text;
}

// Response Parsers
function parseExplainerResponse(response: string): ExplainerResult {
  try {
    const cleaned = response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const data = JSON.parse(cleaned);
    return {
      summary: data.summary || 'Analysis completed.',
      explanations: data.explanations || [],
    };
  } catch (error) {
    console.error('Failed to parse explainer response:', error);
    throw new Error('Failed to parse AI response. Please try again.');
  }
}

function parseBugFinderResponse(response: string): BugFinderResult {
  try {
    const cleaned = response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const data = JSON.parse(cleaned);
    return {
      bugs: data.bugs || [],
      totalCount: data.totalCount || data.bugs?.length || 0,
      severitySummary: data.severitySummary || {
        critical: 0,
        high: 0,
        medium: 0,
        low: 0,
      },
    };
  } catch (error) {
    console.error('Failed to parse bug finder response:', error);
    throw new Error('Failed to parse AI response. Please try again.');
  }
}

function parseRefactoringResponse(response: string): RefactorResult {
  try {
    const cleaned = response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const data = JSON.parse(cleaned);
    return {
      suggestions: data.suggestions || [],
      overallScore: data.overallScore || 70,
    };
  } catch (error) {
    console.error('Failed to parse refactoring response:', error);
    throw new Error('Failed to parse AI response. Please try again.');
  }
}

function parseCodeSmellResponse(response: string): CodeSmellResult {
  try {
    const cleaned = response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const data = JSON.parse(cleaned);
    return {
      smells: data.smells || [],
      totalCount: data.smells?.length || 0,
      categorySummary: data.categorySummary || {
        bloaters: 0,
        'oo-abusers': 0,
        'change-preventers': 0,
        dispensables: 0,
        couplers: 0,
      },
      overallHealthScore: data.overallHealthScore || 70,
    };
  } catch (error) {
    console.error('Failed to parse code smell response:', error);
    throw new Error('Failed to parse AI response. Please try again.');
  }
}

function parseComplexityResponse(response: string): ComplexityResult {
  try {
    const cleaned = response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const data = JSON.parse(cleaned);
    return {
      functions: data.functions || [],
      overallMetrics: data.overallMetrics || {
        averageCyclomaticComplexity: 0,
        averageCognitiveComplexity: 0,
        maxNestingDepth: 0,
        totalFunctions: 0,
        complexFunctions: 0,
      },
      maintainabilityIndex: data.maintainabilityIndex || 70,
      recommendations: data.recommendations || [],
    };
  } catch (error) {
    console.error('Failed to parse complexity response:', error);
    throw new Error('Failed to parse AI response. Please try again.');
  }
}

function parseSecurityResponse(response: string): SecurityResult {
  try {
    const cleaned = response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const data = JSON.parse(cleaned);
    return {
      vulnerabilities: data.vulnerabilities || [],
      totalCount: data.vulnerabilities?.length || 0,
      severitySummary: data.severitySummary || {
        critical: 0,
        high: 0,
        medium: 0,
        low: 0,
        info: 0,
      },
      categorySummary: data.categorySummary || {
        'injection': 0,
        'broken-auth': 0,
        'sensitive-data': 0,
        'xxe': 0,
        'broken-access': 0,
        'security-misconfig': 0,
        'xss': 0,
        'insecure-deserialization': 0,
        'vulnerable-components': 0,
        'logging-monitoring': 0,
      },
      securityScore: data.securityScore || 70,
      recommendations: data.recommendations || [],
    };
  } catch (error) {
    console.error('Failed to parse security response:', error);
    throw new Error('Failed to parse AI response. Please try again.');
  }
}
