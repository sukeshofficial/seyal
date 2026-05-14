import React from "react";
import AuthBranding from "./AuthBranding";
import { Toaster } from "react-hot-toast";
import { Shield } from "lucide-react";

const AuthLayout = ({ children }) => {
    return (
        <div className="h-[100dvh] max-h-screen grid lg:grid-cols-[4fr_6fr] bg-zinc-950 overflow-hidden">
            <Toaster
                position="top-center"
                toastOptions={{
                    className: "dark:bg-zinc-900 dark:text-zinc-100 border border-white/5 shadow-2xl backdrop-blur-xl",
                    style: {
                        maxWidth: "450px",
                        padding: "12px 24px",
                        fontSize: "0.875rem",
                        fontWeight: "500",
                        borderRadius: "9999px",
                        background: "rgba(9, 9, 11, 0.9)",
                        color: "#fff",
                        border: "1px solid rgba(255, 255, 255, 0.1)",
                    },
                    success: {
                        iconTheme: {
                            primary: "#4f46e5",
                            secondary: "#fff",
                        },
                    },
                }}
            />

            {/* Left Branding Section */}
            <AuthBranding />

            {/* Right Form Section */}
            <div className="relative flex flex-col items-center p-4 lg:px-8 lg:py-6 overflow-hidden">
                {/* Mobile Header (Hidden on Laptop) */}
                <div className="lg:hidden shrink-0 mt-2 mb-6 flex items-center gap-3">
                    <div className="h-9 w-9 overflow-hidden rounded-xl bg-white p-1.5 shadow-xl shadow-white/5 ring-1 ring-white/10">
                        <img
                            src="/SEYAL-LOGO.svg"
                            alt="SEYAL Logo"
                            className="h-full w-full object-contain"
                        />
                    </div>
                    <span className="text-xl font-bold tracking-tight text-white">
                        SEYAL
                    </span>
                </div>

                {/* Content Wrapper */}
                <div className="w-full max-w-[720px] my-auto py-4 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150 overflow-y-auto scrollbar-hide">
                    {children}
                </div>

                {/* Global Footer Decoration */}
                <div className="shrink-0 py-4 flex items-center justify-center animate-in fade-in slide-in-from-bottom-2 duration-1000 delay-500">
                    <div className="group flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.03] border border-white/5 hover:border-white/10 hover:bg-white/[0.05] transition-all duration-300 backdrop-blur-sm shadow-inner">
                        <Shield className="h-3 w-3 text-green-400 opacity-50 group-hover:opacity-100 transition-opacity" />
                        <span className="text-[10px] font-bold tracking-[0.15em] uppercase text-zinc-500 group-hover:text-zinc-400 transition-colors">
                            Securely encrypted by SEYAL Shield
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AuthLayout;
