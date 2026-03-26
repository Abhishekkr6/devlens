"use client";

import { useEffect, useRef, useState } from 'react';
import { MessageCircle, X, Send, Trash2, Sparkles } from 'lucide-react';
import { useChatbotStore } from '@/store/chatbotStore';
import { chatbotAPI } from '@/lib/chatbotAPI';
import { useUserStore } from '@/store/userStore';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';
import { usePathname } from 'next/navigation';


export function ChatbotWidget() {
    const { isOpen, messages, isLoading, suggestions, setOpen, addMessage, setLoading, setSuggestions, clearMessages, loadHistory } = useChatbotStore();
    const { activeOrgId } = useUserStore();
    const [input, setInput] = useState('');
    const [isInitialized, setIsInitialized] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const messagesContainerRef = useRef<HTMLDivElement>(null);
    const pathname = usePathname();

    // Context-aware welcome message
    const prevPathRef = useRef<string | null>(null);

    // Load conversation history on mount
    useEffect(() => {
        if (activeOrgId && !isInitialized) {
            // If we already have messages, don't reload history (preserves context on navigation)
            if (messages.length > 0) {
                setIsInitialized(true);
                return;
            }

            loadConversationHistory();
            setIsInitialized(true);
        }
    }, [activeOrgId, isInitialized, messages.length]);

    // Context-aware welcome message
    useEffect(() => {
        const getSection = (p: string) => {
            if (p.includes('/prs')) return 'prs';
            if (p.includes('/repos')) return 'repos';
            if (p.includes('/settings')) return 'settings';
            if (p.includes('/alerts')) return 'alerts';
            if (p.includes('/developers')) return 'developers';
            if (p.includes('/activity')) return 'activity';
            if (p.includes('/team')) return 'team';
            if (p.includes('/dashboard') || p.includes('/organization')) return 'dashboard';
            return 'general';
        };

        const currentSection = getSection(pathname);
        const prevSection = prevPathRef.current ? getSection(prevPathRef.current) : null;

        // Trigger if section changed (comparing to non-null prev) or simply if it's a new mount/first load
        if (currentSection !== prevSection) {
            // Clear previous messages to keep context fresh as per user request
            clearMessages();

            const welcomeMsg = getWelcomeMessage(pathname);

            // Avoid duplicate messages if the last one was the same (though clearMessages makes this less likely, good for safety)
            addMessage({
                type: 'bot',
                content: welcomeMsg
            });
        }

        prevPathRef.current = pathname;
    }, [pathname, messages, addMessage]);

    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const loadConversationHistory = async () => {
        if (!activeOrgId) return;

        try {
            const history = await chatbotAPI.getHistory(activeOrgId, 20);
            loadHistory(history);
        } catch (error) {
            console.error('Failed to load chat history:', error);
        }
    };

    // Prevent scroll propagation to background
    const widgetContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const container = widgetContainerRef.current;
        const messagesContainer = messagesContainerRef.current;
        if (!container || !isOpen) return;

        const handleWheel = (e: WheelEvent) => {
            // If we are over the message container, handle edge scrolling
            if (messagesContainer && messagesContainer.contains(e.target as Node)) {
                const { scrollTop, scrollHeight, clientHeight } = messagesContainer;
                const isScrollingDown = e.deltaY > 0;
                const isScrollingUp = e.deltaY < 0;

                // If content is scrollable
                if (scrollHeight > clientHeight) {
                    // Check edges
                    if (
                        (isScrollingDown && scrollTop + clientHeight >= scrollHeight - 1) ||
                        (isScrollingUp && scrollTop <= 0)
                    ) {
                        e.preventDefault(); // Stop at edges
                    }
                    e.stopPropagation(); // Always stop propagation if it's the scroll container
                    return;
                }
            }

            // For any other area (header, input, or non-scrollable content), prevent default scroll
            e.preventDefault();
            e.stopPropagation();
        };

        container.addEventListener('wheel', handleWheel, { passive: false });
        return () => container.removeEventListener('wheel', handleWheel);
    }, [isOpen]);

    const handleSendMessage = async (messageText?: string) => {
        const queryText = messageText || input.trim();

        if (!queryText || !activeOrgId) return;

        // Add user message
        addMessage({
            type: 'user',
            content: queryText
        });

        setInput('');
        setLoading(true);

        try {
            const response = await chatbotAPI.sendQuery({
                query: queryText,
                orgId: activeOrgId
            });

            // Add bot response
            addMessage({
                type: 'bot',
                content: response.message,
                intent: response.intent
            });

            // Update suggestions
            if (response.suggestions && response.suggestions.length > 0) {
                setSuggestions(response.suggestions);
            }
        } catch (error: any) {
            console.error('Chatbot query failed:', error);

            addMessage({
                type: 'bot',
                content: error.response?.data?.error?.message || 'Sorry, I encountered an error. Please try again.'
            });

            toast.error('Failed to process query');
        } finally {
            setLoading(false);
        }
    };

    const handleClearHistory = async () => {
        if (!activeOrgId) return;

        try {
            await chatbotAPI.clearHistory(activeOrgId);
            clearMessages();
            toast.success('Chat history cleared');
        } catch (error) {
            toast.error('Failed to clear history');
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    return (
        <>
            {/* Floating Chat Button */}
            <AnimatePresence>
                {!isOpen && (
                    <motion.button
                        exit={{ scale: 0, opacity: 0, y: 50 }}
                        whileHover={{ scale: 1.1, rotate: -5 }}
                        whileTap={{ scale: 0.95, rotate: 0 }}
                        onClick={() => setOpen(true)}
                        className="fixed bottom-6 right-6 sm:bottom-8 sm:right-8 z-[150] bg-gradient-to-tr from-brand to-indigo-500 text-white p-4 rounded-full shadow-[0_10px_40px_rgba(67,84,227,0.4)] hover:shadow-[0_15px_50px_rgba(67,84,227,0.6)] transition-all duration-300 cursor-pointer flex items-center justify-center group"
                    >
                        <MessageCircle className="w-6 h-6 group-hover:scale-110 transition-transform duration-300" />
                        <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-background shadow-sm animate-pulse"></span>
                    </motion.button>
                )}
            </AnimatePresence>

            {/* Chat Panel */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        ref={widgetContainerRef}
                        initial={{ opacity: 0, y: 100, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 100, scale: 0.95 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        className="fixed bottom-0 right-0 sm:bottom-6 sm:right-6 z-[9999] w-full sm:w-[400px] h-[85vh] sm:h-[600px] max-h-[100dvh] sm:max-h-[85vh] backdrop-blur-3xl bg-surface/80 border border-white/10 rounded-t-3xl sm:rounded-3xl shadow-[0_0_40px_rgba(0,0,0,0.5)] flex flex-col overflow-hidden"
                    >
                        {/* Decorative Background Glow */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-brand/10 blur-[80px] rounded-full pointer-events-none" />
                        {/* Header */}
                        <div className="bg-surface/50 border-b border-white/5 p-4 flex items-center justify-between shrink-0 relative z-10 backdrop-blur-md">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-brand/20 border border-brand/30 rounded-xl shadow-[0_0_15px_rgba(94,106,210,0.3)]">
                                    <Sparkles className="w-5 h-5 text-brand" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-text-primary tracking-tight">DevLens AI</h3>
                                    <p className="text-xs text-brand font-medium">Ask me anything!</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-1">
                                {messages.length > 0 && (
                                    <button
                                        onClick={handleClearHistory}
                                        className="p-2 hover:bg-surface rounded-lg transition-colors text-text-secondary hover:text-red-400 cursor-pointer"
                                        title="Clear history"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                )}
                                <button
                                    onClick={() => setOpen(false)}
                                    className="p-2 hover:bg-surface rounded-lg transition-colors text-text-secondary hover:text-text-primary cursor-pointer"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </div>


                        {/* Messages */}
                        <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-4 space-y-5 bg-transparent overscroll-contain relative z-10 scrollbar-thin scrollbar-thumb-surface scrollbar-track-transparent">
                            {messages.length === 0 && (
                                <div className="text-center py-10">
                                    <div className="inline-flex p-4 bg-surface/50 border border-white/5 shadow-xl rounded-full mb-5">
                                        <Sparkles className="w-8 h-8 text-brand" />
                                    </div>
                                    <h4 className="text-lg font-bold text-text-primary mb-2">
                                        DevLens AI Guide
                                    </h4>
                                    <p className="text-sm text-text-secondary max-w-[250px] mx-auto leading-relaxed">
                                        I can help you with PRs, stats, codebase navigation, and much more.
                                    </p>
                                </div>
                            )}

                            {messages.map((message) => (
                                <motion.div
                                    key={message.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div
                                        className={`max-w-[85%] rounded-3xl px-5 py-3.5 shadow-sm ${message.type === 'user'
                                            ? 'bg-brand/20 border border-brand/30 text-white rounded-br-sm'
                                            : 'bg-surface/60 backdrop-blur-md border border-white/10 text-text-primary rounded-bl-sm'
                                            }`}
                                    >
                                        <p className="text-[13px] sm:text-sm whitespace-pre-wrap leading-relaxed">
                                            {message.content.split(' ').map((word, i) => {
                                                // Minimal markdown styling for bold / bullets natively
                                                if (word.startsWith('•') || word.startsWith('-')) {
                                                    return <span key={i} className="text-brand font-bold mr-1">{word}</span>;
                                                }
                                                return word + ' ';
                                            })}
                                        </p>
                                        <span className={`text-[10px] sm:text-xs font-semibold mt-2 block ${message.type === 'user' ? 'text-brand-100/70' : 'text-text-secondary'}`}>
                                            {new Date(message.timestamp).toLocaleTimeString([], {
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </span>
                                    </div>
                                </motion.div>
                            ))}

                            {isLoading && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="flex justify-start"
                                >
                                    <div className="bg-surface/50 backdrop-blur-md border border-white/5 rounded-2xl rounded-bl-sm px-5 py-3.5 flex items-center gap-3">
                                        <div className="flex gap-1.5 align-middle">
                                            <div className="w-1.5 h-1.5 bg-brand rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                                            <div className="w-1.5 h-1.5 bg-brand rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                                            <div className="w-1.5 h-1.5 bg-brand rounded-full animate-bounce"></div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            <div ref={messagesEndRef} />
                        </div>

                        {/* Quick Suggestions */}
                        {messages.length === 0 && suggestions.length > 0 && (
                            <div className="px-5 py-3 border-t border-white/5 bg-surface/30 backdrop-blur-md relative z-10">
                                <p className="text-[11px] font-bold uppercase tracking-wider text-text-secondary mb-3">Try asking:</p>
                                <div className="flex flex-wrap gap-2">
                                    {suggestions.map((suggestion, index) => (
                                        <button
                                            key={index}
                                            onClick={() => handleSendMessage(suggestion)}
                                            className="text-xs px-3.5 py-1.5 bg-brand/5 text-brand rounded-xl border border-brand/20 hover:border-brand/50 hover:bg-brand/10 transition-all font-medium cursor-pointer shadow-sm"
                                        >
                                            {suggestion}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Input */}
                        <div className="p-4 border-t border-white/5 bg-surface/50 backdrop-blur-xl relative z-10">
                            <div className="flex items-center gap-3 relative group">
                                <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    placeholder="Ask me anything..."
                                    disabled={isLoading}
                                    className="flex-1 px-5 py-3 bg-surface/80 border border-white/10 rounded-2xl text-sm text-text-primary placeholder:text-text-secondary focus:outline-none focus:ring-4 focus:ring-brand/20 transition-all disabled:opacity-50 shadow-inner"
                                />
                                <button
                                    onClick={() => handleSendMessage()}
                                    disabled={!input.trim() || isLoading}
                                    className="p-3 bg-brand text-white rounded-2xl hover:bg-brand/90 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 cursor-pointer shadow-lg shadow-brand/20"
                                >
                                    <Send className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}

function getWelcomeMessage(pathname: string): string {
    if (pathname.includes('/prs')) {
        return "👋 Welcome to Pull Requests!\n\nI can help you:\n• Analyze PRs with AI\n• Understand risk scores\n• Navigate PR details\n• Filter and search PRs\n\nWhat would you like to know?";
    }
    if (pathname.includes('/repos')) {
        return "👋 Welcome to Repositories!\n\nI can help you:\n• Navigate repositories\n• View PR overview\n• Check contributors\n• Understand repo metrics\n\nWhat would you like to explore?";
    }
    if (pathname.includes('/settings')) {
        return "👋 Welcome to Settings!\n\nI can help you:\n• Configure AI analysis\n• Set up preferences\n• Manage organization\n• Understand options\n\nWhat do you need help with?";
    }
    if (pathname.includes('/alerts')) {
        return "👋 Welcome to Alerts!\n\nI can help you:\n• detailed analysis of alerts\n• Understand risk scores\n• Prioritize critical issues\n• resolution suggestions\n\nWhat do you need help with?";
    }
    if (pathname.includes('/developers')) {
        return "👋 Welcome to Developers!\n\nI can help you:\n• Track developer activity\n• View contribution stats\n• Analyze coding patterns\n• Compare performance\n\nWho would you like to know about?";
    }
    if (pathname.includes('/activity')) {
        return "👋 Welcome to Activity!\n\nI can help you:\n• Review recent events\n• Track team progress\n• Filter activity logs\n• Understand timeline\n\nWhat timeframe are you interested in?";
    }
    if (pathname.includes('/team')) {
        return "👋 Welcome to Team Management!\n\nI can help you:\n• Manage team members\n• Assign roles\n• View access levels\n• Track team performance\n\nWhat would you like to do?";
    }
    if (pathname.includes('/dashboard') || pathname.includes('/organization')) {
        return "👋 Welcome to your Dashboard!\n\nHere you can:\n• View team activity\n• Monitor PR status\n• Check critical alerts\n• Track metrics\n\nNeed help with anything?";
    }
    return "👋 Hi! I'm your DevLens AI Guide.\n\nI can help you:\n• Navigate the platform\n• Use AI features\n• Understand metrics\n• Get started quickly\n\nWhat would you like to learn?";
}
