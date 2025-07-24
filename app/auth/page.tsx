import { redirect } from "next/navigation";
import { Metadata } from "next";
import { cookies } from "next/headers";

import { getAuth } from "@/app/actions/auth";
import MY_TOKEN_KEY from "@/lib/get-cookie-name";

export const revalidate = 1;

export const metadata: Metadata = {
  robots: "noindex, nofollow",
};

// Check if user is already authenticated
async function checkAuth() {
  const cookieStore = await cookies();
  const token = cookieStore.get(MY_TOKEN_KEY())?.value;
  return !!token;
}

export default async function Auth() {
  const isAuthenticated = await checkAuth();
  
  // If already authenticated, redirect to projects
  if (isAuthenticated) {
    redirect("/projects");
  }

  const loginRedirectUrl = await getAuth();
  if (loginRedirectUrl) {
    redirect(loginRedirectUrl);
  }

  return (
    <div className="p-4">
      <div className="border bg-red-500/10 border-red-500/20 text-red-500 px-5 py-3 rounded-lg">
        <h1 className="text-xl font-bold">Error</h1>
        <p className="text-sm">
          An error occurred while trying to log in. Please try again later.
        </p>
      </div>
    </div>
  );
}
