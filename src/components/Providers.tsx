"use client";

import { Toaster } from "sonner";
import { InstallProvider } from "@/components/pwa/InstallProvider";
import { InstallBanner } from "@/components/pwa/InstallBanner";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <InstallProvider>
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: "#15151A",
            border: "1px solid rgba(255,255,255,0.08)",
            color: "#F5F5F7",
          },
        }}
      />
      {children}
      <InstallBanner />
    </InstallProvider>
  );
}
