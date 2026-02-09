"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Plus, Calendar, MoreHorizontal, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { formatDate } from "@/lib/utils";
import { Projects } from "@/lib/types/type";

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Projects[]>([]);

  const fetchProjects = async () => {
    const response = await fetch("/api/projects");
    const data = await response.json();

    setProjects(data);
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/projects/${id}`, {
        method: "DELETE",
      });
      fetchProjects();
      toast.success("Project deleted successfully");
    } catch (error) {
      console.error("Error deleting project:", error);
    }
  };

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 pt-0">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">
            Projects
          </h2>
          <p className="text-muted-foreground">
            Manage and monitor ongoing projects.
          </p>
        </div>
        <Link href="/dashboard/pm/projects/new" passHref>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            New Project
          </Button>
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {projects.map((project) => (
          <Card
            key={project.id}
            className="flex flex-col h-full hover:shadow-md transition-shadow"
          >
            <CardHeader className="pb-4">
              <div className="flex justify-between items-start">
                <Badge
                  variant={
                    project.status === "Active" ? "default" : "secondary"
                  }
                  className="mb-2"
                >
                  {project.status}
                </Badge>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 -mr-2"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <Link
                        href={`/dashboard/pm/projects/${project.id}/details`}
                        className="w-full"
                      >
                        Details
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Link
                        href={`/dashboard/pm/projects/${project.id}/edit`}
                        className="w-full"
                      >
                        Edit
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleDelete(project.id)}
                      className="cursor-pointer text-red-600 focus:text-red-600"
                    >
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <CardTitle className="text-xl ">{project.name}</CardTitle>
              <CardDescription className="line-clamp-2 mt-1">
                {project.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="pb-4 flex-1">
              <div className="space-y-4">
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-medium">
                      {project.progress || 0}%
                    </span>
                  </div>
                  <Progress value={project.progress || 0} className="h-2" />
                </div>

                <div className="flex items-center text-sm text-muted-foreground gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>Due {formatDate(project.endDate)}</span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="pt-0 flex items-center justify-between">
              {/* <div className="flex -space-x-2 overflow-hidden">
                {(project.team || []).map((member, i) => (
                  <Avatar
                    key={i}
                    className="inline-block border-2 border-background h-8 w-8"
                  >
                    <AvatarImage src={member.image} />
                    <AvatarFallback>
                      {member.name ? member.name[0] : "?"}
                    </AvatarFallback>
                  </Avatar>
                ))}
                {(project.team?.length || 0) > 3 && (
                  <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-background bg-muted text-xs font-medium">
                    +{(project.team?.length || 0) - 3}
                  </div>
                )}
              </div> */}
              <Link
                href={`/dashboard/pm/projects/${project.id}/details`}
                passHref
              >
                <Button variant="outline" size="sm" className="gap-2 text-xs">
                  Details <ArrowRight className="h-3 w-3" />
                </Button>
              </Link>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
