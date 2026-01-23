"use client";

import { useState, useEffect } from 'react';
import { Sparkles } from 'lucide-react';
import { AIGuideChatPanel } from './AIGuideChatPanel';

export function AIGuideButton() {
    const [isOpen, setIsOpen] = useState(false);
    const [hasInteracted, setHasInteracted] = useState(false);

    useEffect(() => {
        const interacted = localStorage.getItem('ai_guide_interacted');
        setHasInteracted(!!interacted);
    }, []);

    const handleOpen = () => {
        setIsOpen(true);
        localStorage.setItem('ai_guide_interacted', 'true');
        setHasInteracted(true);
    };

    return (
        <>
            {/* Floating AI Guide Button */}
            <button
                onClick={handleOpen}
                className={`
          fixed bottom-6 right-6 z-50
          w-14 h-14 sm:w-16 sm:h-16
          rounded-full
          bg-gradient-to-r from-brand to-purple-600
          text-white shadow-lg shadow-brand/50
          hover:shadow-xl hover:shadow-brand/60
          hover:scale-110 active:scale-95
          transition-all duration-200
          flex items-center justify-center
          cursor-pointer
          ${!hasInteracted ? 'animate-pulse' : ''}
        `}
                aria-label="AI Guide - Get help using TeamPulse"
                title="Need help? Ask AI Guide"
            >
                <Sparkles className="w-6 h-6 sm:w-7 sm:h-7" />
            </button>

            {/* Chat Panel */}
            {isOpen && (
                <AIGuideChatPanel onClose={() => setIsOpen(false)} />
            )}
        </>
    );
}
