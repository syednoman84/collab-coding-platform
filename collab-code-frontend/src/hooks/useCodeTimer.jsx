// src/hooks/useCodeTimer.jsx
import { useState, useCallback, useRef } from 'react';

export function useCodeTimer() {
  const [startTime, setStartTimeState] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [finalTime, setFinalTime] = useState(null);
  const intervalRef = useRef(null);

  const startTimer = useCallback(() => {
    const now = Date.now();
    setStartTimeState(now);
    setElapsedTime(0);
    setFinalTime(null);

    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - now) / 1000));
    }, 1000);
  }, []);

  const resetTimer = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setStartTimeState(null);
    setElapsedTime(0);
    setFinalTime(null);
  }, []);

  return {
    startTime,
    elapsedTime,
    finalTime,
    startTimer,
    resetTimer,
    setFinalTime
  };
}
