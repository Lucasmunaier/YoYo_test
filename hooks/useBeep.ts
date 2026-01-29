
import { useCallback } from 'react';
import { BEEP_SOUND } from '../constants';

let audio: HTMLAudioElement | null = null;
const getAudio = () => {
    if (typeof window !== 'undefined' && !audio) {
        audio = new Audio(BEEP_SOUND);
    }
    return audio;
}

// This function must be called from a user gesture handler to unlock audio.
export const unlockBeep = () => {
    const beep = getAudio();
    if (beep && beep.paused) {
        beep.volume = 0;
        const promise = beep.play();
        if (promise) {
            promise.then(() => {
                // On success, pause and reset.
                beep.pause();
                beep.currentTime = 0;
                beep.volume = 1;
            }).catch(e => {
                // It failed, probably because the user hasn't interacted with the page yet.
                // Or some other browser restriction.
                console.warn("Audio could not be unlocked.", e);
            });
        }
    }
}

export const useBeep = (): (() => void) => {
  const playBeep = useCallback(() => {
    const beep = getAudio();
    if (beep) {
      beep.currentTime = 0;
      beep.play().catch(error => console.error("Error playing beep sound:", error));
    }
  }, []);

  return playBeep;
};
