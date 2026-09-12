import { useState } from "react";
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
import { EXAM_TEMPLATES } from "@/lib/exam-templates";
import { type MockExam } from "@/lib/demo-data";
import { netOf } from "@/lib/exam-config";
import { cn } from "@/lib/utils";

const DOMAIN_MAP: Record<string, "turkce" | "sosyal" | "matematik" | "fen"> = {
  // TYT
  "Türkçe": "turkce",
  "Sosyal Bilimler": "sosyal",
  "Temel Matematik": "matematik",
  "Fen Bilimleri": "fen",
  // AI & AYT
  "Biyoloji": "fen",
  "Coğrafya": "sosyal",
  "Din Kültürü ve Ahlak Bilgisi": "sosyal",
  "Felsefe": "sosyal",
  "Fizik": "fen",
  "Geometri": "matematik",
  "Kimya": "fen",
  "Matematik": "matematik",
  "Tarih": "sosyal",
  "Türk Dili ve Edebiyatı": "turkce",
};

const BUCKET_LABELS: Record<string, string> = {
  turkce: "Türkçe / Edebiyat",
  sosyal: "Sosyal Bilimler",
  matematik: "Matematik",
  fen: "Fen Bilimleri",
};

type Mark = "wrong" | "blank" | null;

export function DetailedMockExamForm({
  onSave,
  submitLabel = "Kaydet",
  solvedTemplateIds = [],
}: {
  onSave: (exam: Omit<MockExam, "id">, logs: { topicId: string, status: "correct" | "wrong" | "blank" }[]) => void;
  submitLabel?: string;
  solvedTemplateIds?: string[];
}) {
  const [categoryId, setCategoryId] = useState<string>("");
  const [templateId, setTemplateId] = useState<string>("");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));

  // bucket -> qNum -> mark
  const [marks, setMarks] = useState<Record<string, Record<number, Mark>>>({});

  const template = EXAM_TEMPLATES.find(t => t.id === templateId);

  const markOf = (bucket: string, qNum: number): Mark => marks[bucket]?.[qNum] ?? null;

  const cycleMark = (bucket: string, qNum: number) => {
    setMarks(prev => {
      const bucketMarks = { ...(prev[bucket] ?? {}) };
      const current = bucketMarks[qNum] ?? null;
      const next: Mark = current === null ? "wrong" : current === "wrong" ? "blank" : null;
      if (next === null) delete bucketMarks[qNum];
      else bucketMarks[qNum] = next;
      return { ...prev, [bucket]: bucketMarks };
    });
  };

  const handleSave = () => {
    if (!template) {
      toast.error("Lütfen bir sınav şablonu seçin");
      return;
    }

    const totals = {
      turkce: { total: 0, wrong: 0, blank: 0 },
      sosyal: { total: 0, wrong: 0, blank: 0 },
      matematik: { total: 0, wrong: 0, blank: 0 },
      fen: { total: 0, wrong: 0, blank: 0 },
    };

    const logs: { topicId: string, status: "correct" | "wrong" | "blank" }[] = [];

    const buckets = Array.from(new Set(template.questions.map(q => DOMAIN_MAP[q.domain]).filter(Boolean))) as ("turkce" | "sosyal" | "matematik" | "fen")[];

    for (const bucket of buckets) {
      const bucketQuestions = template.questions.filter(q => DOMAIN_MAP[q.domain] === bucket);

      for (const qData of bucketQuestions) {
        if (!qData.topicId) continue;

        totals[bucket].total++;
        const mark = markOf(bucket, qData.qNum);

        if (mark === "wrong") {
          totals[bucket].wrong++;
          logs.push({ topicId: qData.topicId, status: "wrong" });
        } else if (mark === "blank") {
          totals[bucket].blank++;
          logs.push({ topicId: qData.topicId, status: "blank" });
        } else {
          logs.push({ topicId: qData.topicId, status: "correct" });
        }
      }
    }

    const examData: Omit<MockExam, "id"> = {
      date: new Date(date).toLocaleDateString("tr-TR"),
      publisher: template.name,
      type: template.examScope as "TYT" | "AYT",
      turkce: netOf(totals.turkce.total, totals.turkce.wrong, totals.turkce.blank),
      matematik: netOf(totals.matematik.total, totals.matematik.wrong, totals.matematik.blank),
      sosyal: netOf(totals.sosyal.total, totals.sosyal.wrong, totals.sosyal.blank),
      fen: netOf(totals.fen.total, totals.fen.wrong, totals.fen.blank),
      templateId: template.id,
      detailedLogs: logs,
    };

    onSave(examData, logs);
  };

  const uniqueCategories = Array.from(new Set(EXAM_TEMPLATES.map(t => t.category))).filter(Boolean).sort();
  const filteredTemplates = EXAM_TEMPLATES.filter(t => t.category === categoryId);

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Deneme Kategorisi</Label>
        <Select value={categoryId} onValueChange={(val) => { setCategoryId(val); setTemplateId(""); setMarks({}); }}>
          <SelectTrigger>
            <SelectValue placeholder="Bir kategori seçin" />
          </SelectTrigger>
          <SelectContent>
            {uniqueCategories.map(cat => (
              <SelectItem key={cat} value={cat}>{cat}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {categoryId && (
        <div className="space-y-2">
          <Label>Sınav Şablonu (Detaylı Analiz)</Label>
          <Select value={templateId} onValueChange={(val) => { setTemplateId(val); setMarks({}); }}>
            <SelectTrigger>
              <SelectValue placeholder="Bir sınav şablonu seçin" />
            </SelectTrigger>
            <SelectContent>
              {filteredTemplates.map(t => {
                const isSolved = solvedTemplateIds.includes(t.id);
                return (
                  <SelectItem key={t.id} value={t.id}>
                    {isSolved ? "✅ " : ""}{t.name}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="space-y-2">
        <Label>Tarih</Label>
        <Input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
      </div>

      {template && (
        <div className="flex items-center gap-4 rounded-xl bg-secondary/60 px-3 py-2 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="size-3 rounded-sm bg-destructive/80" /> Yanlış
          </span>
          <span className="flex items-center gap-1.5">
            <span className="size-3 rounded-sm bg-amber-400/80" /> Boş
          </span>
          <span className="ml-auto">İşareti kaldırmak için tekrar tıkla</span>
        </div>
      )}

      {template && (
        <div className="space-y-6 pt-2">
          {(Array.from(new Set(template.questions.map(q => DOMAIN_MAP[q.domain]).filter(Boolean))) as ("turkce" | "sosyal" | "matematik" | "fen")[]).map((bucket) => {
            const bucketQuestions = template.questions.filter(q => DOMAIN_MAP[q.domain] === bucket);
            const bucketCount = bucketQuestions.length;
            const minQ = Math.min(...bucketQuestions.map(q => q.qNum));
            const maxQ = Math.max(...bucketQuestions.map(q => q.qNum));
            const wrongCount = Object.values(marks[bucket] ?? {}).filter(m => m === "wrong").length;
            const blankCount = Object.values(marks[bucket] ?? {}).filter(m => m === "blank").length;
            return (
              <div key={bucket} className="space-y-3">
                <h4 className="font-semibold text-brand-deep text-sm">
                  {BUCKET_LABELS[bucket]}{" "}
                  <span className="font-normal text-muted-foreground">
                    ({bucketCount} Soru, No: {minQ}-{maxQ})
                  </span>
                  {(wrongCount > 0 || blankCount > 0) && (
                    <span className="ml-2 text-xs font-normal text-muted-foreground">
                      · {wrongCount} yanlış, {blankCount} boş
                    </span>
                  )}
                </h4>
                <div className="grid grid-cols-8 gap-1.5 sm:grid-cols-10">
                  {Array.from({ length: maxQ - minQ + 1 }, (_, i) => minQ + i).map(qNum => {
                    const mark = markOf(bucket, qNum);
                    return (
                      <button
                        key={qNum}
                        type="button"
                        onClick={() => cycleMark(bucket, qNum)}
                        className={cn(
                          "h-8 rounded-md border text-xs font-medium transition-colors",
                          mark === "wrong" && "border-destructive bg-destructive text-destructive-foreground",
                          mark === "blank" && "border-amber-400 bg-amber-400 text-amber-950",
                          mark === null && "border-border bg-background text-muted-foreground hover:border-brand hover:text-foreground",
                        )}
                      >
                        {qNum}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {template && (
        <div className="flex items-center gap-2 rounded-xl bg-secondary/60 px-3 py-2 text-xs text-muted-foreground">
          <Clock className="size-3.5" />
          Toplam {template.questions.length} Soru
        </div>
      )}

      <Button className="w-full rounded-xl" onClick={handleSave}>
        {submitLabel}
      </Button>
    </div>
  );
}
