"use client";

import { useState, useRef, useEffect } from "react";

export function InfoTooltip({ text }: { text: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <div className="relative inline-block" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="inline-flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold border border-zinc-600 text-zinc-400 hover:text-zinc-200 hover:border-zinc-400 transition-colors ml-2 shrink-0 normal-case"
        aria-label="More info"
      >
        i
      </button>
      {open && (
        <div className="absolute z-50 top-8 right-0 w-72 bg-zinc-800 border border-zinc-600 rounded-lg p-3.5 text-xs text-zinc-300 leading-relaxed shadow-2xl normal-case font-normal tracking-normal">
          <div className="absolute -top-1.5 right-4 w-3 h-3 bg-zinc-800 border-l border-t border-zinc-600 rotate-45" />
          {text}
        </div>
      )}
    </div>
  );
}
