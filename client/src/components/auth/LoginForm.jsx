import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-hot-toast";
import { LoaderIcon, Mail, LogIn, ArrowRight, Check } from "lucide-react";

import { loginSchema } from "@/validations/auth.schema";
import { loginUser, getMe, getPublicAvatar } from "@/services/auth.api";
import { useAuth } from "@/context/AuthContext";
import SocialAuth from "./SocialAuth";
import PasswordInput from "./PasswordInput";
import VerifyOTPModal from "./VerifyOTPModal";
import ForgotPasswordModal from "./ForgotPasswordModal";

import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

const LoginForm = () => {
    const [btnState, setBtnState] = useState('idle');
    const [otpModal, setOtpModal] = useState({ isOpen: false, email: "" });
    const [forgotPasswordModal, setForgotPasswordModal] = useState(false);
    const navigate = useNavigate();
    const { setUser, setIsAuthenticated } = useAuth();
    const [avatarUrl, setAvatarUrl] = useState(null);

    const form = useForm({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            identifier: "",
            password: "",
            rememberMe: false,
        },
        mode: "onBlur",
    });

    const onSubmit = async (values) => {
        setBtnState('loading');
        try {
            const response = await loginUser(values);

            if (response.requiresVerification) {
                toast.error("Account not verified. Please check your email.");
                setOtpModal({ isOpen: true, email: response.email });
                setBtnState('idle');
                return;
            }

            toast.success(response.message || "Welcome back!");
            setBtnState('success');

            // Restore User Session
            const meResponse = await getMe();
            if (meResponse.success) {
                setTimeout(() => {
                    setUser(meResponse.data.user);
                    setIsAuthenticated(true);
                    navigate("/dashboard");
                }, 1200);
            }
        } catch (error) {
            console.error("Login failed:", error);
            toast.error(error.message || "Invalid credentials.");
            setBtnState('idle');
        }
    };

    // Dynamic Avatar Sync
    const identifier = form.watch("identifier");
    useEffect(() => {
        if (!identifier || identifier.length < 3) {
            setAvatarUrl(null);
            return;
        }

        const timer = setTimeout(async () => {
            const response = await getPublicAvatar(identifier);
            if (response.success && response.data?.avatarUrl) {
                setAvatarUrl(response.data.avatarUrl);
            } else {
                setAvatarUrl(null);
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [identifier]);

    return (
        <div className="max-w-[440px] mx-auto space-y-6">
            {/* Form Header */}
            <div className="space-y-1 text-center">
                <h2 className="text-3xl font-bold tracking-tight text-white font-mono">Welcome back</h2>
                <p className="text-zinc-400 text-sm uppercase tracking-widest font-medium">Continue building with SEYAL</p>
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <div className="bg-zinc-900/30 p-8 rounded-3xl border border-white/5 shadow-2xl backdrop-blur-sm space-y-6">
                        <SocialAuth />

                        {/* Identifier */}
                        <FormField
                            control={form.control}
                            name="identifier"
                            render={({ field }) => (
                                <FormItem className="space-y-1">
                                    <FormLabel className="text-[11px] font-bold uppercase text-zinc-500 tracking-wider">Email or Username</FormLabel>
                                    <FormControl>
                                        <div className="relative group">
                                            <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center justify-center">
                                                {avatarUrl ? (
                                                    <div className="h-6 w-6 rounded-full overflow-hidden border border-white/10 shadow-sm animate-in zoom-in duration-300">
                                                        <img src={avatarUrl} alt="Avatar" className="h-full w-full object-cover" />
                                                    </div>
                                                ) : (
                                                    <Mail className="h-3.5 w-3.5 text-zinc-600 group-focus-within:text-indigo-400 transition-colors" />
                                                )}
                                            </div>
                                            <Input
                                                className="pl-11 h-11 bg-zinc-950/50 border-zinc-800 rounded-full focus-visible:ring-indigo-500/20 text-white text-sm"
                                                placeholder="Enter email or username"
                                                {...field}
                                            />
                                        </div>
                                    </FormControl>
                                    <FormMessage className="text-[10px]" />
                                </FormItem>
                            )}
                        />

                        {/* Password */}
                        <FormField
                            control={form.control}
                            name="password"
                            render={({ field }) => (
                                <FormItem className="space-y-1">
                                    <div className="flex items-center justify-between">
                                        <FormLabel className="text-[11px] font-bold uppercase text-zinc-500 tracking-wider">Password</FormLabel>
                                        <button
                                            type="button"
                                            onClick={() => setForgotPasswordModal(true)}
                                            className="text-[10px] text-zinc-500 hover:text-indigo-400 transition-colors uppercase font-bold tracking-tighter"
                                        >
                                            Forgot password?
                                        </button>
                                    </div>
                                    <FormControl>
                                        <PasswordInput
                                            placeholder="••••••••"
                                            className="text-white h-11 text-sm"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage className="text-[10px]" />
                                </FormItem>
                            )}
                        />

                        {/* Remember Me */}
                        <div className="flex items-center space-x-2">
                            <Checkbox id="remember" className="border-zinc-800 rounded-full data-[state=checked]:bg-indigo-600 data-[state=checked]:border-indigo-600" />
                            <label
                                htmlFor="remember"
                                className="text-[11px] font-bold uppercase text-zinc-500 tracking-wider cursor-pointer"
                            >
                                Remember me for 30 days
                            </label>
                        </div>

                        <div className={`transition-all duration-400 flex justify-center ${btnState === 'idle' ? 'w-full' : 'w-full'}`}>
                            <Button
                                type="submit"
                                disabled={btnState !== 'idle'}
                                onClick={(e) => {
                                    if (btnState !== 'idle') return;
                                    const btn = e.currentTarget;
                                    const circle = document.createElement('span');
                                    const size = btn.offsetWidth;
                                    circle.className = 'ripple';
                                    circle.style.cssText = `width:${size}px;height:${size}px;left:${e.nativeEvent.offsetX - size / 2}px;top:${e.nativeEvent.offsetY - size / 2}px;`;
                                    btn.appendChild(circle);
                                    setTimeout(() => circle.remove(), 600);
                                }}
                                className={`
                      relative overflow-hidden h-11 rounded-full text-white font-bold
                      text-sm uppercase tracking-wider transition-all duration-400
                      ${btnState === 'idle' ? 'w-full bg-indigo-600 hover:bg-indigo-700 hover:scale-[1.02] active:scale-[0.98]' : ''}
                      ${btnState === 'loading' ? 'w-11 bg-indigo-700' : ''}
                      ${btnState === 'success' ? 'w-11 bg-green-600' : ''}
                  `}
                                style={{ transition: 'width 0.4s cubic-bezier(.4,0,.2,1), background 0.3s, transform 0.15s' }}
                            >
                                {/* Default label */}
                                <span className={`absolute flex items-center gap-2 transition-all duration-200
                                  ${btnState !== 'idle' ? 'opacity-0 scale-75' : 'opacity-100 scale-100'}`}>
                                    Sign In <ArrowRight className="h-4 w-4" />
                                </span>

                                {/* Loading spinner */}
                                <span className={`absolute transition-all duration-200
                                  ${btnState === 'loading' ? 'opacity-100 scale-100' : 'opacity-0 scale-75'}`}>
                                    <LoaderIcon className="h-5 w-5 animate-spin" />
                                </span>

                                {/* Success check */}
                                <span className={`absolute transition-all duration-200
                                  ${btnState === 'success' ? 'opacity-100 scale-100' : 'opacity-0 scale-75'}`}>
                                    <Check className="h-5 w-5" />
                                </span>
                            </Button>
                        </div>
                    </div>
                </form>
            </Form>

            <VerifyOTPModal
                isOpen={otpModal.isOpen}
                onClose={() => setOtpModal({ ...otpModal, isOpen: false })}
                email={otpModal.email}
            />

            <ForgotPasswordModal
                isOpen={forgotPasswordModal}
                onClose={() => setForgotPasswordModal(false)}
            />

            <div className="text-center text-sm text-zinc-500">
                Don&apos;t have an account?{" "}
                <Link
                    to="/signup"
                    className="text-indigo-400 hover:text-indigo-300 font-semibold transition-colors"
                >
                    Create account
                </Link>
            </div>
        </div>
    );
};

export default LoginForm;
