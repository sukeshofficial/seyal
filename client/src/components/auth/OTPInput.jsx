import React, { useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

const OTPInput = ({ value, onChange, disabled }) => {
    const inputs = useRef([]);

    const handleChange = (e, index) => {
        const val = e.target.value;
        if (isNaN(val)) return;

        const newValue = value.split("");
        newValue[index] = val.substring(val.length - 1);
        const joinedValue = newValue.join("");
        onChange(joinedValue);

        // Auto focus next
        if (val && index < 5) {
            inputs.current[index + 1].focus();
        }
    };

    const handleKeyDown = (e, index) => {
        if (e.key === "Backspace" && !value[index] && index > 0) {
            inputs.current[index - 1].focus();
        }
    };

    const handlePaste = (e) => {
        e.preventDefault();
        const data = e.clipboardData.getData("text").slice(0, 6);
        if (!/^\d+$/.test(data)) return;
        onChange(data);

        // Focus last filled or next available
        const nextIndex = Math.min(data.length, 5);
        inputs.current[nextIndex].focus();
    };

    return (
        <div className="flex justify-between gap-2 md:gap-4" onPaste={handlePaste}>
            {[...Array(6)].map((_, i) => (
                <input
                    key={i}
                    ref={(el) => (inputs.current[i] = el)}
                    type="text"
                    inputMode="numeric"
                    pattern="\d{1}"
                    maxLength={1}
                    value={value[i] || ""}
                    onChange={(e) => handleChange(e, i)}
                    onKeyDown={(e) => handleKeyDown(e, i)}
                    disabled={disabled}
                    className={cn(
                        "w-12 h-14 text-center text-2xl font-bold rounded-xl border border-zinc-800 bg-zinc-950/50 text-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 focus:bg-zinc-950 outline-none transition-all duration-300",
                        disabled && "opacity-50 cursor-not-allowed",
                        value[i] && "border-indigo-500/50 bg-zinc-950"
                    )}
                />
            ))}
        </div>
    );
};

export default OTPInput;
