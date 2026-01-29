import { useCallback } from 'react';

// Mantemos o contexto fora do hook para ser partilhado
let audioContext: AudioContext | null = null;

/**
 * Ativa o sistema de áudio.
 * Deve ser chamado num evento de clique (como o botão "Iniciar").
 */
export const unlockAudio = () => {
    if (!audioContext) {
        audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (audioContext.state === 'suspended') {
        audioContext.resume();
    }
};

/**
 * Hook que gera um som de "bip" sintético.
 */
export const useBeep = () => {
    return useCallback(() => {
        if (!audioContext || audioContext.state !== 'running') return;

        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.type = 'sine'; 
        oscillator.frequency.setValueAtTime(880, audioContext.currentTime); // Tom do bip
        
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + 0.5);

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.5);
    }, []);
};