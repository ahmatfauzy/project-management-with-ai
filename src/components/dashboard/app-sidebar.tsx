"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { IconInnerShadowTop } from "@tabler/icons-react";

import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { dashboardConfig } from "@/config/dashboard";

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  role?: "employee" | "pm" | "hr";
}

export function AppSidebar({
  role = "employee",
  user,
  ...props
}: AppSidebarProps & {
  user: {
    name: string;
    email: string;
    avatar: string;
    role?: string;
  };
}) {
  const pathname = usePathname();

  // Auto-detect role based on URL for development seamlessness
  let currentRole = role;
  if (pathname?.startsWith("/dashboard/pm")) {
    currentRole = "pm";
  } else if (pathname?.startsWith("/dashboard/hr")) {
    currentRole = "hr";
  }

  // Select navigation items based on role
  const navItems = dashboardConfig[currentRole] || dashboardConfig.employee;

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <a href="#">
                <IconInnerShadowTop className="!size-5" />
                <span className="text-base font-semibold">
                  Quavity Dashboard
                </span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navItems} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  );
}
