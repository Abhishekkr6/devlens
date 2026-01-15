import { useCallback, useEffect, useState } from 'react';

type SoundType = 'notification' | 'invite' | 'alert' | 'success';

// Simple notification sounds using Web Audio API
const createBeep = (frequency: number, duration: number, volume: number = 0.3) => {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = frequency;
    gainNode.gain.value = volume;

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + duration);
};

// Sound configurations
const SOUNDS: Record<SoundType, () => void> = {
    notification: () => createBeep(800, 0.1, 0.3), // Single beep
    invite: () => {
        // Double beep for invites
        createBeep(600, 0.08, 0.3);
        setTimeout(() => createBeep(800, 0.08, 0.3), 100);
    },
    alert: () => {
        // Urgent triple beep
        createBeep(1000, 0.06, 0.4);
        setTimeout(() => createBeep(1000, 0.06, 0.4), 80);
        setTimeout(() => createBeep(1000, 0.06, 0.4), 160);
    },
    success: () => {
        // Rising tone
        createBeep(600, 0.08, 0.25);
        setTimeout(() => createBeep(800, 0.12, 0.25), 80);
    },
};

export function useNotificationSound() {
    const [isMuted, setIsMuted] = useState(false);
    const [isEnabled, setIsEnabled] = useState(false);

    // Load mute state from localStorage
    useEffect(() => {
        const stored = localStorage.getItem('notificationSoundMuted');
        setIsMuted(stored === 'true');
        setIsEnabled(true);
    }, []);

    const playSound = useCallback(
        (type: SoundType = 'notification') => {
            if (!isEnabled || isMuted) return;

            try {
                SOUNDS[type]();
            } catch (error) {
                console.error('Failed to play notification sound:', error);
            }
        },
        [isMuted, isEnabled]
    );

    const toggleMute = useCallback(() => {
        const newMuted = !isMuted;
        setIsMuted(newMuted);
        localStorage.setItem('notificationSoundMuted', String(newMuted));
    }, [isMuted]);

    return {
        playSound,
        isMuted,
        toggleMute,
        isEnabled,
    };
}
