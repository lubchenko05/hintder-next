"use client";

import { useEffect } from "react";
import { Toaster } from "sonner";
import { initAnalytics } from "@/lib/analytics";

export function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    initAnalytics();
  }, []);

  return (
    <>
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
    </>
  );
}
