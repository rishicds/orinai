"use client";

import Link from "next/link";
import type { DashboardSublink } from "@/types";

interface SublinksPanelProps {
  sublinks?: DashboardSublink[];
}

export function SublinksPanel({ sublinks }: SublinksPanelProps) {
  if (!sublinks || sublinks.length === 0) {
    return null;
  }

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
      <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-400">
        Explore further
      </h3>
      <div className="mt-3 flex flex-wrap gap-2">
        {sublinks.map((link) => (
          <Link
            key={link.route}
            href={link.route}
            className="rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-slate-200 transition hover:border-blue-500 hover:text-blue-400"
          >
            {link.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
