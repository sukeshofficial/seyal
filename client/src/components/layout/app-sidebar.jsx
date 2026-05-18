import React, { useEffect, useState, useCallback, useMemo } from "react";

import { cn } from "@/lib/utils";
import { ChevronDown, Home } from "lucide-react";

import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarHeader, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarGroupLabel, useSidebar } from "@/components/ui/sidebar";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { UserMenu } from "./UserMenu";

const STORAGE_KEYS = {
  THEME: "theme",
  SIDEBAR_STATE: "sidebar",
};

const APP_CONFIG = {
  NAME: "SEYAL",
  LOGO_PATH: "/SEYAL-LOGO.svg",
  LABEL_TIMEOUT: 3000,
};

const STYLES = {
  headerWrapper: cn("mt-2"),
  headerButton: cn("h-14 hover:bg-transparent data-[active=true]:bg-transparent"),
  logoContainer: cn("-ml-1 flex items-center gap-3"),
  logoBox: cn("h-6 w-6 overflow-hidden rounded-full bg-white flex items-center justify-center"),
  logoImage: cn("h-full w-full object-cover"),
  brandText: cn("text-lg font-semibold tracking-tight"),
  collapsibleIcon: cn("ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180"),
  trigger: cn("cursor-pointer"),
};

const getInitialTheme = () => {
  if (typeof window === "undefined") return false;
  const saved = localStorage.getItem(STORAGE_KEYS.THEME);
  if (saved) return saved === "dark";
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
};

const updateDocumentTheme = (isDark) => {
  if (typeof document === "undefined") return;
  document.documentElement.classList.toggle("dark", isDark);
};

export function AppSidebar() {

  const { open, setOpen } = useSidebar();
  const [isDark, setIsDark] = useState(getInitialTheme);
  const [showLabel, setShowLabel] = useState(false);

  const isCollapsed = useMemo(() => !open, [open]);

  const brandLogo = useMemo(() => (
    <div className={STYLES.logoContainer}>
      <div className={STYLES.logoBox}>
        <img
          src={APP_CONFIG.LOGO_PATH}
          alt={`${APP_CONFIG.NAME} Logo`}
          className={STYLES.logoImage}
        />
      </div>
      <span className={STYLES.brandText}>{APP_CONFIG.NAME}</span>
    </div>
  ), []);

  const headerContent = useMemo(() => {
    const trigger = (
      <SidebarHeader className={STYLES.headerWrapper}>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton className={STYLES.headerButton}>
              {brandLogo}
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
    );

    if (isCollapsed) {
      return (
        <Tooltip>
          <TooltipTrigger asChild>{trigger}</TooltipTrigger>
          <TooltipContent side="right">{APP_CONFIG.NAME}</TooltipContent>
        </Tooltip>
      );
    }
    return trigger;
  }, [isCollapsed, brandLogo]);

  const navItems = useMemo(() => {
    const linkContent = (
      <a href="#" aria-label="Go to Home">
        <Home />
        {!isCollapsed && <span>Home</span>}
      </a>
    );

    const menuButton = (
      <SidebarMenuButton asChild>
        {linkContent}
      </SidebarMenuButton>
    );

    return isCollapsed ? (
      <Tooltip>
        <TooltipTrigger asChild>{menuButton}</TooltipTrigger>
        <TooltipContent side="right">Home</TooltipContent>
      </Tooltip>
    ) : (
      menuButton
    );
  }, [isCollapsed]);

  useEffect(() => {
    const savedSidebar = localStorage.getItem(STORAGE_KEYS.SIDEBAR_STATE);
    if (savedSidebar !== null) {
      const isOpened = savedSidebar === "true";
      if (open !== isOpened) {
        setOpen(isOpened);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SIDEBAR_STATE, String(open));
  }, [open]);

  useEffect(() => {
    updateDocumentTheme(isDark);
    localStorage.setItem(STORAGE_KEYS.THEME, isDark ? "dark" : "light");
  }, [isDark]);

  useEffect(() => {
    if (!showLabel) return;
    const timer = setTimeout(() => setShowLabel(false), APP_CONFIG.LABEL_TIMEOUT);
    return () => clearTimeout(timer);
  }, [showLabel]);

  const handleThemeToggle = useCallback((value) => {
    setIsDark(value);
    setShowLabel(true);
  }, []);

  return (
    <Sidebar role="navigation" aria-label="Main Sidebar">
      {headerContent}

      <SidebarContent>
        <Collapsible defaultOpen className="group/collapsible">
          <SidebarGroup>
            <SidebarGroupLabel asChild>
              <CollapsibleTrigger className={STYLES.trigger}>
                Navigation
                <ChevronDown className={STYLES.collapsibleIcon} aria-hidden="true" />
              </CollapsibleTrigger>
            </SidebarGroupLabel>
            <CollapsibleContent>
              {navItems}
            </CollapsibleContent>
          </SidebarGroup>
        </Collapsible>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <UserMenu
              isCollapsed={isCollapsed}
              isDark={isDark}
              handleToggle={handleThemeToggle}
            />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
