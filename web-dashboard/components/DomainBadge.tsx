"use client";

import { Domain } from "@/lib/types";
import { DOMAIN_COLORS, DOMAIN_LABELS } from "@/lib/constants";

interface DomainBadgeProps {
  domain: Domain;
}

export function DomainBadge({ domain }: DomainBadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${DOMAIN_COLORS[domain]}`}
    >
      {DOMAIN_LABELS[domain]}
    </span>
  );
}
