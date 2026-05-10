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

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

import { UserMenu } from "./UserMenu";
import { ChevronDown, Home } from "lucide-react";
import { useEffect, useState } from "react";

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
      {isCollapsed ? (
        <Tooltip>
          <TooltipTrigger>
            <SidebarHeader className="mt-2">
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton className="h-14 hover:bg-transparent data-[active=true]:bg-transparent">
                    <div className="-ml-1 flex items-center gap-3">
                      <div className="h-6 w-6 overflow-hidden rounded-full bg-white flex items-center justify-center">
                        <img
                          src="/SEYAL-LOGO.svg"
                          alt="SEYAL Logo"
                          className="h-full w-full object-cover cursor-pointer"
                        />
                      </div>

                      <span className="text-lg font-semibold tracking-tight">
                        SEYAL
                      </span>
                    </div>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarHeader>
          </TooltipTrigger>
          <TooltipContent side="right">SEYAL</TooltipContent>
        </Tooltip>
      ) : (
        <SidebarHeader className="mt-2">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton className="h-14 cursor-pointer hover:bg-transparent data-[active=true]:bg-transparent">
                <div className="-ml-1 flex items-center gap-3">
                  <div className="h-6 w-6 overflow-hidden rounded-full bg-white flex items-center justify-center">
                    <img
                      src="/SEYAL-LOGO.svg"
                      alt="SEYAL Logo"
                      className="h-full w-full object-cover"
                    />
                  </div>

                  <span className="text-lg font-semibold tracking-tight">
                    SEYAL
                  </span>
                </div>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
      )}

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
