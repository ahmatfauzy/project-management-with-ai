"use client";

import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PendingApprovals } from "@/components/dashboard/hr/pending-approvals";
import { UserTypes } from "@/lib/types/type";
import { UsersTable } from "@/components/dashboard/hr/users-management/users-table";
import {
  EditRoleDialog,
  RevokeAccessDialog,
} from "@/components/dashboard/hr/users-management/user-action-dialogs";
import { toast } from "sonner";

export default function UserManagementPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredUsers, setFilteredUsers] = useState<UserTypes[]>([]);
  const [activeUsers, setActiveUsers] = useState<UserTypes[]>([]);

  // States for Modals
  const [isEditRoleOpen, setIsEditRoleOpen] = useState(false);
  const [isRevokeOpen, setIsRevokeOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserTypes | null>(null);

  useEffect(() => {
    fetchActiveUsers();
  }, []);

  useEffect(() => {
    const results = activeUsers.filter(
      (user) =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()),
    );
    setFilteredUsers(results);
  }, [searchTerm, activeUsers]);

  const fetchActiveUsers = async () => {
    const response = await fetch("/api/users");
    const data = await response.json();
    setActiveUsers(data.filter((u: UserTypes) => u.status !== "rejected"));
  };

  const handleEditRoleClick = (user: UserTypes) => {
    setSelectedUser(user);
    setIsEditRoleOpen(true);
  };

  const handleRevokeAccessClick = (user: UserTypes) => {
    setSelectedUser(user);
    setIsRevokeOpen(true);
  };

  const handleSaveRole = async (
    userId: string,
    newRole: string,
    newDepartment: string,
  ) => {
    // Optimistic update
    const updatedUsers = activeUsers.map((u) =>
      u.id === userId
        ? {
            ...u,
            role: newRole as "employee" | "hr" | "pm",
            department: newDepartment,
          }
        : u,
    );
    setActiveUsers(updatedUsers);
    setIsEditRoleOpen(false);

    try {
      await fetch(`/api/users/${userId}`, {
        method: "PATCH",
        body: JSON.stringify({ role: newRole, department: newDepartment }),
      });
      toast.success("User role & department updated");
    } catch (error) {
      console.error("Failed to update role", error);
      toast.error("Failed to update user role");
      fetchActiveUsers(); // Revert on error
    }
  };

  const handleConfirmRevoke = async (userId: string) => {
    // Optimistic remove
    const updatedUsers = activeUsers.filter((u) => u.id !== userId);
    setActiveUsers(updatedUsers);
    setIsRevokeOpen(false);

    try {
      await fetch(`/api/users/${userId}`, {
        method: "PATCH",
        body: JSON.stringify({ status: "rejected" }),
      });
      toast.success("User access revoked successfully");
    } catch (error) {
      console.error("Failed to revoke access", error);
      toast.error("Failed to revoke user access");
      fetchActiveUsers();
    }
  };

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 pt-0">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">
            User Management
          </h2>
          <p className="text-muted-foreground">
            Manage system access, roles, and new account approvals.
          </p>
        </div>
      </div>

      <Tabs defaultValue="all-users" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all-users">All Employees</TabsTrigger>
          <TabsTrigger value="pending">Pending Approvals</TabsTrigger>
        </TabsList>

        <TabsContent value="all-users" className="space-y-4">
          <UsersTable
            users={filteredUsers}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            onEditRole={handleEditRoleClick}
            onRevokeAccess={handleRevokeAccessClick}
          />
        </TabsContent>

        <TabsContent value="pending" className="space-y-4">
          <PendingApprovals />
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <EditRoleDialog
        isOpen={isEditRoleOpen}
        onOpenChange={setIsEditRoleOpen}
        user={selectedUser}
        onSave={handleSaveRole}
      />

      <RevokeAccessDialog
        isOpen={isRevokeOpen}
        onOpenChange={setIsRevokeOpen}
        user={selectedUser}
        onConfirm={handleConfirmRevoke}
      />
    </div>
  );
}
