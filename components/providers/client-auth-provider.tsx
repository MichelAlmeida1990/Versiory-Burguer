"use client";

import { ClientAuthProvider } from "@/contexts/client-auth-context";

export function ClientAuthProviderWrapper({ children }: { children: React.ReactNode }) {
  return <ClientAuthProvider>{children}</ClientAuthProvider>;
}

