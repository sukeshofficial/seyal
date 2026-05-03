import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";

import { Kbd } from "@/components/ui/kbd";

import { AppSidebar } from "@/components/sidebar/app-sidebar";

export default function Layout({ children }) {
  return (
    <SidebarProvider>
      <div className="flex h-screen">
        <AppSidebar />

        <main className="flex-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <SidebarTrigger />
            </TooltipTrigger>
            <TooltipContent side="right" className="flex items-center gap-2">
              Toggle Sidebar
              <span className="flex items-center gap-1">
                <Kbd>Ctrl</Kbd> + <Kbd>B</Kbd>
              </span>
            </TooltipContent>
          </Tooltip>

          {children}
        </main>
      </div>
    </SidebarProvider>
  );
}
