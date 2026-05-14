import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { ShieldCheck, RefreshCw, Loader2, Mail } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { verifyOtp, resendOtp, getMe } from "@/services/auth.api";
import useCountdown from "@/hooks/useCountdown";
import OTPInput from "./OTPInput";
import { useAuth } from "@/context/AuthContext";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const VerifyOTPModal = ({ isOpen, onClose, email, purpose = "verify-email" }) => {
    const [otp, setOtp] = useState("");
    const [isVerifying, setIsVerifying] = useState(false);
    const [isResending, setIsResending] = useState(false);

    const navigate = useNavigate();
    const { setUser, setIsAuthenticated } = useAuth();

    // Timer 1: Resend button cooldown (60s)
    const { seconds: resendSeconds, isActive: isResendActive, reset: resetResendTimer } = useCountdown(60);

    // Timer 2: OTP Session Expiry (10 min = 600s)
    const { seconds: expirySeconds, isActive: isExpiryActive, reset: resetExpiryTimer } = useCountdown(600);

    // Reset OTP when modal opens/changes email
    useEffect(() => {
        if (isOpen) {
            setOtp("");
            resetResendTimer();
            resetExpiryTimer();
        }
    }, [isOpen, email, resetResendTimer, resetExpiryTimer]);

    const handleVerify = async (e) => {
        e?.preventDefault();
        if (otp.length !== 6) {
            return toast.error("Please enter a 6-digit code");
        }

        if (!isExpiryActive) {
            return toast.error("OTP has expired. Please request a new one.");
        }

        setIsVerifying(true);
        try {
            const response = await verifyOtp({
                email,
                otp,
                purpose,
            });

            toast.success(response.message || "Account verified successfully!");

            // Use the user data returned directly from verification
            if (response.data?.user) {
                setUser(response.data.user);
                setIsAuthenticated(true);
                onClose();
                navigate("/dashboard");
            } else {
                // Fallback for unexpected response structure
                onClose();
                navigate("/login");
            }
        } catch (error) {
            console.error("Verification failed:", error);
            toast.error(error.message || "Invalid or expired OTP");
        } finally {
            setIsVerifying(false);
        }
    };

    const handleResend = async () => {
        setIsResending(true);
        try {
            const response = await resendOtp({
                email,
                purpose,
            });

            toast.success(response.message || "New OTP sent to your email");
            resetResendTimer();
            resetExpiryTimer();
            setOtp("");
        } catch (error) {
            console.error("Resend failed:", error);
            toast.error(error.message || "Failed to resend OTP");
        } finally {
            setIsResending(false);
        }
    };

    const formatTime = (totalSeconds) => {
        const mins = Math.floor(totalSeconds / 60);
        const secs = totalSeconds % 60;
        return `${mins}:${secs.toString().padStart(2, "0")}`;
    };

    const maskEmail = (emailStr) => {
        if (!emailStr) return "";
        const [user, domain] = emailStr.split("@");
        return `${user.substring(0, 2)}******@${domain}`;
    };

    return (
        <Dialog open={isOpen} onOpenChange={() => { }}>
            <DialogContent
                className="sm:max-w-[500px] border border-white/10 bg-zinc-950/90 backdrop-blur-2xl shadow-[0_0_50px_-12px_rgba(79,70,229,0.2)] [&>button]:hidden px-10 py-8"
                onPointerDownOutside={(e) => e.preventDefault()}
                onEscapeKeyDown={(e) => e.preventDefault()}
            >
                <DialogHeader className="text-center pt-0">
                    <div className="mx-auto w-14 h-14 bg-gradient-to-b from-indigo-500/20 to-transparent rounded-2xl flex items-center justify-center mb-4 ring-1 ring-white/10 shadow-inner">
                        <ShieldCheck className="h-8 w-8 text-indigo-400 drop-shadow-[0_0_8px_rgba(129,140,248,0.5)]" />
                    </div>
                    <DialogTitle className="text-3xl font-bold text-white tracking-tight leading-tight">Verify Your Email</DialogTitle>
                    <DialogDescription className="text-zinc-400 pt-2 text-base leading-relaxed">
                        We've sent a code to <span className="text-white font-medium underline decoration-indigo-500/30 underline-offset-4">{maskEmail(email)}</span>. Enter it to activate your account.
                    </DialogDescription>

                    {!isExpiryActive ? (
                        <div className="mt-2 text-red-500 font-bold text-sm bg-red-500/10 py-1.5 rounded-full ring-1 ring-red-500/20 animate-pulse">
                            OTP Expired. Please request a new one below.
                        </div>
                    ) : (
                        <div className="mt-2 text-zinc-500 text-sm font-medium">
                            Code expires in <span className="text-white font-mono">{formatTime(expirySeconds)}</span>
                        </div>
                    )}
                </DialogHeader>

                <div className="space-y-8 py-6">
                    <OTPInput
                        value={otp}
                        onChange={setOtp}
                        disabled={isVerifying || !isExpiryActive}
                    />

                    <div className="space-y-6">
                        <Button
                            onClick={handleVerify}
                            className="w-full h-14 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-lg shadow-xl shadow-indigo-600/20 rounded-full transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:scale-100"
                            disabled={isVerifying || otp.length !== 6 || !isExpiryActive}
                        >
                            {isVerifying ? (
                                <>
                                    <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                                    Activating Account...
                                </>
                            ) : (
                                "Confirm & Continue"
                            )}
                        </Button>

                        <div className="flex justify-center text-sm">
                            {isResendActive ? (
                                <p className="text-zinc-500 flex items-center gap-2.5 font-medium">
                                    <RefreshCw className="h-4 w-4 animate-pulse text-indigo-500/50" />
                                    Resend code in <span className="text-indigo-400 font-mono font-bold tracking-wider">{resendSeconds}s</span>
                                </p>
                            ) : (
                                <button
                                    onClick={handleResend}
                                    disabled={isResending}
                                    className="text-indigo-400 font-bold hover:text-indigo-300 transition-all hover:scale-105 active:scale-95 flex items-center gap-2 underline decoration-indigo-500/30 underline-offset-4"
                                >
                                    {isResending ? <Loader2 className="h-4 w-4 animate-spin text-white" /> : <RefreshCw className="h-4 w-4" />}
                                    Didn't receive it? Resend
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                <div className="text-center pt-2">
                    <div className="h-px w-full bg-gradient-to-r from-transparent via-white/5 to-transparent mb-4" />
                    <p className="text-[10px] text-zinc-500 uppercase tracking-[0.3em] font-black opacity-40">
                        Secure Authentication by SEYAL
                    </p>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default VerifyOTPModal;
