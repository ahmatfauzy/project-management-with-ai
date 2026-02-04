"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
  Check,
  ChevronsUpDown,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { toast } from "sonner";
import { Calendar } from "@/components/ui/calendar";
import { format, subYears, addYears } from "date-fns";
import Image from "next/image";

type TaskItem = {
  id: number;
  title: string;
  description: string;
  priority: "low" | "medium" | "high" | "critical";
  estimatedHours: number;
  assigneeId?: string;
  dueDate?: Date;
};

interface User {
  id: string;
  name: string;
  image: string;
  role: string;
  department?: string;
}

export default function NewProjectPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // Form States
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);

  // Task States
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch("/api/users");
        if (res.ok) {
          const data = await res.json();
          setUsers(data.filter((u: User) => u.role === "employee"));
        }
      } catch (e) {
        console.error(e);
      }
    };
    fetchUsers();
  }, []);

  const toggleMember = (userId: string) => {
    setSelectedMembers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId],
    );
  };

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

  const removeTask = (id: number) => {
    setTasks(tasks.filter((t) => t.id !== id));
  };

  const updateTask = (
    id: number,
    field: keyof TaskItem,
    value: string | number | Date | undefined,
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
      setLoading(true);

      // 1. Create Project & Tasks
      const res = await fetch("/api/projects", {
        method: "POST",
        body: JSON.stringify({
          name,
          description,
          startDate,
          endDate,
          tasks,
          memberIds: selectedMembers,
        }),
      });

      if (!res.ok) throw new Error("Failed to create project");
      const project = await res.json();

      toast.success("Project created with team and tasks!");
      router.push(`/dashboard/pm/projects/${project.id}/details`);
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-1 flex-col gap-6 p-6 max-w-4xl mx-auto w-full">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/dashboard/pm/projects">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-foreground">
              New Project
            </h2>
            <p className="text-muted-foreground">
              Create a new initiative, assemble team, and define tasks.
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-6">
        <form
          id="create-project-form"
          onSubmit={handleSubmit}
          className="grid gap-6"
        >
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
                        toDate={new Date()}
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
              <CardTitle>Project Team</CardTitle>
              <CardDescription>
                Assign dedicated members to this project.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                <div className="flex flex-col gap-2">
                  <Label>Team Members</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        className="w-full justify-between"
                      >
                        Select members...
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[400px] p-0" align="start">
                      <Command>
                        <CommandInput placeholder="Search employee..." />
                        <CommandList>
                          <CommandEmpty>No employee found.</CommandEmpty>
                          <CommandGroup>
                            {users.map((user) => (
                              <CommandItem
                                key={user.id}
                                value={user.id}
                                className="m-2"
                                onSelect={() => toggleMember(user.id)}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    selectedMembers.includes(user.id)
                                      ? "opacity-100"
                                      : "opacity-0",
                                  )}
                                />
                                <Image
                                  src={user.image}
                                  alt={user.name}
                                  width={20}
                                  height={20}
                                  className="rounded-full"
                                />
                                {user.name}
                                <span className="ml-auto text-xs text-muted-foreground capitalize">
                                  {user.department || "Employee"}
                                </span>
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>

                {selectedMembers.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {selectedMembers.map((memberId) => {
                      const user = users.find((u) => u.id === memberId);
                      return (
                        <Badge
                          key={memberId}
                          variant="secondary"
                          className="px-3 py-1"
                        >
                          {user?.name || "Unknown"}
                          <button
                            type="button"
                            className="ml-2 hover:text-destructive"
                            onClick={() => toggleMember(memberId)}
                          >
                            ×
                          </button>
                        </Badge>
                      );
                    })}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Initial Tasks</CardTitle>
                <CardDescription>
                  Add breakdown tasks for this project (optional).
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
                    No tasks added yet. Click {`"Add Task"`} to start breaking
                    down the project.
                  </div>
                )}
                {tasks.map((task) => (
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

                    {/* Due Date Field */}
                    <div className="col-span-6 md:col-span-4 grid gap-2">
                      <Label>Due Date</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !task.dueDate && "text-muted-foreground",
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {task.dueDate ? (
                              format(task.dueDate, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={task.dueDate}
                            onSelect={(date) =>
                              updateTask(task.id, "dueDate", date)
                            }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>

                    {/* Assignee Field */}
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
                        <SelectTrigger>
                          <SelectValue placeholder="Unassigned" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="unassigned">Unassigned</SelectItem>
                          {users.map((u) => (
                            <SelectItem key={u.id} value={u.id}>
                              {u.name}
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
              <Button type="submit" disabled={loading}>
                {loading ? "Creating..." : "Create Project"}
              </Button>
            </CardFooter>
          </Card>
        </form>
      </div>
    </div>
  );
}
