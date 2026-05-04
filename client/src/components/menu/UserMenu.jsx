import {
  User2,
  Sparkles,
  CreditCard,
  Settings,
  Bell,
  LogOut,
  Sun,
  Moon,
} from "lucide-react";

import {
  Menubar,
  MenubarMenu,
  MenubarTrigger,
  MenubarContent,
  MenubarItem,
  MenubarSeparator,
} from "@/components/ui/menubar";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

import { Switch } from "@/components/ui/switch";

export function UserMenu({ isCollapsed, isDark, handleToggle }) {
  return (
    <div className="flex items-center justify-between w-full">
      <Menubar className="border-none bg-transparent">
        <MenubarMenu>
          {/* <MenubarTrigger asChild className="rounded-full"> */}
          {isCollapsed ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <MenubarTrigger asChild className="rounded-full">
                  <button className="flex items-center justify-center rounded-full hover:bg-muted">
                    <Avatar className="size-5 my-1 mr-[0.2px]">
                      <AvatarImage src="https://i.pravatar.cc/104" />
                      <AvatarFallback>SK</AvatarFallback>
                    </Avatar>
                  </button>
                </MenubarTrigger>
              </TooltipTrigger>

              <TooltipContent side="right">Sukesh</TooltipContent>
            </Tooltip>
          ) : (
            <MenubarTrigger asChild className="rounded-full">
              <button className="flex gap-2 items-center rounded-full px-2 py-1 hover:bg-muted w-full">
                <Avatar className="size-5">
                  <AvatarImage src="https://i.pravatar.cc/104" />
                  <AvatarFallback>SK</AvatarFallback>
                </Avatar>
                <span>Sukesh</span>
              </button>
            </MenubarTrigger>
          )}
          {/* </MenubarTrigger> */}

          <MenubarContent
            side="right"
            align="end"
            sideOffset={8}
            className="w-56 z-50 ml-2"
          >
            <div className="flex items-center gap-3 px-2 py-2">
              <Avatar className="size-8">
                <AvatarImage src="https://i.pravatar.cc/104" />
                <AvatarFallback>SK</AvatarFallback>
              </Avatar>

              <div className="flex flex-col leading-tight">
                <span className="text-sm font-medium">Sukesh</span>
                <span className="text-xs text-muted-foreground truncate max-w-[140px]">
                  sukesh.official.2006@gmail.com
                </span>
              </div>
            </div>

            <MenubarSeparator />

            <MenubarItem className="rounded-full cursor-pointer">
              <Sparkles className="mr-2 size-4" />
              Upgrade to Pro
            </MenubarItem>

            <MenubarItem className="rounded-full cursor-pointer">
              <Settings className="mr-2 size-4" />
              Account
            </MenubarItem>

            <MenubarItem className="rounded-full cursor-pointer">
              <CreditCard className="mr-2 size-4" />
              Billing
            </MenubarItem>

            <MenubarItem className="rounded-full cursor-pointer">
              <Bell className="mr-2 size-4" />
              Notifications
            </MenubarItem>

            <MenubarSeparator />

            {isCollapsed && (
              <>
                <MenubarItem
                  onSelect={(e) => e.preventDefault()}
                  className="flex items-center justify-between rounded-full"
                >
                  <div className="flex items-center gap-2">
                    <Sun className="size-4" />
                    <span>{isDark ? "Dark Mode" : "Light Mode"}</span>
                  </div>

                  <Switch checked={isDark} onCheckedChange={handleToggle} className="cursor-pointer"/>
                </MenubarItem>

                <MenubarSeparator />
              </>
            )}

            <MenubarItem className="rounded-full text-red-500 hover:bg-red-500/10 data-[highlighted]:bg-red-500/10 data-[highlighted]:text-red-600 [&_svg]:text-red-500 cursor-pointer">
              <LogOut className="mr-2 size-4 stroke-red-500" />
              Log out
            </MenubarItem>
          </MenubarContent>
        </MenubarMenu>
      </Menubar>

      {!isCollapsed && (
        <div className="flex items-center gap-2 pr-2">
          <Sun className="size-4" />
          <Switch checked={isDark} onCheckedChange={handleToggle} />
          <Moon className="size-4 text-muted-foreground" />
        </div>
      )}
    </div>
  );
}
