"use client";

import { useState, useMemo, useEffect } from "react";
import { CalendarClock } from "lucide-react";
import {
  KanbanBoard,
  KanbanBoardCard,
  KanbanBoardCardDescription,
  KanbanBoardCardTitle,
  KanbanBoardColumn,
  KanbanBoardColumnHeader,
  KanbanBoardColumnTitle,
  KanbanBoardColumnList,
  KanbanBoardColumnListItem,
  KanbanBoardProvider,
  KanbanColorCircle,
  KanbanBoardCircleColor,
  useDndMonitor,
} from "@/components/kanban";
import { Badge } from "@/components/ui/badge";
import Modal from "@/components/ui/modal";
import { FileUpload } from "@/components/file-upload";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { format } from "date-fns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { Task as DbTask } from "@/types/common";

// Tipe data Internal Kanban (Visual)
type Task = {
  id: string; // Changed to string for UUID
  header: string;
  type: string;
  status: string;
  target: string;
  limit: string;
  reviewer: string;
  endDate: string;
  dueDate: string;
  description?: string;
  projectId?: string;
  qualityScore?: number;
  qualityAnalysis?: string;
};

const COLUMNS = [
  { id: "Todo", title: "Todo", color: "gray" as KanbanBoardCircleColor },
  {
    id: "In Progress",
    title: "In Progress",
    color: "blue" as KanbanBoardCircleColor,
  },
  {
    id: "Review",
    title: "In Review",
    color: "yellow" as KanbanBoardCircleColor,
  },
  { id: "Done", title: "Done", color: "green" as KanbanBoardCircleColor },
];

function mapDbStatusToKanban(status: string) {
  if (status === "in_progress") return "In Progress";
  if (status === "review") return "Review";
  if (status === "done") return "Done";
  return "Todo";
}

function mapKanbanStatusToDb(status: string) {
  if (status === "In Progress") return "in_progress";
  if (status === "Review") return "review";
  if (status === "Done") return "done";
  return "todo";
}

function KanbanContent({
  tasks,
  setTasks,
  onTaskClick,
}: {
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  onTaskClick: (task: Task) => void;
}) {
  useDndMonitor({
    onDragEnd: async (activeId, overId) => {
      if (!overId) return;

      const activeTask = tasks.find((t) => t.id === activeId);
      if (!activeTask) return;

      let newStatus = overId as string;

      // Logic to determine new status if dropped over another card
      const overTask = tasks.find((t) => t.id === overId);
      if (overTask) {
        newStatus = overTask.status;
      }

      // Logic if dropped over column directly (handled by DndContext usually, but here overId is likely columnId or cardId)
      const column = COLUMNS.find((c) => c.id === overId);
      if (column) {
        newStatus = column.id;
      } else {
        // If overId is a card, find its column
        const card = tasks.find((t) => t.id === overId);
        if (card) newStatus = card.status;
      }

      if (activeTask.status !== newStatus) {
        const previousStatus = activeTask.status;

        // Optimistic Update
        setTasks((prev) =>
          prev.map((t) =>
            t.id === activeTask.id ? { ...t, status: newStatus } : t,
          ),
        );

        try {
          const dbStatus = mapKanbanStatusToDb(newStatus);
          await fetch(`/api/tasks/${activeTask.id}`, {
            method: "PATCH",
            body: JSON.stringify({ status: dbStatus }),
          });
          toast.success(`Task moved to ${newStatus}`);
        } catch (error) {
          console.error(error);
          toast.error("Failed to update task status");
          // Revert
          setTasks((prev) =>
            prev.map((t) =>
              t.id === activeTask.id ? { ...t, status: previousStatus } : t,
            ),
          );
        }
      }
    },
  });

  console.log(tasks);

  const columnsData = useMemo(() => {
    return COLUMNS.map((col) => ({
      ...col,
      tasks: tasks.filter((t) => t.status === col.id),
    }));
  }, [tasks]);

  return (
    <KanbanBoard className="h-full">
      {columnsData.map((col) => (
        <KanbanBoardColumn key={col.id} columnId={col.id}>
          <KanbanBoardColumnHeader>
            <div className="flex items-center gap-2">
              <KanbanColorCircle color={col.color} />
              <KanbanBoardColumnTitle columnId={col.id}>
                {col.title}
              </KanbanBoardColumnTitle>
              <Badge variant="secondary" className="ml-auto">
                {col.tasks.length}
              </Badge>
            </div>
          </KanbanBoardColumnHeader>

          <KanbanBoardColumnList>
            {col.tasks.map((task) => (
              <KanbanBoardColumnListItem key={task.id} cardId={task.id}>
                <KanbanBoardCard
                  data={{ id: task.id }}
                  className="flex flex-col gap-2 cursor-grab hover:border-primary/50 transition-colors"
                  onClick={() => onTaskClick(task)}
                >
                  <div className="flex justify-between items-start">
                    <KanbanBoardCardTitle>{task.header}</KanbanBoardCardTitle>
                  </div>

                  <KanbanBoardCardDescription className="text-white">
                    {task.type}
                  </KanbanBoardCardDescription>

                  <div className="flex items-center justify-between mt-2">
                    <Badge
                      variant="outline"
                      className="text-[10px] px-1 py-0 h-5"
                    >
                      {task.reviewer ? task.reviewer.split(" ")[0] : "Me"}
                    </Badge>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded">
                      <CalendarClock className="h-3 w-3" />
                      <span>{task.limit}</span>
                    </div>
                  </div>
                </KanbanBoardCard>
              </KanbanBoardColumnListItem>
            ))}
          </KanbanBoardColumnList>
        </KanbanBoardColumn>
      ))}
    </KanbanBoard>
  );
}

