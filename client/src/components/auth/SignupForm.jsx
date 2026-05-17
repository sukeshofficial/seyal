import React, { useCallback, useMemo, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, AtSign, Check, LoaderIcon, Mail, User } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";

import { signupUser, uploadAvatar } from "@/services/auth.api";
import { signupSchema } from "@/validations/auth.schema";

import PasswordInput from "./PasswordInput";
import ProfileUpload from "./ProfileUpload";
import SocialAuth from "./SocialAuth";
import VerifyOTPModal from "./VerifyOTPModal";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

/* -------------------------------------------------------------------------- */
/*                                   Config                                   */
/* -------------------------------------------------------------------------- */

const SIGNUP_CONFIG = {
  TRANSITION_DELAY: 1200,
  RIPPLE_DURATION: 600,
  FIELD_MODE: "onBlur",
};

const BTN_STATES = {
  IDLE: "idle",
  LOADING: "loading",
  SUCCESS: "success",
};

/* -------------------------------------------------------------------------- */
/*                                   Styles                                   */
/* -------------------------------------------------------------------------- */

const STYLES = {
  container: "space-y-4",
  header: {
    wrapper: "space-y-1 text-center",
    title: "text-2xl font-bold tracking-tight text-white",
    subtitle: "text-xs text-zinc-400 uppercase tracking-widest font-medium",
  },
  formGrid: cn(
    "grid grid-cols-1 md:grid-cols-12 gap-6 bg-zinc-900/30 p-5 items-start",
    "rounded-2xl border border-white/5 shadow-2xl backdrop-blur-sm"
  ),
  columnRight: "md:col-span-5 order-1 md:order-2 flex flex-col gap-[43px]",
  columnLeft: cn(
    "md:col-span-7 space-y-6 border-r-0 md:border-r border-white/5",
    "pl-0 md:pr-8 order-2 md:order-1"
  ),
  inputWrapper: "relative group",
  inputIcon: cn(
    "absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5",
    "text-zinc-600 group-focus-within:text-indigo-400 transition-colors"
  ),
  inputBase: cn(
    "pl-9 h-10 bg-zinc-950/50 border-zinc-800 rounded-full",
    "focus-visible:ring-indigo-500/20 text-white text-sm"
  ),
  labelBase: "text-[11px] font-bold uppercase text-zinc-500 tracking-wider",
  messageBase: "text-[10px]",
  submitBtn: {
    base: cn(
      "relative overflow-hidden h-11 rounded-full text-white font-bold",
      "text-sm uppercase tracking-wider transition-all duration-400"
    ),
    idle: "w-full bg-indigo-600 hover:bg-indigo-700 hover:scale-[1.02] active:scale-[0.98]",
    loading: "w-11 bg-indigo-700",
    success: "w-11 bg-green-600",
    content: "absolute flex items-center gap-2 transition-all duration-200",
  },
  footer: {
    wrapper: "text-center text-xs text-zinc-500",
    link: "text-indigo-400 hover:text-indigo-300 font-bold transition-colors",
  },
};

/* -------------------------------------------------------------------------- */
/*                              Helper Functions                              */
/* -------------------------------------------------------------------------- */

/**
 * Spawns a ripple effect on a button element.
 */
const spawnRipple = (event) => {
  const btn = event.currentTarget;
  const circle = document.createElement("span");
  const size = btn.offsetWidth;

  circle.className = "ripple";
  circle.style.cssText = `
    width:${size}px;
    height:${size}px;
    left:${event.nativeEvent.offsetX - size / 2}px;
    top:${event.nativeEvent.offsetY - size / 2}px;
  `;

  btn.appendChild(circle);
  setTimeout(() => circle.remove(), SIGNUP_CONFIG.RIPPLE_DURATION);
};

/* -------------------------------------------------------------------------- */
/*                                 Component                                  */
/* -------------------------------------------------------------------------- */

