import React, { useState } from "react";
import { Eye, EyeOff, Lock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const PasswordInput = React.forwardRef(({ className, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);

    return (
        <div className="relative group">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-600 dark:group-focus-within:text-indigo-400 transition-colors" />
            <Input
                type={showPassword ? "text" : "password"}
                className={cn("pl-9 pr-11 h-10 bg-zinc-950/50 border-zinc-800 rounded-full focus-visible:ring-offset-0 focus-visible:ring-indigo-500/20", className)}
                ref={ref}
                {...props}
            />
            <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 flex items-center justify-center rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-50 transition-all outline-none"
            >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
        </div>
    );
});

PasswordInput.displayName = "PasswordInput";

export default PasswordInput;
