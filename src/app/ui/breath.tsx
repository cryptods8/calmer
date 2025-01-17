"use client";

import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";

type PhaseName = "inhale" | "hold" | "exhale" | "initial";

interface Phase {
  name: PhaseName;
  duration: number;
}

const initialPhase: Phase = { name: "initial", duration: 4000 };

const phases: Phase[] = [
  { name: "inhale", duration: 4000 },
  { name: "hold", duration: 7000 },
  { name: "exhale", duration: 8000 },
];

const phaseTexts: Record<PhaseName, { title: string; messages: string[] }> = {
  initial: {
    title: "Exhale",
    messages: ["Try to exhale as much as you can", "Get ready to inhale"],
  },
  inhale: {
    title: "Inhale",
    messages: [
      "Inhale through your nose and into your abdomen",
      "Get ready to hold your breath",
    ],
  },
  hold: {
    title: "Hold",
    messages: ["Hold your breath for 7 seconds", "Get ready to exhale"],
  },
  exhale: {
    title: "Exhale",
    messages: [
      "Exhale loudly through your mouth for 8 seconds",
      "Make a whoosh sound",
      "Get ready to inhale",
    ],
  },
};

const progressStep = 10;

function pad(value: number, length: number) {
  return value.toString().padStart(length, "0");
}

function FormatTime({ value }: { value: number }) {
  const seconds = Math.floor(value / 1000);
  return (
    <div className="font-mono">
      <span>{seconds}</span>
      <small>
        <small>{`.${pad(Math.floor((value % 1000) / 10), 2)}`}</small>
      </small>
    </div>
  );
}

function PhaseMessages({
  messages,
  duration,
}: {
  messages: string[];
  duration: number;
}) {
  const [messageIdx, setMessageIdx] = useState<number>(0);
  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIdx((prev) => prev + 1);
    }, duration / messages.length);
    return () => clearInterval(interval);
  }, [duration, messages]);

  const message = messages[messageIdx % messages.length];

  return (
    <div className="relative w-full">
      <AnimatePresence>
        <motion.div
          className="absolute inset-0"
          key={messageIdx}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
        >
          {message}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function ProgressIndicator({
  duration,
  phaseName,
  active,
  iteration,
  showMessages = false,
}: {
  duration: number;
  phaseName: PhaseName;
  active: boolean;
  iteration: number;
  showMessages?: boolean;
}) {
  // const [progress, setProgress] = useState<number>(0);

  // useEffect(() => {
  //   setProgress(0);
  //   if (!active) {
  //     return;
  //   }
  //   const interval = setInterval(() => {
  //     setProgress((prev) => prev + progressStep);
  //   }, progressStep);
  //   return () => clearInterval(interval);
  // }, [duration, phaseName, active]);

  const phaseText = phaseTexts[phaseName];

  const r = 40;

  return (
    <div
      className={`rounded-full bg-green-600 text-green-200 flex items-center justify-center relative transition-all duration-100 ${
        active ? "size-56 bg-green-600" : "size-24 bg-green-600/50"
      }`}
      style={
        active
          ? {
              backgroundImage: `radial-gradient(circle at 50% 50%, rgba(0, 0, 0, 0.1) 0%, rgba(0, 0, 0, 0) 100%)`,
            }
          : {}
      }
    >
      {active && (
        <>
          <motion.div
            className="absolute inset-0 bg-green-500 rounded-full transition-size flex items-center justify-center"
            // style={{
            //   transform: `scale(${
            //     phaseName === "hold"
            //       ? 1
            //       : phaseName === "inhale"
            //       ? progress / duration
            //       : 1 - progress / duration
            //   })`,
            //   transitionDuration: `${progressStep}ms`,
            // }}
            initial={phaseName === "inhale" ? { scale: 0 } : { scale: 1 }}
            animate={
              phaseName === "hold" || phaseName === "inhale"
                ? { scale: 1 }
                : { scale: 0 }
            }
            exit={
              phaseName === "hold" || phaseName === "inhale"
                ? { scale: 1 }
                : { scale: 0 }
            }
            transition={{ duration: duration / 1000, ease: "linear" }}
          >
            {phaseName === "hold" && (
              <AnimatePresence>
                <motion.svg
                  className="size-56 text-green-600"
                  viewBox="0 0 100 100"
                  key={phaseName}
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.5 }}
                >
                  {/* <circle
                    cx="50"
                    cy="50"
                    r={r}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={"8"}
                    strokeDasharray={`${
                      (1 - progress / duration) * 2 * Math.PI * r
                    }, ${2 * Math.PI * r}`}
                    transform="rotate(-90) translate(-100, 0)"
                  /> */}
                  <motion.circle
                    cx="50"
                    cy="50"
                    r={r}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={"8"}
                    // strokeDasharray={`${
                    //   (1 - progress / duration) * 2 * Math.PI * r
                    // }, ${2 * Math.PI * r}`}
                    strokeDasharray={`${2 * Math.PI * r}, ${2 * Math.PI * r}`}
                    transform="rotate(-90) translate(-100, 0)"
                    initial={{ strokeDashoffset: 0 }}
                    animate={{ strokeDashoffset: 2 * Math.PI * r }}
                    exit={{ strokeDashoffset: 0 }}
                    transition={{ duration: duration / 1000, ease: "linear" }}
                  />
                </motion.svg>
              </AnimatePresence>
            )}
          </motion.div>
          <div className="text-3xl font-bold absolute inset-0 flex flex-col gap-3 items-center justify-center">
            {/* <FormatTime value={remaining} /> */}
            <span>{phaseText.title}</span>
            {showMessages && (
              <div className="text-center w-40 text-sm text-green-100/60">
                <PhaseMessages
                  key={phaseName}
                  messages={phaseText.messages}
                  duration={duration}
                />
              </div>
            )}
          </div>
        </>
      )}
      {!active && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div
            className={cn(
              "text-green-800 font-playwrite",
              iteration === 0 ? "text-xl" : "text-xl"
            )}
          >
            {iteration === 0 ? "Start" : iteration}
          </div>
        </div>
      )}
    </div>
  );
}

