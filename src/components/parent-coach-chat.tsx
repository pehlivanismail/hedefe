import { useCallback, useEffect, useRef, useState } from "react";
import { Loader2, Send } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

type MessageRow = {
  id: string;
  student_id: string;
  parent_id: string;
  coach_id: string | null;
  sender_id: string;
  body: string;
  created_at: string;
};

type Props = {
  studentId: string;
  parentId: string | null;
  coachId: string | null;
  studentName: string;
};

function timeLabel(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString("tr-TR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function ParentCoachChat({
  studentId,
  parentId,
  coachId,
  studentName,
}: Props) {
  const { user } = useAuth();
  const [rows, setRows] = useState<MessageRow[]>([]);
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);
  const endRef = useRef<HTMLDivElement | null>(null);

  const load = useCallback(async () => {
    const { data } = await supabase
      .from("parent_messages")
      .select("id, student_id, parent_id, coach_id, sender_id, body, created_at")
      .eq("student_id", studentId)
      .order("created_at", { ascending: true });
    setRows((data ?? []) as MessageRow[]);
  }, [studentId]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "nearest" });
  }, [rows.length]);

  const missing = !parentId || !coachId;

  const send = async () => {
    const text = body.trim();
    if (!text || !user || !parentId || !coachId) return;
    setBusy(true);
    const { error } = await supabase.from("parent_messages").insert({
      student_id: studentId,
      parent_id: parentId,
      coach_id: coachId,
      sender_id: user.id,
      body: text,
    });
    setBusy(false);
    if (error) {
      toast.error("Mesaj gönderilemedi.");
      return;
    }
    setBody("");
    void load();
  };

  return (
    <Card className="rounded-3xl border-border p-6 shadow-soft">
      <p className="font-display text-lg font-bold text-brand-deep">
        💬 Koç ↔ Veli Mesajları
      </p>
      <p className="mt-1 text-sm text-muted-foreground">
        {studentName} hakkında notlar ve sorular.
      </p>

      {missing ? (
        <div className="mt-4 rounded-xl border border-dashed border-border px-4 py-6 text-center text-sm text-muted-foreground">
          {parentId
            ? "Öğrencinin henüz bir koçu yok; koç eşleşince mesajlaşma açılır."
            : "Öğrenciye bağlı bir veli yok."}
        </div>
      ) : (
        <>
          <div className="mt-4 max-h-80 space-y-3 overflow-y-auto pr-1">
            {rows.length === 0 && (
              <p className="rounded-xl bg-brand-soft px-4 py-6 text-center text-sm text-muted-foreground">
                Henüz mesaj yok. İlk mesajı sen yaz.
              </p>
            )}
            {rows.map((m) => {
              const mine = m.sender_id === user?.id;
              const fromParent = m.sender_id === m.parent_id;
              return (
                <div
                  key={m.id}
                  className={cn("flex", mine ? "justify-end" : "justify-start")}
                >
                  <div
                    className={cn(
                      "max-w-[80%] rounded-2xl px-4 py-2 text-sm shadow-soft",
                      mine
                        ? "bg-primary text-primary-foreground"
                        : "bg-brand-soft text-brand-deep",
                    )}
                  >
                    <span className="block text-[11px] opacity-70">
                      {mine ? "Sen" : fromParent ? "Veli" : "Koç"} ·{" "}
                      {timeLabel(m.created_at)}
                    </span>
                    <span className="whitespace-pre-wrap">{m.body}</span>
                  </div>
                </div>
              );
            })}
            <div ref={endRef} />
          </div>

          <div className="mt-4 flex flex-col gap-2 sm:flex-row">
            <Textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Mesajını yaz…"
              className="min-h-[70px] flex-1 rounded-xl"
            />
            <Button
              onClick={() => void send()}
              disabled={busy || !body.trim()}
              className="rounded-full sm:self-end"
            >
              {busy ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Send className="size-4" />
              )}
              Gönder
            </Button>
          </div>
        </>
      )}
    </Card>
  );
}
