import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { apiServer } from "@/lib/api";
import MY_TOKEN_KEY from "@/lib/get-cookie-name";
import { AppEditor } from "@/components/editor";

// Check if user is authenticated
async function checkAuth() {
  const cookieStore = await cookies();
  const token = cookieStore.get(MY_TOKEN_KEY())?.value;
  return !!token;
}

async function getProject(namespace: string, repoId: string) {
  const cookieStore = await cookies();
  const token = cookieStore.get(MY_TOKEN_KEY())?.value;
  if (!token) return null;
  try {
    const { data } = await apiServer.get(
      `/me/projects/${namespace}/${repoId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return data.project;
  } catch {
    return null;
  }
}

export default async function ProjectNamespacePage({
  params,
}: {
  params: Promise<{ namespace: string; repoId: string }>;
}) {
  const isAuthenticated = await checkAuth();
  
  if (!isAuthenticated) {
    redirect("/auth");
  }

  const { namespace, repoId } = await params;
  const project = await getProject(namespace, repoId);
  if (!project) {
    redirect("/auth");
  }
  
  return <AppEditor project={project} />;
}
