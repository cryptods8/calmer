"use client";

import { AppFrameProvider } from "./app-frame-provider";
import { UserProvider } from "./user-provider";
import { SettingsProvider } from "./settings-provider";
import { Suspense } from "react";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Suspense>
      <AppFrameProvider>
        <UserProvider>
          <SettingsProvider>{children}</SettingsProvider>
        </UserProvider>
      </AppFrameProvider>
    </Suspense>
  );
}
