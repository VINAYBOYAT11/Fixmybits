import { useEffect, useRef } from 'react';

export function ScrollSound() {
  const audioContextRef = useRef<AudioContext | null>(null);
  const currentCheckpointIndexRef = useRef(-1);
  const playedCheckpointsRef = useRef<Set<number>>(new Set());

  useEffect(() => {
    const initAudioContext = () => {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
    };

    const playTick = () => {
      if (!audioContextRef.current) {
        initAudioContext();
      }

      const audioContext = audioContextRef.current!;
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = 600;
      oscillator.type = 'sine';

      gainNode.gain.setValueAtTime(0.05, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.15);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.15);
    };

    const getCheckpointOffsets = () => {
      const checkpoints = ['#features', '#how-it-works', '#careers', '#signup', '#contact'];
      return checkpoints
        .map((selector) => document.querySelector(selector) as HTMLElement | null)
        .filter((element): element is HTMLElement => element !== null)
        .map((element) => element.offsetTop);
    };

    const handleScroll = () => {
      const currentScrollY = window.scrollY + window.innerHeight * 0.4;
      const checkpointOffsets = getCheckpointOffsets();

      let activeIndex = -1;
      for (let i = 0; i < checkpointOffsets.length; i += 1) {
        if (currentScrollY >= checkpointOffsets[i]) {
          activeIndex = i;
        }
      }

      if (activeIndex !== currentCheckpointIndexRef.current) {
        currentCheckpointIndexRef.current = activeIndex;

        if (activeIndex >= 0 && !playedCheckpointsRef.current.has(activeIndex)) {
          playedCheckpointsRef.current.add(activeIndex);
          playTick();
        }
      }
    };

    document.addEventListener('click', initAudioContext, { once: true });
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll);
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, []);

  return null;
}
