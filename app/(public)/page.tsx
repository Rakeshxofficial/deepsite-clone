import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import MY_TOKEN_KEY from "@/lib/get-cookie-name";

// Check if user is authenticated
async function checkAuth() {
  const cookieStore = await cookies();
  const token = cookieStore.get(MY_TOKEN_KEY())?.value;
  return !!token;
}

export default async function Home() {
  const isAuthenticated = await checkAuth();
  
  if (!isAuthenticated) {
    redirect("/auth");
  }
  
  // If authenticated, redirect to projects
  redirect("/projects/new");
}
