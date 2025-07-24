import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AppEditor } from "@/components/editor";
import MY_TOKEN_KEY from "@/lib/get-cookie-name";

// Check if user is authenticated
async function checkAuth() {
  const cookieStore = await cookies();
  const token = cookieStore.get(MY_TOKEN_KEY())?.value;
  return !!token;
}

export default async function ProjectsNewPage() {
  const isAuthenticated = await checkAuth();
  
  if (!isAuthenticated) {
    redirect("/auth");
  }

  return <AppEditor />;
}
