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

    this.initializeModel(this.apiKeys[0]);
  }

  private initializeModel(apiKey: string) {
    this.genAI = new GoogleGenerativeAI(apiKey);

    this.model = this.genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      generationConfig: {
        temperature: 0.3,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 4096,
      }
    });
  }

  private rotateApiKey(): boolean {
    if (this.apiKeys.length <= 1) {
      return false;
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

        if ((error.message?.includes('quota') || error.message?.includes('rate limit'))
          && keyRotations < maxKeyRotations - 1) {

          const rotated = this.rotateApiKey();
          if (rotated) {
            keyRotations++;
            logger.info({
              newKeyIndex: this.currentKeyIndex + 1,
              rotationCount: keyRotations
            }, 'Quota exceeded, rotated to next API key');

            attempt--;
            continue;
          }
        }

        if (error.message?.includes('quota') || error.message?.includes('rate limit')) {
          throw new Error('AI analysis quota exceeded on all API keys. Please try again later.');
        }

        if (error.message?.includes('overloaded') || error.message?.includes('503')) {
          if (attempt < maxRetries) {
            const waitTime = Math.pow(2, attempt) * 1000;
            logger.info({ waitTime, attempt }, 'Model overloaded, retrying after delay...');
            await new Promise(resolve => setTimeout(resolve, waitTime));
            continue;
          }
        }

        if (attempt === maxRetries) {
          throw new Error(`AI analysis failed after ${maxRetries} attempts: ${lastError?.message || 'Unknown error'}`);
        }
      }
    }

    throw new Error(`AI analysis failed: ${lastError?.message || 'Unknown error'}`);
  }

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

  private buildCodeReviewPrompt(
    diff: string,
    prTitle: string,
    prDescription: string,
    fileExtensions: string[]
  ): string {
    const languages = fileExtensions.join(', ');

    return `
You are an expert code reviewer. Analyze this Pull Request and provide a focused code review.

**PR Title:** ${prTitle}
**PR Description:** ${prDescription || 'No description provided'}
**Languages:** ${languages}

**Code Diff:**
\`\`\`diff
${diff.slice(0, 6000)} ${diff.length > 6000 ? '... (truncated)' : ''}
\`\`\`

**Review Guidelines:**
1. Focus on critical issues only (bugs, security, performance)
2. Limit to top 5 most important issues
3. Be concise and specific
4. Rate overall code quality (0-100)

**Response Format (MUST be valid, complete JSON):**
{
  "score": 0-100,
  "issues": [
    {
      "file": "filename",
      "line": number,
      "severity": "low|medium|high|critical",
      "category": "bug|security|style|performance|best-practice",
      "message": "brief issue description",
      "suggestion": "brief fix suggestion"
    }
  ],
  "summary": "1-2 sentence assessment",
  "recommendations": [
    "brief recommendation 1",
    "brief recommendation 2"
  ]
}

**CRITICAL REQUIREMENTS:**
- Return ONLY valid JSON (no markdown, no code blocks)
- Limit issues array to maximum 5 items
- Keep all strings concise (under 100 characters)
- Ensure JSON is complete with all closing braces
- Your entire response must be parseable by JSON.parse()
`;
  }

  private parseGeminiResponse(text: string): CodeAnalysisResult {
    try {
      logger.info({ responseLength: text.length }, 'Parsing Gemini response');
      logger.debug({ rawResponse: text.substring(0, 500) }, 'Raw Gemini response preview');

      let jsonText = text.trim();

      if (jsonText.includes('```json')) {
        const match = jsonText.match(/```json\s*([\s\S]*?)\s*```/);
        if (match) {
          jsonText = match[1].trim();
          logger.debug('Extracted JSON from ```json``` block');
        }
      }
      else if (jsonText.includes('```')) {
        const match = jsonText.match(/```\s*([\s\S]*?)\s*```/);
        if (match) {
          jsonText = match[1].trim();
          logger.debug('Extracted JSON from ``` block');
        }
      }

      if (!jsonText.startsWith('{')) {
        const jsonMatch = jsonText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          jsonText = jsonMatch[0];
          logger.debug('Extracted JSON object from text');
        } else {
          throw new Error('No JSON object found in response');
        }
      }

      jsonText = jsonText
        .replace(/,\s*}/g, '}')
        .replace(/,\s*]/g, ']')
        .trim();

      const parsed = JSON.parse(jsonText);

      // Validate required fields
      if (typeof parsed !== 'object' || parsed === null) {
        throw new Error('Parsed result is not an object');
      }

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

      logger.debug({
        fullText: text.substring(0, 2000),
        errorStack: error.stack
      }, 'Detailed parsing error');

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

let geminiServiceInstance: GeminiService | null = null;

export const getGeminiService = (): GeminiService => {
  if (!geminiServiceInstance) {
    geminiServiceInstance = new GeminiService();
  }
  return geminiServiceInstance;
};
