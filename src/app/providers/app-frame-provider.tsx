"use client";

import { Context } from "@farcaster/frame-node";
import sdk from "@farcaster/frame-sdk";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { UserInfo } from "@/app/db/types";

export interface ClientContext {
  userInfo?: UserInfo;
  userFid?: number;
  isReady: boolean;
  isLoading: boolean;
  client?: Context.FrameContext["client"];
  share: ({ title, url, channelKey }: { title: string; url: string; channelKey?: string }) => Promise<void>;
  openUrl: (url: string) => Promise<void>;
  requestAddFrame: () => Promise<void>;
}

function toUserInfo({
  pfpUrl,
  username,
  displayName,
}: Context.FrameContext["user"]): UserInfo {
  return {
    username: username || undefined,
    displayName: displayName || undefined,
    profileImage: pfpUrl,
  };
}

function createComposeUrl(text: string, url: string, channelKey?: string): string {
  const params = new URLSearchParams();
  params.set("text", text);
  params.set("embeds[]", url);
  if (channelKey) {
    params.set("channelKey", channelKey);
  }
  return `https://warpcast.com/~/compose?${params.toString()}`;
}

function useClientContext({
  onLoad,
}: {
  onLoad?: (ctx: Context.FrameContext) => void;
}): ClientContext {
  const [context, setContext] = useState<Context.FrameContext | undefined>();
  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const ctx = await sdk.context;
        setContext(ctx);
        onLoad?.(ctx);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    if (!ready && sdk) {
      setReady(true);
      load();
    }
  }, [ready, onLoad]);

  const userInfo = useMemo(() => {
    return context?.user ? toUserInfo(context.user) : undefined;
  }, [context?.user]);

  const share = useCallback(
    ({ title, url, channelKey }: { title: string; url: string; channelKey?: string }) => {
      return sdk.actions.openUrl(createComposeUrl(title, url, channelKey ));
    },
    []
  );

  const openUrl = useCallback((url: string) => {
    return sdk.actions.openUrl(url);
  }, []);

  const requestAddFrame = useCallback(() => {
    sdk.actions.addFrame();
    return Promise.resolve();
  }, []);

  return {
    userInfo,
    userFid: context?.user?.fid,
    isReady: ready,
    isLoading: loading,
    client: context?.client,
    share,
    openUrl,
    requestAddFrame,
  };
}

export const AppFrameContext = createContext<ClientContext | undefined>(
  undefined
);

export const useAppFrameContext = () => useContext(AppFrameContext);

export function AppFrameProvider({ children }: { children: React.ReactNode }) {
  const ctx = useClientContext({
    onLoad: () => {
      sdk.actions.ready();
    },
  });

  return (
    <AppFrameContext.Provider value={ctx}>{children}</AppFrameContext.Provider>
  );
}
