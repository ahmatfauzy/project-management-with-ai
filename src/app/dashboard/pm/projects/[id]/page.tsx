import { redirect } from "next/navigation";

// Redirect [id] -> [id]/details
export default async function ProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  redirect(`/dashboard/pm/projects/${id}/details`);
}
