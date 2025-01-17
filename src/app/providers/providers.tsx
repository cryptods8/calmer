"use client";

import { AppFrameProvider } from "./app-frame-provider";
import { UserProvider } from "./user-provider";
import { SettingsProvider } from "./settings-provider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AppFrameProvider>
      <UserProvider>
        <SettingsProvider>{children}</SettingsProvider>
      </UserProvider>
    </AppFrameProvider>
  );
}
