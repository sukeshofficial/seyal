import React, { useCallback, useEffect, useMemo, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, ChevronLeft, Key, Loader2, Mail, Shield, X } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";

import { forgotPassword, resetPassword, verifyResetOtp } from "@/services/auth.api";
import { forgotPasswordSchema, resetPasswordSchema } from "@/validations/auth.schema";

import OTPInput from "./OTPInput";
import PasswordInput from "./PasswordInput";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

/* -------------------------------------------------------------------------- */
/*                                   Config                                   */
/* -------------------------------------------------------------------------- */

const STEPS = {
  IDENTIFY: 1,
  VERIFY: 2,
  RESET: 3,
};

const STEP_CONFIG = {
  [STEPS.IDENTIFY]: {
    title: "Forgot password?",
    description: "Reset your password using a secure OTP sent to your email.",
    icon: Mail,
  },
  [STEPS.VERIFY]: {
    title: "Enter OTP",
    icon: Shield,
  },
  [STEPS.RESET]: {
    title: "Reset Password",
    description: "Choose a new strong password for your account.",
    icon: Key,
  },
};

const UI_CONFIG = {
  RESET_DELAY: 300,
  SUCCESS_TRANSITION_DELAY: 800,
  VERIFY_TRANSITION_DELAY: 600,
  FINAL_CLOSE_DELAY: 1200,
  OTP_LENGTH: 6,
};

/* -------------------------------------------------------------------------- */
/*                                   Styles                                   */
/* -------------------------------------------------------------------------- */

const STYLES = {
  // Main Container
  dialogContent: cn(
    "overflow-hidden rounded-[32px] border-white/5 bg-zinc-950/80 p-0 shadow-2xl backdrop-blur-xl",
    "sm:max-w-[420px] sm:rounded-3xl [&>button]:hidden"
  ),
  closeBtn: cn(
    "absolute top-4 right-4 z-10 rounded-full p-2 text-zinc-500",
    "transition-colors hover:bg-white/5"
  ),
  closeIcon: "h-4 w-4",
  contentWrapper: "px-6 py-7 md:px-8",

  // Header Logic
  headerStack: "space-y-2 text-center",
  stepIndicatorWrapper: "mb-6 flex scale-150 items-center justify-center gap-1.5",
  stepDotBase: "h-1 rounded-full transition-all duration-500",
  stepDotActive: "w-4 bg-indigo-500/80",
  stepDotInactive: "w-1 bg-zinc-800",

  // Icon Branding
  iconContainer: cn(
    "mx-auto mb-1 flex h-12 w-12 items-center justify-center rounded-full",
    "border border-white/10 bg-white/[0.03] shadow-inner ring-1 ring-white/5"
  ),
  iconInner: "h-6 w-6 text-indigo-400",

  // Typography
  title: "pt-7 text-xl font-bold tracking-tight text-white",
  description: "mx-auto ml-0 max-w-[300px] text-xs leading-tight text-zinc-500 md:text-sm",
  emailHighlight: "break-words font-medium text-zinc-300",
  errorLabel: "ml-4 text-[10px] font-medium uppercase tracking-wide text-red-400/80",

  // Form Layouts
  formWrapper: "mt-6",
  formStack: "space-y-4",
  fieldStack: "space-y-1",
  passwordFieldStack: "space-y-3",
  relativeWrapper: "relative",

  // Inputs & Buttons
  inputBase: cn(
    "h-12 rounded-full border-white/10 bg-white/[0.03] text-white",
    "focus:border-indigo-500/50 focus:ring-indigo-500/10"
  ),
  inputWithIcon: "pl-11",
  inputIcon: "absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-zinc-600",

  submitBtn: cn(
    "h-12 w-full rounded-full bg-indigo-600 font-bold text-white shadow-lg shadow-indigo-600/10",
    "transition-all hover:translate-y-[-1px] hover:bg-indigo-500 active:translate-y-[1px]"
  ),

  backBtn: "flex w-full items-center justify-center gap-1.5 text-xs font-semibold text-zinc-500 transition-colors hover:text-zinc-300",
  backIcon: "h-3.5 w-3.5",

  // States
  loaderIcon: "h-5 w-5 animate-spin",
  successIcon: "h-5 w-5 animate-in zoom-in duration-300",

  // Footer
  footerWrapper: "mt-8 border-t border-white/[0.02] pt-6 text-center",
  footerText: "flex items-center justify-center gap-2 text-[9px] font-bold uppercase tracking-[0.2em] text-zinc-600 opacity-80",
  footerDot: "h-1 w-1 rounded-full bg-zinc-800",
};

