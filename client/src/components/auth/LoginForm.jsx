/* -------------------------------------------------------------------------- */
/*                                   Imports                                  */
/* -------------------------------------------------------------------------- */

import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowRight,
  Check,
  LoaderIcon,
  Mail,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";

import { useAuth } from "@/context/AuthContext";
import {
  getMe,
  getPublicAvatar,
  loginUser,
} from "@/services/auth.api";
import { loginSchema } from "@/validations/auth.schema";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

import ForgotPasswordModal from "./ForgotPasswordModal";
import PasswordInput from "./PasswordInput";
import SocialAuth from "./SocialAuth";
import VerifyOTPModal from "./VerifyOTPModal";

/* -------------------------------------------------------------------------- */
/*                                   Config                                   */
/* -------------------------------------------------------------------------- */

const CONFIG = {
  AVATAR_MIN_LENGTH: 3,
  AVATAR_FETCH_DELAY: 500,
  REDIRECT_DELAY: 1200,
  RIPPLE_DURATION: 600,
};

const BUTTON_STATES = {
  IDLE: "idle",
  LOADING: "loading",
  SUCCESS: "success",
};

/* -------------------------------------------------------------------------- */
/*                                   Styles                                   */
/* -------------------------------------------------------------------------- */

const STYLES = {
  container: "mx-auto max-w-[440px] space-y-6",
  header: {
    wrapper: "space-y-1 text-center",
    title: "font-mono text-3xl font-bold tracking-tight text-white",
    subtitle: "text-sm font-medium uppercase tracking-widest text-zinc-400",
  },
  card: cn(
    "space-y-6 rounded-3xl border border-white/5",
    "bg-zinc-900/30 p-8 shadow-2xl backdrop-blur-sm"
  ),
  label: "text-[11px] font-bold uppercase tracking-wider text-zinc-500",
  message: "text-[10px]",
  inputs: {
    group: "group relative",
    iconWrapper: "absolute top-1/2 left-3 flex -translate-y-1/2 items-center justify-center",
    base: cn(
      "h-11 rounded-full border-zinc-800 bg-zinc-950/50",
      "pl-11 text-sm text-white focus-visible:ring-indigo-500/20"
    ),
    password: "h-11 text-sm text-white",
  },
  avatar: {
    wrapper: "h-6 w-6 overflow-hidden rounded-full border border-white/10 shadow-sm animate-in zoom-in duration-300",
    img: "h-full w-full object-cover",
    placeholder: "h-3.5 w-3.5 text-zinc-600 transition-colors group-focus-within:text-indigo-400",
  },
  actionBtn: "text-[10px] font-bold uppercase tracking-tighter text-zinc-500 transition-colors hover:text-indigo-400",
  checkbox: "rounded-full border-zinc-800 data-[state=checked]:border-indigo-600 data-[state=checked]:bg-indigo-600",
  submit: {
    base: "relative h-11 overflow-hidden rounded-full text-sm font-bold uppercase tracking-wider text-white transition-all duration-400",
    states: {
      idle: "w-full bg-indigo-600 hover:scale-[1.02] hover:bg-indigo-700 active:scale-[0.98]",
      loading: "w-11 bg-indigo-700",
      success: "w-11 bg-green-600",
    },
    content: "absolute flex items-center gap-2 transition-all duration-200 opacity-100 scale-100",
  },
  footer: {
    text: "text-center text-sm text-zinc-500",
    link: "font-semibold text-indigo-400 transition-colors hover:text-indigo-300",
  },
};

/* -------------------------------------------------------------------------- */
/*                              Helper Functions                              */
/* -------------------------------------------------------------------------- */

/**
 * Executes a ripple animation on an element
 */
const spawnRipple = (event) => {
  const button = event.currentTarget;
  const circle = document.createElement("span");
  const size = button.offsetWidth;

  circle.classList.add("ripple");
  circle.style.width = circle.style.height = `${size}px`;
  circle.style.left = `${event.nativeEvent.offsetX - size / 2}px`;
  circle.style.top = `${event.nativeEvent.offsetY - size / 2}px`;

  button.appendChild(circle);
  setTimeout(() => circle.remove(), CONFIG.RIPPLE_DURATION);
};

/* -------------------------------------------------------------------------- */
/*                                 Component                                  */
/* -------------------------------------------------------------------------- */

/**
 * Senior-level LoginForm component.
 * Implements Zod validation, multi-stage submit feedback, and dynamic avatar fetching.
 */