export function EmployeeKanban() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const res = await fetch("/api/tasks"); // Fetches logged-in user tasks
        if (res.ok) {
          const data = await res.json();
          console.log("Kanban fetched tasks:", data);
          const mappedTasks: Task[] = data.map((t: any) => ({
            id: t.id,
            header: t.title,
            type: t.priority || "Medium",
            status: mapDbStatusToKanban(t.status), // Map 'todo' -> 'Todo'
            target: t.projectId, // Using target as projectId ref for now
            limit: t.dueDate
              ? format(new Date(t.dueDate), "MMM dd")
              : "No Date",
            dueDate: t.dueDate
              ? format(new Date(t.dueDate), "MMM dd, yyyy")
              : "No Deadline",
            endDate: "", // Not available in task schema usually
            reviewer: "Manager", // Static for now, or fetch creator name
            description: t.description,
            qualityScore: t.qualityScore,
            qualityAnalysis: t.qualityAnalysis,
          }));
          setTasks(mappedTasks);
        }
      } catch (e) {
        console.error("Failed to fetch tasks", e);
      } finally {
        setLoading(false);
      }
    };
    fetchTasks();
  }, []);

  const [description, setDescription] = useState("");

  const handleTaskClick = async (task: Task) => {
    setSelectedTask(task);
    setDescription(""); // Reset description

    try {
      // Fetch detailed task info including subtasks
      const res = await fetch(`/api/tasks/${task.id}`);
      if (res.ok) {
        const detail = await res.json();
        setSelectedTask((prev) => ({
          ...prev!,
          description: detail.description || prev?.description,
          status: mapDbStatusToKanban(detail.status),
          qualityScore: detail.qualityScore,
          qualityAnalysis: detail.qualityAnalysis,
        }));
      }
    } catch (error) {
      console.error("Failed to fetch task details", error);
    }
  };

  const handleUploadComplete = (result: unknown) => {
    console.log("Upload success:", result);
    if (
      selectedTask &&
      result &&
      typeof result === "object" &&
      "secure_url" in result
    ) {
      fetch(`/api/tasks/${selectedTask.id}/evidence`, {
        method: "POST",
        body: JSON.stringify({
          fileUrl: (result as any).secure_url,
          publicId: (result as any).public_id,
          fileType: "image", // simplified
          description: description || "Proof of work", // Use user description
        }),
      }).then((res) => {
        if (res.ok) {
          toast.success("Evidence linked to task!");
          // Move to Review if not already
          if (selectedTask.status !== "Review") {
            // trigger update status...
            setTasks((prev) =>
              prev.map((t) =>
                t.id === selectedTask.id ? { ...t, status: "Review" } : t,
              ),
            );
          }
          setSelectedTask(null);
        }
      });
    }
  };

  if (loading) return <div>Loading tasks...</div>;

  return (
    <div className="h-full w-full min-h-[500px]">
      <Tabs defaultValue="kanban" className="h-full w-full">
        <div className="flex items-center justify-between mb-4">
          <TabsList>
            <TabsTrigger value="kanban">Kanban Board</TabsTrigger>
            <TabsTrigger value="table">Table View</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="kanban" className="h-[calc(100%-60px)]">
          <KanbanBoardProvider>
            <KanbanContent
              tasks={tasks}
              setTasks={setTasks}
              onTaskClick={handleTaskClick}
            />
          </KanbanBoardProvider>
        </TabsContent>

        <TabsContent value="table" className="h-[calc(100%-60px)]">
          <div className="rounded-md border h-full overflow-hidden bg-background">
            <ScrollArea className="h-full">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Task Name</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Deadline</TableHead>
                    <TableHead>Subtasks (AI)</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tasks.map((task) => (
                    <TableRow
                      key={task.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => handleTaskClick(task)}
                    >
                      <TableCell className="font-medium">
                        {task.header}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            task.type === "high" || task.type === "critical"
                              ? "destructive"
                              : "secondary"
                          }
                        >
                          {task.type}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{task.status}</Badge>
                      </TableCell>
                      <TableCell>{task.dueDate}</TableCell>
                      <TableCell>
                        <span className="text-xs text-muted-foreground">-</span>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm">
                          Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          </div>
        </TabsContent>
      </Tabs>

      <Modal
        isOpen={!!selectedTask}
        onClose={() => setSelectedTask(null)}
        title={selectedTask?.header}
        size="lg"
      >
        <div className="space-y-6 text-foreground">
          {/* Common Task Details */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-muted-foreground">
              Description
            </h4>
            <p className="text-sm">
              {selectedTask?.description ||
                "No detailed description provided for this task."}
            </p>
          </div>

          {/* Quality Score Display (if available) */}
          {selectedTask?.qualityScore !== undefined &&
            selectedTask.qualityScore !== null && (
              <div className="space-y-3 pt-4 border-t">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium">Quality Score</h4>
                  <div
                    className={`text-xl font-bold ${
                      selectedTask.qualityScore >= 80
                        ? "text-green-500"
                        : selectedTask.qualityScore >= 50
                          ? "text-yellow-500"
                          : "text-red-500"
                    }`}
                  >
                    {selectedTask.qualityScore}/100
                  </div>
                </div>
                {selectedTask.qualityAnalysis && (
                  <p className="text-sm text-muted-foreground">
                    {selectedTask.qualityAnalysis}
                  </p>
                )}
              </div>
            )}

          <div className="grid grid-cols-2 gap-4 text-sm mt-4">
            <div>
              <span className="text-muted-foreground">Status:</span>{" "}
              <Badge className="capitalize">{selectedTask?.status}</Badge>
            </div>
            <div>
              <span className="text-muted-foreground">Deadline:</span>{" "}
              {selectedTask?.dueDate}
            </div>
            <div>
              <span className="text-muted-foreground">Priority:</span>{" "}
              {selectedTask?.type}
            </div>
          </div>

          <div className="border-t pt-4">
            {selectedTask?.status === "Done" ||
            selectedTask?.status === "Review" ? (
              // Case: Task IS Done/Review -> Show Upload
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Evidence Submission</h4>
                <div className="mb-4">
                  <label className="text-xs text-muted-foreground block mb-2">
                    Work Description / Notes
                  </label>
                  <textarea
                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="Describe what you did..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>
                <p className="text-xs text-muted-foreground mb-4">
                  Upload verification files (Screenshots, PDFs, or Documents) to
                  prove task completion.
                </p>
                <FileUpload
                  folder="task-evidence"
                  onUploadComplete={handleUploadComplete}
                />
              </div>
            ) : (
              // Case: Task NOT Done -> Show Alert
              <div className="rounded-md bg-yellow-50 dark:bg-yellow-900/20 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg
                      className="h-5 w-5 text-yellow-400"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                      Cannot Upload Evidence Yet
                    </h3>
                    <div className="mt-2 text-sm text-yellow-700 dark:text-yellow-300">
                      <p>
                        Please move this card to the{" "}
                        <strong>In Progress</strong>, <strong>Review</strong> or{" "}
                        <strong>Done</strong> column before submitting proofs.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setSelectedTask(null)}>
              Close
            </Button>
            {/* Only show Save button if upload is allowed */}
            {(selectedTask?.status === "Done" ||
              selectedTask?.status === "Review" ||
              selectedTask?.status === "In Progress") && (
              <Button onClick={() => setSelectedTask(null)}>
                Save Changes
              </Button>
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
}
