import React, { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowLeft, Loader2, RefreshCw, ShieldCheck } from "lucide-react";
import { toast } from "react-hot-toast";
import { useLocation, useNavigate } from "react-router-dom";

import useCountdown from "@/hooks/useCountdown";
import { resendOtp, verifyOtp } from "@/services/auth.api";

import OTPInput from "./OTPInput";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

/* -------------------------------------------------------------------------- */
/*                                   Config                                   */
/* -------------------------------------------------------------------------- */

const CONFIG = {
  OTP_LENGTH: 6,
  COUNTDOWN_SECONDS: 60,
  SUCCESS_NAVIGATE_DELAY: 1500,
  DEFAULT_PURPOSE: "verify-email",
};

/* -------------------------------------------------------------------------- */
/*                                   Styles                                   */
/* -------------------------------------------------------------------------- */

const STYLES = {
  card: cn(
    "border-none shadow-2xl shadow-zinc-200/50 dark:shadow-zinc-900/50",
    "bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl rounded-2xl overflow-hidden"
  ),
  cardHeader: "text-center pb-2",
  iconContainer: cn(
    "mx-auto w-12 h-12 bg-zinc-100 dark:bg-zinc-800",
    "rounded-full flex items-center justify-center mb-2"
  ),
  icon: "h-6 w-6 text-zinc-900 dark:text-zinc-50",
  title: "text-2xl font-bold",
  description: "text-zinc-500 dark:text-zinc-400",
  emailHighlight: "font-semibold text-zinc-900 dark:text-zinc-50",
  content: "space-y-6 pt-4",
  submitButton: "w-full h-12 font-bold text-lg",
  footer: "flex flex-col items-center gap-4 pb-8 pt-2",
  timerText: "text-sm text-zinc-400",
  timerValue: "font-mono font-bold text-zinc-900 dark:text-zinc-50",
  resendBtn: cn(
    "flex items-center gap-2 text-zinc-900 dark:text-zinc-50",
    "font-semibold hover:underline underline-offset-4",
    "disabled:opacity-50 transition-all text-sm"
  ),
  backBtn: cn(
    "flex items-center gap-2 text-xs text-zinc-400",
    "hover:text-zinc-900 dark:hover:text-zinc-50 transition-colors"
  ),
};

/* -------------------------------------------------------------------------- */
/*                              Helper Functions                              */
/* -------------------------------------------------------------------------- */

/**
 * Mask email for privacy (e.g., su******@gmail.com)
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
 * VerifyOTPCard Component
 * Handles the logic for verifying a 6-digit OTP code and resending codes.
 */
const VerifyOTPCard = () => {

  const navigate = useNavigate();
  const location = useLocation();

  const [otp, setOtp] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);

  const { seconds, isActive, reset: resetTimer } = useCountdown(CONFIG.COUNTDOWN_SECONDS);

  /* ---------------------------------------------------------------------- */
  /*                               Computed UI                              */
  /* ---------------------------------------------------------------------- */

  const { email, purpose } = useMemo(() => location.state || {}, [location.state]);
  const maskedEmailDisplay = useMemo(() => maskEmail(email), [email]);
  const isSubmitDisabled = isVerifying || otp.length !== CONFIG.OTP_LENGTH;
  const timerDisplay = useMemo(() => (
    `00:${seconds.toString().padStart(2, "0")}`
  ), [seconds]);

  /* ---------------------------------------------------------------------- */
  /*                               Side Effects                             */
  /* ---------------------------------------------------------------------- */

  useEffect(() => {
    if (!email) {
      toast.error("Session expired. Please signup again.");
      navigate("/signup", { replace: true });
    }
  }, [email, navigate]);

  /* ---------------------------------------------------------------------- */
  /*                                 Actions                                */
  /* ---------------------------------------------------------------------- */

  const handleVerify = useCallback(async (e) => {
    e?.preventDefault();

    if (otp.length !== CONFIG.OTP_LENGTH) {
      return toast.error(`Please enter a ${CONFIG.OTP_LENGTH}-digit code`);
    }

    setIsVerifying(true);
    try {
      const response = await verifyOtp({
        email,
        otp,
        purpose: purpose || CONFIG.DEFAULT_PURPOSE,
      });

      toast.success(response.message || "Email verified successfully!");

      setTimeout(() => {
        navigate("/login", { replace: true });
      }, CONFIG.SUCCESS_NAVIGATE_DELAY);
    } catch (error) {
      toast.error(error.message || "Invalid or expired OTP");
    } finally {
      setIsVerifying(false);
    }
  }, [email, otp, purpose, navigate]);

  const handleResend = useCallback(async () => {
    setIsResending(true);
    try {
      const response = await resendOtp({
        email,
        purpose: purpose || CONFIG.DEFAULT_PURPOSE,
      });

      toast.success(response.message || "New OTP sent to your email");
      resetTimer();
    } catch (error) {
      toast.error(error.message || "Failed to resend OTP");
    } finally {
      setIsResending(false);
    }
  }, [email, purpose, resetTimer]);

  const handleBackToSignup = useCallback(() => {
    navigate("/signup");
  }, [navigate]);

  /* ---------------------------------------------------------------------- */
  /*                               Render Parts                             */
  /* ---------------------------------------------------------------------- */

  const resendSection = isActive ? (
    <p className={STYLES.timerText} aria-live="polite">
      Resend available in <span className={STYLES.timerValue}>{timerDisplay}</span>
    </p>
  ) : (
    <button
      type="button"
      onClick={handleResend}
      disabled={isResending}
      className={STYLES.resendBtn}
      aria-label="Resend verification code"
    >
      {isResending ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <RefreshCw className="h-4 w-4" />
      )}
      Resend OTP
    </button>
  );

  return (
    <Card className={STYLES.card}>
      <CardHeader className={STYLES.cardHeader}>
        <div className={STYLES.iconContainer}>
          <ShieldCheck className={STYLES.icon} />
        </div>

        <CardTitle className={STYLES.title}>Verify Your Email</CardTitle>

        <CardDescription className={STYLES.description}>
          We sent a {CONFIG.OTP_LENGTH}-digit code to{" "}
          <span className={STYLES.emailHighlight}>{maskedEmailDisplay}</span>
        </CardDescription>
      </CardHeader>

      <CardContent className={STYLES.content}>
        <OTPInput
          value={otp}
          onChange={setOtp}
          disabled={isVerifying}
        />

        <Button
          onClick={handleVerify}
          className={STYLES.submitButton}
          disabled={isSubmitDisabled}
          aria-live="polite"
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

      <CardFooter className={STYLES.footer}>
        <div className="text-sm">
          {resendSection}
        </div>

        <button
          type="button"
          onClick={handleBackToSignup}
          className={STYLES.backBtn}
        >
          <ArrowLeft className="h-3 w-3" />
          Back to Signup
        </button>
      </CardFooter>
    </Card>
  );
};

export default VerifyOTPCard;
