import React, { Component } from "react";
import { cn } from "@/lib/utils";
import { AlertOctagon, RotateCcw } from "lucide-react";

/* -------------------------------------------------------------------------- */
/*                                   Config                                   */
/* -------------------------------------------------------------------------- */

const ERROR_CONFIG = {
  DEFAULT_TITLE: "Something went wrong",
  DEFAULT_MESSAGE: "An unexpected error occurred. Our team has been notified.",
  RETRY_LABEL: "Refresh Page",
};

/* -------------------------------------------------------------------------- */
/*                                   Styles                                   */
/* -------------------------------------------------------------------------- */

const STYLES = {
  container: cn(
    "flex min-h-[400px] w-full items-center justify-center p-6",
    "bg-slate-50 dark:bg-zinc-950 rounded-lg border-2 border-dashed border-slate-200 dark:border-zinc-800"
  ),
  content: cn("flex max-w-md flex-col items-center text-center"),
  iconWrapper: cn(
    "mb-4 flex h-12 w-12 items-center justify-center rounded-full",
    "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-500"
  ),
  title: cn("text-xl font-semibold text-slate-900 dark:text-zinc-50"),
  message: cn("mt-2 text-sm text-slate-500 dark:text-zinc-400"),
  button: cn(
    "mt-6 flex items-center gap-2 rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors",
    "hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2",
    "dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
  ),
};

/* -------------------------------------------------------------------------- */
/*                                 Component                                  */
/* -------------------------------------------------------------------------- */

/**
 * ErrorBoundary
 * Catches JavaScript errors anywhere in the child component tree,
 * logs those errors, and displays a fallback UI instead of crashing the app.
 */
export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  /* ---------------------------------------------------------------------- */
  /*                             State Management                           */
  /* ---------------------------------------------------------------------- */

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  /* ---------------------------------------------------------------------- */
  /*                              Side Effects                              */
  /* ---------------------------------------------------------------------- */

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  /* ---------------------------------------------------------------------- */
  /*                                Actions                                 */
  /* ---------------------------------------------------------------------- */

  /**
   * Clears error state and attempts to reload the page.
   */
  handleReset = () => {
    window.location.reload();
  };

  /* ---------------------------------------------------------------------- */
  /*                             Computed UI                                */
  /* ---------------------------------------------------------------------- */

  /**
   * Memoized-like getter for the error view fragment.
   * Keeps the render() method clean and structural.
   */
  get errorView() {
    const { error } = this.state;

    return (
      <div className={STYLES.container} role="alert" aria-live="assertive">
        <div className={STYLES.content}>
          <div className={STYLES.iconWrapper}>
            <AlertOctagon size={24} aria-hidden="true" />
          </div>

          <h2 className={STYLES.title}>{ERROR_CONFIG.DEFAULT_TITLE}</h2>

          <p className={STYLES.message}>
            {error?.message || ERROR_CONFIG.DEFAULT_MESSAGE}
          </p>

          <button
            type="button"
            onClick={this.handleReset}
            className={STYLES.button}
            aria-label="Refresh the application"
          >
            <RotateCcw size={16} aria-hidden="true" />
            {ERROR_CONFIG.RETRY_LABEL}
          </button>
        </div>
      </div>
    );
  }

  render() {
    if (this.state.hasError) {
      return this.errorView;
    }

    return this.props.children;
  }
}