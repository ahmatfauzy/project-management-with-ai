"use client";

import { Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserTypes } from "@/lib/types/type";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate } from "@/lib/utils";

export function PendingApprovals() {
  const [activeUsers, setActiveUsers] = useState<UserTypes[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchPendingUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/users");
      const data = await response.json();

      const filterPending = data.filter(
        (user: UserTypes) => user.status === "pending",
      );
      setActiveUsers(filterPending);
    } catch (error) {
      console.error("Failed to fetch users", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Initial fetch
    fetchPendingUsers();

    // Set interval for auto-refresh every 5 seconds
    const intervalId = setInterval(() => {
      fetchPendingUsers();
    }, 5000);

    // Cleanup interval on component unmount
    return () => clearInterval(intervalId);
  }, []);

  const handleApproveUsers = async (id: string) => {
    try {
      const response = await fetch(`/api/users/${id}`, {
        method: "PATCH",
        body: JSON.stringify({
          status: "active",
        }),
      });

      if (response.ok) {
        setActiveUsers((prev) => prev.filter((user) => user.id !== id));
      }
    } catch (error) {
      console.error("Failed to approve user", error);
    }
  };

  const handleRejectUsers = async (id: string) => {
    try {
      const response = await fetch(`/api/users/${id}`, {
        method: "PATCH",
        body: JSON.stringify({
          status: "rejected",
        }),
      });

      if (response.ok) {
        setActiveUsers((prev) => prev.filter((user) => user.id !== id));
      }
    } catch (error) {
      console.error("Failed to reject user", error);
    }
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Pending Approvals</CardTitle>
        <CardDescription>
          New account requests waiting for review
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        {loading && activeUsers.length === 0 ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center justify-between space-x-4 rounded-md border p-4"
            >
              <div className="flex items-center space-x-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-[150px]" />
                  <Skeleton className="h-3 w-[100px]" />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Skeleton className="h-8 w-8 rounded-md" />
                <Skeleton className="h-8 w-8 rounded-md" />
              </div>
            </div>
          ))
        ) : activeUsers.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground text-sm">
            No pending approvals at the moment.
          </div>
        ) : (
          activeUsers.map((user) => (
            <div
              key={user.id}
              className="flex items-center justify-between space-x-4 rounded-md border p-4"
            >
              <div className="flex items-center space-x-4">
                <Avatar>
                  <AvatarImage src={user?.image} />
                  <AvatarFallback>
                    {user.name
                      ?.split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {user.name}
                  </p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                  <p className="text-xs text-muted-foreground capitalize">
                    {user.role} | {formatDate(user.createdAt)}
                  </p>
                  <Badge className="text-xs capitalize bg-yellow-600">
                    {user.status}
                  </Badge>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  size="icon"
                  onClick={() => handleApproveUsers(user.id)}
                  variant="outline"
                  className="h-8 w-8 text-green-500 hover:text-green-600 hover:bg-green-50"
                >
                  <Check className="h-4 w-4" />
                  <span className="sr-only">Approve</span>
                </Button>
                <Button
                  size="icon"
                  onClick={() => handleRejectUsers(user.id)}
                  variant="outline"
                  className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                >
                  <X className="h-4 w-4" />
                  <span className="sr-only">Reject</span>
                </Button>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
