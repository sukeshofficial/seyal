import React, { memo, useCallback, useRef } from "react";
import { cn } from "@/lib/utils";

/* -------------------------------------------------------------------------- */
/*                                   Config                                   */
/* -------------------------------------------------------------------------- */

const OTP_LENGTH = 6;

/* -------------------------------------------------------------------------- */
/*                                   Styles                                   */
/* -------------------------------------------------------------------------- */

const containerClass = cn("flex justify-between", "gap-2 md:gap-4");
const inputBaseClass = cn(
  "h-14 w-12 rounded-xl",
  "border border-zinc-800",
  "bg-zinc-950/50",
  "text-center text-2xl font-bold text-white",
  "outline-none transition-all duration-300",
  "focus:border-indigo-500",
  "focus:bg-zinc-950",
  "focus:ring-4 focus:ring-indigo-500/10"
);
const disabledInputClass = "cursor-not-allowed opacity-50";
const filledInputClass = "border-indigo-500/50 bg-zinc-950";

/* -------------------------------------------------------------------------- */
/*                              Helper Functions                              */
/* -------------------------------------------------------------------------- */

const isNumericValue = (value) => /^\d*$/.test(value);

/* -------------------------------------------------------------------------- */
/*                                 OTP Input                                  */
/* -------------------------------------------------------------------------- */

/**
 * @param {Object} props
 * @param {string} props.value
 * @param {(value: string) => void} props.onChange
 * @param {boolean} [props.disabled=false]
 */
const OTPInput = ({
  value = "",
  onChange = () => { },
  disabled = false,
}) => {
  const inputsRef = useRef([]);

  const otpInputs = Array.from({ length: OTP_LENGTH });

  /* ---------------------------------------------------------------------- */
  /*                                 Actions                                */
  /* ---------------------------------------------------------------------- */

  const focusInput = useCallback((index) => {
    inputsRef.current[index]?.focus();
  }, []);

  const handleChange = useCallback((event, index) => {
    const inputValue = event.target.value;
    if (!isNumericValue(inputValue)) return;

    const updatedValue = value.padEnd(OTP_LENGTH, "").split("");
    updatedValue[index] = inputValue.slice(-1);

    onChange(updatedValue.join(""));

    const shouldFocusNext = inputValue && index < OTP_LENGTH - 1;
    if (shouldFocusNext) focusInput(index + 1);

  },
    [focusInput, onChange, value]
  );

  const handleKeyDown = useCallback((event, index) => {
    const isBackspace = event.key === "Backspace";
    const hasValue = Boolean(value[index]);

    const shouldFocusPrevious = isBackspace && !hasValue && index > 0;
    if (shouldFocusPrevious) focusInput(index - 1);
  },
    [focusInput, value]
  );

  const handlePaste = useCallback((event) => {
    event.preventDefault();

    const pastedValue = event.clipboardData
      .getData("text")
      .slice(0, OTP_LENGTH);

    const isValidPaste = /^\d+$/.test(pastedValue);
    if (!isValidPaste) return;

    onChange(pastedValue);

    const nextIndex = Math.min(pastedValue.length, OTP_LENGTH - 1);
    focusInput(nextIndex);
  },
    [focusInput, onChange]
  );

  return (
    <div
      role="group"
      aria-label="One-time password input"
      className={containerClass}
      onPaste={handlePaste}
    >
      {otpInputs.map((_, index) => {
        const inputValue = value[index] || "";
        const hasValue = Boolean(inputValue);
        const inputClass = cn(
          inputBaseClass,
          disabled && disabledInputClass,
          hasValue && filledInputClass
        );

        return (
          <input
            key={index}
            ref={(element) => { inputsRef.current[index] = element; }}
            type="text"
            maxLength={1}
            disabled={disabled}
            value={inputValue}
            inputMode="numeric"
            autoComplete="one-time-code"
            pattern="\d{1}"
            aria-label={`OTP digit ${index + 1}`}
            className={inputClass}
            onChange={(event) => handleChange(event, index)}
            onKeyDown={(event) => handleKeyDown(event, index)}
          />
        );
      }
      )}
    </div>
  );
};

export default memo(OTPInput);
