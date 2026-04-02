"use client";

import { Domain } from "@/lib/types";
import { DOMAIN_COLORS, DOMAIN_LABELS } from "@/lib/constants";

interface DomainBadgeProps {
  domain: Domain;
}

export function DomainBadge({ domain }: DomainBadgeProps) {
  const c = DOMAIN_COLORS[domain] || DOMAIN_COLORS.other;
  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-semibold tracking-wide border ${c.bg} ${c.text} ${c.border}`}
    >
      {DOMAIN_LABELS[domain]}
    </span>
  );
}
