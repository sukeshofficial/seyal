import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "react-hot-toast";
import {
    Mail,
    Shield,
    Key,
    ArrowRight,
    ShieldCheck,
    Loader2,
    ChevronLeft,
    X,
    CheckCircle2
} from "lucide-react";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import OTPInput from "./OTPInput";
import PasswordInput from "./PasswordInput";
import { forgotPassword, resetPassword } from "@/services/auth.api";
import { forgotPasswordSchema, resetPasswordSchema } from "@/validations/auth.schema";
import { cn } from "@/lib/utils";

const ForgotPasswordModal = ({ isOpen, onClose }) => {
    const [step, setStep] = useState(1);
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [btnState, setBtnState] = useState("idle");

    const {
        register: registerStep1,
        handleSubmit: handleSubmitStep1,
        formState: { errors: errorsStep1 },
    } = useForm({
        resolver: zodResolver(forgotPasswordSchema),
    });

    const {
        register: registerStep3,
        handleSubmit: handleSubmitStep3,
        formState: { errors: errorsStep3 },
        reset: resetStep3,
    } = useForm({
        resolver: zodResolver(resetPasswordSchema),
    });

    useEffect(() => {
        if (!isOpen) {
            const timer = setTimeout(() => {
                setStep(1);
                setEmail("");
                setOtp("");
                setIsLoading(false);
                setBtnState("idle");
                resetStep3();
            }, 300);
            return () => clearTimeout(timer);
        }
    }, [isOpen, resetStep3]);

    const handleEmailSubmit = async (data) => {
        setIsLoading(true);
        setBtnState("loading");
        try {
            await forgotPassword(data.email);
            setEmail(data.email);
            setBtnState("success");
            setTimeout(() => {
                setStep(2);
                setBtnState("idle");
                setIsLoading(false);
            }, 800);
        } catch (error) {
            toast.error(error.message || "Failed to request reset code");
            setBtnState("idle");
            setIsLoading(false);
        }
    };

    const handleOtpVerify = async () => {
        if (otp.length !== 6) return toast.error("Please enter 6-digit code");

        setIsLoading(true);
        setBtnState("loading");
        setTimeout(() => {
            setStep(3);
            setBtnState("idle");
            setIsLoading(false);
        }, 600);
    };

    const handlePasswordReset = async (data) => {
        setIsLoading(true);
        setBtnState("loading");
        try {
            await resetPassword({
                email,
                otp,
                password: data.password,
            });
            setBtnState("success");
            toast.success("Password reset successful!");
            setTimeout(() => {
                onClose();
            }, 1200);
        } catch (error) {
            toast.error(error.message || "Failed to reset password");
            setBtnState("idle");
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[420px] border-white/5 bg-zinc-950/80 backdrop-blur-xl p-0 overflow-hidden rounded-[32px] sm:rounded-3xl [&>button]:hidden shadow-2xl">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute right-4 top-4 p-2 rounded-full hover:bg-white/5 text-zinc-500 transition-colors z-10"
                >
                    <X className="h-4 w-4" />
                </button>

                <div className="px-6 py-7 md:px-8">
                    <DialogHeader className="text-center space-y-2">
                        {/* Carousel-style Step Indicator */}
                        <div className="flex items-center justify-center gap-1.5 mb-6 scale-150">
                            {[1, 2, 3].map((s) => (
                                <div
                                    key={s}
                                    className={cn(
                                        "h-1 transition-all duration-500 rounded-full",
                                        step === s ? "w-4 bg-indigo-500/80" : "w-1 bg-zinc-800"
                                    )}
                                />
                            ))}
                        </div>

                        {/* Compact Badge Icon */}
                        <div className="mx-auto w-12 h-12 bg-white/[0.03] border border-white/10 rounded-full flex items-center justify-center mb-1 shadow-inner ring-1 ring-white/5">
                            {step === 1 && <Mail className="h-6 w-6 text-indigo-400" />}
                            {step === 2 && <Shield className="h-6 w-6 text-indigo-400" />}
                            {step === 3 && <Key className="h-6 w-6 text-indigo-400" />}
                        </div>

                        <div className="space-y-2">
                            <DialogTitle className="text-xl pt-7 font-bold text-white tracking-tight">
                                {step === 1 && "Forgot password?"}
                                {step === 2 && "Enter OTP"}
                                {step === 3 && "Reset Password"}
                            </DialogTitle>

                            <DialogDescription className="text-zinc-500 text-xs md:text-sm leading-tight max-w-[300px] mx-auto ml-0">
                                {step === 1 && "Reset your password using a secure OTP sent to your email."}
                                {step === 2 && (
                                    <span className="block">
                                        Code sent to <br />
                                        <span className="text-zinc-300 font-medium break-words">{email}</span>
                                    </span>
                                )}
                                {step === 3 && "Choose a new strong password for your account."}
                            </DialogDescription>
                        </div>
                    </DialogHeader>

                    <div className="mt-6">
                        {step === 1 && (
                            <form onSubmit={handleSubmitStep1(handleEmailSubmit)} className="space-y-4">
                                <div className="space-y-1">
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-600 transition-colors" />
                                        <Input
                                            placeholder="Enter your email"
                                            className="pl-11 h-12 bg-white/[0.03] border-white/10 rounded-full focus:ring-indigo-500/10 focus:border-indigo-500/50 text-white transition-all"
                                            {...registerStep1("email")}
                                        />
                                    </div>
                                    {errorsStep1.email && (
                                        <p className="text-[10px] text-red-400/80 ml-4 font-medium tracking-wide uppercase">{errorsStep1.email.message}</p>
                                    )}
                                </div>
                                <Button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full h-12 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full font-bold shadow-lg shadow-indigo-600/10 transition-all hover:translate-y-[-1px] active:translate-y-[1px]"
                                >
                                    {btnState === "loading" ? (
                                        <Loader2 className="h-5 w-5 animate-spin" />
                                    ) : btnState === "success" ? (
                                        <CheckCircle2 className="h-5 w-5 animate-in zoom-in duration-300" />
                                    ) : (
                                        "Send reset code"
                                    )}
                                </Button>
                            </form>
                        )}

                        {step === 2 && (
                            <div className="space-y-6">
                                <OTPInput
                                    value={otp}
                                    onChange={setOtp}
                                    disabled={isLoading}
                                />
                                <div className="space-y-3">
                                    <Button
                                        onClick={handleOtpVerify}
                                        disabled={isLoading || otp.length !== 6}
                                        className="w-full h-12 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full font-bold shadow-lg shadow-indigo-600/10 transition-all hover:translate-y-[-1px]"
                                    >
                                        {isLoading ? (
                                            <Loader2 className="h-5 w-5 animate-spin" />
                                        ) : (
                                            "Verify and continue"
                                        )}
                                    </Button>
                                    <button
                                        onClick={() => setStep(1)}
                                        className="w-full text-zinc-500 hover:text-zinc-300 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
                                    >
                                        <ChevronLeft className="h-3.5 w-3.5" /> Back to email
                                    </button>
                                </div>
                            </div>
                        )}

                        {step === 3 && (
                            <form onSubmit={handleSubmitStep3(handlePasswordReset)} className="space-y-4">
                                <div className="space-y-3">
                                    <div className="space-y-1">
                                        <PasswordInput
                                            placeholder="New password"
                                            className="h-12 bg-white/[0.03] border-white/10 rounded-full text-white focus:ring-indigo-500/10 focus:border-indigo-500/50"
                                            {...registerStep3("password")}
                                        />
                                        {errorsStep3.password && (
                                            <p className="text-[10px] text-red-400/80 ml-4 font-medium uppercase">{errorsStep3.password.message}</p>
                                        )}
                                    </div>
                                    <div className="space-y-1">
                                        <PasswordInput
                                            placeholder="Confirm password"
                                            className="h-12 bg-white/[0.03] border-white/10 rounded-full text-white focus:ring-indigo-500/10 focus:border-indigo-500/50"
                                            {...registerStep3("confirmPassword")}
                                        />
                                        {errorsStep3.confirmPassword && (
                                            <p className="text-[10px] text-red-400/80 ml-4 font-medium uppercase tracking-tight">{errorsStep3.confirmPassword.message}</p>
                                        )}
                                    </div>
                                </div>
                                <Button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full h-12 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full font-bold shadow-lg shadow-indigo-600/10 transition-all hover:translate-y-[-1px]"
                                >
                                    {btnState === "loading" ? (
                                        <Loader2 className="h-5 w-5 animate-spin" />
                                    ) : btnState === "success" ? (
                                        <CheckCircle2 className="h-5 w-5" />
                                    ) : (
                                        "Reset password"
                                    )}
                                </Button>
                            </form>
                        )}
                    </div>

                    <div className="mt-8 pt-6 border-t border-white/[0.02] text-center">
                        <p className="text-[9px] text-zinc-600 uppercase tracking-[0.2em] font-bold opacity-80 flex items-center justify-center gap-2">
                            <span className="w-1 h-1 bg-zinc-800 rounded-full" />
                            Secure password recovery powered by SEYAL
                            <span className="w-1 h-1 bg-zinc-800 rounded-full" />
                        </p>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default ForgotPasswordModal;
