"use client";

import { useCallback, useEffect, useState } from "react";
import { Breath } from "./breath";
import { Sheet, SheetContent, SheetTitle } from "./sheet";
import { Plus, Minus, Bolt as SettingsIcon } from "lucide-react";
import { cn } from "@/lib/utils";

import { AnimatePresence, motion } from "motion/react";
import { useSettingsContext } from "@/app/providers/settings-provider";
import { useUserContext } from "@/app/providers/user-provider";
import { useAppFrameContext } from "@/app/providers/app-frame-provider";
import { externalBaseUrl } from "../constants";

const Button = ({
  children,
  onClick,
  disabled,
  variant = "outline",
  className,
  isIcon,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  variant?: "primary" | "outline" | "ghost";
  className?: string;
  isIcon?: boolean;
}) => {
  return (
    <motion.button
      className={cn(
        "font-bold rounded-full disabled:cursor-not-allowed disabled:opacity-50 border-2",
        variant === "primary" &&
          "bg-green-100 text-green-900 border-transparent",
        variant === "outline" && "bg-green-900 text-green-500 border-green-700",
        variant === "ghost" &&
          "bg-transparent border-transparent text-green-500",
        isIcon ? "p-3" : "px-5 py-3",
        className
      )}
      onClick={onClick}
      disabled={disabled}
      whileHover={disabled ? {} : { scale: 1.05 }}
      whileTap={disabled ? {} : { scale: 0.95 }}
    >
      {children}
    </motion.button>
  );
};

function SettingsSheetContent({
  iterations,
  onDecreaseIterations,
  onIncreaseIterations,
}: {
  iterations: number;
  onDecreaseIterations: () => void;
  onIncreaseIterations: () => void;
}) {
  return (
    <div className="flex gap-4 items-center pt-8 pb-4 text-green-500 justify-between">
      <div className="flex flex-col">
        <span className="font-bold">Cycles</span>
        <span className="text-xs text-green-500/70">4 is ideal</span>
      </div>
      <div className="flex gap-4 items-center">
        <Button onClick={onDecreaseIterations} disabled={iterations === 1}>
          <Minus />
        </Button>
        <span className="text-2xl font-bold text-green-100 w-8 text-center">
          {iterations}
        </span>
        <Button onClick={onIncreaseIterations}>
          <Plus />
        </Button>
      </div>
    </div>
  );
}

function Logo() {
  return (
    <h1 className="text-5xl font-bold text-green-600 font-playwrite">Calmer</h1>
  );
}

function MainButtonContainer({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("w-full px-12 flex flex-col gap-2 pb-2", className)}>
      {children}
    </div>
  );
}

function BreathScreenContent({ onCompleted }: { onCompleted: () => void }) {
  const [active, setActive] = useState(false);
  const { iterations } = useSettingsContext();

  const userCtx = useUserContext();
  const startSession = userCtx?.startSession;
  const endSession = userCtx?.endSession;

  const startUserSession = useCallback(async () => {
    if (startSession) {
      await startSession({ data: { iterations } });
    }
  }, [startSession, iterations]);
  const endUserSession = useCallback(async () => {
    if (endSession) {
      await endSession({ data: { iterations } });
    }
  }, [endSession, iterations]);

  const handleCompleted = useCallback(() => {
    setActive(false);
    onCompleted();
    endUserSession();
  }, [endUserSession, onCompleted]);

  const user = userCtx?.user;
  const handleActiveToggle = useCallback(() => {
    if (!active && user) {
      startUserSession();
    }
    setActive((active) => !active);
  }, [active, startUserSession, user]);

  return (
    <div className="flex flex-1 flex-col gap-8 items-center justify-center w-full">
      <div className="flex flex-1 items-center justify-center w-full">
        <Breath
          status={active ? "active" : "completed"}
          onCompleted={handleCompleted}
          iterations={iterations}
          firstSession={!userCtx?.lastSession}
        />
      </div>
      <div className="max-w-md mx-auto px-4 w-full">
        <MainButtonContainer>
          <Button
            onClick={handleActiveToggle}
            variant={active ? "outline" : "primary"}
            className="w-full"
          >
            {active ? "Stop" : "Start"}
          </Button>
        </MainButtonContainer>
      </div>
    </div>
  );
}

function Settings() {
  const { iterations, setIterations } = useSettingsContext();

  const handleIncreaseIterations = useCallback(
    () => setIterations(iterations + 1),
    [iterations, setIterations]
  );
  const handleDecreaseIterations = useCallback(
    () => setIterations(iterations - 1),
    [iterations, setIterations]
  );

  const [sheetOpen, setSheetOpen] = useState(false);

  const ctx = useAppFrameContext();

  return (
    <>
      <Button onClick={() => setSheetOpen(true)} variant="ghost" isIcon>
        <SettingsIcon />
      </Button>
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent
          side="bottom"
          className="bg-green-800 border-green-700 border-t-2 rounded-t-3xl max-w-md mx-auto font-inter"
          style={{
            paddingBottom: 24 + (ctx?.client?.safeAreaInsets?.bottom || 0),
          }}
        >
          <SheetTitle
            className="text-green-500 text-center text-sm font-playwrite"
            hidden
          >
            Settings
          </SheetTitle>
          <SettingsSheetContent
            iterations={iterations}
            onDecreaseIterations={handleDecreaseIterations}
            onIncreaseIterations={handleIncreaseIterations}
          />
        </SheetContent>
      </Sheet>
    </>
  );
}

