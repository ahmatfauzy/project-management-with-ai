"use client";

import * as React from "react";
import { IconInnerShadowTop } from "@tabler/icons-react";
import Link from "next/link";

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

export type UserRole = "employee" | "pm" | "hr";

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  user: {
    name: string;
    email: string;
    avatar: string;
    role?: string;
  };
}

export function AppSidebar({ user, ...props }: AppSidebarProps) {
  // Use the actual user role from session, not from URL
  const userRole = (user.role as UserRole) || "employee";

  // Get navigation items based on user's actual role
  const navItems = dashboardConfig[userRole] || dashboardConfig.employee;

  // Get home link based on role
  const homeLink =
    userRole === "hr"
      ? "/dashboard/hr"
      : userRole === "pm"
        ? "/dashboard/pm"
        : "/dashboard/employee";

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <Link href={homeLink}>
                <IconInnerShadowTop className="!size-5" />
                <span className="text-base font-semibold">
                  Quavity Dashboard
                </span>
              </Link>
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

