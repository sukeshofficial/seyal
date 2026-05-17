import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Loader2, RefreshCw, ShieldCheck } from "lucide-react";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";

import { useAuth } from "@/context/AuthContext";
import useCountdown from "@/hooks/useCountdown";
import { resendOtp, verifyOtp } from "@/services/auth.api";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

import OTPInput from "./OTPInput";

/* -------------------------------------------------------------------------- */
/*                                   Config                                   */
/* -------------------------------------------------------------------------- */

const OTP_CONFIG = {
  RESEND_COOLDOWN: 60,
  SESSION_EXPIRY: 600,
  LENGTH: 6,
  DEFAULT_PURPOSE: "verify-email",
};

const REDIRECT_PATHS = {
  SUCCESS: "/dashboard",
  FALLBACK: "/login",
};

/* -------------------------------------------------------------------------- */
/*                                   Styles                                   */
/* -------------------------------------------------------------------------- */

const dialogContentClass = cn(
  "sm:max-w-[500px] px-10 py-8",
  "border border-white/10 bg-zinc-950/90 backdrop-blur-2xl",
  "shadow-[0_0_50px_-12px_rgba(79,70,229,0.2)]",
  "[&>button]:hidden"
);

const iconContainerClass = cn(
  "mx-auto w-14 h-14 rounded-2xl flex items-center justify-center mb-4",
  "bg-gradient-to-b from-indigo-500/20 to-transparent",
  "ring-1 ring-white/10 shadow-inner"
);

const shieldIconClass = cn(
  "h-8 w-8 text-indigo-400",
  "drop-shadow-[0_0_8px_rgba(129,140,248,0.5)]"
);

const emailHighlightClass = cn(
  "text-white font-medium underline underline-offset-4",
  "decoration-indigo-500/30"
);

const expiryAlertClass = cn(
  "mt-2 py-1.5 rounded-full ring-1 animate-pulse",
  "text-red-500 font-bold text-sm bg-red-500/10 ring-red-500/20"
);

const submitButtonClass = cn(
  "w-full h-14 rounded-full text-white font-bold text-lg transition-all duration-300",
  "bg-indigo-600 hover:bg-indigo-500 shadow-xl shadow-indigo-600/20",
  "hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:scale-100"
);

const resendButtonClass = cn(
  "text-indigo-400 font-bold flex items-center gap-2 underline underline-offset-4 transition-all",
  "hover:text-indigo-300 hover:scale-105 active:scale-95 decoration-indigo-500/30"
);

const footerDividerClass = cn(
  "h-px w-full mb-4 bg-gradient-to-r",
  "from-transparent via-white/5 to-transparent"
);

const footerBrandingClass = cn(
  "text-[10px] text-zinc-500 uppercase tracking-[0.3em] font-black opacity-40"
);

/* -------------------------------------------------------------------------- */
/*                              Helper Functions                              */
/* -------------------------------------------------------------------------- */

/**
 * Formats seconds into MM:SS
 */
