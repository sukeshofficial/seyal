import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroupLabel,
  useSidebar,
} from "@/components/ui/sidebar";

import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@/components/ui/collapsible";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { UserMenu } from "../menu/UserMenu";

import { ChevronDown, Home } from "lucide-react";

import { createContext, useEffect, useState } from "react";

const SidebarContext = createContext();

export function SidebarProvider({ children }) {
  const [state, setState] = useState("expanded");

  const [isDark, setIsDark] = useState(false);

  const handleToggle = (value) => {
    setIsDark(value);
  };

  return (
    <SidebarContext.Provider
      value={{
        state,
        isDark,
        handleToggle,
      }}
    >
      {children}
    </SidebarContext.Provider>
  );
}

export function AppSidebar() {
  const { open, setOpen } = useSidebar();
  const isCollapsed = !open;
  const [isDark, setIsDark] = useState(() => {
    if (typeof window === "undefined") return false;

    const saved = localStorage.getItem("theme");
    const dark = saved
      ? saved === "dark"
      : window.matchMedia("(prefers-color-scheme: dark)").matches;

    document.documentElement.classList.toggle("dark", dark);
    return dark;
  });
  const [showLabel, setShowLabel] = useState(false);

  const handleToggle = (value) => {
    setIsDark(value);
    setShowLabel(true);
  };

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", isDark);
    localStorage.setItem("theme", isDark ? "dark" : "light");
  }, [isDark]);

  useEffect(() => {
    if (!showLabel) return;

    const timer = setTimeout(() => {
      setShowLabel(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, [showLabel]);

  useEffect(() => {
    const saved = localStorage.getItem("sidebar");

    if (saved !== null) {
      setOpen(saved === "true");
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("sidebar", open);
  }, [open]);

  return (
    <Sidebar>
      <SidebarHeader />
      <SidebarContent>
        <Collapsible defaultOpen className="group/collapsible">
          <SidebarGroup>
            <SidebarGroupLabel asChild>
              <CollapsibleTrigger className="cursor-pointer">
                Navigation
                <ChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
              </CollapsibleTrigger>
            </SidebarGroupLabel>
            <CollapsibleContent>
              {isCollapsed ? (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <SidebarMenuButton asChild>
                      <a href="#">
                        <Home />
                      </a>
                    </SidebarMenuButton>
                  </TooltipTrigger>
                  <TooltipContent side="right">Home</TooltipContent>
                </Tooltip>
              ) : (
                <SidebarMenuButton asChild>
                  <a href="#">
                    <Home />
                    <span>Home</span>
                  </a>
                </SidebarMenuButton>
              )}
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
              handleToggle={handleToggle}
            />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
