"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { useUserContext } from "./user-provider";

export interface Settings {
  iterations: number;
  setIterations: (iterations: number) => void;
}

const initialSettings: Settings = { iterations: 4, setIterations: () => {} };

export const SettingsContext = createContext<Settings>(initialSettings);

export const useSettingsContext = () => useContext(SettingsContext);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [iterations, setIterations] = useState<number>(initialSettings.iterations);
  const [isSetManually, setIsSetManually] = useState(false);

  const userCtx = useUserContext();
  const lastSessionData = userCtx?.lastSession?.data;
  console.log('CTX', userCtx);
  useEffect(() => {
    if (lastSessionData && !isSetManually && "iterations" in lastSessionData) {
      setIterations(Number(lastSessionData.iterations));
    }
  }, [lastSessionData, isSetManually]);

  const handleSetIterations = useCallback(
    (iterations: number) => {
      setIterations(iterations);
      setIsSetManually(true);
    },
    [setIterations, setIsSetManually]
  );

  return (
    <SettingsContext.Provider
      value={{ iterations, setIterations: handleSetIterations }}
    >
      {children}
    </SettingsContext.Provider>
  );
}
