import { useState, useEffect, useCallback, useRef, useMemo } from "react";

const COUNTDOWN_CONFIG = {
  INTERVAL_MS: 1000,
  DEFAULT_SECONDS: 60,
  MIN_SECONDS: 0,
};
/* -------------------------------------------------------------------------- */
/*                               Helper Functions                             */
/* -------------------------------------------------------------------------- */

/**
 * Formats seconds into a MM:SS string.
 * Useful for derived UI state.
 */
const formatDisplayTime = (totalSeconds) => {
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
};

/**
 * useCountdown
 * A robust timer hook with pause, resume, and completion lifecycle support.
 * 
 * @param {Object} options
 * @param {number} options.initialSeconds - Starting value
 * @param {boolean} options.autoStart - Whether to start on mount
 * @param {function} options.onComplete - Callback when timer hits zero
 */
export const useCountdown = ({
  initialSeconds = COUNTDOWN_CONFIG.DEFAULT_SECONDS,
  autoStart = true,
  onComplete = null,
} = {}) => {
  /* ---------------------------------------------------------------------- */
  /*                                Hooks                                   */
  /* ---------------------------------------------------------------------- */

  const [seconds, setSeconds] = useState(initialSeconds);
  const [isActive, setIsActive] = useState(autoStart);
  const timerRef = useRef(null);
  const onCompleteRef = useRef(onComplete);

  /* ---------------------------------------------------------------------- */
  /*                             Computed UI                                */
  /* ---------------------------------------------------------------------- */

  /**
   * Derived values for the consuming component.
   */
  const formattedTime = useMemo(() => formatDisplayTime(seconds), [seconds]);
  const isFinished = useMemo(() => seconds <= 0, [seconds]);
  const progress = useMemo(() =>
    (seconds / initialSeconds) * 100,
    [seconds, initialSeconds]
  );

  /* ---------------------------------------------------------------------- */
  /*                                Actions                                 */
  /* ---------------------------------------------------------------------- */

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const start = useCallback(() => {
    if (seconds > 0) setIsActive(true);
  }, [seconds]);

  const pause = useCallback(() => {
    setIsActive(false);
  }, []);

  const reset = useCallback(() => {
    clearTimer();
    setSeconds(initialSeconds);
    setIsActive(autoStart);
  }, [initialSeconds, autoStart, clearTimer]);

  /* ---------------------------------------------------------------------- */
  /*                              Side Effects                              */
  /* ---------------------------------------------------------------------- */

  // Keep callback ref updated
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  /**
   * Core Timer Logic
   * Note: We only re-run this effect when the "isActive" state toggles.
   * This is more performant than re-creating the interval every second.
   */
  useEffect(() => {
    if (isActive && seconds > 0) {
      timerRef.current = setInterval(() => {
        setSeconds((prev) => {
          if (prev <= 1) {
            clearTimer();
            setIsActive(false);
            onCompleteRef.current?.();
            return 0;
          }
          return prev - 1;
        });
      }, COUNTDOWN_CONFIG.INTERVAL_MS);
    }

    return () => clearTimer();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActive, clearTimer]);

  return {
    seconds,
    formattedTime,
    progress,
    isActive,
    isFinished,
    start,
    pause,
    reset,
  };
};

export default useCountdown;
