"use client";

import { Domain } from "@/lib/types";
import { DOMAIN_COLORS, DOMAIN_LABELS } from "@/lib/constants";

interface DomainBadgeProps {
  domain: Domain;
}

export function DomainBadge({ domain }: DomainBadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-xl text-xs font-medium border ${DOMAIN_COLORS[domain]}`}
    >
      {DOMAIN_LABELS[domain]}
    </span>
  );
}
