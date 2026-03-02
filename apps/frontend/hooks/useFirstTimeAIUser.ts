import { useEffect, useState } from 'react';

const STORAGE_KEY = 'DevLens_ai_feature_seen';
const MAX_PULSE_COUNT = 3;

export function useFirstTimeAIUser() {
    const [shouldPulse, setShouldPulse] = useState(false);
    const [isFirstTime, setIsFirstTime] = useState(false);

    useEffect(() => {
        // Check if user has seen AI feature
        const seenCount = parseInt(localStorage.getItem(STORAGE_KEY) || '0', 10);

        if (seenCount < MAX_PULSE_COUNT) {
            setShouldPulse(true);
            setIsFirstTime(seenCount === 0);
        }
    }, []);

    const markAsSeen = () => {
        const seenCount = parseInt(localStorage.getItem(STORAGE_KEY) || '0', 10);
        localStorage.setItem(STORAGE_KEY, String(seenCount + 1));
        setShouldPulse(false);
    };

    return { shouldPulse, isFirstTime, markAsSeen };
}
