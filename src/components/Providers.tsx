"use client";

import { Toaster } from "sonner";

export function Providers({ children }: { children: React.ReactNode }) {
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
