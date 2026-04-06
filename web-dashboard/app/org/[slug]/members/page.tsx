"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  Users,
  UserPlus,
  Mail,
  Clock,
  Shield,
  ShieldCheck,
  User,
  X,
  Copy,
  Check,
  Trash2,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Member {
  id: string;
  user_id: string;
  role: string;
  joined_at: string;
  email?: string;
  display_name?: string;
}

interface Invitation {
  id: string;
  email: string;
  role: string;
  invite_code: string;
  created_at: string;
  accepted_at: string | null;
  expires_at: string;
}

const ROLE_ICONS: Record<string, typeof Shield> = {
  admin: ShieldCheck,
  manager: Shield,
  member: User,
};

const ROLE_COLORS: Record<string, string> = {
  admin: "text-primary bg-primary/10",
  manager: "text-amber-400 bg-amber-400/10",
  member: "text-zinc-400 bg-zinc-400/10",
};

export default function OrgMembersPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [members, setMembers] = useState<Member[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("member");
  const [inviting, setInviting] = useState(false);
  const [inviteResult, setInviteResult] = useState<{ url?: string; error?: string } | null>(null);
  const [copied, setCopied] = useState(false);

  const loadData = () => {
    fetch(`/api/org/${slug}/members`).then((r) => r.json()).then(setMembers);
    fetch(`/api/org/${slug}/invitations`).then((r) => r.json()).then(setInvitations);
  };

  useEffect(() => { loadData(); }, [slug]);

  const sendInvite = async () => {
    setInviting(true);
    setInviteResult(null);
    const res = await fetch(`/api/org/${slug}/invitations`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: inviteEmail, role: inviteRole }),
    });
    const data = await res.json();
    setInviting(false);
    if (res.ok) {
      setInviteResult({ url: data.invite_url });
      setInviteEmail("");
      loadData();
    } else {
      setInviteResult({ error: data.error });
    }
  };

  const changeRole = async (memberId: string, newRole: string) => {
    await fetch(`/api/org/${slug}/members`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ member_id: memberId, role: newRole }),
    });
    loadData();
  };

  const removeMember = async (memberId: string) => {
    if (!confirm("Remove this member from the organization?")) return;
    await fetch(`/api/org/${slug}/members`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ member_id: memberId }),
    });
    loadData();
  };

  const pendingInvites = invitations.filter((i) => !i.accepted_at);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Users className="w-6 h-6 text-primary" />
            Team Members
          </h1>
          <p className="text-sm text-zinc-500 mt-1">
            {members.length} member{members.length !== 1 ? "s" : ""} in your organization
          </p>
        </div>
        <button
          onClick={() => setShowInviteModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-white text-sm font-medium
                     shadow-lg shadow-primary/25 hover:bg-primary/90 transition-all"
        >
          <UserPlus className="w-4 h-4" />
          Invite Member
        </button>
      </div>

      {/* Members table */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <div className="grid grid-cols-[1fr_120px_140px_80px] gap-4 px-5 py-3 border-b border-border text-[10px] uppercase tracking-wider text-zinc-600 font-medium">
          <span>Member</span>
          <span>Role</span>
          <span>Joined</span>
          <span />
        </div>
        {members.map((m) => {
          const RoleIcon = ROLE_ICONS[m.role] || User;
          return (
            <div
              key={m.id}
              className="grid grid-cols-[1fr_120px_140px_80px] gap-4 px-5 py-3.5 border-b border-border last:border-0
                         hover:bg-zinc-800/30 transition-colors items-center"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold shrink-0">
                  {(m.display_name || m.email || "?")[0].toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">
                    {m.display_name || m.email?.split("@")[0] || "Unknown"}
                  </p>
                  <p className="text-[11px] text-zinc-600 truncate">{m.email}</p>
                </div>
              </div>

              <div className="relative group">
                <select
                  value={m.role}
                  onChange={(e) => changeRole(m.id, e.target.value)}
                  className={cn(
                    "appearance-none text-xs font-medium px-2.5 py-1 rounded-lg cursor-pointer border-0",
                    "focus:outline-none focus:ring-1 focus:ring-primary/30",
                    ROLE_COLORS[m.role]
                  )}
                >
                  <option value="admin">Admin</option>
                  <option value="manager">Manager</option>
                  <option value="member">Member</option>
                </select>
              </div>

              <span className="text-xs text-zinc-600">
                {new Date(m.joined_at).toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>

              <button
                onClick={() => removeMember(m.id)}
                className="text-zinc-700 hover:text-red-400 transition-colors p-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>

      {/* Pending invitations */}
      {pendingInvites.length > 0 && (
        <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-6">
          <h3 className="text-sm font-semibold text-amber-400 flex items-center gap-2 mb-4">
            <Mail className="w-4 h-4" />
            Pending Invitations ({pendingInvites.length})
          </h3>
          <div className="space-y-2">
            {pendingInvites.map((inv) => (
              <div key={inv.id} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-3">
                  <Clock className="w-3.5 h-3.5 text-amber-500/50" />
                  <span className="text-zinc-400">{inv.email}</span>
                  <span className={cn("text-[10px] font-medium px-2 py-0.5 rounded", ROLE_COLORS[inv.role])}>
                    {inv.role}
                  </span>
                </div>
                <span className="text-[10px] text-zinc-600">
                  Expires {new Date(inv.expires_at).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-card border border-border rounded-2xl p-6 shadow-2xl animate-slide-in-right">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-primary" />
                Invite Team Member
              </h2>
              <button onClick={() => { setShowInviteModal(false); setInviteResult(null); }}>
                <X className="w-5 h-5 text-zinc-500 hover:text-zinc-300" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs text-zinc-500 block mb-1.5">Email Address</label>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="colleague@company.com"
                  className="w-full px-4 py-2.5 bg-black/20 border border-border rounded-xl text-sm
                             focus:outline-none focus:ring-2 focus:ring-primary/30 placeholder:text-zinc-700"
                />
              </div>

              <div>
                <label className="text-xs text-zinc-500 block mb-1.5">Role</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { value: "member", label: "Member", desc: "Can use boosts" },
                    { value: "manager", label: "Manager", desc: "Can manage rules & invite" },
                    { value: "admin", label: "Admin", desc: "Full access" },
                  ].map((r) => (
                    <button
                      key={r.value}
                      onClick={() => setInviteRole(r.value)}
                      className={cn(
                        "rounded-xl border p-3 text-left transition-all",
                        inviteRole === r.value
                          ? "border-primary/40 bg-primary/5"
                          : "border-border hover:border-primary/20"
                      )}
                    >
                      <div className="text-xs font-medium">{r.label}</div>
                      <div className="text-[10px] text-zinc-600 mt-0.5">{r.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {inviteResult?.error && (
                <p className="text-xs text-red-400 bg-red-400/10 rounded-xl px-3 py-2">{inviteResult.error}</p>
              )}

              {inviteResult?.url && (
                <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-3">
                  <p className="text-xs text-emerald-400 font-medium mb-2">Invitation sent! Share this link:</p>
                  <div className="flex gap-2">
                    <code className="flex-1 text-[11px] bg-black/30 rounded-lg px-3 py-1.5 text-zinc-400 truncate">
                      {inviteResult.url}
                    </code>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(inviteResult.url!);
                        setCopied(true);
                        setTimeout(() => setCopied(false), 2000);
                      }}
                      className="p-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 transition-colors"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-emerald-400" />}
                    </button>
                  </div>
                </div>
              )}

              <button
                onClick={sendInvite}
                disabled={!inviteEmail || inviting}
                className={cn(
                  "w-full py-2.5 rounded-xl text-sm font-medium transition-all",
                  inviteEmail
                    ? "bg-primary text-white shadow-lg shadow-primary/25 hover:bg-primary/90"
                    : "bg-zinc-800 text-zinc-500 cursor-not-allowed"
                )}
              >
                {inviting ? "Sending..." : "Send Invitation"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
