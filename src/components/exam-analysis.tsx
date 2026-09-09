import { useMemo, useState } from "react";
import { useDemoData } from "@/lib/demo-data";
import { realExams } from "@/lib/topics-data";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { addDays } from "date-fns";

export function ExamAnalysis() {
  const { studyLogs, addTask, removeTopicDenemeLogs, currentStudent } = useDemoData();
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
    // Tüm deneme loglarını al (doğru veya yanlış fark etmez)
    const examLogs = studyLogs.filter((log) => log.source?.includes("Deneme"));

    // Konulara göre grupla
    const grouped = new Map<string, typeof examLogs>();
    for (const log of examLogs) {
      const topicId = log.subTopic;
      if (!topicId) continue;
      if (!grouped.has(topicId)) grouped.set(topicId, []);
      grouped.get(topicId)!.push(log);
    }

    const aggregated = [];

    for (const [topicId, logs] of grouped.entries()) {
      // Logları tarihe göre yeniden eskiye sırala
      const sorted = logs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      
      const latest = sorted[0];
      const isLatestCorrect = (latest.wrong || 0) === 0 && (latest.blank || 0) === 0;
      
      // Eğer en son denemede doğru yapıldıysa bu konuyu atla (Başarıldı kabul et)
      if (isLatestCorrect) continue;

      // Toplam kaç yanlış/boş var? Ardışık kaç yanlış var?
      let totalWrong = 0;
      let totalBlank = 0;
      let consecutiveFails = 0;

      for (let i = 0; i < sorted.length; i++) {
        const log = sorted[i];
        const isFail = (log.wrong || 0) > 0 || (log.blank || 0) > 0;
        if (isFail) {
          totalWrong += (log.wrong || 0);
          totalBlank += (log.blank || 0);
          if (consecutiveFails === i) {
            consecutiveFails++; // zinciri bozmadan artıyor
          }
        }
      }

      const info = topicMap.get(topicId);
      aggregated.push({
        topicId,
        wrong: totalWrong,
        blank: totalBlank,
        consecutiveFails,
        totalMissed: totalWrong + totalBlank,
        topicName: info?.topicName || "Bilinmeyen Konu",
        areaName: info?.areaName || "Bilinmeyen Ünite",
        subjectName: info?.subjectName || "Bilinmeyen Ders",
        examName: info?.examName || "",
        areaId: info?.areaId || "",
      });
    }

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
        <p>Henüz deneme analiz verisi bulunmuyor veya mevcut eksikler başarıyla kapatılmış.</p>
        <p className="text-sm mt-2">Detaylı deneme sonuçları girdikçe güncel eksik konularınız burada listelenecektir.</p>
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
          <Card 
            key={item.topicId} 
            className={`flex items-center justify-between p-4 rounded-2xl shadow-soft border ${item.consecutiveFails >= 2 ? 'border-destructive/50 bg-destructive/5' : 'border-border'}`}
          >
            <div>
              <p className="text-xs font-semibold text-muted-foreground tracking-wide uppercase">
                {item.subjectName} &gt; {item.areaName}
              </p>
              <div className="flex items-center gap-2 mt-0.5">
                <h3 className="font-display font-bold text-brand-deep text-base">
                  {item.topicName}
                </h3>
                {item.consecutiveFails >= 2 && (
                  <span className="flex items-center gap-1 text-[10px] font-bold bg-destructive/10 text-destructive px-2 py-0.5 rounded-full uppercase tracking-wider">
                    <AlertTriangle className="size-3" />
                    Son {item.consecutiveFails} Denemede Yanlış
                  </span>
                )}
              </div>
              <div className="flex gap-3 mt-2 text-sm">
                <span className="text-destructive font-medium">{item.wrong} Yanlış</span>
                <span className="text-muted-foreground">{item.blank} Boş</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive shrink-0" onClick={() => {
                if (window.confirm("Bu konuya ait deneme analiz verilerini temizlemek istiyor musunuz?")) {
                  removeTopicDenemeLogs(item.topicId);
                  toast.success("Konu analizi temizlendi");
                }
              }}>
                <Trash2 className="size-4" />
              </Button>
              <Button variant="outline" size="sm" className="shrink-0 rounded-xl" onClick={() => handleAddTask(item)}>
                <Plus className="size-4 mr-1" /> Görev Ekle
              </Button>
            </div>
          </Card>
        ))}
        {filteredData.length === 0 && (
          <p className="text-center text-muted-foreground py-8">Bu derste eksik konu bulunmuyor.</p>
        )}
      </div>
    </div>
  );
}
