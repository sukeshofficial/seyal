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

import { Switch } from "@/components/ui/switch";

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

import { ChevronDown, User2, Home, SunIcon, MoonIcon } from "lucide-react";

import { useEffect, useState } from "react";

export function AppSidebar() {
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";
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
            {isCollapsed ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <SidebarMenuButton className="flex items-center gap-2">
                    <User2 />
                    <span>Sukesh</span>
                    <Switch
                      checked={isDark}
                      onCheckedChange={setIsDark}
                      className="ml-auto"
                    />
                  </SidebarMenuButton>
                </TooltipTrigger>
                <TooltipContent side="right">User</TooltipContent>
              </Tooltip>
            ) : (
              <SidebarMenuButton className="flex items-center gap-2">
                <User2 />
                <span>Sukesh</span>

                <div className="ml-auto flex items-center gap-2">
                  {/* {showLabel && (
                    <span className="text-sm transition-opacity duration-300">
                      {isDark ? "Dark" : "Light"}
                    </span>
                  )} */}

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center gap-2">
                        <SunIcon className="size-4" />

                        <Switch
                          checked={isDark}
                          onCheckedChange={handleToggle}
                        />

                        <MoonIcon className="size-4 text-muted-foreground" />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="top">
                      {isDark ? "Switch to Light mode" : "Switch to Dark mode"}
                    </TooltipContent>
                  </Tooltip>
                </div>
              </SidebarMenuButton>
            )}
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
