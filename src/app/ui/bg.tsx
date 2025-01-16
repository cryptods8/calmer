"use client";

export function Bg({ children }: { children: React.ReactNode }) {
  return <div className="bg-gradient-to-t from-green-800 to-green-700 text-green-100">{children}</div>;
}
