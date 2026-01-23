"use client";

import { useState, useEffect, useRef } from 'react';
import { X, Send, Sparkles, Loader2, BookOpen, Zap, HelpCircle } from 'lucide-react';
import { usePathname } from 'next/navigation';

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
}

interface AIGuideChatPanelProps {
    onClose: () => void;
}

export function AIGuideChatPanel({ onClose }: AIGuideChatPanelProps) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const pathname = usePathname();
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const messagesContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Send welcome message based on current page
        const welcomeMessage = getWelcomeMessage(pathname);
        setMessages([{
            id: '1',
            role: 'assistant',
            content: welcomeMessage,
            timestamp: new Date()
        }]);
    }, [pathname]);

    useEffect(() => {
        // Auto-scroll to bottom
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    useEffect(() => {
        // Prevent scroll propagation to background
        const container = messagesContainerRef.current;
        if (!container) return;

        const handleWheel = (e: WheelEvent) => {
            const { scrollTop, scrollHeight, clientHeight } = container;
            const isScrollingDown = e.deltaY > 0;
            const isScrollingUp = e.deltaY < 0;

            // Prevent propagation if we're scrolling within bounds
            if (
                (isScrollingDown && scrollTop + clientHeight < scrollHeight) ||
                (isScrollingUp && scrollTop > 0)
            ) {
                e.stopPropagation();
            }
        };

        container.addEventListener('wheel', handleWheel, { passive: false });
        return () => container.removeEventListener('wheel', handleWheel);
    }, []);

    const sendMessage = async (text?: string) => {
        const messageText = text || input;
        if (!messageText.trim()) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: messageText,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setLoading(true);

        try {
            const response = await fetch('/api/v1/ai/guide', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: messageText,
                    context: pathname,
                    history: messages.slice(-5) // Last 5 messages for context
                })
            });

            const data = await response.json();

            const aiMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: data.response || "I'm here to help! Could you rephrase your question?",
                timestamp: new Date()
            };

            setMessages(prev => [...prev, aiMessage]);
        } catch (error) {
            console.error('AI Guide error:', error);
            const errorMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: "Sorry, I'm having trouble connecting. Please try again in a moment.",
                timestamp: new Date()
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setLoading(false);
        }
    };

    const handleQuickAction = (question: string) => {
        sendMessage(question);
    };

    return (
        <div className="fixed bottom-24 right-6 z-[9999] w-[400px] max-w-[calc(100vw-3rem)] sm:w-[400px] h-[600px] max-h-[calc(100vh-8rem)] bg-[#0a0a0a] dark:bg-[#0a0a0a] border-2 border-border rounded-2xl shadow-2xl flex flex-col animate-in slide-in-from-bottom-4 fade-in-0 duration-300 backdrop-blur-xl">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border bg-gradient-to-r from-brand/10 to-purple-500/10 rounded-t-2xl">
                <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-brand/20 rounded-lg">
                        <Sparkles className="w-5 h-5 text-brand" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-text-primary">AI Guide</h3>
                        <p className="text-[10px] text-text-secondary">Your TeamPulse assistant</p>
                    </div>
                </div>
                <button
                    onClick={onClose}
                    className="p-1.5 hover:bg-surface rounded-lg transition-colors"
                    aria-label="Close AI Guide"
                >
                    <X className="w-5 h-5 text-text-secondary" />
                </button>
            </div>

            {/* Messages */}
            <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-surface/30 overscroll-behavior-y-contain">
                {messages.map(message => (
                    <div
                        key={message.id}
                        className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                        <div
                            className={`max-w-[85%] rounded-2xl px-4 py-2.5 ${message.role === 'user'
                                ? 'bg-brand text-white'
                                : 'bg-background border border-border text-text-primary'
                                }`}
                        >
                            <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                            <p className={`text-[10px] mt-1 ${message.role === 'user' ? 'text-white/70' : 'text-text-secondary'
                                }`}>
                                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                        </div>
                    </div>
                ))}

                {loading && (
                    <div className="flex justify-start">
                        <div className="bg-background border border-border rounded-2xl px-4 py-2.5">
                            <div className="flex items-center gap-2">
                                <Loader2 className="w-4 h-4 animate-spin text-brand" />
                                <span className="text-sm text-text-secondary">Thinking...</span>
                            </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Quick Actions */}
            <div className="px-4 py-3 border-t border-border bg-background/50">
                <p className="text-[10px] text-text-secondary mb-2 font-medium">Quick Help:</p>
                <div className="flex gap-2 flex-wrap">
                    <QuickActionButton
                        icon={<BookOpen className="w-3 h-3" />}
                        onClick={() => handleQuickAction("How do I create a PR?")}
                    >
                        Create PR
                    </QuickActionButton>
                    <QuickActionButton
                        icon={<Sparkles className="w-3 h-3" />}
                        onClick={() => handleQuickAction("Show me AI features")}
                    >
                        AI Features
                    </QuickActionButton>
                    <QuickActionButton
                        icon={<Zap className="w-3 h-3" />}
                        onClick={() => handleQuickAction("Give me a dashboard tour")}
                    >
                        Dashboard
                    </QuickActionButton>
                    <QuickActionButton
                        icon={<HelpCircle className="w-3 h-3" />}
                        onClick={() => handleQuickAction("What can you help me with?")}
                    >
                        Help
                    </QuickActionButton>
                </div>
            </div>

            {/* Input */}
            <div className="p-4 border-t border-border bg-background rounded-b-2xl">
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                        placeholder="Ask me anything..."
                        className="flex-1 px-4 py-2.5 rounded-full border border-border bg-surface text-text-primary placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand text-sm"
                        disabled={loading}
                    />
                    <button
                        onClick={() => sendMessage()}
                        disabled={!input.trim() || loading}
                        className="p-2.5 rounded-full bg-brand text-white hover:bg-brand/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-105 active:scale-95"
                        aria-label="Send message"
                    >
                        <Send className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    );
}

function QuickActionButton({
    onClick,
    children,
    icon
}: {
    onClick: () => void;
    children: React.ReactNode;
    icon: React.ReactNode;
}) {
    return (
        <button
            onClick={onClick}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-full bg-surface hover:bg-surface/80 text-text-secondary hover:text-text-primary border border-border hover:border-brand/50 transition-all"
        >
            {icon}
            {children}
        </button>
    );
}

function getWelcomeMessage(pathname: string): string {
    if (pathname.includes('/prs')) {
        return "👋 Welcome to Pull Requests!\n\nI can help you:\n• Analyze PRs with AI\n• Understand risk scores\n• Navigate PR details\n• Filter and search PRs\n\nWhat would you like to know?";
    }
    if (pathname.includes('/dashboard') || pathname.includes('/organization')) {
        return "👋 Welcome to your Dashboard!\n\nHere you can:\n• View team activity\n• Monitor PR status\n• Check critical alerts\n• Track metrics\n\nNeed help with anything?";
    }
    if (pathname.includes('/repos')) {
        return "👋 Welcome to Repositories!\n\nI can help you:\n• Navigate repositories\n• View PR overview\n• Check contributors\n• Understand repo metrics\n\nWhat would you like to explore?";
    }
    if (pathname.includes('/settings')) {
        return "👋 Welcome to Settings!\n\nI can help you:\n• Configure AI analysis\n• Set up preferences\n• Manage organization\n• Understand options\n\nWhat do you need help with?";
    }
    return "👋 Hi! I'm your TeamPulse AI Guide.\n\nI can help you:\n• Navigate the platform\n• Use AI features\n• Understand metrics\n• Get started quickly\n\nWhat would you like to learn?";
}
