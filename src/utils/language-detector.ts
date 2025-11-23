/**
 * Detects programming language from code content
 * Based on common patterns, keywords, and syntax
 */
export function detectLanguage(code: string): string {
  if (!code || code.trim().length === 0) {
    return 'javascript'; // default
  }

  const trimmedCode = code.trim();
  const lines = trimmedCode.split('\n').map(line => line.trim());
  const codeContent = lines.filter(line => line.length > 0 && !line.startsWith('//')).join('\n');

  // Python detection
  if (
    /^(def|class|import|from|if __name__|print\(|async def)\s/.test(codeContent) ||
    /:\s*$/.test(lines[0]) || // Python uses colons for blocks
    /^\s*(def|class|import|from|elif|async def)\s/.test(codeContent)
  ) {
    return 'python';
  }

  // Java detection
  if (
    /\b(public|private|protected)\s+(static\s+)?(class|interface|enum|void|int|String)\b/.test(codeContent) ||
    /\bpackage\s+[\w.]+;/.test(codeContent) ||
    /\bimport\s+java\./.test(codeContent) ||
    /\bSystem\.out\.println/.test(codeContent)
  ) {
    return 'java';
  }

  // C# detection
  if (
    /\b(namespace|using\s+System|public\s+class|private\s+class)\b/.test(codeContent) ||
    /\bConsole\.WriteLine/.test(codeContent) ||
    /\[.*Attribute\]/.test(codeContent) ||
    /\basync\s+Task/.test(codeContent)
  ) {
    return 'csharp';
  }

  // C++ detection
  if (
    /#include\s*[<"]/.test(codeContent) ||
    /\b(std::|cout|cin|endl|nullptr|template\s*<)\b/.test(codeContent) ||
    /^using namespace std;?/.test(codeContent)
  ) {
    return 'cpp';
  }

  // Go detection
  if (
    /^package\s+\w+/.test(trimmedCode) ||
    /\bfunc\s+\w+\(/.test(codeContent) ||
    /\bimport\s+\(/.test(codeContent) ||
    /\bfmt\.Print/.test(codeContent) ||
    /:=\s*/.test(codeContent)
  ) {
    return 'go';
  }

  // Rust detection
  if (
    /\bfn\s+\w+/.test(codeContent) ||
    /\blet\s+mut\s+/.test(codeContent) ||
    /\buse\s+std::/.test(codeContent) ||
    /\bimpl\s+/.test(codeContent) ||
    /\b(pub\s+)?(struct|enum|trait)\s+/.test(codeContent)
  ) {
    return 'rust';
  }

  // Ruby detection
  if (
    /\b(def|class|module|require|puts|attr_accessor|end)\b/.test(codeContent) ||
    /\bdo\s*\|.*\|/.test(codeContent) ||
    /@\w+/.test(codeContent) && /\bdef\s+/.test(codeContent)
  ) {
    return 'ruby';
  }

  // PHP detection
  if (
    /^<\?php/.test(trimmedCode) ||
    /\$\w+\s*=/.test(codeContent) ||
    /\bfunction\s+\w+\(.*\)\s*\{/.test(codeContent) && /\$/.test(codeContent) ||
    /\b(echo|print_r|var_dump)\b/.test(codeContent)
  ) {
    return 'php';
  }

  // TypeScript detection (before JavaScript as TS is a superset)
  if (
    /:\s*(string|number|boolean|any|void|never|unknown)\b/.test(codeContent) ||
    /\binterface\s+\w+/.test(codeContent) ||
    /\btype\s+\w+\s*=/.test(codeContent) ||
    /<\w+>/.test(codeContent) && /\bfunction\s+/.test(codeContent) ||
    /\bas\s+\w+/.test(codeContent) ||
    /\benum\s+\w+/.test(codeContent)
  ) {
    return 'typescript';
  }

  // JavaScript detection (default for JS-like syntax)
  if (
    /\b(const|let|var|function|class|import|export|async|await|=>)\b/.test(codeContent) ||
    /\bconsole\.(log|error|warn)/.test(codeContent) ||
    /\brequire\(/.test(codeContent) ||
    /\bmodule\.exports/.test(codeContent)
  ) {
    return 'javascript';
  }

  // Default to JavaScript if no clear match
  return 'javascript';
}
