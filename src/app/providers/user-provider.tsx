import { createContext, useCallback, useContext, useEffect } from "react";

import { useLocalStorage } from "react-use";
import { useAppFrameContext } from "./app-frame-provider";
import { useState } from "react";
import { DBUser } from "../db/types";
import { DBUserSession } from "../db/types";
import { useSearchParams } from "next/navigation";

function useSessionId() {
  const [sessionId] = useLocalStorage(
    "sessionId",
    Math.random().toString(36).substring(2, 15)
  );
  return sessionId;
}

function useReferralId() {
  const searchParams = useSearchParams();
  return searchParams.get("sid") || null;
}

function useUser() {
  const ctx = useAppFrameContext();
  const referralId = useReferralId();
  const [data, setData] = useState<{
    user: DBUser;
    newUser?: boolean;
    lastSession?: DBUserSession;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const sessionId = useSessionId();
  useEffect(() => {
    const controller = new AbortController();
    if (data || !sessionId || !ctx) {
      return;
    }
    if (ctx.isReady && !ctx.isLoading) {
      setLoading(true);
      const userId = ctx.userFid?.toString() || sessionId;
      const identityProvider = ctx.userFid ? "fc" : "anon";

      fetch(`/api/users`, {
        method: "POST",
        body: JSON.stringify({
          userId,
          identityProvider,
          userInfo: ctx.userInfo,
          data: referralId ? { sid: referralId } : null,
        }),
        signal: controller.signal,
      })
        .then((res) => res.json())
        .then(({ data }) => setData(data))
        .finally(() => setLoading(false));
    }

    return () => controller.abort();
  }, [ctx, data, sessionId, referralId]);

  return { data, loading };
}

interface UserSessionArgs {
  data?: Record<string, string | number | boolean | null | undefined>;
}

type UserContextType = {
  user?: DBUser;
  isNewUser?: boolean;
  lastSession?: DBUserSession;
  currentSession?: DBUserSession;
  isLoading: boolean;

  startSession: (args: UserSessionArgs) => Promise<void>;
  endSession: (args: UserSessionArgs) => Promise<void>;
};

export const UserContext = createContext<UserContextType | undefined>(
  undefined
);

export const useUserContext = () => useContext(UserContext);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const { data, loading: isLoading } = useUser();
  const { user, newUser: isNewUser, lastSession } = data || {};
  const [currentSession, setCurrentSession] = useState<
    DBUserSession | undefined
  >(undefined);
  const referralId = useReferralId();
  const startSession = useCallback(
    async ({ data }: UserSessionArgs) => {
      if (!user) {
        console.error("No current user");
        return;
      }
      console.log("startSession", user, data);
      const session = await fetch(`/api/users/${user?.id}/sessions`, {
        method: "POST",
        body: JSON.stringify({
          data: { ...data, sid: referralId },
        }),
      });
      const sessionData = await session.json();
      setCurrentSession(sessionData.data.session);
    },
    [user, referralId]
  );
  const endSession = useCallback(
    async (args: UserSessionArgs) => {
      if (!user || !currentSession) {
        console.error("No current user or session");
        return;
      }
      console.log("endSession", user, args);
      const session = await fetch(
        `/api/users/${user.id}/sessions/${currentSession.id}`,
        {
          method: "PUT",
          body: JSON.stringify({
            data: { ...args.data, sid: referralId },
            finishedAt: new Date(),
          }),
        }
      );
      const sessionData = await session.json();
      setCurrentSession(sessionData.data.session);
    },
    [user, currentSession, referralId]
  );

  return (
    <UserContext.Provider
      value={{
        user,
        isNewUser,
        lastSession,
        currentSession,
        isLoading,
        startSession,
        endSession,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}
