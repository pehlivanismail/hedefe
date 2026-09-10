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
  
  const [wrongQ, setWrongQ] = useState<Record<string, string>>({});
  const [blankQ, setBlankQ] = useState<Record<string, string>>({});

  const template = EXAM_TEMPLATES.find(t => t.id === templateId);

  const parseQuestions = (input: string) => {
    if (!input) return [];
    return input.split(',').map(s => parseInt(s.trim(), 10)).filter(n => !isNaN(n));
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

    // Her bucket (bölüm) için kontrolleri ve hesaplamaları yap
    const buckets = Array.from(new Set(template.questions.map(q => DOMAIN_MAP[q.domain]).filter(Boolean))) as ("turkce" | "sosyal" | "matematik" | "fen")[];

    for (const bucket of buckets) {
      const wrongList = parseQuestions(wrongQ[bucket] || "");
      const blankList = parseQuestions(blankQ[bucket] || "");

      const intersection = wrongList.filter(x => blankList.includes(x));
      if (intersection.length > 0) {
        toast.error(`${BUCKET_LABELS[bucket]} testinde soru hem yanlış hem boş olamaz: ${intersection.join(', ')}`);
        return;
      }

      const bucketQuestions = template.questions.filter(q => DOMAIN_MAP[q.domain] === bucket);
      
      const maxQ = Math.max(...bucketQuestions.map(q => q.qNum));
      const minQ = Math.min(...bucketQuestions.map(q => q.qNum));

      const outOfBounds = [...wrongList, ...blankList].filter(q => q < minQ || q > maxQ);
      if (outOfBounds.length > 0) {
        toast.error(`${BUCKET_LABELS[bucket]} testi için geçersiz soru numaraları (${minQ}-${maxQ} arası olmalı): ${outOfBounds.join(', ')}`);
        return;
      }
      
      const internalDomain = bucket;

      for (const qData of bucketQuestions) {
        if (!qData.topicId) continue;
        
        totals[internalDomain].total++;

        if (wrongList.includes(qData.qNum)) {
          totals[internalDomain].wrong++;
          logs.push({ topicId: qData.topicId, status: "wrong" });
        } else if (blankList.includes(qData.qNum)) {
          totals[internalDomain].blank++;
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

  const domains = template ? Array.from(new Set(template.questions.map(q => q.domain))) : [];
  const uniqueCategories = Array.from(new Set(EXAM_TEMPLATES.map(t => t.category))).filter(Boolean).sort();
  const filteredTemplates = EXAM_TEMPLATES.filter(t => t.category === categoryId);

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Deneme Kategorisi</Label>
        <Select value={categoryId} onValueChange={(val) => { setCategoryId(val); setTemplateId(""); }}>
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
          <Select value={templateId} onValueChange={setTemplateId}>
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
        <div className="space-y-6 pt-4 border-t border-border">
          {(Array.from(new Set(template.questions.map(q => DOMAIN_MAP[q.domain]).filter(Boolean))) as ("turkce" | "sosyal" | "matematik" | "fen")[]).map((bucket) => {
            const bucketQuestions = template.questions.filter(q => DOMAIN_MAP[q.domain] === bucket);
            const bucketCount = bucketQuestions.length;
            const minQ = Math.min(...bucketQuestions.map(q => q.qNum));
            const maxQ = Math.max(...bucketQuestions.map(q => q.qNum));
            return (
              <div key={bucket} className="space-y-3">
                <h4 className="font-semibold text-brand-deep text-sm">{BUCKET_LABELS[bucket]} <span className="font-normal text-muted-foreground">({bucketCount} Soru, No: {minQ}-{maxQ})</span></h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs">Yanlış Sorular</Label>
                    <Input
                      value={wrongQ[bucket] || ""}
                      placeholder="Ör: 5, 12, 17"
                      onChange={(e) => setWrongQ(prev => ({ ...prev, [bucket]: e.target.value }))}
                      className="text-sm"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Boş Sorular</Label>
                    <Input
                      value={blankQ[bucket] || ""}
                      placeholder="Ör: 20"
                      onChange={(e) => setBlankQ(prev => ({ ...prev, [bucket]: e.target.value }))}
                      className="text-sm"
                    />
                  </div>
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
