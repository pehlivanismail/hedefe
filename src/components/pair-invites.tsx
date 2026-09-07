import { useCallback, useEffect, useState } from "react";
import { Check, Loader2, Mail, X } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type InviteRow = {
  id: string;
  from_user: string;
  from_role: "student" | "coach";
  to_email: string;
  status: string;
  created_at: string;
};

type Props = {
  /** Bu paneli kullanan kişinin rolü. */
  role: "student" | "coach";
};

export function PairInvites({ role }: Props) {
  const { user, refresh } = useAuth();
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [incoming, setIncoming] = useState<InviteRow[]>([]);
  const [sent, setSent] = useState<InviteRow[]>([]);
  const [names, setNames] = useState<Record<string, string>>({});

  const load = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from("pair_invites")
      .select("id, from_user, from_role, to_email, status, created_at")
      .eq("status", "pending")
      .order("created_at", { ascending: false });
    const rows = (data ?? []) as InviteRow[];
    setSent(rows.filter((r) => r.from_user === user.id));
    setIncoming(rows.filter((r) => r.from_user !== user.id));

    const ids = [...new Set(rows.map((r) => r.from_user))];
    if (ids.length > 0) {
      const { data: profs } = await supabase
        .from("profiles")
        .select("id, full_name, email")
        .in("id", ids);
      setNames(
        Object.fromEntries(
          (profs ?? []).map((p) => [p.id, p.full_name || p.email]),
        ),
      );
    }
  }, [user]);

  useEffect(() => {
    void load();
  }, [load]);

  const targetLabel = role === "student" ? "Koç" : "Öğrenci";

  const invite = async () => {
    const clean = email.trim().toLowerCase();
    if (!clean || !clean.includes("@")) {
      toast.error("Geçerli bir e-posta yaz.");
      return;
    }
    if (!user) return;
    setBusy(true);
    const { error } = await supabase.from("pair_invites").insert({
      from_user: user.id,
      from_role: role,
      to_email: clean,
    });
    setBusy(false);
    if (error) {
      toast.error("Davet gönderilemedi.");
      return;
    }
    setEmail("");
    toast.success(`${targetLabel} daveti gönderildi.`);
    void load();
  };

  const respond = async (id: string, accept: boolean) => {
    setBusy(true);
    const { error } = await supabase.rpc("respond_pair_invite", {
      _invite_id: id,
      _accept: accept,
    });
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(accept ? "Eşleşme tamamlandı." : "Davet reddedildi.");
    await load();
    await refresh();
  };

  const cancel = async (id: string) => {
    await supabase.from("pair_invites").delete().eq("id", id);
    void load();
  };

  return (
    <Card className="rounded-3xl border-border p-6 shadow-soft">
      <p className="font-display text-lg font-bold text-brand-deep">
        {role === "student" ? "🤝 Koçumu Davet Et" : "🤝 Öğrenci Davet Et"}
      </p>
      <p className="mt-1 text-sm text-muted-foreground">
        {targetLabel} e-postasını yaz; karşı taraf onaylayınca eşleşme kurulur.
      </p>

      <div className="mt-4 flex flex-col sm:flex-row gap-2">
        <Input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={`${targetLabel.toLowerCase()}@ornek.com`}
          className="flex-1"
          type="email"
        />
        <Button onClick={invite} disabled={busy} className="rounded-full shrink-0">
          {busy ? (
            <Loader2 className="size-4 animate-spin mr-2" />
          ) : (
            <Mail className="size-4 mr-2" />
          )}
          Davet Gönder
        </Button>
      </div>

      {incoming.length > 0 && (
        <div className="mt-6 space-y-2">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Gelen davetler
          </p>
          {incoming.map((i) => (
            <div
              key={i.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border bg-brand-soft px-3 py-2"
            >
              <span className="text-sm font-medium text-brand-deep">
                {names[i.from_user] ?? "Bilinmeyen kullanıcı"} ·{" "}
                {i.from_role === "coach" ? "Koç" : "Öğrenci"}
              </span>
              <span className="flex gap-2">
                <Button
                  size="sm"
                  className="rounded-full"
                  disabled={busy}
                  onClick={() => respond(i.id, true)}
                >
                  <Check className="size-4" /> Kabul et
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="rounded-full"
                  disabled={busy}
                  onClick={() => respond(i.id, false)}
                >
                  <X className="size-4" /> Reddet
                </Button>
              </span>
            </div>
          ))}
        </div>
      )}

      {sent.length > 0 && (
        <div className="mt-6 space-y-2">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Gönderilen davetler
          </p>
          {sent.map((i) => (
            <div
              key={i.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border px-3 py-2"
            >
              <span className="text-sm text-muted-foreground">
                {i.to_email} · yanıt bekliyor
              </span>
              <Button
                size="sm"
                variant="ghost"
                className="rounded-full"
                onClick={() => cancel(i.id)}
              >
                Vazgeç
              </Button>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
