import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-hot-toast";
import { ShieldCheck, RefreshCw, Loader2, ArrowLeft } from "lucide-react";

import { verifyOtp, resendOtp } from "@/services/auth.api";
import useCountdown from "@/hooks/useCountdown";
import OTPInput from "./OTPInput";

import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const VerifyOTPCard = () => {
    const [otp, setOtp] = useState("");
    const [isVerifying, setIsVerifying] = useState(false);
    const [isResending, setIsResending] = useState(false);

    const navigate = useNavigate();
    const location = useLocation();
    const { seconds, isActive, reset: resetTimer } = useCountdown(60);

    // Extract state from router
    const { email, purpose } = location.state || {};

    useEffect(() => {
        if (!email) {
            toast.error("Session expired. Please signup again.");
            navigate("/signup", { replace: true });
        }
    }, [email, navigate]);

    const handleVerify = async (e) => {
        e?.preventDefault();
        if (otp.length !== 6) {
            return toast.error("Please enter a 6-digit code");
        }

        setIsVerifying(true);
        try {
            const response = await verifyOtp({
                email,
                otp,
                purpose: purpose || "verify-email",
            });

            toast.success(response.message || "Email verified successfully!");

            // Delay navigation for success feel
            setTimeout(() => {
                navigate("/login", { replace: true });
            }, 1500);
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
                purpose: purpose || "verify-email",
            });

            toast.success(response.message || "New OTP sent to your email");
            resetTimer();
        } catch (error) {
            console.error("Resend failed:", error);
            toast.error(error.message || "Failed to resend OTP");
        } finally {
            setIsResending(false);
        }
    };

    // Mask email for privacy (e.g., su******@gmail.com)
    const maskEmail = (emailStr) => {
        if (!emailStr) return "";
        const [user, domain] = emailStr.split("@");
        return `${user.substring(0, 2)}******@${domain}`;
    };

    return (
        <Card className="border-none shadow-2xl shadow-zinc-200/50 dark:shadow-zinc-900/50 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl rounded-2xl overflow-hidden">
            <CardHeader className="text-center pb-2">
                <div className="mx-auto w-12 h-12 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mb-2">
                    <ShieldCheck className="h-6 w-6 text-zinc-900 dark:text-zinc-50" />
                </div>
                <CardTitle className="text-2xl font-bold">Verify Your Email</CardTitle>
                <CardDescription className="text-zinc-500 dark:text-zinc-400">
                    We sent a 6-digit code to <span className="font-semibold text-zinc-900 dark:text-zinc-50">{maskEmail(email)}</span>
                </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6 pt-4">
                <OTPInput
                    value={otp}
                    onChange={setOtp}
                    disabled={isVerifying}
                />

                <Button
                    onClick={handleVerify}
                    className="w-full h-12 font-bold text-lg"
                    disabled={isVerifying || otp.length !== 6}
                >
                    {isVerifying ? (
                        <>
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            Verifying...
                        </>
                    ) : (
                        "Verify OTP"
                    )}
                </Button>
            </CardContent>

            <CardFooter className="flex flex-col items-center gap-4 pb-8 pt-2">
                <div className="text-sm">
                    {isActive ? (
                        <p className="text-zinc-400">
                            Resend available in <span className="font-mono font-bold text-zinc-900 dark:text-zinc-50">
                                00:{seconds.toString().padStart(2, "0")}
                            </span>
                        </p>
                    ) : (
                        <button
                            onClick={handleResend}
                            disabled={isResending}
                            className="flex items-center gap-2 text-zinc-900 dark:text-zinc-50 font-semibold hover:underline underline-offset-4 disabled:opacity-50 transition-all"
                        >
                            {isResending ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                            Resend OTP
                        </button>
                    )}
                </div>

                <button
                    onClick={() => navigate("/signup")}
                    className="flex items-center gap-2 text-xs text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50 transition-colors"
                >
                    <ArrowLeft className="h-3 w-3" />
                    Back to Signup
                </button>
            </CardFooter>
        </Card>
    );
};

export default VerifyOTPCard;
