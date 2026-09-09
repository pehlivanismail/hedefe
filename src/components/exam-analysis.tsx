import { useMemo, useState } from "react";
import { useDemoData } from "@/lib/demo-data";
import { realExams } from "@/lib/topics-data";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { addDays } from "date-fns";

export function ExamAnalysis() {
  const { studyLogs, addTask, currentStudent } = useDemoData();
  const [filterSubject, setFilterSubject] = useState<string>("all");

  const topicMap = useMemo(() => {
    const map = new Map<string, { topicName: string; areaName: string; subjectName: string; examName: string; areaId: string }>();
    for (const exam of realExams) {
      for (const subject of exam.subjects) {
        for (const area of subject.areas) {
          for (const topic of area.topics) {
            map.set(topic.id, {
              topicName: topic.name,
              areaName: area.name,
              subjectName: subject.name,
              examName: exam.name,
              areaId: area.id,
            });
          }
        }
      }
    }
    return map;
  }, []);

  const analysisData = useMemo(() => {
    const topicErrors = new Map<string, { wrong: number; blank: number }>();
    
    // Yalnızca deneme hatalarını bul ("Deneme" source'unda geçenler)
    const examLogs = studyLogs.filter(
      (log) => log.source?.includes("Deneme") && (log.wrong || log.blank)
    );

    for (const log of examLogs) {
      const current = topicErrors.get(log.topicId) || { wrong: 0, blank: 0 };
      topicErrors.set(log.topicId, {
        wrong: current.wrong + (log.wrong || 0),
        blank: current.blank + (log.blank || 0),
      });
    }

    const aggregated = Array.from(topicErrors.entries()).map(([topicId, errors]) => {
      const info = topicMap.get(topicId);
      return {
        topicId,
        ...errors,
        totalMissed: errors.wrong + errors.blank,
        topicName: info?.topicName || "Bilinmeyen Konu",
        areaName: info?.areaName || "Bilinmeyen Ünite",
        subjectName: info?.subjectName || "Bilinmeyen Ders",
        examName: info?.examName || "",
        areaId: info?.areaId || "",
      };
    });

    aggregated.sort((a, b) => b.totalMissed - a.totalMissed);
    return aggregated;
  }, [studyLogs, topicMap]);

  const filteredData = useMemo(() => {
    if (filterSubject === "all") return analysisData;
    return analysisData.filter(d => d.subjectName === filterSubject);
  }, [analysisData, filterSubject]);

  const uniqueSubjects = useMemo(() => {
    return Array.from(new Set(analysisData.map(d => d.subjectName))).sort();
  }, [analysisData]);

  const handleAddTask = (item: typeof filteredData[0]) => {
    if (!currentStudent) return;
    addTask({
      kind: "konu",
      subject: `${item.examName.startsWith("AYT") ? "AYT" : "TYT"} ${item.subjectName}`,
      areaName: item.areaName,
      topicName: item.topicName,
      title: item.topicName,
      topicId: item.topicId,
      areaId: null,
      day: new Date().getDay() === 0 ? 6 : new Date().getDay() - 1,
      weekOffset: 0,
      studentId: currentStudent.id,
    });
    toast.success(`${item.topicName} çalışma planına eklendi`);
  };

  if (analysisData.length === 0) {
    return (
      <Card className="p-8 text-center text-muted-foreground rounded-3xl shadow-soft">
        <p>Henüz deneme analiz verisi bulunmuyor.</p>
        <p className="text-sm mt-2">Detaylı deneme sonuçları girdikçe eksik konularınız burada listelenecektir.</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-brand-deep">Eksik Konular Analizi</h2>
        <Select value={filterSubject} onValueChange={setFilterSubject}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Ders Seçin" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tüm Dersler</SelectItem>
            {uniqueSubjects.map(sub => (
              <SelectItem key={sub} value={sub}>{sub}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-3">
        {filteredData.map((item) => (
          <Card key={item.topicId} className="flex items-center justify-between p-4 rounded-2xl shadow-soft border border-border">
            <div>
              <p className="text-xs font-semibold text-muted-foreground tracking-wide uppercase">
                {item.subjectName} &gt; {item.areaName}
              </p>
              <h3 className="font-display font-bold text-brand-deep text-base mt-0.5">
                {item.topicName}
              </h3>
              <div className="flex gap-3 mt-2 text-sm">
                <span className="text-destructive font-medium">{item.wrong} Yanlış</span>
                <span className="text-muted-foreground">{item.blank} Boş</span>
              </div>
            </div>
            <Button variant="outline" size="sm" className="shrink-0 rounded-xl" onClick={() => handleAddTask(item)}>
              <Plus className="size-4 mr-1" /> Görev Ekle
            </Button>
          </Card>
        ))}
        {filteredData.length === 0 && (
          <p className="text-center text-muted-foreground py-8">Bu derste eksik konu bulunmuyor.</p>
        )}
      </div>
    </div>
  );
}
