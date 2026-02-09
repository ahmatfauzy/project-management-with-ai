"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Calendar as CalendarIcon,
  ArrowLeft,
  Plus,
  Trash2,
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { toast } from "sonner";
import { Calendar } from "@/components/ui/calendar";
import { format, subYears, addYears } from "date-fns";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

type TaskItem = {
  id: string | number;
  title: string;
  description: string;
  priority: "low" | "medium" | "high" | "critical";
  estimatedHours: number;
  assigneeId?: string;
};

export default function EditProjectPage() {
  const router = useRouter();
  const params = useParams();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();

  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch("/api/users");
        if (res.ok) {
          const data = await res.json();
          setUsers(data.filter((u: any) => u.role === "employee"));
        }
      } catch (e) {
        console.error(e);
      }
    };
    fetchUsers();
  }, []);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const res = await fetch(`/api/projects/${params.id}`);
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();

        setName(data.title || "");
        setDescription(data.description || "");
        if (data.startDate) setStartDate(new Date(data.startDate));
        if (data.dueDate) setEndDate(new Date(data.dueDate));

        if (data.team && Array.isArray(data.team)) {
          setSelectedMembers(data.team.map((m: any) => m.id));
        }

        if (data.tasks && Array.isArray(data.tasks)) {
          setTasks(
            data.tasks.map((t: any) => ({
              id: t.id,
              title: t.title,
              description: t.description || "",
              priority: t.priority || "medium",
              estimatedHours: t.estimatedHours || 0,
              assigneeId: t.assigneeId,
            })),
          );
        }
      } catch (err) {
        console.error(err);
        toast.error("Could not load project details");
      } finally {
        setLoading(false);
      }
    };

    if (params.id) fetchProject();
  }, [params.id]);

  const addTask = () => {
    setTasks([
      ...tasks,
      {
        id: Date.now(),
        title: "",
        description: "",
        priority: "medium",
        estimatedHours: 0,
      },
    ]);
  };

  const removeTask = (id: string | number) => {
    setTasks(tasks.filter((t) => t.id !== id));
  };

  const updateTask = (
    id: string | number,
    field: keyof TaskItem,
    value: string | number,
  ) => {
    setTasks(tasks.map((t) => (t.id === id ? { ...t, [field]: value } : t)));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) {
      toast.error("Project name is required");
      return;
    }

    try {
      setSaving(true);
      const res = await fetch(`/api/projects/${params.id}`, {
        method: "PATCH",
        body: JSON.stringify({
          name,
          description,
          startDate,
          endDate,
          tasks,
          memberIds: selectedMembers,
        }),
      });

      if (!res.ok) throw new Error("Failed to update project");

      toast.success("Project updated successfully!");
      router.push(`/dashboard/pm/projects/${params.id}/details`);
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center">Loading...</div>;
  }

  return (
    <div className="flex flex-1 flex-col gap-6 p-6 max-w-4xl mx-auto w-full">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href={`/dashboard/pm/projects`}>
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-foreground">
              Edit Project
            </h2>
            <p className="text-muted-foreground">Update project details.</p>
          </div>
        </div>
      </div>

      <div className="grid gap-6">
        <form onSubmit={handleSubmit} className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Project Details</CardTitle>
              <CardDescription>
                Basic information about the project.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6">
              <div className="grid gap-2">
                <Label htmlFor="name">
                  Project Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  placeholder="e.g. AI Integration Phase 1"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe the goals and scope..."
                  className="min-h-[100px]"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="startDate">Start Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !startDate && "text-muted-foreground",
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {startDate ? (
                          format(startDate, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={startDate}
                        onSelect={setStartDate}
                        fromDate={subYears(new Date(), 5)}
                        toDate={addYears(new Date(), 5)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="endDate">End Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !endDate && "text-muted-foreground",
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {endDate ? (
                          format(endDate, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={endDate}
                        onSelect={setEndDate}
                        fromDate={startDate || subYears(new Date(), 5)}
                        toDate={addYears(new Date(), 5)}
                        initialFocus
                        disabled={(date) => !!startDate && date < startDate}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Team Members</CardTitle>
              <CardDescription>
                Manage who has access to this project.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {users.map((user) => (
                  <div
                    key={user.id}
                    className={cn(
                      "flex items-center space-x-3 border p-4 rounded-lg cursor-pointer transition-colors",
                      selectedMembers.includes(user.id)
                        ? "border-primary bg-primary/5 ring-1 ring-primary"
                        : "hover:bg-muted/50",
                    )}
                    onClick={() => {
                      if (selectedMembers.includes(user.id)) {
                        setSelectedMembers(
                          selectedMembers.filter((id) => id !== user.id),
                        );
                      } else {
                        setSelectedMembers([...selectedMembers, user.id]);
                      }
                    }}
                  >
                    <div
                      className={cn(
                        "h-4 w-4 rounded-full border border-primary flex items-center justify-center",
                        selectedMembers.includes(user.id)
                          ? "bg-primary"
                          : "bg-background",
                      )}
                    >
                      {selectedMembers.includes(user.id) && (
                        <div className="h-2 w-2 bg-primary-foreground rounded-full" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium leading-none">
                        {user.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Tasks</CardTitle>
                <CardDescription>
                  Manage tasks for this project.
                </CardDescription>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addTask}
                className="gap-2"
              >
                <Plus className="h-4 w-4" /> Add Task
              </Button>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-4">
                {tasks.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
                    No tasks found. Click {`"Add Task"`} to create one.
                  </div>
                )}
                {tasks.map((task, index) => (
                  <div
                    key={task.id}
                    className="grid grid-cols-12 gap-4 p-4 border rounded-lg bg-card/50 relative group"
                  >
                    <div className="col-span-12 md:col-span-5 grid gap-2">
                      <Label>Task Title</Label>
                      <Input
                        placeholder="e.g. Setup Repo"
                        value={task.title}
                        onChange={(e) =>
                          updateTask(task.id, "title", e.target.value)
                        }
                        required
                      />
                    </div>
                    <div className="col-span-12 md:col-span-7 grid gap-2">
                      <Label>Description</Label>
                      <Input
                        placeholder="Brief details..."
                        value={task.description}
                        onChange={(e) =>
                          updateTask(task.id, "description", e.target.value)
                        }
                      />
                    </div>
                    <div className="col-span-6 md:col-span-4 grid gap-2">
                      <Label>Assignee</Label>
                      <Select
                        value={task.assigneeId || "unassigned"}
                        onValueChange={(val) =>
                          updateTask(
                            task.id,
                            "assigneeId",
                            val === "unassigned" ? "" : val,
                          )
                        }
                      >
                        <SelectTrigger className="h-10">
                          <SelectValue placeholder="Unassigned">
                            {task.assigneeId &&
                            users.find((u) => u.id === task.assigneeId) ? (
                              <div className="flex items-center gap-2">
                                <Avatar className="h-5 w-5">
                                  <AvatarImage
                                    src={
                                      users.find(
                                        (u) => u.id === task.assigneeId,
                                      )?.image
                                    }
                                  />
                                  <AvatarFallback>
                                    {users
                                      .find((u) => u.id === task.assigneeId)
                                      ?.name?.charAt(0)}
                                  </AvatarFallback>
                                </Avatar>
                                <span>
                                  {
                                    users.find((u) => u.id === task.assigneeId)
                                      ?.name
                                  }
                                </span>
                              </div>
                            ) : (
                              "Unassigned"
                            )}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="unassigned">
                            <span className="text-muted-foreground">
                              Unassigned
                            </span>
                          </SelectItem>
                          {users.map((u) => (
                            <SelectItem key={u.id} value={u.id}>
                              <div className="flex items-center gap-2">
                                <Avatar className="h-5 w-5">
                                  <AvatarImage src={u.image} alt={u.name} />
                                  <AvatarFallback>
                                    {u.name.charAt(0)}
                                  </AvatarFallback>
                                </Avatar>
                                <span>{u.name}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="col-span-6 md:col-span-4 grid gap-2">
                      <Label>Priority</Label>
                      <Select
                        value={task.priority}
                        onValueChange={(val) =>
                          updateTask(task.id, "priority", val)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="critical">Critical</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="col-span-5 md:col-span-3 grid gap-2">
                      <Label>Est. Hours</Label>
                      <Input
                        type="number"
                        min="0"
                        value={task.estimatedHours}
                        onChange={(e) =>
                          updateTask(
                            task.id,
                            "estimatedHours",
                            parseInt(e.target.value) || 0,
                          )
                        }
                      />
                    </div>
                    <div className="col-span-1 flex items-end justify-end pb-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="text-muted-foreground hover:text-destructive"
                        onClick={() => removeTask(task.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter className="flex justify-between border-t px-6 py-4 bg-muted/40">
              <Button
                type="button"
                variant="ghost"
                onClick={() => router.back()}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </CardFooter>
          </Card>
        </form>
      </div>
    </div>
  );
}
