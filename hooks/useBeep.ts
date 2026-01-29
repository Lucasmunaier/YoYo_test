
import { useCallback } from 'react';
import { BEEP_SOUND } from '../constants';

// --- Web Audio API Setup ---

let audioContext: AudioContext | null = null;
let audioBuffer: AudioBuffer | null = null;
let isInitializing = false;

// Helper to decode the Base64 sound to an ArrayBuffer
function base64ToArrayBuffer(base64: string): ArrayBuffer {
    // Remove the data URI prefix if it exists
    const base64Data = base64.split(',')[1] || base64;
    const binaryString = window.atob(base64Data);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
}

// Initializes the AudioContext and decodes the audio data.
// This is done lazily on the first unlock attempt.
async function initializeAudio() {
    if (audioContext || isInitializing || typeof window === 'undefined') {
        return;
    }
    isInitializing = true;
    try {
        audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const arrayBuffer = base64ToArrayBuffer(BEEP_SOUND);
        audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
        console.log("Audio resources initialized successfully.");
    } catch (e) {
        console.error("Failed to initialize Web Audio resources:", e);
        // Reset context on failure so we can try again
        audioContext = null; 
    } finally {
        isInitializing = false;
    }
}

/**
 * Unlocks the Web Audio API.
 * This function MUST be called from within a user-initiated event handler
 * (e.g., a 'click' or 'touchend' event).
 */
export const unlockAudio = () => {
    const startAudio = async () => {
        if (!audioContext) {
            await initializeAudio();
        }

        if (audioContext && audioContext.state === 'suspended') {
            audioContext.resume().then(() => {
                console.log("AudioContext resumed successfully.");
            }).catch(e => console.error("Failed to resume AudioContext:", e));
        }
    };
    
    startAudio();
};

/**
 * Custom hook that returns a function to play the loaded beep sound.
 */
export const useBeep = (): (() => void) => {
    return useCallback(() => {
        if (audioContext && audioBuffer && audioContext.state === 'running') {
            try {
                const source = audioContext.createBufferSource();
                source.buffer = audioBuffer;
                source.connect(audioContext.destination);
                source.start(0);
            } catch (e) {
                console.error("Error playing beep sound:", e);
            }
        } else {
            console.warn(`Cannot play beep. AudioContext state: ${audioContext?.state}`);
        }
    }, []);
};
