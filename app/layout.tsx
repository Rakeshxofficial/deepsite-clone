/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Metadata, Viewport } from "next";
import { Inter, PT_Sans } from "next/font/google";
import { cookies } from "next/headers";

import TanstackProvider from "@/components/providers/tanstack-query-provider";
import "@/assets/globals.css";
import { Toaster } from "@/components/ui/sonner";
import MY_TOKEN_KEY from "@/lib/get-cookie-name";
import { apiServer } from "@/lib/api";
import AppContext from "@/components/contexts/app-context";
import Script from "next/script";

const inter = Inter({
  variable: "--font-inter-sans",
  subsets: ["latin"],
});

const ptSans = PT_Sans({
  variable: "--font-ptSans-mono",
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "HTMLweb.dev | Build with AI ✨",
  description:
    "HTMLweb.dev is a web development tool that helps you build websites with AI, no code required. Let's deploy your website with HTMLweb.dev and enjoy the magic of AI.",
  openGraph: {
    title: "HTMLweb.dev | Build with AI ✨",
    description:
      "HTMLweb.dev is a web development tool that helps you build websites with AI, no code required. Let's deploy your website with HTMLweb.dev and enjoy the magic of AI.",
    url: "https://htmlweb.dev",
    siteName: "HTMLweb.dev",
    images: [
      {
        url: "https://htmlweb.dev/banner.png",
        width: 1200,
        height: 630,
        alt: "HTMLweb.dev Open Graph Image",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "HTMLweb.dev | Build with AI ✨",
    description:
      "HTMLweb.dev is a web development tool that helps you build websites with AI, no code required. Let's deploy your website with HTMLweb.dev and enjoy the magic of AI.",
    images: ["https://htmlweb.dev/banner.png"],
  },
  appleWebApp: {
    capable: true,
    title: "HTMLweb.dev",
    statusBarStyle: "black-translucent",
  },
  icons: {
    icon: "/logo.svg",
    shortcut: "/logo.svg",
    apple: "/logo.svg",
  },
};

export const viewport: Viewport = {
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#000000",
};

async function getMe() {
  const cookieStore = await cookies();
  const token = cookieStore.get(MY_TOKEN_KEY())?.value;
  if (!token) return { user: null, errCode: null };
  try {
    const res = await apiServer.get("/me", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return { user: res.data.user, errCode: null };
  } catch (err: any) {
    return { user: null, errCode: err.status };
  }
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const data = await getMe();
  return (
    <html lang="en">
      <Script
        defer
        data-domain="htmlweb.dev"
        src="https://plausible.io/js/script.js"
      ></Script>
      <body
        className={`${inter.variable} ${ptSans.variable} antialiased bg-black dark h-[100dvh] overflow-hidden`}
      >
        <Toaster richColors position="bottom-center" />
        <TanstackProvider>
          <AppContext me={data}>{children}</AppContext>
        </TanstackProvider>
      </body>
    </html>
  );
}
