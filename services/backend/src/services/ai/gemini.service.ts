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
  private genAI!: GoogleGenerativeAI;
  private model: any;
  private apiKeys: string[];
  private currentKeyIndex: number = 0;

  constructor() {
    // Support multiple API keys for quota management
    this.apiKeys = [
      process.env.GEMINI_API_KEY,
      process.env.GEMINI_API_KEY_1,
      process.env.GEMINI_API_KEY_2,
      process.env.GEMINI_API_KEY_3,
      process.env.GEMINI_API_KEY_4,
      process.env.GEMINI_API_KEY_5,
    ].filter(Boolean) as string[];

    if (this.apiKeys.length === 0) {
      logger.warn('No GEMINI_API_KEY found. AI code review will be disabled.');
      throw new Error('Gemini API key not configured');
    }

    logger.info({ totalKeys: this.apiKeys.length }, 'Gemini service initialized with API keys');

    // Initialize with first key
    this.initializeModel(this.apiKeys[0]);
  }

  private initializeModel(apiKey: string) {
    this.genAI = new GoogleGenerativeAI(apiKey);

    // Using gemini-2.5-flash - Latest stable free tier model (Jan 2026)
    // Free tier limits: 250 requests/day, 10 requests/min per key
    // With 5 keys: 1,250 requests/day total
    // Context window: 1 million tokens
    this.model = this.genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      generationConfig: {
        temperature: 0.3, // Lower temperature for more consistent code analysis
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 2048,
      }
    });
  }

  private rotateApiKey(): boolean {
    if (this.apiKeys.length <= 1) {
      return false; // No other keys to rotate to
    }

    this.currentKeyIndex = (this.currentKeyIndex + 1) % this.apiKeys.length;
    const newKey = this.apiKeys[this.currentKeyIndex];

    logger.info({
      keyIndex: this.currentKeyIndex + 1,
      totalKeys: this.apiKeys.length
    }, 'Rotating to next API key');

    this.initializeModel(newKey);
    return true;
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
    const maxRetries = 3;
    const maxKeyRotations = this.apiKeys.length;
    let lastError: any;
    let keyRotations = 0;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const prompt = this.buildCodeReviewPrompt(diff, prTitle, prDescription, fileExtensions);

        logger.info({
          attempt,
          keyIndex: this.currentKeyIndex + 1,
          totalKeys: this.apiKeys.length
        }, 'Sending code analysis request to Gemini API');

        const result = await this.model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // Parse JSON response
        const analysisResult = this.parseGeminiResponse(text);

        logger.info({
          score: analysisResult.score,
          issuesFound: analysisResult.issues.length,
          attempts: attempt,
          keyUsed: this.currentKeyIndex + 1
        }, 'Code analysis completed successfully');

        return analysisResult;
      } catch (error: any) {
        lastError = error;
        logger.warn({
          error: error.message,
          attempt,
          keyIndex: this.currentKeyIndex + 1
        }, 'Gemini API error');

        // Check for quota exceeded - try rotating to next key
        if ((error.message?.includes('quota') || error.message?.includes('rate limit'))
          && keyRotations < maxKeyRotations - 1) {

          const rotated = this.rotateApiKey();
          if (rotated) {
            keyRotations++;
            logger.info({
              newKeyIndex: this.currentKeyIndex + 1,
              rotationCount: keyRotations
            }, 'Quota exceeded, rotated to next API key');

            // Retry immediately with new key (don't count as attempt)
            attempt--;
            continue;
          }
        }

        // If quota error and no more keys to rotate
        if (error.message?.includes('quota') || error.message?.includes('rate limit')) {
          throw new Error('AI analysis quota exceeded on all API keys. Please try again later.');
        }

        // Check for overload (503) - retry with exponential backoff
        if (error.message?.includes('overloaded') || error.message?.includes('503')) {
          if (attempt < maxRetries) {
            const waitTime = Math.pow(2, attempt) * 1000; // 2s, 4s, 8s
            logger.info({ waitTime, attempt }, 'Model overloaded, retrying after delay...');
            await new Promise(resolve => setTimeout(resolve, waitTime));
            continue;
          }
        }

        // For other errors, throw immediately
        if (attempt === maxRetries) {
          throw new Error(`AI analysis failed after ${maxRetries} attempts: ${lastError?.message || 'Unknown error'}`);
        }
      }
    }

    throw new Error(`AI analysis failed: ${lastError?.message || 'Unknown error'}`);
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
      // Log raw response for debugging
      logger.info({ responseLength: text.length }, 'Parsing Gemini response');
      logger.debug({ rawResponse: text.substring(0, 500) }, 'Raw Gemini response preview');

      // Remove markdown code blocks if present
      let jsonText = text.trim();

      // Strategy 1: Handle ```json ... ``` format
      if (jsonText.includes('```json')) {
        const match = jsonText.match(/```json\s*([\s\S]*?)\s*```/);
        if (match) {
          jsonText = match[1].trim();
          logger.debug('Extracted JSON from ```json``` block');
        }
      }
      // Strategy 2: Handle ``` ... ``` format (without json specifier)
      else if (jsonText.includes('```')) {
        const match = jsonText.match(/```\s*([\s\S]*?)\s*```/);
        if (match) {
          jsonText = match[1].trim();
          logger.debug('Extracted JSON from ``` block');
        }
      }

      // Strategy 3: Try to find JSON object in the text if it's not pure JSON
      if (!jsonText.startsWith('{')) {
        const jsonMatch = jsonText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          jsonText = jsonMatch[0];
          logger.debug('Extracted JSON object from text');
        } else {
          throw new Error('No JSON object found in response');
        }
      }

      // Strategy 4: Clean up common JSON formatting issues
      jsonText = jsonText
        .replace(/,\s*}/g, '}')  // Remove trailing commas
        .replace(/,\s*]/g, ']')  // Remove trailing commas in arrays
        .trim();

      // Parse JSON
      const parsed = JSON.parse(jsonText);

      // Validate required fields
      if (typeof parsed !== 'object' || parsed === null) {
        throw new Error('Parsed result is not an object');
      }

      // Normalize and validate response
      const result: CodeAnalysisResult = {
        score: Math.max(0, Math.min(100, Number(parsed.score) || 70)),
        issues: Array.isArray(parsed.issues) ? parsed.issues.map((issue: any) => ({
          file: String(issue.file || 'unknown'),
          line: Number(issue.line) || 0,
          severity: issue.severity || 'medium',
          category: issue.category || 'best-practice',
          message: String(issue.message || 'No message'),
          suggestion: String(issue.suggestion || 'No suggestion')
        })) : [],
        summary: String(parsed.summary || 'Code analysis completed successfully'),
        recommendations: Array.isArray(parsed.recommendations)
          ? parsed.recommendations.map(String).filter(Boolean)
          : []
      };

      logger.info({
        score: result.score,
        issuesCount: result.issues.length,
        recommendationsCount: result.recommendations.length
      }, 'Successfully parsed Gemini response');

      return result;
    } catch (error: any) {
      logger.error({
        error: error.message,
        textLength: text.length,
        textPreview: text.substring(0, 200)
      }, 'Failed to parse Gemini response');

      // Log more details for debugging
      logger.debug({
        fullText: text.substring(0, 2000),
        errorStack: error.stack
      }, 'Detailed parsing error');

      // Return fallback response with helpful message
      return {
        score: 70,
        issues: [],
        summary: `AI analysis completed but response parsing failed. Error: ${error.message}. This is usually temporary - try again.`,
        recommendations: [
          'Manual code review recommended',
          'Check logs for parsing details',
          'Try analyzing again - Gemini responses can vary'
        ]
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
