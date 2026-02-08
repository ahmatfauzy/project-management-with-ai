/**
 * Common Type Definitions for Project Management System
 * Centralized types to avoid 'any' usage
 */

// Project Types
export interface Project {
  id: string;
  name: string;
  description: string | null;
  status: "planning" | "active" | "completed" | "on_hold";
  startDate: Date | string | null;
  endDate: Date | string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
  createdBy: string | null;
  progress?: number; // Calculated field
  tasks?: Task[];
  members?: ProjectMember[];
}

export interface ProjectMember {
  userId: string;
  projectId: string;
  role?: string;
  user?: {
    id: string;
    name: string | null;
    email: string;
  };
}

// Task Types
export interface Task {
  id: string;
  title: string;
  description: string | null;
  status: "todo" | "in_progress" | "review" | "done";
  priority: "low" | "medium" | "high";
  projectId: string;
  assigneeId: string | null;
  dueDate: Date | string | null;
  startDate: Date | string | null;
  completedDate: Date | string | null;
  estimatedHours: number | null;
  actualHours: number | null;
  qualityScore: number | null;
  qualityAnalysis: string | null;
  riskLevel: "low" | "medium" | "high" | null;
  aiRiskAnalysis: string | null;
  aiBreakdown: Record<string, unknown> | null; // JSON type
  createdAt: Date | string;
  updatedAt: Date | string;
  evidences?: Evidence[];
}

export interface Evidence {
  id: string;
  taskId: string;
  fileUrl: string;
  publicId: string;
  fileType: string;
  description: string | null;
  uploadedBy: string;
  createdAt: Date | string;
}

// User Types
export interface User {
  id: string;
  name: string | null;
  email: string;
  role: "employee" | "pm" | "hr";
  department: string | null;
  emailVerified: Date | string | null;
  createdAt: Date | string;
}

// API Response Types
export interface ApiResponse<T = unknown> {
  success?: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}

// Form Data Types
export interface ProjectFormData {
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  tasks: TaskFormData[];
  memberIds: string[];
}

export interface TaskFormData {
  title: string;
  description: string;
  priority: "low" | "medium" | "high";
  dueDate: string;
  assigneeId: string;
}

// Event Handler Types
export type FormSubmitHandler = (
  e: React.FormEvent<HTMLFormElement>,
) => void | Promise<void>;
export type ButtonClickHandler = (
  e: React.MouseEvent<HTMLButtonElement>,
) => void | Promise<void>;
export type InputChangeHandler = (
  e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
) => void;
export type SelectChangeHandler = (value: string) => void;
