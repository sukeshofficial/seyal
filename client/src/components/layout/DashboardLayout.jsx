import React, { useMemo } from "react";

import { cn } from "@/lib/utils";

import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Kbd } from "@/components/ui/kbd";
import { AppSidebar } from "@/components/layout/app-sidebar";

const LAYOUT_CONFIG = {
  SHORTCUT_LABEL: "Toggle Sidebar",
  SHORTCUT_KEYS: ["Ctrl", "B"],
};

const STYLES = {
  layoutWrapper: cn("flex h-screen overflow-hidden"),
  mainContainer: cn("flex-1 flex flex-col overflow-y-auto bg-background"),
  triggerButton: cn("ml-2 mt-4 cursor-e-resize"),
  tooltipContent: cn("flex items-center gap-2"),
  shortcutWrapper: cn("flex items-center gap-1"),
};

/* -------------------------------------------------------------------------- */
/*                                 Component                                  */
/* -------------------------------------------------------------------------- */

export default function Layout({ children }) {
  /* ---------------------------------------------------------------------- */
  /*                             Computed UI                                */
  /* ---------------------------------------------------------------------- */

  /**
   * Memoized Sidebar Toggle Button
   * Combines the trigger with keyboard shortcut hints for accessibility.
   */
  const sidebarToggle = useMemo(() => (
    <Tooltip>
      <TooltipTrigger asChild>
        <SidebarTrigger className={STYLES.triggerButton} />
      </TooltipTrigger>

      <TooltipContent side="right" className={STYLES.tooltipContent}>
        <span>{LAYOUT_CONFIG.SHORTCUT_LABEL}</span>

        <div className={STYLES.shortcutWrapper} aria-hidden="true">
          <Kbd>{LAYOUT_CONFIG.SHORTCUT_KEYS[0]}</Kbd>
          <span>+</span>
          <Kbd>{LAYOUT_CONFIG.SHORTCUT_KEYS[1]}</Kbd>
        </div>
      </TooltipContent>
    </Tooltip>
  ), []);

  return (
    <SidebarProvider>
      <div className={STYLES.layoutWrapper}>
        <AppSidebar />

        <main className={STYLES.mainContainer} role="main">
          {sidebarToggle}
          {children}
        </main>
      </div>
    </SidebarProvider>
  );
}
