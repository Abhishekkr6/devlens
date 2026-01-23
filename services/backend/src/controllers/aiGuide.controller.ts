import { Request, Response } from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function handleGuideQuery(req: Request, res: Response) {
    try {
        const { message, context, history } = req.body;

        if (!message || typeof message !== 'string') {
            return res.status(400).json({
                success: false,
                error: 'Message is required'
            });
        }

        const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

        const prompt = buildGuidePrompt(message, context, history);

        const result = await model.generateContent(prompt);
        const response = result.response.text();

        res.json({
            success: true,
            response: response
        });
    } catch (error: any) {
        console.error('AI Guide error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get AI response',
            message: error.message
        });
    }
}

function buildGuidePrompt(message: string, context: string, history: any[]): string {
    const contextInfo = getContextInfo(context);

    const conversationHistory = history && history.length > 0
        ? history.map((m: any) => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`).join('\n')
        : 'No previous conversation';

    return `You are a helpful AI guide for TeamPulse, a team collaboration and code review platform.

**Your Role:**
- Help users navigate and use TeamPulse features
- Provide step-by-step guidance
- Be friendly, concise, and helpful
- Use emojis to make responses engaging
- Break complex tasks into numbered steps

**Current Context:**
Page: ${contextInfo.page}
Available Features: ${contextInfo.features.join(', ')}

**Conversation History:**
${conversationHistory}

**User Question:** ${message}

**Instructions:**
1. If the user asks "how to" do something, provide clear numbered steps
2. If the user asks about a feature, explain what it does and how to use it
3. If the user seems lost, offer a quick tour or guide them to relevant sections
4. Keep responses under 150 words unless explaining a complex process
5. Use bullet points and emojis for better readability
6. If you don't know something specific about TeamPulse, be honest and suggest general guidance

**Response:**`;
}

function getContextInfo(pathname: string): { page: string; features: string[] } {
    if (!pathname) {
        return {
            page: 'Home',
            features: ['Dashboard', 'Pull Requests', 'Repositories', 'Team Management']
        };
    }

    const contexts: Record<string, { page: string; features: string[] }> = {
        '/dashboard': {
            page: 'Dashboard',
            features: ['Team Activity Chart', 'PR Status Cards', 'Critical Alerts', 'Weekly Metrics']
        },
        '/prs': {
            page: 'Pull Requests',
            features: ['AI Code Analysis', 'Risk Scoring', 'PR Filters', 'PR Details', 'Review Status']
        },
        '/repos': {
            page: 'Repositories',
            features: ['Repository List', 'PR Overview', 'Contributors', 'Activity Stats']
        },
        '/settings': {
            page: 'Settings',
            features: ['AI Analysis Settings', 'Auto-Analysis Options', 'Notifications', 'Organization Settings']
        },
        '/team': {
            page: 'Team',
            features: ['Team Members', 'Roles', 'Permissions', 'Activity']
        },
        '/developers': {
            page: 'Developers',
            features: ['Developer Stats', 'Contributions', 'Activity Timeline']
        },
        '/alerts': {
            page: 'Alerts',
            features: ['Critical Alerts', 'Security Issues', 'High-Risk PRs']
        }
    };

    for (const [path, info] of Object.entries(contexts)) {
        if (pathname.includes(path)) {
            return info;
        }
    }

    return {
        page: 'TeamPulse',
        features: ['Dashboard', 'Pull Requests', 'Repositories', 'Team', 'AI Analysis']
    };
}
