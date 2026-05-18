import React, { useMemo } from "react";
import { Toaster } from "react-hot-toast";
import { cn } from "@/lib/utils";
import VerifyOTPCard from "@/components/auth/VerifyOTPCard";

const VERIFY_OTP_CONFIG = {
  SPAM_HINT: "Make sure to check your spam folder if you don't see the email.",
  TOAST_POSITION: "top-center",
};

/* -------------------------------------------------------------------------- */
/*                                   Styles                                   */
/* -------------------------------------------------------------------------- */

const STYLES = {
  pageWrapper: cn(
    "min-h-screen flex items-center justify-center p-4 font-sans",
    "bg-gray-50/50 dark:bg-zinc-950"
  ),
  contentContainer: cn(
    "w-full max-w-md",
    "animate-in fade-in zoom-in slide-in-from-top-4 duration-500"
  ),
  hintText: cn("mt-8 text-center text-xs text-zinc-400 dark:text-zinc-500"),
};

/* -------------------------------------------------------------------------- */
/*                                 Component                                  */
/* -------------------------------------------------------------------------- */

/**
 * VerifyOTP
 * The structural wrapper for the OTP verification flow.
 */
const VerifyOTP = () => {

  /* ---------------------------------------------------------------------- */
  /*                             Computed UI                                */
  /* ---------------------------------------------------------------------- */

  /**
   * Memoized notification provider to prevent re-initialization.
   */
  const notificationProvider = useMemo(
    () => (
      <Toaster
        position={VERIFY_OTP_CONFIG.TOAST_POSITION}
        reverseOrder={false}
      />
    ),
    []
  );

  /**
   * Memoized footer hint to keep the return statement lean.
   */
  const footerHint = useMemo(
    () => <p className={STYLES.hintText}>{VERIFY_OTP_CONFIG.SPAM_HINT}</p>,
    []
  );

  /**
   * The core verification module.
   */
  const verificationModule = useMemo(
    () => (
      <div className={STYLES.contentContainer}>
        <VerifyOTPCard />
        {footerHint}
      </div>
    ),
    [footerHint]
  );

  return (
    <main className={STYLES.pageWrapper} role="main">
      {notificationProvider}
      {verificationModule}
    </main>
  );
};

export default VerifyOTP;
