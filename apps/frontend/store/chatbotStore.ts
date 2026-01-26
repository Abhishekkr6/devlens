import { create } from 'zustand';

interface Message {
    id: string;
    type: 'user' | 'bot';
    content: string;
    timestamp: Date;
    intent?: string;
}

interface ChatbotStore {
    isOpen: boolean;
    messages: Message[];
    isLoading: boolean;
    suggestions: string[];

    // Actions
    setOpen: (open: boolean) => void;
    addMessage: (message: Omit<Message, 'id' | 'timestamp'>) => void;
    setLoading: (loading: boolean) => void;
    setSuggestions: (suggestions: string[]) => void;
    clearMessages: () => void;
    loadHistory: (history: any[]) => void;
}

export const useChatbotStore = create<ChatbotStore>((set) => ({
    isOpen: false,
    messages: [],
    isLoading: false,
    suggestions: [
        'Show me all PRs',
        'Which developer is most active?',
        'What are the security alerts?'
    ],

    setOpen: (open) => set({ isOpen: open }),

    addMessage: (message) => set((state) => ({
        messages: [
            ...state.messages,
            {
                ...message,
                id: `${Date.now()}-${Math.random()}`,
                timestamp: new Date()
            }
        ]
    })),

    setLoading: (loading) => set({ isLoading: loading }),

    setSuggestions: (suggestions) => set({ suggestions }),

    clearMessages: () => set({ messages: [] }),

    loadHistory: (history) => set({
        messages: history.map((item, index) => [
            {
                id: `history-user-${index}`,
                type: 'user' as const,
                content: item.message,
                timestamp: new Date(item.createdAt)
            },
            {
                id: `history-bot-${index}`,
                type: 'bot' as const,
                content: item.response,
                timestamp: new Date(item.createdAt),
                intent: item.intent
            }
        ]).flat()
    })
}));
