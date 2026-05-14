import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-hot-toast";
import { LoaderIcon, User, Mail, AtSign, ArrowRight, Check } from "lucide-react";

import { signupSchema } from "@/validations/auth.schema";
import { signupUser } from "@/services/auth.api";
import ProfileUpload from "./ProfileUpload";
import SocialAuth from "./SocialAuth";
import PasswordInput from "./PasswordInput";
import VerifyOTPModal from "./VerifyOTPModal";

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

const SignupForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [otpModal, setOtpModal] = useState({ isOpen: false, email: "" });
  const [btnState, setBtnState] = useState('idle');
  const navigate = useNavigate();

  const form = useForm({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
      profilePicture: null,
    },
    mode: "onBlur",
  });

  const onSubmit = async (values) => {
    setBtnState('loading');
    try {
      const response = await signupUser(values);
      toast.success(response.message || "Signup successful! Verify your email.");
      setBtnState('success');
      setTimeout(() => {
        setOtpModal({ isOpen: true, email: values.email });
        setBtnState('idle');
      }, 1200);
    } catch (error) {
      console.error("Signup failed:", error);
      toast.error(error.message || "Registration failed. Please check your details.");
      setBtnState('idle');
    }
  };

  return (
    <div className="space-y-4">
      {/* Form Header */}
      <div className="space-y-1 text-center">
        <h2 className="text-2xl font-bold tracking-tight text-white">Create your account</h2>
        <p className="text-xs text-zinc-400 uppercase tracking-widest font-medium">Join the SEYAL developer ecosystem</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 bg-zinc-900/30 p-5 rounded-2xl border border-white/5 shadow-2xl backdrop-blur-sm">

            {/* Left Column: Form Fields */}
            <div className="md:col-span-7 space-y-7">
              <div className="grid grid-cols-2 gap-3">
                {/* First Name */}
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem className="space-y-1">
                      <FormLabel className="text-[11px] font-bold uppercase text-zinc-500 tracking-wider">First Name</FormLabel>
                      <FormControl>
                        <div className="relative group">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-600 group-focus-within:text-indigo-400 transition-colors" />
                          <Input
                            className="pl-9 h-10 bg-zinc-950/50 border-zinc-800 rounded-full focus-visible:ring-indigo-500/20 text-white text-sm"
                            placeholder="John"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage className="text-[10px]" />
                    </FormItem>
                  )}
                />

                {/* Last Name */}
                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem className="space-y-1">
                      <FormLabel className="text-[11px] font-bold uppercase text-zinc-500 tracking-wider">Last Name</FormLabel>
                      <FormControl>
                        <div className="relative group">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-600 group-focus-within:text-indigo-400 transition-colors" />
                          <Input
                            className="pl-9 h-10 bg-zinc-950/50 border-zinc-800 rounded-full focus-visible:ring-indigo-500/20 text-white text-sm"
                            placeholder="Doe"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage className="text-[10px]" />
                    </FormItem>
                  )}
                />
              </div>

              {/* Username */}
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem className="space-y-1">
                    <FormLabel className="text-[11px] font-bold uppercase text-zinc-500 tracking-wider">Username</FormLabel>
                    <FormControl>
                      <div className="relative group">
                        <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-600 group-focus-within:text-indigo-400 transition-colors" />
                        <Input
                          className="pl-9 h-10 bg-zinc-950/50 border-zinc-800 rounded-full focus-visible:ring-indigo-500/20 text-white text-sm"
                          placeholder="johndoe"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage className="text-[10px]" />
                  </FormItem>
                )}
              />

              {/* Email */}
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem className="space-y-1">
                    <FormLabel className="text-[11px] font-bold uppercase text-zinc-500 tracking-wider">Email Address</FormLabel>
                    <FormControl>
                      <div className="relative group">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-600 group-focus-within:text-indigo-400 transition-colors" />
                        <Input
                          className="pl-9 h-10 bg-zinc-950/50 border-zinc-800 rounded-full focus-visible:ring-indigo-500/20 text-white text-sm"
                          placeholder="name@example.com"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage className="text-[10px]" />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-3">
                {/* Password */}
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem className="space-y-1">
                      <FormLabel className="text-[11px] font-bold uppercase text-zinc-500 tracking-wider">Password</FormLabel>
                      <FormControl>
                        <PasswordInput
                          placeholder="••••••••"
                          className="text-white h-10 text-sm"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-[10px]" />
                    </FormItem>
                  )}
                />

                {/* Confirm Password */}
                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem className="space-y-1">
                      <FormLabel className="text-[11px] font-bold uppercase text-zinc-500 tracking-wider">Confirm</FormLabel>
                      <FormControl>
                        <PasswordInput
                          placeholder="••••••••"
                          className="text-white h-10 text-sm"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-[10px]" />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Right Column: Actions & Profile */}
            <div className="md:col-span-5 flex flex-col gap-4 border-l border-white/5 pl-6">
              {/* Profile Upload */}
              <FormField
                control={form.control}
                name="profilePicture"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <ProfileUpload
                        onImageSelect={(file) => field.onChange(file)}
                        error={form.formState.errors.profilePicture?.message}
                        compact
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <div className="mt-auto space-y-4">
                <SocialAuth />
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
                      Create Account <ArrowRight className="h-4 w-4" />
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
            </div>
          </div>
        </form>
      </Form>

      <VerifyOTPModal
        isOpen={otpModal.isOpen}
        onClose={() => setOtpModal({ ...otpModal, isOpen: false })}
        email={otpModal.email}
      />

      <div className="text-center text-xs text-zinc-500">
        Already have an account?{" "}
        <Link
          to="/login"
          className="text-indigo-400 hover:text-indigo-300 font-bold transition-colors"
        >
          Sign in
        </Link>
      </div>
    </div>
  );
};

export default SignupForm;
