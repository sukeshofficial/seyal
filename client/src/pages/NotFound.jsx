import React, { useCallback, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, LifeBuoy, Home } from "lucide-react";
import { cn } from "@/lib/utils";

/* -------------------------------------------------------------------------- */
/*                                   Config                                   */
/* -------------------------------------------------------------------------- */

const NOT_FOUND_CONFIG = {
  ILLUSTRATION_URL: "https://flowbite.s3.amazonaws.com/blocks/marketing-ui/404/404-computer.svg",
  GRID_PATTERN: "url('data:image/svg+xml,%3Csvg width=\"40\" height=\"40\" viewBox=\"0 0 40 40\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cpath d=\"M0 0h40v40H0V0zm1 1h38v38H1V1z\" fill=\"currentColor\" fill-rule=\"evenodd\"/%3E%3C/svg%3E')",
  ANIMATION: {
    FLOAT: {
      y: [0, -10, 0],
      transition: { duration: 4, repeat: Infinity, ease: "easeInOut" },
    },
    FADE_UP: (delay = 0) => ({
      initial: { opacity: 0, y: 10 },
      animate: { opacity: 1, y: 0 },
      transition: { delay, duration: 0.5 },
    }),
  },
};

/* -------------------------------------------------------------------------- */
/*                                   Styles                                   */
/* -------------------------------------------------------------------------- */

const STYLES = {
  section: cn("relative flex h-screen w-full items-center justify-center overflow-hidden bg-background px-6"),
  gridBg: cn("absolute inset-0 z-0 opacity-[0.03] [mask-image:radial-gradient(ellipse_at_center,white,transparent)]"),
  glowViolet: cn("absolute -top-[10%] -left-[10%] h-[40%] w-[40%] rounded-full bg-violet-500/10 blur-[120px]"),
  glowAmber: cn("absolute -bottom-[10%] -right-[10%] h-[40%] w-[40%] rounded-full bg-amber-500/10 blur-[120px]"),
  contentWrapper: cn("relative z-10 flex h-full max-h-[90vh] w-full max-w-2xl flex-col items-center justify-center text-center"),
  imageContainer: cn("relative mb-4 sm:mb-8"),
  image: cn("mx-auto w-auto h-auto max-h-[20vh] sm:max-h-[25vh] md:max-h-[30vh] drop-shadow-2xl object-contain"),
  shadow: cn("mx-auto mt-2 h-2 w-24 rounded-[100%] bg-foreground/5 blur-md"),
  title: cn("mb-2 text-6xl font-black tracking-tighter sm:text-8xl md:text-9xl"),
  gradientText: cn("bg-gradient-to-b from-foreground via-foreground/80 to-foreground/50 bg-clip-text text-transparent"),
  heading: cn("text-xl font-bold tracking-tight text-foreground sm:text-2xl md:text-3xl"),
  description: cn("mx-auto max-w-sm px-4 text-sm font-medium text-muted-foreground sm:text-base md:text-lg"),
  buttonGroup: cn("mt-6 flex flex-col items-center gap-3 sm:mt-8 sm:flex-row"),
  primaryBtn: cn(
    "inline-flex h-11 items-center gap-2 rounded-xl bg-primary px-6 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-all",
    "hover:bg-primary/90 hover:-translate-y-0.5 active:scale-95"
  ),
  secondaryBtn: cn(
    "inline-flex h-11 items-center gap-2 rounded-xl border border-input bg-background px-6 text-sm font-semibold transition-all",
    "hover:bg-accent hover:text-accent-foreground active:scale-95"
  ),
  footer: cn("mt-8 flex items-center gap-6 border-t border-border/50 pt-6 text-xs font-medium text-muted-foreground sm:mt-10 sm:text-sm"),
  footerLink: cn("flex items-center gap-1.5 hover:text-foreground transition-colors"),
  dotSeparator: cn("h-1 w-1 rounded-full bg-border"),
};

/* -------------------------------------------------------------------------- */
/*                                 Component                                  */
/* -------------------------------------------------------------------------- */

export default function NotFound() {

  const navigate = useNavigate();

  const backgroundElements = useMemo(() => (
    <div aria-hidden="true">
      <div className={STYLES.gridBg} style={{ backgroundImage: NOT_FOUND_CONFIG.GRID_PATTERN }} />
      <div className={STYLES.glowViolet} />
      <div className={STYLES.glowAmber} />
    </div>
  ), []);

  const illustration = useMemo(() => (
    <motion.div {...NOT_FOUND_CONFIG.ANIMATION.FADE_UP(0)} className={STYLES.imageContainer}>
      <motion.div animate={NOT_FOUND_CONFIG.ANIMATION.FLOAT.y} transition={NOT_FOUND_CONFIG.ANIMATION.FLOAT.transition}>
        <img
          className={STYLES.image}
          src={NOT_FOUND_CONFIG.ILLUSTRATION_URL}
          alt="Illustration showing a computer with a 404 error"
        />
      </motion.div>
      <div className={STYLES.shadow} />
    </motion.div>
  ), []);

  const textContent = useMemo(() => (
    <motion.div {...NOT_FOUND_CONFIG.ANIMATION.FADE_UP(0.2)} className="flex flex-col items-center">
      <h1 className={STYLES.title}>
        <span className={STYLES.gradientText}>404</span>
      </h1>
      <div className="space-y-1">
        <h2 className={STYLES.heading}>Whoops! That page is missing.</h2>
        <p className={STYLES.description}>
          We searched everywhere but couldn't find what you're looking for.
        </p>
      </div>
    </motion.div>
  ), []);

  const footerActions = useMemo(() => (
    <motion.div {...NOT_FOUND_CONFIG.ANIMATION.FADE_UP(0.6)} className={STYLES.footer}>
      <Link to="/help" className={STYLES.footerLink}>
        <LifeBuoy className="h-4 w-4" />
        Help Center
      </Link>
      <span className={STYLES.dotSeparator} />
      <Link to="/report" className={STYLES.footerLink}>
        Report an Issue
      </Link>
    </motion.div>
  ), []);

  const handleGoBack = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  return (
    <main className={STYLES.section}>
      {backgroundElements}

      <div className={STYLES.contentWrapper}>
        {illustration}
        {textContent}

        <motion.div {...NOT_FOUND_CONFIG.ANIMATION.FADE_UP(0.4)} className={STYLES.buttonGroup}>
          <Link to="/" className={STYLES.primaryBtn}>
            <Home className="h-4 w-4" />
            Back to Dashboard
          </Link>

          <button
            type="button"
            onClick={handleGoBack}
            className={STYLES.secondaryBtn}
            aria-label="Go back to the previous page"
          >
            <ArrowLeft className="h-4 w-4" />
            Go Back
          </button>
        </motion.div>

        {footerActions}
      </div>
    </main>
  );
}
