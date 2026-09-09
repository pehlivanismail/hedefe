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
  "Türkçe": "turkce",
  "Sosyal Bilimler": "sosyal",
  "Temel Matematik": "matematik",
  "Fen Bilimleri": "fen",
};

export function DetailedMockExamForm({
  onSave,
  submitLabel = "Kaydet",
}: {
  onSave: (exam: Omit<MockExam, "id">, logs: { topicId: string, isWrong: boolean }[]) => void;
  submitLabel?: string;
}) {
  const [templateId, setTemplateId] = useState<string>("");
  const [publisher, setPublisher] = useState("");
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
    if (!publisher.trim()) {
      toast.error("Kurum/Yayın adı gerekli");
      return;
    }

    const totals = {
      turkce: { correct: 40, wrong: 0, blank: 0 },
      sosyal: { correct: 20, wrong: 0, blank: 0 },
      matematik: { correct: 40, wrong: 0, blank: 0 },
      fen: { correct: 20, wrong: 0, blank: 0 },
    };

    const logs: { topicId: string, isWrong: boolean }[] = [];

    // Her domain (test) için kontrolleri ve hesaplamaları yap
    const domains = Array.from(new Set(template.questions.map(q => q.domain)));

    for (const domain of domains) {
      const wrongList = parseQuestions(wrongQ[domain] || "");
      const blankList = parseQuestions(blankQ[domain] || "");

      const intersection = wrongList.filter(x => blankList.includes(x));
      if (intersection.length > 0) {
        toast.error(`${domain} testinde soru hem yanlış hem boş olamaz: ${intersection.join(', ')}`);
        return;
      }

      const domainQuestions = template.questions.filter(q => q.domain === domain);
      const maxQ = domainQuestions.length;

      const outOfBounds = [...wrongList, ...blankList].filter(q => q < 1 || q > maxQ);
      if (outOfBounds.length > 0) {
        toast.error(`${domain} testi için geçersiz soru numaraları (Maks ${maxQ}): ${outOfBounds.join(', ')}`);
        return;
      }

      const internalDomain = DOMAIN_MAP[domain];
      if (!internalDomain) continue;

      for (const q of wrongList) {
        const qData = domainQuestions.find(x => x.qNum === q);
        if (!qData) continue;
        
        totals[internalDomain].correct--;
        totals[internalDomain].wrong++;
        
        if (qData.topicId) {
          logs.push({ topicId: qData.topicId, isWrong: true });
        }
      }

      for (const q of blankList) {
        const qData = domainQuestions.find(x => x.qNum === q);
        if (!qData) continue;
        
        totals[internalDomain].correct--;
        totals[internalDomain].blank++;
        
        if (qData.topicId) {
          logs.push({ topicId: qData.topicId, isWrong: false });
        }
      }
    }

    const examData: Omit<MockExam, "id"> = {
      date: new Date(date).toLocaleDateString("tr-TR"),
      publisher: publisher.trim(),
      type: template.examScope as "TYT" | "AYT",
      turkce: netOf(40, totals.turkce.wrong, totals.turkce.blank),
      matematik: netOf(40, totals.matematik.wrong, totals.matematik.blank),
      sosyal: netOf(20, totals.sosyal.wrong, totals.sosyal.blank),
      fen: netOf(20, totals.fen.wrong, totals.fen.blank),
      templateId: template.id,
      detailedLogs: logs,
    };

    onSave(examData, logs);
  };

  const domains = template ? Array.from(new Set(template.questions.map(q => q.domain))) : [];

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Sınav Şablonu (Detaylı Analiz)</Label>
        <Select value={templateId} onValueChange={setTemplateId}>
          <SelectTrigger>
            <SelectValue placeholder="Bir sınav şablonu seçin" />
          </SelectTrigger>
          <SelectContent>
            {EXAM_TEMPLATES.map(t => (
              <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label>Tarih</Label>
          <Input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label>Kurum / Yayın</Label>
          <Input
            value={publisher}
            placeholder="Ör: Endemik Yayınları"
            onChange={(e) => setPublisher(e.target.value)}
          />
        </div>
      </div>

      {template && (
        <div className="space-y-6 pt-4 border-t border-border">
          {domains.map((domain) => {
            const domainCount = template.questions.filter(q => q.domain === domain).length;
            return (
              <div key={domain} className="space-y-3">
                <h4 className="font-semibold text-brand-deep text-sm">{domain} <span className="font-normal text-muted-foreground">({domainCount} Soru)</span></h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs">Yanlış Sorular</Label>
                    <Input
                      value={wrongQ[domain] || ""}
                      placeholder="Ör: 5, 12, 17"
                      onChange={(e) => setWrongQ(prev => ({ ...prev, [domain]: e.target.value }))}
                      className="text-sm"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Boş Sorular</Label>
                    <Input
                      value={blankQ[domain] || ""}
                      placeholder="Ör: 20"
                      onChange={(e) => setBlankQ(prev => ({ ...prev, [domain]: e.target.value }))}
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
