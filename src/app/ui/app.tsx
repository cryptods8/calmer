"use client";

import { useCallback, useEffect, useState } from "react";
import { Breath } from "./breath";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./sheet";
import { Plus, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

import { AnimatePresence, motion } from "motion/react";

const Button = ({
  children,
  onClick,
  disabled,
  variant = "outline",
  className,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  variant?: "primary" | "outline" | "ghost";
  className?: string;
}) => {
  return (
    <motion.button
      className={cn(
        "font-bold px-5 py-3 rounded-full disabled:cursor-not-allowed disabled:opacity-50 border-2",
        variant === "primary" &&
          "bg-green-100 text-green-900 border-transparent",
        variant === "outline" && "bg-green-900 text-green-500 border-green-700",
        variant === "ghost" &&
          "bg-transparent border-transparent text-green-500",
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

function AppContainer({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center h-dvh gap-4 py-12">
      {children}
    </div>
  );
}

function BreathScreenContent({ onCompleted }: { onCompleted: () => void }) {
  const [active, setActive] = useState(false);
  const [iterations, setIterations] = useState(4);

  const handleCompleted = useCallback(() => {
    setActive(false);
    onCompleted();
  }, []);
  const handleActiveToggle = useCallback(() => {
    setActive((active) => !active);
  }, []);

  const handleIncreaseIterations = useCallback(
    () => setIterations((i) => i + 1),
    []
  );
  const handleDecreaseIterations = useCallback(
    () => setIterations((i) => i - 1),
    []
  );

  const [sheetOpen, setSheetOpen] = useState(false);

  return (
    <div className="flex flex-1 flex-col gap-8 items-center justify-center w-full">
      <div className="flex flex-1 items-center justify-center w-full">
        <Breath
          status={active ? "active" : "completed"}
          onCompleted={handleCompleted}
          iterations={iterations}
        />
      </div>
      <div className="flex flex-col gap-2">
        <Button
          onClick={handleActiveToggle}
          variant={active ? "outline" : "primary"}
          className="min-w-32"
        >
          {active ? "Stop" : "Start"}
        </Button>
        <Button onClick={() => setSheetOpen(true)} variant="ghost">
          Settings
        </Button>
      </div>
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent
          side="bottom"
          className="bg-green-800 border-green-700 border-t-2 rounded-t-3xl max-w-md mx-auto font-inter"
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
    </div>
  );
}

function IntroScreenContent({ onClose }: { onClose: () => void }) {
  return (
    <div className="flex flex-col text-green-100/60 max-w-md mx-auto px-4 h-full">
      <div className="flex flex-col gap-4 px-2 leading-snug flex-1 justify-center">
        <h3 className="text-2xl text-green-100 font-playwrite font-bold">
          Welcome to Calmer
        </h3>
        <div className="flex flex-col gap-2 font-light">
          <p>
            Experience calm and relaxation with the 4-7-8 breathing technique,
            popularized by Dr. Andrew Weil. This simple yet powerful method is
            designed to help reduce stress, improve sleep, and enhance overall
            well-being.
          </p>
          <p>The Technique:</p>
          <ol className="list-decimal px-8 font-bold space-y-1">
            <li>Inhale quietly through your nose for 4 seconds.</li>
            <li>Hold your breath for 7 seconds.</li>
            <li>Exhale completely through your mouth for 8 seconds.</li>
          </ol>
          <p>Repeat 3 more times. Practice regularly for optimal benefits.</p>
        </div>
      </div>
      <Button onClick={onClose} className="w-full mt-4" variant="primary">
        Let's get started
      </Button>
    </div>
  );
}

function OutroScreenContent({ onBack }: { onBack: () => void }) {
  return (
    <div className="flex flex-col text-green-100/60 max-w-md mx-auto px-4 w-full h-full">
      <div className="flex flex-col gap-4 flex-1 justify-center text-center">
        <h3 className="text-3xl text-green-100 font-playwrite font-bold">
          You did it!
        </h3>
        <p className="text-base text-green-100/60">
          You've completed the 4-7-8 breathing technique and now you should feel <span className="font-playwrite font-bold">Calmer</span>
        </p>
      </div>
      <Button onClick={onBack} className="w-full mt-4" variant="primary">
        Let's do it again
      </Button>
    </div>
  );
}

export function App() {
  const [activeSheet, setActiveSheet] = useState<"intro" | "breath" | "outro">(
    "intro"
  );

  const handleActivityCompleted = useCallback(() => {
    setActiveSheet("outro");
  }, []);

  const handleOutroBack = useCallback(() => {
    setActiveSheet("breath");
  }, []);

  return (
    <div className="flex flex-col items-center h-dvh gap-4 py-12 overflow-hidden">
      <Logo />
      <Button
        onClick={() =>
          setActiveSheet(activeSheet === "intro" ? "breath" : activeSheet === "breath" ? "outro" : "intro")
        }
      >
        Switch
      </Button>
      <AnimatePresence mode="wait">
        {activeSheet === "intro" && (
          <motion.div
            key="intro"
            className="flex-1 flex flex-col"
            initial={{ opacity: 0, x: -20, }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
          >
            <IntroScreenContent onClose={() => setActiveSheet("breath")} />
          </motion.div>
        )}
        {activeSheet === "breath" && (
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
        {activeSheet === "outro" && (
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