/* -------------------------------------------------------------------------- */
/*                                 Component                                  */
/* -------------------------------------------------------------------------- */

const ForgotPasswordModal = ({ isOpen, onClose }) => {
  /* ---------------------------------------------------------------------- */
  /*                                   Hooks                                */
  /* ---------------------------------------------------------------------- */

  const [step, setStep] = useState(STEPS.IDENTIFY);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [btnState, setBtnState] = useState("idle");

  const identifyForm = useForm({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  const resetForm = useForm({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  /* ---------------------------------------------------------------------- */
  /*                               Computed UI                              */
  /* ---------------------------------------------------------------------- */

  const currentConfig = STEP_CONFIG[step];
  const StepIcon = currentConfig.icon;
  const isLoading = btnState === "loading";

  const closeButton = (
    <button type="button" onClick={onClose} className={STYLES.closeBtn} aria-label="Close modal">
      <X className={STYLES.closeIcon} />
    </button>
  );

  const stepIndicators = (
    <div className={STYLES.stepIndicatorWrapper}>
      {[STEPS.IDENTIFY, STEPS.VERIFY, STEPS.RESET].map((item) => (
        <div
          key={item}
          className={cn(
            STYLES.stepDotBase,
            step === item ? STYLES.stepDotActive : STYLES.stepDotInactive
          )}
        />
      ))}
    </div>
  );

  const stepDescription = (
    <DialogDescription className={STYLES.description}>
      {step === STEPS.VERIFY ? (
        <span className="block">
          Code sent to <br />
          <span className={STYLES.emailHighlight}>{email}</span>
        </span>
      ) : (
        currentConfig.description
      )}
    </DialogDescription>
  );

  const buttonContent = useMemo(() => {
    if (isLoading) return <Loader2 className={STYLES.loaderIcon} />;
    if (btnState === "success") return <CheckCircle2 className={STYLES.successIcon} />;
    return null;
  }, [isLoading, btnState]);

  const identifyView = (
    <form onSubmit={identifyForm.handleSubmit(async (d) => {
      setBtnState("loading");
      try {
        await forgotPassword(d.email);
        setEmail(d.email);
        setBtnState("success");
        setTimeout(() => { setStep(STEPS.VERIFY); setBtnState("idle"); }, UI_CONFIG.SUCCESS_TRANSITION_DELAY);
      } catch (err) {
        toast.error(err.message || "Failed to request reset code");
        setBtnState("idle");
      }
    })} className={STYLES.formStack}>
      <div className={STYLES.fieldStack}>
        <div className={STYLES.relativeWrapper}>
          <Mail className={STYLES.inputIcon} />
          <Input
            placeholder="Enter your email"
            className={cn(STYLES.inputBase, STYLES.inputWithIcon)}
            {...identifyForm.register("email")}
          />
        </div>
        {identifyForm.formState.errors.email && (
          <p className={STYLES.errorLabel}>{identifyForm.formState.errors.email.message}</p>
        )}
      </div>
      <Button type="submit" disabled={isLoading} className={STYLES.submitBtn}>
        {buttonContent || "Send reset code"}
      </Button>
    </form>
  );

  const verifyView = (
    <div className={STYLES.formStack}>
      <OTPInput value={otp} onChange={setOtp} disabled={isLoading} />
      <div className={STYLES.passwordFieldStack}>
        <Button
          onClick={async () => {
            if (otp.length !== UI_CONFIG.OTP_LENGTH) return toast.error("Please enter 6-digit code");
            setBtnState("loading");
            try {
              await verifyResetOtp({ email, otp });
              setBtnState("success");
              setTimeout(() => { setStep(STEPS.RESET); setBtnState("idle"); }, UI_CONFIG.VERIFY_TRANSITION_DELAY);
            } catch (err) {
              toast.error(err.message || "Invalid reset code");
              setBtnState("idle");
            }
          }}
          disabled={isLoading || otp.length !== UI_CONFIG.OTP_LENGTH}
          className={STYLES.submitBtn}
        >
          {isLoading ? <Loader2 className={STYLES.loaderIcon} /> : "Verify and continue"}
        </Button>
        <button type="button" onClick={() => setStep(STEPS.IDENTIFY)} className={STYLES.backBtn}>
          <ChevronLeft className={STYLES.backIcon} />
          Back to email
        </button>
      </div>
    </div>
  );

  const resetView = (
    <form onSubmit={resetForm.handleSubmit(async (d) => {
      setBtnState("loading");
      try {
        await resetPassword({ email, otp, password: d.password });
        setBtnState("success");
        toast.success("Password reset successful!");
        setTimeout(onClose, UI_CONFIG.FINAL_CLOSE_DELAY);
      } catch (err) {
        toast.error(err.message || "Failed to reset password");
        setBtnState("idle");
      }
    })} className={STYLES.formStack}>
      <div className={STYLES.passwordFieldStack}>
        <div className={STYLES.fieldStack}>
          <PasswordInput placeholder="New password" className={STYLES.inputBase} {...resetForm.register("password")} />
          {resetForm.formState.errors.password && (
            <p className={STYLES.errorLabel}>{resetForm.formState.errors.password.message}</p>
          )}
        </div>
        <div className={STYLES.fieldStack}>
          <PasswordInput placeholder="Confirm password" className={STYLES.inputBase} {...resetForm.register("confirmPassword")} />
          {resetForm.formState.errors.confirmPassword && (
            <p className={STYLES.errorLabel}>{resetForm.formState.errors.confirmPassword.message}</p>
          )}
        </div>
      </div>
      <Button type="submit" disabled={isLoading} className={STYLES.submitBtn}>
        {buttonContent || "Reset password"}
      </Button>
    </form>
  );

  const footer = (
    <footer className={STYLES.footerWrapper}>
      <p className={STYLES.footerText}>
        <span className={STYLES.footerDot} />
        Secure password recovery powered by SEYAL
        <span className={STYLES.footerDot} />
      </p>
    </footer>
  );

  /* ---------------------------------------------------------------------- */
  /*                               Side Effects                             */
  /* ---------------------------------------------------------------------- */

  useEffect(() => {
    if (!isOpen) {
      const t = setTimeout(() => {
        setStep(STEPS.IDENTIFY);
        setEmail("");
        setOtp("");
        setBtnState("idle");
        identifyForm.reset();
        resetForm.reset();
      }, UI_CONFIG.RESET_DELAY);
      return () => clearTimeout(t);
    }
  }, [isOpen, identifyForm, resetForm]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={STYLES.dialogContent}>
        {closeButton}
        <div className={STYLES.contentWrapper}>
          <DialogHeader className={STYLES.headerStack}>
            {stepIndicators}
            <div className={STYLES.iconContainer}>
              <StepIcon className={STYLES.iconInner} />
            </div>
            <div className={STYLES.fieldStack}>
              <DialogTitle className={STYLES.title}>{currentConfig.title}</DialogTitle>
              {stepDescription}
            </div>
          </DialogHeader>

          <div className={STYLES.formWrapper}>
            {step === STEPS.IDENTIFY && identifyView}
            {step === STEPS.VERIFY && verifyView}
            {step === STEPS.RESET && resetView}
          </div>

          {footer}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ForgotPasswordModal;