const formatTime = (totalSeconds) => {
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

/**
 * Masks email for privacy
 */
const maskEmail = (emailStr) => {
  if (!emailStr) return "";
  const [user, domain] = emailStr.split("@");
  return `${user.substring(0, 2)}******@${domain}`;
};

/* -------------------------------------------------------------------------- */
/*                                 Component                                  */
/* -------------------------------------------------------------------------- */

/**
 * VerifyOTPModal
 * Handles multi-timer OTP verification with session management.
 */
const VerifyOTPModal = ({
  isOpen,
  onClose,
  email,
  purpose = OTP_CONFIG.DEFAULT_PURPOSE,
}) => {

  const navigate = useNavigate();
  const { setUser, setIsAuthenticated } = useAuth();

  const [otp, setOtp] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);

  // Timer 1: Resend button cooldown
  const {
    seconds: resendSeconds,
    isActive: isResendActive,
    reset: resetResendTimer,
  } = useCountdown(OTP_CONFIG.RESEND_COOLDOWN);

  // Timer 2: OTP Session Expiry
  const {
    seconds: expirySeconds,
    isActive: isExpiryActive,
    reset: resetExpiryTimer,
  } = useCountdown(OTP_CONFIG.SESSION_EXPIRY);

  /* ---------------------------------------------------------------------- */
  /*                               Computed UI                              */
  /* ---------------------------------------------------------------------- */

  const maskedEmail = useMemo(() => maskEmail(email), [email]);

  const formattedExpiryTime = useMemo(
    () => formatTime(expirySeconds),
    [expirySeconds]
  );

  const isSubmitDisabled =
    isVerifying || otp.length !== OTP_CONFIG.LENGTH || !isExpiryActive;

  const expiryStatusDisplay = !isExpiryActive ? (
    <div className={expiryAlertClass} role="alert">
      OTP Expired. Please request a new one below.
    </div>
  ) : (
    <div className="mt-2 text-zinc-500 text-sm font-medium">
      Code expires in <span className="text-white font-mono">{formattedExpiryTime}</span>
    </div>
  );

  const submitButtonContent = isVerifying ? (
    <>
      <Loader2 className="mr-2 h-6 w-6 animate-spin" />
      Activating Account...
    </>
  ) : (
    "Confirm & Continue"
  );

  /* ---------------------------------------------------------------------- */
  /*                               Side Effects                             */
  /* ---------------------------------------------------------------------- */

  useEffect(() => {
    if (isOpen) {
      setOtp("");
      resetResendTimer();
      resetExpiryTimer();
    }
  }, [isOpen, email, resetResendTimer, resetExpiryTimer]);

  /* ---------------------------------------------------------------------- */
  /*                                 Actions                                */
  /* ---------------------------------------------------------------------- */

  const handleVerify = useCallback(
    async (e) => {
      e?.preventDefault();

      if (otp.length !== OTP_CONFIG.LENGTH) {
        return toast.error(`Please enter a ${OTP_CONFIG.LENGTH}-digit code`);
      }

      if (!isExpiryActive) {
        return toast.error("OTP has expired. Please request a new one.");
      }

      setIsVerifying(true);
      try {
        const response = await verifyOtp({ email, otp, purpose });

        toast.success(response.message || "Account verified successfully!");

        if (response.data?.user) {
          setUser(response.data.user);
          setIsAuthenticated(true);
          onClose();
          navigate(REDIRECT_PATHS.SUCCESS);
        } else {
          onClose();
          navigate(REDIRECT_PATHS.FALLBACK);
        }
      } catch (error) {
        toast.error(error.message || "Invalid or expired OTP");
      } finally {
        setIsVerifying(false);
      }
    },
    [otp, isExpiryActive, email, purpose, setUser, setIsAuthenticated, onClose, navigate]
  );

  const handleResend = useCallback(async () => {
    setIsResending(true);
    try {
      const response = await resendOtp({ email, purpose });

      toast.success(response.message || "New OTP sent to your email");
      resetResendTimer();
      resetExpiryTimer();
      setOtp("");
    } catch (error) {
      toast.error(error.message || "Failed to resend OTP");
    } finally {
      setIsResending(false);
    }
  }, [email, purpose, resetResendTimer, resetExpiryTimer]);

  const preventAutoClose = useCallback((e) => {
    e.preventDefault();
  }, []);

  /* ---------------------------------------------------------------------- */
  /*                                Computed JSX                            */
  /* ---------------------------------------------------------------------- */

  const resendAction = isResendActive ? (
    <p className="text-zinc-500 flex items-center gap-2.5 font-medium" aria-live="polite">
      <RefreshCw className="h-4 w-4 animate-pulse text-indigo-500/50" />
      Resend code in <span className="text-indigo-400 font-mono font-bold tracking-wider">{resendSeconds}s</span>
    </p>
  ) : (
    <button
      type="button"
      onClick={handleResend}
      disabled={isResending}
      className={resendButtonClass}
    >
      {isResending ? (
        <Loader2 className="h-4 w-4 animate-spin text-white" />
      ) : (
        <RefreshCw className="h-4 w-4" />
      )}
      Didn't receive it? Resend
    </button>
  );

  return (
    <Dialog open={isOpen} onOpenChange={() => { }}>
      <DialogContent
        className={dialogContentClass}
        onPointerDownOutside={preventAutoClose}
        onEscapeKeyDown={preventAutoClose}
      >
        <DialogHeader className="text-center pt-0">
          <div className={iconContainerClass}>
            <ShieldCheck className={shieldIconClass} />
          </div>

          <DialogTitle className="text-3xl font-bold text-white tracking-tight leading-tight">
            Verify Your Email
          </DialogTitle>

          <DialogDescription className="text-zinc-400 pt-2 text-base leading-relaxed">
            We've sent a code to <span className={emailHighlightClass}>{maskedEmail}</span>. Enter it to activate your account.
          </DialogDescription>

          {expiryStatusDisplay}
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
              className={submitButtonClass}
              disabled={isSubmitDisabled}
              aria-busy={isVerifying}
            >
              {submitButtonContent}
            </Button>

            <div className="flex justify-center text-sm" role="status">
              {resendAction}
            </div>
          </div>
        </div>

        <div className="text-center pt-2">
          <div className={footerDividerClass} />
          <p className={footerBrandingClass}>
            Secure Authentication by SEYAL
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default VerifyOTPModal;
