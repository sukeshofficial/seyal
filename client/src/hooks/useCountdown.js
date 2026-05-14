import { useState, useEffect, useCallback } from "react";

/**
 * useCountdown Hook
 * @param {number} initialSeconds - Starting time in seconds
 * @returns {Object} - { seconds, isActive, start, reset }
 */
const useCountdown = (initialSeconds = 60) => {
    const [seconds, setSeconds] = useState(initialSeconds);
    const [isActive, setIsActive] = useState(true);

    const start = useCallback(() => {
        setSeconds(initialSeconds);
        setIsActive(true);
    }, [initialSeconds]);

    const reset = useCallback(() => {
        setSeconds(initialSeconds);
        setIsActive(true);
    }, [initialSeconds]);

    useEffect(() => {
        let interval = null;
        if (isActive && seconds > 0) {
            interval = setInterval(() => {
                setSeconds((prev) => prev - 1);
            }, 1000);
        } else if (seconds === 0) {
            setIsActive(false);
            clearInterval(interval);
        }
        return () => clearInterval(interval);
    }, [isActive, seconds]);

    return { seconds, isActive, start, reset };
};

export default useCountdown;
