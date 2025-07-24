import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { MyProjects } from "@/components/my-projects";
import { getProjects } from "@/app/actions/projects";
import MY_TOKEN_KEY from "@/lib/get-cookie-name";

// Check if user is authenticated
async function checkAuth() {
  const cookieStore = await cookies();
  const token = cookieStore.get(MY_TOKEN_KEY())?.value;
  return !!token;
}

export default async function ProjectsPage() {
  const isAuthenticated = await checkAuth();
  
  if (!isAuthenticated) {
    redirect("/auth");
  }

  const { ok, projects } = await getProjects();
  if (!ok) {
    redirect("/auth");
  }

  return <MyProjects projects={projects} />;
}
