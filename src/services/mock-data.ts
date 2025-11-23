import type { ExplainerResult, BugFinderResult, RefactorResult } from '@/types';

// Mock data generator functions
export async function generateMockExplainer(code: string, language: string): Promise<ExplainerResult> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));

  const lines = code.split('\n').filter(line => line.trim());
  
  return {
    summary: `This ${language} code contains ${lines.length} lines. It appears to be a ${lines.length < 10 ? 'simple' : 'moderately complex'} implementation that performs various operations. The code structure follows standard ${language} conventions and practices.`,
    explanations: lines.slice(0, 10).map((line, index) => ({
      lineNumber: index + 1,
      code: line.trim(),
      explanation: generateExplanation(line, language),
      why: generateWhy(line, language),
      issues: Math.random() > 0.7 ? [generateIssue(line)] : undefined,
    })),
  };
}

export async function generateMockBugs(code: string, language: string): Promise<BugFinderResult> {
  await new Promise(resolve => setTimeout(resolve, 1200));

  const bugs = generateMockBugsData(code, language);
  const severitySummary = {
    critical: bugs.filter(b => b.severity === 'critical').length,
    high: bugs.filter(b => b.severity === 'high').length,
    medium: bugs.filter(b => b.severity === 'medium').length,
    low: bugs.filter(b => b.severity === 'low').length,
  };

  return {
    bugs,
    totalCount: bugs.length,
    severitySummary,
  };
}

export async function generateMockRefactorings(code: string, language: string): Promise<RefactorResult> {
  await new Promise(resolve => setTimeout(resolve, 1100));

  const suggestions = generateMockRefactoringsData(code, language);
  const overallScore = Math.floor(Math.random() * 30) + 60; // 60-90

  return {
    suggestions,
    overallScore,
  };
}

// Helper functions
function generateExplanation(line: string, _language: string): string {
  if (line.includes('function') || line.includes('def ')) {
    return 'Defines a function that encapsulates reusable logic and operations';
  }
  if (line.includes('const') || line.includes('let') || line.includes('var')) {
    return 'Declares a variable to store data that can be used throughout the code';
  }
  if (line.includes('return')) {
    return 'Returns a value from the function back to the caller';
  }
  if (line.includes('if') || line.includes('else')) {
    return 'Implements conditional logic to execute different code paths based on conditions';
  }
  if (line.includes('for') || line.includes('while')) {
    return 'Creates a loop to iterate over data or repeat operations multiple times';
  }
  if (line.includes('import') || line.includes('require')) {
    return 'Imports external modules or libraries to use their functionality';
  }
  return 'Performs an operation as part of the program\'s logic flow';
}

function generateWhy(line: string, _language: string): string {
  if (line.includes('function') || line.includes('def ')) {
    return 'Functions promote code reusability and make the code more maintainable by breaking down complex tasks';
  }
  if (line.includes('const') || line.includes('let') || line.includes('var')) {
    return 'Variables provide a way to name and reference data, making code more readable and flexible';
  }
  if (line.includes('return')) {
    return 'Returning values allows functions to provide results to be used elsewhere in the program';
  }
  return 'This operation is necessary for the program\'s intended functionality';
}

function generateIssue(_line: string): string {
  const issues = [
    'Consider adding error handling for edge cases',
    'Variable naming could be more descriptive',
    'This could be optimized for better performance',
    'Consider adding type annotations for better type safety',
    'This pattern might lead to unexpected behavior in some cases',
  ];
  return issues[Math.floor(Math.random() * issues.length)];
}

function generateMockBugsData(code: string, _language: string) {
  const lines = code.split('\n');
  const bugCount = Math.min(Math.floor(lines.length / 5) + 1, 8);
  
  const bugTemplates = [
    {
      severity: 'critical' as const,
      description: 'Potential null pointer dereference',
      explanation: 'This code attempts to access properties of a variable that might be null or undefined, which could cause a runtime crash.',
      suggestedFix: 'Add null check:\nif (variable !== null && variable !== undefined) {\n  // safe to access\n}',
      category: 'Null Safety',
    },
    {
      severity: 'high' as const,
      description: 'Array index out of bounds',
      explanation: 'The code accesses an array element without checking if the index is within valid bounds.',
      suggestedFix: 'Add bounds check:\nif (index >= 0 && index < array.length) {\n  // safe to access\n}',
      category: 'Array Safety',
    },
    {
      severity: 'high' as const,
      description: 'Resource leak detected',
      explanation: 'Resources like file handles or database connections are opened but not properly closed, leading to memory leaks.',
      suggestedFix: 'Use try-finally or with statement to ensure cleanup:\ntry {\n  // use resource\n} finally {\n  resource.close();\n}',
      category: 'Resource Management',
    },
    {
      severity: 'medium' as const,
      description: 'Type mismatch in comparison',
      explanation: 'Comparing values of different types can lead to unexpected results due to type coercion.',
      suggestedFix: 'Use strict equality:\nif (value === expectedValue) { ... }',
      category: 'Type Safety',
    },
    {
      severity: 'medium' as const,
      description: 'Potential infinite loop',
      explanation: 'Loop condition may never become false, causing the program to hang indefinitely.',
      suggestedFix: 'Ensure loop variable is properly updated:\nfor (let i = 0; i < limit; i++) { ... }',
      category: 'Control Flow',
    },
    {
      severity: 'low' as const,
      description: 'Inefficient string concatenation',
      explanation: 'Multiple string concatenations in a loop can be slow. Consider using array join or string builder.',
      suggestedFix: 'Use array and join:\nconst parts = [];\nfor (...) parts.push(value);\nconst result = parts.join("");',
      category: 'Performance',
    },
    {
      severity: 'low' as const,
      description: 'Unused variable',
      explanation: 'Variable is declared but never used, adding unnecessary code complexity.',
      suggestedFix: 'Remove the unused variable declaration',
      category: 'Code Quality',
    },
  ];

  return Array.from({ length: bugCount }, (_, i) => {
    const template = bugTemplates[i % bugTemplates.length];
    return {
      id: `bug-${i + 1}`,
      lineNumber: Math.floor(Math.random() * Math.max(lines.length, 10)) + 1,
      ...template,
    };
  });
}

