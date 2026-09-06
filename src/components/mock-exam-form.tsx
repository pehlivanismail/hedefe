import { useMemo, useState } from "react";
import { Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
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

type Cell = { wrong: string; blank: string };

export function MockExamForm({
  track,
  onSave,
  submitLabel = "Kaydet",
}: {
  track: Track;
  onSave: (e: Omit<MockExam, "id">) => void;
  submitLabel?: string;
}) {
  const [kind, setKind] = useState<ExamKind>("TYT");
  const [publisher, setPublisher] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [cells, setCells] = useState<Record<string, Cell>>({});

  const sections = useMemo(() => sectionsFor(kind, track), [kind, track]);

  const cell = (key: string) => cells[key] ?? { wrong: "", blank: "" };
  const netFor = (key: string, questions: number) => {
    const c = cell(key);
    return netOf(questions, Number(c.wrong) || 0, Number(c.blank) || 0);
  };

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
          <Select value={kind} onValueChange={(v) => setKind(v as ExamKind)}>
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
        {sections.reduce((s, x) => s + x.questions, 0)} soru
      </div>

      <div className="space-y-2">
        <div className="grid grid-cols-[1fr_4rem_4rem_3.5rem] items-center gap-2 px-1 text-[11px] font-semibold text-muted-foreground">
          <span>Bölüm (soru)</span>
          <span className="text-center">Yanlış</span>
          <span className="text-center">Boş</span>
          <span className="text-right">Net</span>
        </div>
        <div className="max-h-64 space-y-2 overflow-y-auto rounded-xl border border-border p-3">
          {sections.map((s) => (
            <div
              key={s.key}
              className="grid grid-cols-[1fr_4rem_4rem_3.5rem] items-center gap-2"
            >
              <span className="text-sm font-medium">
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
                  className="h-9 px-2 text-center"
                  value={cell(s.key)[f]}
                  onChange={(e) =>
                    setCells((prev) => ({
                      ...prev,
                      [s.key]: { ...cell(s.key), [f]: e.target.value },
                    }))
                  }
                />
              ))}
              <span className="text-right font-display text-sm font-bold text-brand-deep">
                {netFor(s.key, s.questions).toFixed(2)}
              </span>
            </div>
          ))}
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
          const invalid = sections.find(
            (s) =>
              (Number(cell(s.key).wrong) || 0) + (Number(cell(s.key).blank) || 0) >
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
