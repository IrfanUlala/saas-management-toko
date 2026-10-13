"use client";

import { useEffect } from "react";
import { ConvexAuthProvider } from "@convex-dev/auth/react";
import { ConvexReactClient } from "convex/react";
import { ReactNode } from "react";

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);
const legacyLocalKeys = [
  "toman-products-v1",
  "toman-vendors-v1",
  "toman-sales-transactions-v1",
];
const legacySessionKeys = [
  "toman-pembelian-draft",
  "toman-pembelian-products-updated",
];

export function ConvexClientProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    for (const key of legacyLocalKeys) window.localStorage.removeItem(key);
    for (const key of legacySessionKeys) window.sessionStorage.removeItem(key);
  }, []);

  return (
    <ConvexAuthProvider client={convex}>{children}</ConvexAuthProvider>
  );
}