const maxIterations = 4;

function adjustPhase(phase: Phase) {
  return { ...phase, duration: phase.duration };
}

interface BreathProps {
  iterations?: number;
  status: "active" | "completed";
  firstSession?: boolean;
  onCompleted?: () => void;
}

export function Breath({
  iterations = maxIterations,
  status,
  onCompleted,
  firstSession = false,
}: BreathProps) {
  const [phaseIdx, setPhaseIdx] = useState<number>(-1);
  const phase = adjustPhase(
    phaseIdx === -1 ? initialPhase : phases[phaseIdx % phases.length]
  );

  const isActive = status === "active";
  useEffect(() => {
    if (!isActive) {
      return;
    }
    const timeout = setTimeout(() => {
      setPhaseIdx((prev) => prev + 1);
    }, phase.duration);
    return () => clearTimeout(timeout);
  }, [phaseIdx, isActive]);

  useEffect(() => {
    if (status === "completed") {
      setPhaseIdx(-1);
    }
  }, [status]);

  useEffect(() => {
    if (phaseIdx === iterations * phases.length) {
      onCompleted?.();
    }
  }, [phaseIdx, iterations]);

  const iteration =
    phaseIdx === -1
      ? 0
      : (Math.floor(phaseIdx / phases.length) % iterations) + 1;

  return (
    <div className="flex flex-col items-center justify-center font-inter pt-4 w-full">
      <div className="flex gap-4 items-center relative w-full h-56 overflow-hidden">
        <motion.div
          className="absolute inset-0 flex gap-4 items-center justify-center"
          initial={{ x: 0 }}
          animate={{ x: `${(-iteration + iterations / 2) * 7}rem` }}
          exit={{ x: 0 }}
        >
          {Array.from({ length: iterations + 1 }).map((_, i) => (
            <div
              key={i}
              style={{
                opacity: 0.05 + 0.95 * (1 - Math.abs(i - iteration) / 6),
              }}
            >
              <ProgressIndicator
                active={isActive && i === iteration}
                iteration={i}
                duration={phase.duration}
                phaseName={phase.name}
                showMessages={iteration < 2 && firstSession}
              />
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
