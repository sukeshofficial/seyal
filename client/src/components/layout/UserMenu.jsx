import {
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
import { PremiumSparkles } from "@/components/ui/premium-sparkles";
import { Spinner } from "@/components/ui/spinner";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";

export function UserMenu({ isCollapsed, isDark, handleToggle }) {
  const [loadingItem, setLoadingItem] = useState(null);
  const { user, logout } = useAuth();

  const handleMenuAction = async (item) => {
    setLoadingItem(item);

    if (item === "logout") {
      try {
        await logout();
      } catch (error) {
        console.error("Logout failed:", error);
      } finally {
        setLoadingItem(null);
      }
      return;
    }

    // Simulate async action for other items
    setTimeout(() => {
      console.log(`${item} completed`);
      setLoadingItem(null);
    }, 2000);
  };

  return (
    <div className="flex items-center justify-between w-full">
      <Menubar className="border-none bg-transparent">
        <MenubarMenu>
          {isCollapsed ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <MenubarTrigger asChild className="rounded-full cursor-pointer">
                  <button className="flex items-center justify-center rounded-full hover:bg-muted">
                    <Avatar className="size-5 my-1 mr-[0.2px]">
                      <AvatarImage src={user?.profilePicture || `https://ui-avatars.com/api/?name=${user?.name?.first || user?.username}&background=random`} />
                      <AvatarFallback>{user?.username?.substring(0, 2).toUpperCase() || "SK"}</AvatarFallback>
                    </Avatar>
                  </button>
                </MenubarTrigger>
              </TooltipTrigger>

              <TooltipContent side="right">{user?.username}</TooltipContent>
            </Tooltip>
          ) : (
            <MenubarTrigger asChild className="rounded-full cursor-pointer p-0 px-1 pr-2">
              <button className="flex gap-2 items-center rounded-full px-0 py-1 hover:bg-muted w-full">
                <Avatar className="size-5">
                  <AvatarImage src={user?.profilePicture || `https://ui-avatars.com/api/?name=${user?.name?.first || user?.username}&background=random`} />
                  <AvatarFallback>{user?.username?.substring(0, 2).toUpperCase() || "SK"}</AvatarFallback>
                </Avatar>

                <span className="truncate max-w-[100px]">{user?.name?.first} {user?.name?.last}</span>
              </button>
            </MenubarTrigger>
          )}

          <MenubarContent
            side="right"
            align="end"
            sideOffset={8}
            className="w-56 z-50 ml-2"
          >
            {/* User Info */}
            <div className="flex items-center gap-3 px-2 py-2">
              <Avatar className="size-8">
                <AvatarImage src={user?.profilePicture || `https://ui-avatars.com/api/?name=${user?.name?.first || user?.username}&background=random`} />
                <AvatarFallback>{user?.username?.substring(0, 2).toUpperCase() || "SK"}</AvatarFallback>
              </Avatar>

              <div className="flex flex-col leading-tight overflow-hidden">
                <span className="text-sm font-medium truncate">
                  {user?.name?.first} {user?.name?.last}
                </span>
                <div className="mt-1">
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 font-mono italic border border-zinc-200 dark:border-zinc-700">
                    @{user?.username}
                  </span>
                </div>

                <div className="group/email relative mt-1 overflow-hidden">
                  <span className="text-xs text-muted-foreground truncate block max-w-[140px] hover:max-w-none transition-all duration-300 ease-in-out cursor-help">
                    {user?.email}
                  </span>
                </div>
              </div>
            </div>

            <MenubarSeparator />

            {/* Upgrade */}
            <MenubarItem
              onSelect={(e) => {
                e.preventDefault();
                handleMenuAction("pro");
              }}
              disabled={loadingItem !== null}
              className="group rounded-full cursor-pointer "
            >
              {loadingItem === "pro" ? (
                <Spinner />
              ) : (
                <PremiumSparkles className="-ml-5 mr-2 size-4" />
              )}

              <span className="bg-gradient-to-r from-violet-600 via-fuchsia-500 to-amber-500 bg-clip-text text-transparent">
                {loadingItem === "pro" ? "Opening Pro..." : "Upgrade to Pro"}
              </span>
            </MenubarItem>

            {/* Account */}
            <MenubarItem
              onSelect={(e) => {
                e.preventDefault();
                handleMenuAction("account");
              }}
              disabled={loadingItem !== null}
              className="rounded-full cursor-pointer"
            >
              {loadingItem === "account" ? (
                <Spinner />
              ) : (
                <Settings className="mr-2 size-4" />
              )}

              {loadingItem === "account" ? "Opening Account..." : "Account"}
            </MenubarItem>

            {/* Billing */}
            <MenubarItem
              onSelect={(e) => {
                e.preventDefault();
                handleMenuAction("billing");
              }}
              disabled={loadingItem !== null}
              className="rounded-full cursor-pointer"
            >
              {loadingItem === "billing" ? (
                <Spinner />
              ) : (
                <CreditCard className="mr-2 size-4" />
              )}

              {loadingItem === "billing" ? "Opening Billing..." : "Billing"}
            </MenubarItem>

            {/* Notifications */}
            <MenubarItem
              onSelect={(e) => {
                e.preventDefault();
                handleMenuAction("notifications");
              }}
              disabled={loadingItem !== null}
              className="rounded-full cursor-pointer"
            >
              {loadingItem === "notifications" ? (
                <Spinner />
              ) : (
                <Bell className="mr-2 size-4" />
              )}

              {loadingItem === "notifications"
                ? "Opening Notifications..."
                : "Notifications"}
            </MenubarItem>

            <MenubarSeparator />

            {/* Theme Toggle */}
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

                  <Switch
                    checked={isDark}
                    onCheckedChange={handleToggle}
                    className="cursor-pointer"
                  />
                </MenubarItem>

                <MenubarSeparator />
              </>
            )}

            {/* Logout */}
            <MenubarItem
              onSelect={(e) => {
                e.preventDefault();
                handleMenuAction("logout");
              }}
              disabled={loadingItem !== null}
              className="rounded-full text-red-500 hover:bg-red-500/10 data-[highlighted]:bg-red-500/10 data-[highlighted]:text-red-600 [&_svg]:text-red-500 cursor-pointer"
            >
              {loadingItem === "logout" ? (
                <Spinner />
              ) : (
                <LogOut className="mr-2 size-4 stroke-red-500" />
              )}

              {loadingItem === "logout" ? "Logging out..." : "Log out"}
            </MenubarItem>
          </MenubarContent>
        </MenubarMenu>
      </Menubar>

      {/* Desktop Theme Toggle */}
      {!isCollapsed && (
        <div className="flex items-center gap-2 pr-2">
          <Sun className="size-4" />
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="inline-flex">
                <Switch
                  checked={isDark}
                  onCheckedChange={handleToggle}
                  className="cursor-pointer"
                />
              </span>
            </TooltipTrigger>

            <TooltipContent side="top">
              {isDark ? "Light Mode" : "Dark Mode"}
            </TooltipContent>
          </Tooltip>

          <Moon className="size-4 text-muted-foreground" />
        </div>
      )}
    </div>
  );
}