function IntroScreenContent({ onClose }: { onClose: () => void }) {
  return (
    <div className="flex flex-col text-green-100/80 max-w-md mx-auto px-4 flex-1 overflow-hidden gap-4">
      <div className="flex flex-col gap-4 px-2 leading-snug flex-1 justify-center flex-1 overflow-hidden">
        <h3 className="text-2xl text-green-100 font-playwrite font-bold">
          {"Welcome to Calmer"}
        </h3>
        <div className="flex flex-col gap-2 font-light overflow-y-auto">
          <p>
            {
              "Experience calm and relaxation with the 4-7-8 breathing technique, popularized by Dr. Andrew Weil. This method is designed to help reduce stress, improve sleep, and enhance overall well-being."
            }
          </p>
          <p>{"The Technique:"}</p>
          <ol className="list-decimal px-8 font-bold space-y-1">
            <li>{"Inhale quietly through your nose for 4 seconds."}</li>
            <li>{"Hold your breath for 7 seconds."}</li>
            <li>{"Exhale completely through your mouth for 8 seconds."}</li>
          </ol>
          <p>
            {"Repeat 3 more times. Practice regularly for optimal benefits."}
          </p>
        </div>
      </div>
      <MainButtonContainer>
        <Button onClick={onClose} className="w-full" variant="primary">
          {"Let's go"}
        </Button>
      </MainButtonContainer>
    </div>
  );
}

function OutroScreenContent({ onBack }: { onBack: () => void }) {
  const ctx = useAppFrameContext();
  const userCtx = useUserContext();
  const currentSession = userCtx?.currentSession;

  const share = ctx?.share;
  const handleShare = useCallback(() => {
    const url = `${externalBaseUrl}${
      currentSession?.id ? `?sid=${currentSession.id}` : ""
    }`;
    share?.({
      title: "Do you want to feel @calmer too?\n\n" + url,
      url,
      channelKey: "calmer",
    });
  }, [share, currentSession]);

  return (
    <div className="flex flex-col text-green-100/60 max-w-md mx-auto px-4 w-full h-full gap-4">
      <div className="flex flex-col gap-4 flex-1 justify-center text-center">
        <h3 className="text-3xl text-green-100 font-playwrite font-bold">
          {"You did it!"}
        </h3>
        <p className="text-base text-green-100/60">
          {"You've completed the 4-7-8 breathing technique and now you should feel "}
          <span className="font-playwrite font-bold">Calmer</span>
        </p>
      </div>
      <MainButtonContainer>
        <Button onClick={handleShare} className="w-full" variant="primary">
          {"Share"}
        </Button>
        <span className="text-green-100/40 text-center text-xs pt-1">
          {"…and help your friends feel "}
          <span className="font-playwrite font-bold">Calmer</span>
        </span>
        <Button onClick={onBack} className="w-full" variant="ghost">
          {"Let's do it again"}
        </Button>
      </MainButtonContainer>
    </div>
  );
}

function Loader() {
  return (
    <motion.div
      className="w-12 h-12 border-4 border-green-600 rounded-full border-t-transparent"
      animate={{
        rotate: 360,
      }}
      transition={{
        duration: 1,
        repeat: Infinity,
        ease: "linear",
      }}
    />
  );
}

export function App() {
  const [activeScreen, setActiveScreen] = useState<
    "intro" | "breath" | "outro" | null
  >(null);

  const handleActivityCompleted = useCallback(() => {
    setActiveScreen("outro");
  }, []);

  const ctx = useAppFrameContext();
  useEffect(() => {
    if (ctx?.client && !ctx?.client.added) {
      ctx?.requestAddFrame();
    }
  }, [ctx]);

  const handleOutroBack = useCallback(() => {
    setActiveScreen("breath");
  }, []);

  const userCtx = useUserContext();

  useEffect(() => {
    if (userCtx?.user) {
      if (!userCtx.lastSession) {
        setActiveScreen("intro");
      } else {
        setActiveScreen("breath");
      }
    }
  }, [userCtx?.user, userCtx?.lastSession]);

  const paddingBottom = 24 + (ctx?.client?.safeAreaInsets?.bottom || 0);

  return (
    <div
      className="flex flex-col items-center h-dvh pt-12 overflow-hidden relative"
      style={{ paddingBottom }}
    >
      <div className="flex items-center justify-center w-full relative pt-2 pb-6">
        <Logo />
      </div>
      <div
        className="absolute right-0 bg-green-700 opacity-60 rounded-l-full rounded-r-none"
        style={{ bottom: paddingBottom + 8 }}
      >
        <Settings />
      </div>
      <AnimatePresence mode="wait">
        {activeScreen == null && (
          <motion.div
            key="loader"
            className="flex-1 flex flex-col items-center justify-center"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
          >
            <Loader />
          </motion.div>
        )}
        {activeScreen === "intro" && (
          <motion.div
            key="intro"
            className="flex-1 flex flex-col overflow-hidden"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
          >
            <IntroScreenContent onClose={() => setActiveScreen("breath")} />
          </motion.div>
        )}
        {activeScreen === "breath" && (
          <motion.div
            className="flex-1 flex flex-col w-full"
            key="breath"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
          >
            <BreathScreenContent onCompleted={handleActivityCompleted} />
          </motion.div>
        )}
        {activeScreen === "outro" && (
          <motion.div
            key="outro"
            className="flex-1 flex flex-col w-full"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
          >
            <OutroScreenContent onBack={handleOutroBack} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
