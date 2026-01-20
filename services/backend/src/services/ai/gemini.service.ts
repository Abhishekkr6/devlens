import { GoogleGenerativeAI } from '@google/generative-ai';
import logger from '../../utils/logger';

interface CodeAnalysisResult {
  score: number;
  issues: Array<{
    file: string;
    line: number;
    severity: 'low' | 'medium' | 'high' | 'critical';
    category: 'bug' | 'security' | 'style' | 'performance' | 'best-practice';
    message: string;
    suggestion: string;
  }>;
  summary: string;
  recommendations: string[];
}

export class GeminiService {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      logger.warn('GEMINI_API_KEY not found. AI code review will be disabled.');
      throw new Error('Gemini API key not configured');
    }

    this.genAI = new GoogleGenerativeAI(apiKey);
    // Using gemini-1.5-pro-latest for better JSON support and v1beta API compatibility
    // gemini-1.5-flash doesn't support response_mime_type: "application/json"
    this.model = this.genAI.getGenerativeModel({
      model: 'gemini-1.5-pro-latest',
      generationConfig: {
        temperature: 0.3, // Lower temperature for more consistent code analysis
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 2048,
        responseMimeType: 'text/plain', // Explicitly set to text/plain to avoid MIME type errors
      }
    });
  }

  /**
   * Analyze code diff and provide AI-powered review suggestions
   */
  async analyzeCodeDiff(
    diff: string,
    prTitle: string,
    prDescription: string,
    fileExtensions: string[]
  ): Promise<CodeAnalysisResult> {
    try {
      const prompt = this.buildCodeReviewPrompt(diff, prTitle, prDescription, fileExtensions);

      logger.info('Sending code analysis request to Gemini API');
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      // Parse JSON response
      const analysisResult = this.parseGeminiResponse(text);

      logger.info({
        score: analysisResult.score,
        issuesFound: analysisResult.issues.length
      }, 'Code analysis completed successfully');

      return analysisResult;
    } catch (error: any) {
      logger.error({ error }, 'Gemini API error');

      // Check for quota exceeded
      if (error.message?.includes('quota') || error.message?.includes('rate limit')) {
        throw new Error('AI analysis quota exceeded. Please try again later.');
      }

      throw new Error(`AI analysis failed: ${error.message}`);
    }
  }

  /**
   * Analyze code for security vulnerabilities
   */
  async analyzeSecurityIssues(code: string, language: string): Promise<any> {
    try {
      const prompt = `
You are a security expert. Analyze this ${language} code for security vulnerabilities.

Focus on:
1. SQL Injection risks
2. XSS (Cross-Site Scripting) vulnerabilities
3. Authentication/Authorization issues
4. Sensitive data exposure
5. Insecure dependencies
6. CSRF vulnerabilities
7. Insecure cryptography

Code:
\`\`\`${language}
${code}
\`\`\`

Provide response in JSON format:
{
  "vulnerabilities": [
    {
      "type": "sql-injection|xss|auth|data-exposure|dependency|csrf|crypto",
      "severity": "low|medium|high|critical",
      "line": number,
      "description": "what is the issue",
      "impact": "what could happen",
      "recommendation": "how to fix it",
      "cwe": "CWE-XXX (if applicable)"
    }
  ],
  "overallRisk": "low|medium|high|critical",
  "summary": "brief security assessment"
}
`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      return this.parseJSONFromText(text);
    } catch (error: any) {
      logger.error({ error }, 'Security analysis error');
      throw error;
    }
  }

  /**
   * Predict bug probability based on code changes
   */
  async predictBugProbability(
    additions: number,
    deletions: number,
    filesChanged: number,
    complexity: number,
    authorExperience: number
  ): Promise<{ probability: number; factors: string[]; recommendation: string }> {
    try {
      const prompt = `
You are a software engineering expert. Predict the bug probability for a code change with these metrics:

- Lines Added: ${additions}
- Lines Deleted: ${deletions}
- Files Changed: ${filesChanged}
- Cyclomatic Complexity: ${complexity}
- Author Experience (commits): ${authorExperience}

Provide response in JSON format:
{
  "probability": 0-100 (percentage),
  "riskLevel": "low|medium|high|critical",
  "factors": ["list of risk factors"],
  "recommendation": "what should be done before merging"
}
`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      return this.parseJSONFromText(text);
    } catch (error: any) {
      logger.error({ error }, 'Bug prediction error');
      throw error;
    }
  }

  /**
   * Build comprehensive code review prompt
   */
  private buildCodeReviewPrompt(
    diff: string,
    prTitle: string,
    prDescription: string,
    fileExtensions: string[]
  ): string {
    const languages = fileExtensions.join(', ');

    return `
You are an expert code reviewer with deep knowledge of software engineering best practices, security, and performance optimization.

Analyze this Pull Request and provide a comprehensive code review.

**PR Title:** ${prTitle}
**PR Description:** ${prDescription || 'No description provided'}
**Languages/Files:** ${languages}

**Code Diff:**
\`\`\`diff
${diff.slice(0, 8000)} ${diff.length > 8000 ? '... (truncated)' : ''}
\`\`\`

**Review Guidelines:**
1. Identify bugs, logic errors, and edge cases
2. Flag security vulnerabilities (SQL injection, XSS, auth issues, etc.)
3. Check for performance issues (N+1 queries, inefficient algorithms, memory leaks)
4. Verify best practices (naming conventions, code structure, error handling)
5. Suggest improvements and optimizations
6. Rate overall code quality (0-100)

**Response Format (MUST be valid JSON):**
{
  "score": 0-100,
  "issues": [
    {
      "file": "filename with extension",
      "line": line_number,
      "severity": "low|medium|high|critical",
      "category": "bug|security|style|performance|best-practice",
      "message": "clear description of the issue",
      "suggestion": "specific fix or improvement"
    }
  ],
  "summary": "2-3 sentence overall assessment",
  "recommendations": [
    "actionable recommendation 1",
    "actionable recommendation 2"
  ]
}

**Important:** 
- Only include real issues, not nitpicks
- Be specific with file names and line numbers
- Provide actionable suggestions
- Return ONLY valid JSON, no markdown code blocks (no \`\`\`json or \`\`\`)
- Your entire response should be parseable by JSON.parse()
`;
  }

  /**
   * Parse Gemini response and extract JSON
   */
  private parseGeminiResponse(text: string): CodeAnalysisResult {
    try {
      // Remove markdown code blocks if present
      let jsonText = text.trim();
      if (jsonText.startsWith('```json')) {
        jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      } else if (jsonText.startsWith('```')) {
        jsonText = jsonText.replace(/```\n?/g, '');
      }

      const parsed = JSON.parse(jsonText);

      // Validate and normalize response
      return {
        score: Math.max(0, Math.min(100, parsed.score || 70)),
        issues: Array.isArray(parsed.issues) ? parsed.issues : [],
        summary: parsed.summary || 'Code analysis completed',
        recommendations: Array.isArray(parsed.recommendations) ? parsed.recommendations : []
      };
    } catch (error) {
      logger.error({ error }, 'Failed to parse Gemini response');
      logger.debug({ text }, 'Raw response');

      // Return default response if parsing fails
      return {
        score: 70,
        issues: [],
        summary: 'AI analysis completed but response parsing failed',
        recommendations: ['Manual code review recommended']
      };
    }
  }

  /**
   * Parse JSON from text (handles markdown code blocks)
   */
  private parseJSONFromText(text: string): any {
    let jsonText = text.trim();
    if (jsonText.startsWith('```json')) {
      jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    } else if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/```\n?/g, '');
    }
    return JSON.parse(jsonText);
  }
}

// Singleton instance
let geminiServiceInstance: GeminiService | null = null;

export const getGeminiService = (): GeminiService => {
  if (!geminiServiceInstance) {
    geminiServiceInstance = new GeminiService();
  }
  return geminiServiceInstance;
};
