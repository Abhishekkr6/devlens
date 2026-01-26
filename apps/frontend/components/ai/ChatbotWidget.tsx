"use client";

import { useEffect, useRef, useState } from 'react';
import { MessageCircle, X, Send, Trash2, Sparkles, Loader2 } from 'lucide-react';
import { useChatbotStore } from '@/store/chatbotStore';
import { chatbotAPI } from '@/lib/chatbotAPI';
import { useUserStore } from '@/store/userStore';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';


export function ChatbotWidget() {
    const { isOpen, messages, isLoading, suggestions, setOpen, addMessage, setLoading, setSuggestions, clearMessages, loadHistory } = useChatbotStore();
    const { activeOrgId } = useUserStore();
    const [input, setInput] = useState('');
    const [isInitialized, setIsInitialized] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Load conversation history on mount
    useEffect(() => {
        if (activeOrgId && !isInitialized) {
            loadConversationHistory();
            setIsInitialized(true);
        }
    }, [activeOrgId, isInitialized]);

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
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setOpen(true)}
                        className="fixed bottom-6 right-6 z-50 bg-gradient-to-r from-brand to-purple-600 text-white p-4 rounded-full shadow-2xl hover:shadow-brand/50 transition-all duration-300"
                    >
                        <MessageCircle className="w-6 h-6" />
                        <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></span>
                    </motion.button>
                )}
            </AnimatePresence>

            {/* Chat Panel */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 100, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 100, scale: 0.9 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        className="fixed bottom-6 right-6 z-50 w-[400px] h-[600px] bg-surface border border-border rounded-2xl shadow-2xl flex flex-col overflow-hidden"
                    >
                        {/* Header */}
                        <div className="bg-gradient-to-r from-brand to-purple-600 text-white p-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-white/20 rounded-lg">
                                    <Sparkles className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="font-semibold">TeamPulse AI</h3>
                                    <p className="text-xs text-white/80">Ask me anything!</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                {messages.length > 0 && (
                                    <button
                                        onClick={handleClearHistory}
                                        className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                                        title="Clear history"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                )}
                                <button
                                    onClick={() => setOpen(false)}
                                    className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-background">
                            {messages.length === 0 && (
                                <div className="text-center py-8">
                                    <div className="inline-flex p-4 bg-brand/10 rounded-full mb-4">
                                        <Sparkles className="w-8 h-8 text-brand" />
                                    </div>
                                    <h4 className="text-lg font-semibold text-text-primary mb-2">
                                        Welcome to TeamPulse AI!
                                    </h4>
                                    <p className="text-sm text-text-secondary mb-4">
                                        I can help you with pull requests, developer stats, commits, and more.
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
                                        className={`max-w-[80%] rounded-2xl px-4 py-2 ${message.type === 'user'
                                            ? 'bg-brand text-white'
                                            : 'bg-surface border border-border text-text-primary'
                                            }`}
                                    >
                                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                                        <span className="text-xs opacity-70 mt-1 block">
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
                                    <div className="bg-surface border border-border rounded-2xl px-4 py-3 flex items-center gap-2">
                                        <Loader2 className="w-4 h-4 animate-spin text-brand" />
                                        <span className="text-sm text-text-secondary">Thinking...</span>
                                    </div>
                                </motion.div>
                            )}

                            <div ref={messagesEndRef} />
                        </div>

                        {/* Quick Suggestions */}
                        {messages.length === 0 && suggestions.length > 0 && (
                            <div className="px-4 py-2 border-t border-border bg-surface/50">
                                <p className="text-xs text-text-secondary mb-2">Try asking:</p>
                                <div className="flex flex-wrap gap-2">
                                    {suggestions.map((suggestion, index) => (
                                        <button
                                            key={index}
                                            onClick={() => handleSendMessage(suggestion)}
                                            className="text-xs px-3 py-1.5 bg-brand/10 text-brand rounded-full hover:bg-brand/20 transition-colors"
                                        >
                                            {suggestion}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Input */}
                        <div className="p-4 border-t border-border bg-surface">
                            <div className="flex items-center gap-2">
                                <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    placeholder="Ask me anything..."
                                    disabled={isLoading}
                                    className="flex-1 px-4 py-2 bg-background border border-border rounded-full text-sm text-text-primary placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-brand/50 disabled:opacity-50"
                                />
                                <button
                                    onClick={() => handleSendMessage()}
                                    disabled={!input.trim() || isLoading}
                                    className="p-2 bg-brand text-white rounded-full hover:bg-brand/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <Send className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
