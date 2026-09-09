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
  
  const [wrongQ, setWrongQ] = useState("");
  const [blankQ, setBlankQ] = useState("");

  const template = EXAM_TEMPLATES.find(t => t.id === templateId);

  const parseQuestions = (input: string) => {
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

    const wrongList = parseQuestions(wrongQ);
    const blankList = parseQuestions(blankQ);

    const intersection = wrongList.filter(x => blankList.includes(x));
    if (intersection.length > 0) {
      toast.error(`Soru hem yanlış hem boş olamaz: ${intersection.join(', ')}`);
      return;
    }

    const outOfBounds = [...wrongList, ...blankList].filter(q => q < 1 || q > template.questions.length);
    if (outOfBounds.length > 0) {
      toast.error(`Geçersiz soru numaraları: ${outOfBounds.join(', ')}`);
      return;
    }

    const totals = {
      turkce: { correct: 40, wrong: 0, blank: 0 },
      sosyal: { correct: 20, wrong: 0, blank: 0 },
      matematik: { correct: 40, wrong: 0, blank: 0 },
      fen: { correct: 20, wrong: 0, blank: 0 },
    };

    const logs: { topicId: string, isWrong: boolean }[] = [];

    for (const q of wrongList) {
      const qData = template.questions.find(x => x.qNum === q);
      if (!qData) continue;
      
      const domain = qData.domain.toLowerCase() as keyof typeof totals;
      if (totals[domain]) {
        totals[domain].correct--;
        totals[domain].wrong++;
      }
      
      if (qData.topicId) {
        logs.push({ topicId: qData.topicId, isWrong: true });
      }
    }

    for (const q of blankList) {
      const qData = template.questions.find(x => x.qNum === q);
      if (!qData) continue;
      
      const domain = qData.domain.toLowerCase() as keyof typeof totals;
      if (totals[domain]) {
        totals[domain].correct--;
        totals[domain].blank++;
      }
      
      if (qData.topicId) {
        logs.push({ topicId: qData.topicId, isWrong: false });
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
    };

    onSave(examData, logs);
  };

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

      <div className="space-y-2">
        <Label>Yanlış Yapılan Sorular (Virgülle ayırın)</Label>
        <Input
          value={wrongQ}
          placeholder="Ör: 5, 12, 17, 42"
          onChange={(e) => setWrongQ(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label>Boş Bırakılan Sorular (Virgülle ayırın)</Label>
        <Input
          value={blankQ}
          placeholder="Ör: 20, 115"
          onChange={(e) => setBlankQ(e.target.value)}
        />
      </div>

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