function generateMockRefactoringsData(code: string, _language: string) {
  const lines = code.split('\n');
  const suggestionCount = Math.min(Math.floor(lines.length / 8) + 2, 6);
  
  const refactorTemplates = [
    {
      id: 'refactor-1',
      title: 'Extract Method for Better Reusability',
      priority: 'high' as const,
      impact: 'Improves code reusability and maintainability by 40%',
      lineNumbers: [5, 6, 7, 8],
      description: 'This complex block of code can be extracted into a separate method to improve readability and enable reuse in other parts of the codebase.',
      before: 'function main() {\n  // Complex logic here\n  const result = data.map(x => x * 2)\n    .filter(x => x > 10)\n    .reduce((a, b) => a + b);\n}',
      after: 'function processData(data) {\n  return data.map(x => x * 2)\n    .filter(x => x > 10)\n    .reduce((a, b) => a + b);\n}\n\nfunction main() {\n  const result = processData(data);\n}',
      benefits: [
        'Improves code organization and structure',
        'Makes code more testable in isolation',
        'Enables reuse across multiple functions',
        'Reduces cognitive complexity',
      ],
    },
    {
      id: 'refactor-2',
      title: 'Replace Magic Numbers with Named Constants',
      priority: 'high' as const,
      impact: 'Increases code readability and reduces maintenance errors by 35%',
      lineNumbers: [12, 15, 18],
      description: 'Hard-coded numeric values lack context and make the code harder to understand and maintain. Using named constants makes the code self-documenting.',
      before: 'if (age > 18 && score >= 75) {\n  discount = price * 0.15;\n}',
      after: 'const ADULT_AGE = 18;\nconst PASSING_SCORE = 75;\nconst DISCOUNT_RATE = 0.15;\n\nif (age > ADULT_AGE && score >= PASSING_SCORE) {\n  discount = price * DISCOUNT_RATE;\n}',
      benefits: [
        'Self-documenting code improves readability',
        'Easier to update values in one place',
        'Reduces risk of typos and errors',
        'Follows industry best practices',
      ],
    },
    {
      id: 'refactor-3',
      title: 'Simplify Complex Conditional Logic',
      priority: 'medium' as const,
      impact: 'Reduces cognitive complexity by 30% and improves maintainability',
      lineNumbers: [20, 21, 22, 23],
      description: 'Nested if statements can be simplified using early returns or guard clauses, making the code flow easier to follow.',
      before: 'if (isValid) {\n  if (hasPermission) {\n    if (isActive) {\n      return process();\n    }\n  }\n}\nreturn null;',
      after: 'if (!isValid) return null;\nif (!hasPermission) return null;\nif (!isActive) return null;\n\nreturn process();',
      benefits: [
        'Reduces nesting depth',
        'Easier to understand logic flow',
        'Simpler to add or modify conditions',
        'Follows clean code principles',
      ],
    },
    {
      id: 'refactor-4',
      title: 'Apply DRY Principle - Remove Code Duplication',
      priority: 'medium' as const,
      impact: 'Reduces code duplication by 45% and improves maintainability',
      lineNumbers: [30, 35, 40],
      description: 'Repeated code blocks should be extracted into a reusable function to follow the DRY (Don\'t Repeat Yourself) principle.',
      before: 'const result1 = data1.filter(x => x.active)\n  .map(x => x.value);\nconst result2 = data2.filter(x => x.active)\n  .map(x => x.value);',
      after: 'function getActiveValues(data) {\n  return data.filter(x => x.active)\n    .map(x => x.value);\n}\n\nconst result1 = getActiveValues(data1);\nconst result2 = getActiveValues(data2);',
      benefits: [
        'Eliminates code duplication',
        'Single source of truth for logic',
        'Easier to fix bugs in one place',
        'Reduces maintenance overhead',
      ],
    },
    {
      id: 'refactor-5',
      title: 'Improve Variable Naming for Clarity',
      priority: 'low' as const,
      impact: 'Enhances code readability by 25%',
      lineNumbers: [45, 46],
      description: 'Short or unclear variable names should be replaced with descriptive names that clearly communicate their purpose.',
      before: 'const d = new Date();\nconst x = getData();\nconst flg = true;',
      after: 'const currentDate = new Date();\nconst userData = getData();\nconst isProcessingComplete = true;',
      benefits: [
        'Code becomes self-documenting',
        'Reduces need for comments',
        'Easier for new developers to understand',
        'Follows naming conventions',
      ],
    },
    {
      id: 'refactor-6',
      title: 'Use Modern Language Features',
      priority: 'low' as const,
      impact: 'Modernizes codebase and improves performance by 15%',
      lineNumbers: [50, 51, 52],
      description: 'Update code to use modern language features like destructuring, arrow functions, and template literals.',
      before: 'function getName(user) {\n  return user.firstName + " " + user.lastName;\n}\nconst items = array.map(function(x) { return x * 2; });',
      after: 'const getName = ({ firstName, lastName }) => {\n  return `${firstName} ${lastName}`;\n}\nconst items = array.map(x => x * 2);',
      benefits: [
        'More concise and readable code',
        'Better performance in modern runtimes',
        'Follows current best practices',
        'Easier to maintain',
      ],
    },
  ];

  return refactorTemplates.slice(0, suggestionCount);
}
