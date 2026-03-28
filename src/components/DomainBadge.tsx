import { Domain, DOMAIN_COLORS } from "@/lib/data";

interface DomainBadgeProps {
  domain: Domain;
}

const DomainBadge = ({ domain }: DomainBadgeProps) => {
  const colors = DOMAIN_COLORS[domain];
  const label = domain.replace(/_/g, " ");

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-sm font-display text-[11px] uppercase tracking-wider ${colors.bg} ${colors.text}`}
    >
      {label}
    </span>
  );
};

export default DomainBadge;