const LoginForm = () => {
  /* ---------------------------------------------------------------------- */
  /*                                   Hooks                                */
  /* ---------------------------------------------------------------------- */

  const navigate = useNavigate();
  const { setUser, setIsAuthenticated } = useAuth();

  const [btnState, setBtnState] = useState(BUTTON_STATES.IDLE);
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  const [otpModal, setOtpModal] = useState({ isOpen: false, email: "" });

  const form = useForm({
    resolver: zodResolver(loginSchema),
    mode: "onBlur",
    defaultValues: { identifier: "", password: "", rememberMe: false },
  });

  const watchIdentifier = form.watch("identifier");

  /* ---------------------------------------------------------------------- */
  /*                               Computed UI                              */
  /* ---------------------------------------------------------------------- */

  const isInteracting = btnState !== BUTTON_STATES.IDLE;

  const submitButtonClasses = useMemo(() => cn(
    STYLES.submit.base,
    STYLES.submit.states[btnState]
  ), [btnState]);

  const identifierIcon = useMemo(() => (
    avatarUrl ? (
      <div className={STYLES.avatar.wrapper}>
        <img src={avatarUrl} alt="User" className={STYLES.avatar.img} />
      </div>
    ) : (
      <Mail className={STYLES.avatar.placeholder} />
    )
  ), [avatarUrl]);

  const submitButtonLabel = useMemo(() => {
    if (btnState === BUTTON_STATES.LOADING) return <LoaderIcon className="h-5 w-5 animate-spin" />;
    if (btnState === BUTTON_STATES.SUCCESS) return <Check className="h-5 w-5" />;
    return (
      <>
        Sign In <ArrowRight className="h-4 w-4" />
      </>
    );
  }, [btnState]);

  /* ---------------------------------------------------------------------- */
  /*                               Side Effects                             */
  /* ---------------------------------------------------------------------- */

  /**
   * Debounced Avatar Fetching
   */
  useEffect(() => {
    if (!watchIdentifier || watchIdentifier.length < CONFIG.AVATAR_MIN_LENGTH) {
      setAvatarUrl(null);
      return;
    }

    const handler = setTimeout(async () => {
      try {
        const res = await getPublicAvatar(watchIdentifier);
        setAvatarUrl(res.success ? res.data?.avatarUrl : null);
      } catch {
        setAvatarUrl(null);
      }
    }, CONFIG.AVATAR_FETCH_DELAY);

    return () => clearTimeout(handler);
  }, [watchIdentifier]);

  /* ---------------------------------------------------------------------- */
  /*                                 Actions                                */
  /* ---------------------------------------------------------------------- */

  const toggleForgotModal = useCallback((val) => setIsForgotModalOpen(val), []);
  const closeOtpModal = useCallback(() => setOtpModal(prev => ({ ...prev, isOpen: false })), []);

  /**
   * Main Login Handler
   */
  const onLoginSubmit = async (values) => {
    setBtnState(BUTTON_STATES.LOADING);

    try {
      const response = await loginUser(values);

      if (response.requiresVerification) {
        toast.error("Verification required. Please check your inbox.");
        setOtpModal({ isOpen: true, email: response.email });
        setBtnState(BUTTON_STATES.IDLE);
        return;
      }

      toast.success(response.message || "Welcome back!");
      setBtnState(BUTTON_STATES.SUCCESS);

      const me = await getMe();
      if (me.success) {
        setTimeout(() => {
          setUser(me.data.user);
          setIsAuthenticated(true);
          navigate("/dashboard");
        }, CONFIG.REDIRECT_DELAY);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || "Login failed.");
      setBtnState(BUTTON_STATES.IDLE);
    }
  };

  const handleButtonClick = useCallback((e) => {
    if (isInteracting) return;
    spawnRipple(e);
  }, [isInteracting]);

  return (
    <div className={STYLES.container}>
      {/* 1. Header Section */}
      <header className={STYLES.header.wrapper}>
        <h2 className={STYLES.header.title}>Welcome back</h2>
        <p className={STYLES.header.subtitle}>Continue building with SEYAL</p>
      </header>

      {/* 2. Form Section */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onLoginSubmit)} className="space-y-4">
          <div className={STYLES.card}>
            <SocialAuth />

            {/* Email/Username Field */}
            <FormField
              control={form.control}
              name="identifier"
              render={({ field }) => (
                <FormItem className="space-y-1">
                  <FormLabel className={STYLES.label}>Email or Username</FormLabel>
                  <FormControl>
                    <div className={STYLES.inputs.group}>
                      <div className={STYLES.inputs.iconWrapper}>{identifierIcon}</div>
                      <Input
                        {...field}
                        placeholder="Enter email or username"
                        className={STYLES.inputs.base}
                        autoComplete="username"
                      />
                    </div>
                  </FormControl>
                  <FormMessage className={STYLES.message} />
                </FormItem>
              )}
            />

            {/* Password Field */}
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem className="space-y-1">
                  <div className="flex items-center justify-between">
                    <FormLabel className={STYLES.label}>Password</FormLabel>
                    <button
                      type="button"
                      onClick={() => toggleForgotModal(true)}
                      className={STYLES.actionBtn}
                    >
                      Forgot password?
                    </button>
                  </div>
                  <FormControl>
                    <PasswordInput
                      {...field}
                      placeholder="••••••••"
                      className={STYLES.inputs.password}
                      autoComplete="current-password"
                    />
                  </FormControl>
                  <FormMessage className={STYLES.message} />
                </FormItem>
              )}
            />

            {/* Persistence Option */}
            <FormField
              control={form.control}
              name="rememberMe"
              render={({ field }) => (
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="remember"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    className={STYLES.checkbox}
                  />
                  <label htmlFor="remember" className={STYLES.label}>
                    Remember me for 30 days
                  </label>
                </div>
              )}
            />

            {/* Submit Action */}
            <div className="flex justify-center">
              <Button
                type="submit"
                disabled={isInteracting}
                onClick={handleButtonClick}
                className={submitButtonClasses}
                style={{ transition: "width 0.4s cubic-bezier(.4,0,.2,1), background 0.3s, transform 0.15s" }}
              >
                <span className={STYLES.submit.content}>
                  {submitButtonLabel}
                </span>
              </Button>
            </div>
          </div>
        </form>
      </Form>

      {/* 3. Modals & Navigation */}
      <VerifyOTPModal
        isOpen={otpModal.isOpen}
        email={otpModal.email}
        onClose={closeOtpModal}
      />

      <ForgotPasswordModal
        isOpen={isForgotModalOpen}
        onClose={() => toggleForgotModal(false)}
      />

      <footer className={STYLES.footer.text}>
        Don&apos;t have an account?{" "}
        <Link to="/signup" className={STYLES.footer.link}>
          Create account
        </Link>
      </footer>
    </div>
  );
};

export default LoginForm;