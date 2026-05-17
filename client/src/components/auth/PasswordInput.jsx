import React, { forwardRef, memo, useCallback, useId, useState } from "react";
import { Eye, EyeOff, Lock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

/* -------------------------------------------------------------------------- */
/*                                   Config                                   */
/* -------------------------------------------------------------------------- */

const DEFAULT_AUTOCOMPLETE = "current-password";

/* -------------------------------------------------------------------------- */
/*                                   Styles                                   */
/* -------------------------------------------------------------------------- */

const containerClass = "group relative";
const leadingIconClass = cn(
  "absolute left-3 top-1/2",
  "h-3.5 w-3.5 -translate-y-1/2",
  "text-zinc-600 transition-colors",
  "dark:group-focus-within:text-indigo-400"
);
const inputBaseClass = cn(
  "h-10 rounded-full",
  "border-zinc-800 bg-zinc-950/50",
  "pl-9 pr-11",
  "focus-visible:ring-offset-0",
  "focus-visible:ring-indigo-500/20"
);
const toggleButtonClass = cn(
  "absolute right-2 top-1/2",
  "flex h-6 w-6 -translate-y-1/2",
  "items-center justify-center",
  "rounded-full outline-none",
  "text-zinc-500 transition-all",
  "hover:bg-zinc-200 hover:text-zinc-900",
  "dark:hover:bg-zinc-800 dark:hover:text-zinc-50",
  "focus-visible:ring-2",
  "focus-visible:ring-indigo-500/40",
  "disabled:pointer-events-none",
  "disabled:opacity-50"
);
const actionIconClass = "h-4 w-4";
const srOnlyClass = "sr-only";

/* -------------------------------------------------------------------------- */
/*                               Password Input                               */
/* -------------------------------------------------------------------------- */

/**
 * @param {Object} props
 * @param {string} [props.className]
 * @param {boolean} [props.disabled=false]
 * @param {boolean} [props.readOnly=false]
 * @param {boolean} [props.defaultVisible=false]
 * @param {(visible: boolean) => void} [props.onVisibilityChange]
 */
const PasswordInput = memo(
  forwardRef(function PasswordInput(
    {
      className,
      disabled = false,
      readOnly = false,
      defaultVisible = false,
      onVisibilityChange,
      autoComplete,
      id,
      ...props
    },
    ref
  ) {
    const generatedId = useId();
    const inputId = id ?? `password-input-${generatedId}`;
    const [isPasswordVisible, setIsPasswordVisible] = useState(defaultVisible);
    const isToggleDisabled = disabled || readOnly;

    /* ---------------------------------------------------------------------- */
    /*                               Computed UI                              */
    /* ---------------------------------------------------------------------- */

    const inputType = isPasswordVisible ? "text" : "password";
    const visibilityLabel = isPasswordVisible ? "Hide password" : "Show password";
    const inputClass = cn(inputBaseClass, className);
    const visibilityIcon = isPasswordVisible ? (
      <EyeOff aria-hidden="true" className={actionIconClass} />
    ) : (
      <Eye aria-hidden="true" className={actionIconClass} />
    );

    /* ---------------------------------------------------------------------- */
    /*                                 Actions                                 */
    /* ---------------------------------------------------------------------- */

    const handleToggleVisibility = useCallback(() => {
      if (isToggleDisabled) return;

      setIsPasswordVisible((previous) => {
        const next = !previous;
        onVisibilityChange?.(next);
        return next;
      });
    }, [isToggleDisabled, onVisibilityChange]);

    return (
      <div className={containerClass}>
        {/* Leading Icon */}
        <Lock aria-hidden="true" className={leadingIconClass} />

        <Input
          {...props}
          id={inputId}
          ref={ref}
          disabled={disabled}
          readOnly={readOnly}
          type={inputType}
          autoComplete={autoComplete ?? DEFAULT_AUTOCOMPLETE}
          className={inputClass}
        />

        {/* Password Toggle */}
        <button
          type="button"
          disabled={isToggleDisabled}
          onClick={handleToggleVisibility}
          aria-label={visibilityLabel}
          aria-controls={inputId}
          aria-pressed={isPasswordVisible}
          title={visibilityLabel}
          className={toggleButtonClass}
        >
          <span className={srOnlyClass}>
            {visibilityLabel}
          </span>

          {visibilityIcon}
        </button>
      </div>
    );
  })
);

PasswordInput.displayName = "PasswordInput";

export default PasswordInput;
