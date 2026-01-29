import { useCallback } from 'react';

let audioContext: AudioContext | null = null;

export const unlockAudio = () => {
    if (!audioContext) {
        audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (audioContext.state === 'suspended') {
        audioContext.resume();
    }
};

// Nova função para síntese de voz
export const speak = (text: string) => {
    if ('speechSynthesis' in window) {
        // Cancela qualquer fala anterior para não encavalar
        window.speechSynthesis.cancel(); 
        
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'pt-BR';
        utterance.rate = 1.8; // Voz bem mais rápida (era 1.2)
        utterance.pitch = 1.0;
        window.speechSynthesis.speak(utterance);
    }
};

export const useBeep = () => {
    return useCallback(() => {
        if (!audioContext || audioContext.state !== 'running') return;

        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.type = 'sine'; 
        oscillator.frequency.setValueAtTime(880, audioContext.currentTime); 
        
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + 0.5);

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.5);
    }, []);
};