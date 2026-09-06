import { useEffect, useMemo, useState } from "react";
import { Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  EXAM_DURATION,
  formatDuration,
  netOf,
  sectionsFor,
  type ExamKind,
  type NetBucket,
} from "@/lib/exam-config";
import { TRACK_LABELS, type MockExam, type Track } from "@/lib/demo-data";

type Cell = { wrong: string; blank: string; done: boolean };

export function MockExamForm({
  track,
  onSave,
  submitLabel = "Kaydet",
  fixedKind,
  onlySubject,
}: {
  track: Track;
  onSave: (e: Omit<MockExam, "id">) => void;
  submitLabel?: string;
  /** TYT / AYT denemesi ödevlerinde tür kilitli gelir */
  fixedKind?: ExamKind;
  /** Branş denemesi: sadece bu dersin bölümü gösterilir */
  onlySubject?: string;
}) {
  const [kind, setKind] = useState<ExamKind>(fixedKind ?? "TYT");
  const [publisher, setPublisher] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [cells, setCells] = useState<Record<string, Cell>>({});

  useEffect(() => {
    if (fixedKind) setKind(fixedKind);
  }, [fixedKind]);

  const sections = useMemo(() => {
    const all = sectionsFor(kind, track);
    if (!onlySubject) return all;
    const norm = (s: string) => s.toLocaleLowerCase("tr");
    const filtered = all.filter((s) => norm(s.label) === norm(onlySubject));
    return filtered.length ? filtered : all;
  }, [kind, track, onlySubject]);

  const cell = (key: string) =>
    cells[key] ?? { wrong: "", blank: "", done: true };
  const setCell = (key: string, patch: Partial<Cell>) =>
    setCells((prev) => ({ ...prev, [key]: { ...cell(key), ...patch } }));

  const netFor = (key: string, questions: number) => {
    const c = cell(key);
    if (!c.done) return 0;
    return netOf(questions, Number(c.wrong) || 0, Number(c.blank) || 0);
  };

  const activeSections = sections.filter((s) => cell(s.key).done);

  const totals = sections.reduce(
    (acc, s) => {
      const n = netFor(s.key, s.questions);
      acc[s.bucket] += n;
      acc.total += n;
      return acc;
    },
    { turkce: 0, matematik: 0, sosyal: 0, fen: 0, total: 0 } as Record<
      NetBucket | "total",
      number
    >,
  );

  const round = (n: number) => Math.round(n * 100) / 100;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label>Sınav Türü</Label>
          <Select
            value={kind}
            onValueChange={(v) => setKind(v as ExamKind)}
            disabled={!!fixedKind}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="TYT">TYT</SelectItem>
              <SelectItem value="AYT">AYT — {TRACK_LABELS[track]}</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Tarih</Label>
          <Input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Kurum / Yayın</Label>
        <Input
          value={publisher}
          placeholder="Ör: Endemik Yayınları"
          onChange={(e) => setPublisher(e.target.value)}
        />
      </div>

      <div className="flex items-center gap-2 rounded-xl bg-secondary/60 px-3 py-2 text-xs text-muted-foreground">
        <Clock className="size-3.5" />
        {kind} standart süresi: {formatDuration(EXAM_DURATION[kind])} ·{" "}
        {activeSections.reduce((s, x) => s + x.questions, 0)} soru
      </div>

      <div className="space-y-2">
        <div className="grid grid-cols-[1.6rem_1fr_4rem_4rem_3.5rem] items-center gap-2 px-1 text-[11px] font-semibold text-muted-foreground">
          <span className="text-center">✓</span>
          <span>Ders (soru)</span>
          <span className="text-center">Yanlış</span>
          <span className="text-center">Boş</span>
          <span className="text-right">Net</span>
        </div>
        <div className="max-h-64 space-y-2 overflow-y-auto rounded-xl border border-border p-3">
          {sections.map((s) => {
            const c = cell(s.key);
            return (
              <div
                key={s.key}
                className="grid grid-cols-[1.6rem_1fr_4rem_4rem_3.5rem] items-center gap-2"
              >
                <Checkbox
                  checked={c.done}
                  aria-label={`${s.label} çözdüm`}
                  onCheckedChange={(v) => setCell(s.key, { done: v === true })}
                />
                <span
                  className={
                    c.done
                      ? "text-sm font-medium"
                      : "text-sm font-medium text-muted-foreground line-through"
                  }
                >
                  {s.label}{" "}
                  <span className="text-xs text-muted-foreground">
                    ({s.questions})
                  </span>
                </span>
                {(["wrong", "blank"] as const).map((f) => (
                  <Input
                    key={f}
                    type="number"
                    min={0}
                    max={s.questions}
                    disabled={!c.done}
                    className="h-9 px-2 text-center"
                    value={c[f]}
                    onChange={(e) => setCell(s.key, { [f]: e.target.value })}
                  />
                ))}
                <span className="text-right font-display text-sm font-bold text-brand-deep">
                  {netFor(s.key, s.questions).toFixed(2)}
                </span>
              </div>
            );
          })}
        </div>
        <p className="text-right text-sm text-muted-foreground">
          Toplam net:{" "}
          <span className="font-display font-bold text-brand-deep">
            {totals.total.toFixed(2)}
          </span>
        </p>
      </div>

      <Button
        className="w-full rounded-xl"
        onClick={() => {
          if (!publisher.trim()) {
            toast.error("Kurum adı gerekli");
            return;
          }
          if (activeSections.length === 0) {
            toast.error("En az bir ders seçili olmalı");
            return;
          }
          const invalid = activeSections.find(
            (s) =>
              (Number(cell(s.key).wrong) || 0) +
                (Number(cell(s.key).blank) || 0) >
              s.questions,
          );
          if (invalid) {
            toast.error(
              `${invalid.label} bölümünde yanlış + boş, ${invalid.questions} soruyu geçemez`,
            );
            return;
          }
          onSave({
            date: new Date(date).toLocaleDateString("tr-TR"),
            publisher: publisher.trim(),
            type: kind,
            turkce: round(totals.turkce),
            matematik: round(totals.matematik),
            sosyal: round(totals.sosyal),
            fen: round(totals.fen),
          });
          setCells({});
          setPublisher("");
        }}
      >
        {submitLabel}
      </Button>
    </div>
  );
}