/**
 * SignupForm Component
 * Senior-level refactor with dry logic and performance optimizations.
 */
const SignupForm = () => {
  const navigate = useNavigate();
  const [btnState, setBtnState] = useState(BTN_STATES.IDLE);
  const [isUploading, setIsUploading] = useState(false);
  const [otpModal, setOtpModal] = useState({ isOpen: false, email: "" });

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
    mode: SIGNUP_CONFIG.FIELD_MODE,
  });

  /* ---------------------------------------------------------------------- */
  /*                               Computed UI                              */
  /* ---------------------------------------------------------------------- */

  const isInteractionDisabled = btnState !== BTN_STATES.IDLE;

  const submitBtnClass = useMemo(() => cn(
    STYLES.submitBtn.base,
    btnState === BTN_STATES.IDLE && STYLES.submitBtn.idle,
    btnState === BTN_STATES.LOADING && STYLES.submitBtn.loading,
    btnState === BTN_STATES.SUCCESS && STYLES.submitBtn.success
  ), [btnState]);

  const submitButtonContent = (
    <>
      <span className={cn(STYLES.submitBtn.content, btnState !== BTN_STATES.IDLE ? "opacity-0 scale-75" : "opacity-100 scale-100")}>
        Create Account <ArrowRight className="h-4 w-4" />
      </span>
      <span className={cn(STYLES.submitBtn.content, btnState === BTN_STATES.LOADING ? "opacity-100 scale-100" : "opacity-0 scale-75")}>
        <LoaderIcon className="h-5 w-5 animate-spin" />
      </span>
      <span className={cn(STYLES.submitBtn.content, btnState === BTN_STATES.SUCCESS ? "opacity-100 scale-100" : "opacity-0 scale-75")}>
        <Check className="h-5 w-5" />
      </span>
    </>
  );

  /* ---------------------------------------------------------------------- */
  /*                                 Actions                                */
  /* ---------------------------------------------------------------------- */

  const handleImageUpload = useCallback(async (file) => {
    if (!file) {
      form.setValue("profilePicture", null);
      return;
    }

    setIsUploading(true);
    try {
      const response = await uploadAvatar(file);
      if (response.success && response.data.url) {
        form.setValue("profilePicture", response.data.url);
        toast.success("Profile picture secured!");
      }
    } catch (error) {
      toast.error(error.message || "Failed to upload image.");
      form.setValue("profilePicture", null);
    } finally {
      setIsUploading(false);
    }
  }, [form]);

  const onSignupSubmit = useCallback(async (values) => {
    setBtnState(BTN_STATES.LOADING);
    try {
      const response = await signupUser(values);
      toast.success(response.message || "Signup successful! Verify your email.");
      setBtnState(BTN_STATES.SUCCESS);

      setTimeout(() => {
        setOtpModal({ isOpen: true, email: values.email });
        setBtnState(BTN_STATES.IDLE);
      }, SIGNUP_CONFIG.TRANSITION_DELAY);
    } catch (error) {
      toast.error(error.message || "Registration failed.");
      setBtnState(BTN_STATES.IDLE);
    }
  }, []);

  const handleBtnInteraction = useCallback((e) => {
    if (isInteractionDisabled) return;
    spawnRipple(e);
  }, [isInteractionDisabled]);

  /* ---------------------------------------------------------------------- */
  /*                               Sub-Components                           */
  /* ---------------------------------------------------------------------- */

  const SharedSubmitButton = (
    <div className="flex justify-center transition-all duration-400">
      <Button
        type="submit"
        disabled={isInteractionDisabled}
        onClick={handleBtnInteraction}
        className={submitBtnClass}
        style={{ transition: 'width 0.4s cubic-bezier(.4,0,.2,1), background 0.3s, transform 0.15s' }}
      >
        {submitButtonContent}
      </Button>
    </div>
  );

  return (
    <div className={STYLES.container}>
      <header className={STYLES.header.wrapper}>
        <h2 className={STYLES.header.title}>Create your account</h2>
        <p className={STYLES.header.subtitle}>Join the SEYAL developer ecosystem</p>
      </header>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSignupSubmit)} className="space-y-4">
          <div className={STYLES.formGrid}>

            {/* Right Column (Desktop) / Top (Mobile) */}
            <div className={STYLES.columnRight}>
              <FormField
                control={form.control}
                name="profilePicture"
                render={() => (
                  <FormItem>
                    <FormControl>
                      <ProfileUpload
                        onImageSelect={handleImageUpload}
                        isUploading={isUploading}
                        error={form.formState.errors.profilePicture?.message}
                        compact
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <div className="space-y-4">
                <SocialAuth />
                <div className="hidden md:block">
                  {SharedSubmitButton}
                </div>
              </div>
            </div>

            {/* Left Column (Desktop) / Bottom (Mobile) */}
            <div className={STYLES.columnLeft}>
              <div className="grid grid-cols-2 gap-3">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem className="space-y-1">
                      <FormLabel className={STYLES.labelBase}>First Name</FormLabel>
                      <FormControl>
                        <div className={STYLES.inputWrapper}>
                          <User className={STYLES.inputIcon} />
                          <Input className={STYLES.inputBase} placeholder="John" {...field} />
                        </div>
                      </FormControl>
                      <FormMessage className={STYLES.messageBase} />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem className="space-y-1">
                      <FormLabel className={STYLES.labelBase}>Last Name</FormLabel>
                      <FormControl>
                        <div className={STYLES.inputWrapper}>
                          <User className={STYLES.inputIcon} />
                          <Input className={STYLES.inputBase} placeholder="Doe" {...field} />
                        </div>
                      </FormControl>
                      <FormMessage className={STYLES.messageBase} />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem className="space-y-1">
                    <FormLabel className={STYLES.labelBase}>Username</FormLabel>
                    <FormControl>
                      <div className={STYLES.inputWrapper}>
                        <AtSign className={STYLES.inputIcon} />
                        <Input className={STYLES.inputBase} placeholder="johndoe" {...field} />
                      </div>
                    </FormControl>
                    <FormMessage className={STYLES.messageBase} />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem className="space-y-1">
                    <FormLabel className={STYLES.labelBase}>Email Address</FormLabel>
                    <FormControl>
                      <div className={STYLES.inputWrapper}>
                        <Mail className={STYLES.inputIcon} />
                        <Input className={STYLES.inputBase} placeholder="name@example.com" {...field} />
                      </div>
                    </FormControl>
                    <FormMessage className={STYLES.messageBase} />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-3">
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem className="space-y-1">
                      <FormLabel className={STYLES.labelBase}>Password</FormLabel>
                      <FormControl>
                        <PasswordInput placeholder="••••••••" className="text-white h-10 text-sm" {...field} />
                      </FormControl>
                      <FormMessage className={STYLES.messageBase} />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem className="space-y-1">
                      <FormLabel className={STYLES.labelBase}>Confirm</FormLabel>
                      <FormControl>
                        <PasswordInput placeholder="••••••••" className="text-white h-10 text-sm" {...field} />
                      </FormControl>
                      <FormMessage className={STYLES.messageBase} />
                    </FormItem>
                  )}
                />
              </div>

              <div className="md:hidden pt-4">
                {SharedSubmitButton}
              </div>
            </div>
          </div>
        </form>
      </Form>

      <VerifyOTPModal
        isOpen={otpModal.isOpen}
        onClose={() => setOtpModal(prev => ({ ...prev, isOpen: false }))}
        email={otpModal.email}
      />

      <footer className={STYLES.footer.wrapper}>
        Already have an account?{" "}
        <Link to="/login" className={STYLES.footer.link}>
          Sign in
        </Link>
      </footer>
    </div>
  );
};

export default SignupForm;