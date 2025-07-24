/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useUser } from "@/hooks/useUser";
import { usePathname, useRouter } from "next/navigation";
import { useMount } from "react-use";
import { UserContext } from "@/components/contexts/user-context";
import { User } from "@/types";
import { toast } from "sonner";
import { useBroadcastChannel } from "@/lib/useBroadcastChannel";

export default function AppContext({
  children,
  me: initialData,
}: {
  children: React.ReactNode;
  me?: {
    user: User | null;
    errCode: number | null;
  };
}) {
  const { loginFromCode, user, logout, loading, errCode } =
    useUser(initialData);
  const pathname = usePathname();
  const router = useRouter();

  useMount(() => {
    // Always check authentication - redirect to auth if no user
    if (!user && !loading) {
      if ([401, 403].includes(errCode as number)) {
        logout();
      } else if (!pathname.includes("/auth")) {
        // Redirect to auth page if not authenticated and not already on auth page
        router.push("/auth");
      }
    }
  });

  const events: any = {};

  useBroadcastChannel("auth", (message) => {
    if (pathname.includes("/auth/callback")) return;

    if (!message.code) return;
    if (message.type === "user-oauth" && message?.code && !events.code) {
      loginFromCode(message.code);
    }
  });

  return (
    <UserContext value={{ user, loading, logout } as any}>
      {children}
    </UserContext>
  );
}
