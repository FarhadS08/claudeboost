"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  Activity,
  Zap,
  UserPlus,
  UserCheck,
  ScrollText,
  Settings,
  Key,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface LogEntry {
  id: string;
  action: string;
  details: Record<string, unknown>;
  created_at: string;
  email?: string;
  display_name?: string;
}

const ACTION_CONFIG: Record<string, { icon: typeof Zap; label: string; color: string }> = {
  boost:            { icon: Zap,        label: "Boosted a prompt",   color: "text-primary" },
  org_created:      { icon: Zap,        label: "Created organization", color: "text-emerald-400" },
  invite_sent:      { icon: UserPlus,   label: "Sent invitation",    color: "text-amber-400" },
  invite_accepted:  { icon: UserCheck,  label: "Joined the team",    color: "text-emerald-400" },
  rule_updated:     { icon: ScrollText, label: "Updated rules",      color: "text-violet-400" },
  settings_changed: { icon: Settings,   label: "Changed settings",   color: "text-blue-400" },
  api_key_generated:{ icon: Key,        label: "Generated API key",  color: "text-amber-400" },
  member_removed:   { icon: Trash2,     label: "Removed member",     color: "text-red-400" },
  role_changed:     { icon: Settings,   label: "Changed member role", color: "text-blue-400" },
};

export default function OrgActivityPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/org/${slug}/activity`)
      .then((r) => r.json())
      .then((data) => { setLogs(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-14 rounded-xl bg-card animate-pulse" />
        ))}
      </div>
    );
  }

  // Group by date
  const grouped: Record<string, LogEntry[]> = {};
  for (const log of logs) {
    const day = new Date(log.created_at).toLocaleDateString(undefined, {
      weekday: "long",
      month: "long",
      day: "numeric",
    });
    if (!grouped[day]) grouped[day] = [];
    grouped[day].push(log);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Activity className="w-6 h-6 text-primary" />
          Activity Log
        </h1>
        <p className="text-sm text-zinc-500 mt-1">
          Recent actions across your organization.
        </p>
      </div>

      {logs.length === 0 && (
        <div className="text-center py-16 rounded-2xl border border-border bg-card">
          <Activity className="w-10 h-10 text-zinc-700 mx-auto mb-3" />
          <h3 className="text-sm font-medium text-zinc-400">No activity yet</h3>
          <p className="text-xs text-zinc-600 mt-1">
            Actions like boosts, invitations, and rule changes will appear here.
          </p>
        </div>
      )}

      {Object.entries(grouped).map(([day, dayLogs]) => (
        <div key={day}>
          <h3 className="text-[10px] uppercase tracking-wider text-zinc-600 font-medium mb-2 px-1">
            {day}
          </h3>
          <div className="space-y-1">
            {dayLogs.map((log) => {
              const config = ACTION_CONFIG[log.action] || {
                icon: Activity,
                label: log.action,
                color: "text-zinc-400",
              };
              const Icon = config.icon;
              const userName = log.display_name || log.email?.split("@")[0] || "System";
              const details = log.details || {};

              return (
                <div
                  key={log.id}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl bg-card border border-border
                             hover:border-zinc-700 transition-colors"
                >
                  <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center bg-card", config.color)}>
                    <Icon className="w-4 h-4" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm">
                      <span className="font-medium text-zinc-300">{userName}</span>
                      <span className="text-zinc-500 ml-1.5">{config.label}</span>
                      {details.email ? (
                        <span className="text-zinc-600 ml-1">({String(details.email)})</span>
                      ) : null}
                      {details.domain ? (
                        <span className="text-zinc-600 ml-1">[{String(details.domain)}]</span>
                      ) : null}
                    </p>
                  </div>

                  <span className="text-[10px] text-zinc-600 shrink-0">
                    {new Date(log.created_at).toLocaleTimeString(undefined, {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
