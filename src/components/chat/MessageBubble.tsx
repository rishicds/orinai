"use client";

import clsx from "clsx";
import { ReactNode } from "react";

interface MessageBubbleProps {
  role: "user" | "assistant" | "system";
  children: ReactNode;
}

export function MessageBubble({ role, children }: MessageBubbleProps) {
  const isUser = role === "user";

  return (
    <div className={clsx("flex", isUser ? "justify-end" : "justify-start")}>
      <div
        className={clsx(
          "rounded-2xl px-5 py-3 text-sm shadow-md border max-w-[85%] sm:max-w-[75%]",
          isUser
            ? "bg-gradient-to-br from-blue-500 to-blue-600 text-white border-blue-400/30 shadow-blue-500/20"
            : "bg-slate-800/60 backdrop-blur-sm text-slate-100 border-slate-700/50 shadow-slate-900/50"
        )}
      >
        {children}
      </div>
    </div>
  );
}
