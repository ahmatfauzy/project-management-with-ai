export type UserTypes = {
  id: string;
  name: string;
  email: string;
  image: string;
  department?: string;
  createdAt: string;
  role: "employee" | "hr" | "pm";
  status: "pending" | "active" | "rejected";
};

export type Projects = {
  id: string;
  name: string;
  description: string;
  progress: number;
  endDate: string;
  status: string;
};