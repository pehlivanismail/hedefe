import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { Plus, Trash2 } from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from "recharts";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { MockExamForm } from "@/components/mock-exam-form";
import { DetailedMockExamForm } from "@/components/detailed-mock-exam-form";
import { ExamAnalysis } from "@/components/exam-analysis";
import { ExamDetailDialog } from "@/components/exam-detail-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { useDemoData, type MockExam } from "@/lib/demo-data";
import { cn } from "@/lib/utils";
import { EXAM_QUESTION_COUNTS } from "@/lib/exam-config";

export const Route = createFileRoute("/denemeler")({
  component: Denemeler,
});

const total = (e: MockExam) => e.turkce + e.matematik + e.sosyal + e.fen;

function NetChart({
  id,
  title,
  data,
  color,
  maxQuestions,
}: {
  id: string;
  title: string;
  data: { date: string; net: number }[];
  color: string;
  maxQuestions: number;
}) {
  return (
    <Card className="rounded-3xl border-border p-6 shadow-soft">
      <h3 className="font-display text-lg font-bold text-brand-deep">
        {title}{" "}
        <span className="text-sm font-normal text-muted-foreground">
          ({maxQuestions} soru)
        </span>
      </h3>
      <div className="mt-4 h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ left: -20, right: 8, top: 8 }}>
            <defs>
              <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity={0.45} />
                <stop offset="100%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
            <XAxis dataKey="date" tickLine={false} axisLine={false} fontSize={12} />
            <YAxis
              domain={[0, maxQuestions]}
              tickLine={false}
              axisLine={false}
              fontSize={12}
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (!active || !payload || !payload.length) return null;
                const net = Number(payload[0]?.value) || 0;
                const pct = maxQuestions ? (net / maxQuestions) * 100 : 0;
                return (
                  <div className="rounded-xl border border-border bg-card p-3 shadow-soft">
                    <p className="text-xs text-muted-foreground">{label}</p>
                    <p className="font-display text-sm font-bold text-brand-deep">
                      {net.toFixed(2)} net
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {maxQuestions} sorunun %{pct.toFixed(1)}&apos;i
                    </p>
                  </div>
                );
              }}
            />
            <Area
              type="monotone"
              dataKey="net"
              stroke={color}
              strokeWidth={3}
              fill={`url(#${id})`}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}

function Denemeler() {
  const { mockExamList, addMockExam, removeMockExam, addLog, currentStudent } = useDemoData();
  const rows = mockExamList;
  const [open, setOpen] = useState(false);
  const [selectedExam, setSelectedExam] = useState<MockExam | null>(null);

  const tytRows = rows.filter((e) => e.type === "TYT");
  const aytRows = rows.filter((e) => e.type === "AYT");

  const tyt = tytRows.map((e) => ({ date: e.date.slice(0, 5), net: total(e) }));
  const ayt = aytRows.map((e) => ({ date: e.date.slice(0, 5), net: total(e) }));

  // Radar Chart Data Calculation (Average Percentages for TYT)
  const radarData = useMemo(() => {
    if (tytRows.length === 0) return [];
    
    const sum = tytRows.reduce(
      (acc, e) => ({
        turkce: acc.turkce + (e.turkce || 0),
        matematik: acc.matematik + (e.matematik || 0),
        sosyal: acc.sosyal + (e.sosyal || 0),
        fen: acc.fen + (e.fen || 0),
      }),
      { turkce: 0, matematik: 0, sosyal: 0, fen: 0 }
    );
    
    return [
      { subject: "Türkçe", pct: Math.round((sum.turkce / (tytRows.length * 40)) * 100) || 0, fullMark: 100 },
      { subject: "Matematik", pct: Math.round((sum.matematik / (tytRows.length * 40)) * 100) || 0, fullMark: 100 },
      { subject: "Sosyal", pct: Math.round((sum.sosyal / (tytRows.length * 20)) * 100) || 0, fullMark: 100 },
      { subject: "Fen", pct: Math.round((sum.fen / (tytRows.length * 20)) * 100) || 0, fullMark: 100 },
    ];
  }, [tytRows]);

  const handleDelete = (e: React.MouseEvent, exam: MockExam) => {
    e.stopPropagation();
    if (window.confirm("Bu denemeyi silmek istediğinize emin misiniz?")) {
      removeMockExam({ id: exam.id, date: exam.date, publisher: exam.publisher });
      toast.success("Deneme silindi");
    }
  };

  const renderTable = (examRows: MockExam[], type: "TYT" | "AYT") => (
    <Card className="overflow-hidden rounded-3xl border-border p-0 shadow-soft mt-4">
      <Table>
        <TableHeader>
          <TableRow className="bg-secondary/60">
            <TableHead>Tarih</TableHead>
            <TableHead>Kurum</TableHead>
            <TableHead>Tür</TableHead>
            <TableHead className="text-right">Türkçe</TableHead>
            <TableHead className="text-right">Matematik</TableHead>
            <TableHead className="text-right">Sosyal</TableHead>
            <TableHead className="text-right">Fen</TableHead>
            <TableHead className="text-right">Toplam Net</TableHead>
            <TableHead className="text-right">Başarı %</TableHead>
            <TableHead className="w-12 text-center"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {examRows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                Henüz {type} denemesi bulunmuyor.
              </TableCell>
            </TableRow>
          ) : (
            examRows.map((e, i) => (
              <TableRow 
                key={e.id} 
                className={cn(i % 2 === 1 && "bg-secondary/30", "cursor-pointer hover:bg-muted/50")}
                onClick={() => setSelectedExam(e)}
              >
                <TableCell>{e.date}</TableCell>
                <TableCell className="font-medium">{e.publisher}</TableCell>
                <TableCell className="text-muted-foreground">{e.type}</TableCell>
                <TableCell className="text-right">{e.turkce}</TableCell>
                <TableCell className="text-right">{e.matematik}</TableCell>
                <TableCell className="text-right">{e.sosyal}</TableCell>
                <TableCell className="text-right">{e.fen}</TableCell>
                <TableCell className="text-right">
                  <span className="rounded-full bg-brand-soft px-3 py-1 font-display text-sm font-bold text-brand-deep">
                    {total(e).toFixed(1)}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <span className="text-sm font-medium text-muted-foreground">
                    {(
                      (total(e) / EXAM_QUESTION_COUNTS[type]) * 100
                    ).toFixed(1)}
                    %
                  </span>
                </TableCell>
                <TableCell className="text-center">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    onClick={(ev) => handleDelete(ev, e)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </Card>
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-brand-deep">
            🎯 Denemeler
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Net ilerlemeni haftalık olarak izle.
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-xl">
              <Plus className="size-4" /> Yeni Deneme Ekle
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-display text-brand-deep">
                Yeni Deneme Sonucu
              </DialogTitle>
            </DialogHeader>
            <Tabs defaultValue="quick" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="quick">Hızlı Giriş</TabsTrigger>
                <TabsTrigger value="detailed">Detaylı Analiz</TabsTrigger>
              </TabsList>
              <TabsContent value="quick">
                <MockExamForm
                  track={currentStudent?.track ?? "sayisal"}
                  onSave={(e) => {
                    addMockExam(e);
                    setOpen(false);
                    toast.success("Deneme sonucu eklendi");
                  }}
                />
              </TabsContent>
              <TabsContent value="detailed">
                <DetailedMockExamForm
                  solvedTemplateIds={mockExamList.filter(m => m.templateId).map(m => m.templateId as string)}
                  onSave={(e, logs) => {
                    addMockExam(e);
                    const groupedLogs = logs.reduce((acc, log) => {
                      const item = acc[log.topicId] || { solved: 0, wrong: 0, blank: 0 };
                      item.solved++;
                      if (log.status === "wrong") item.wrong++;
                      if (log.status === "blank") item.blank++;
                      acc[log.topicId] = item;
                      return acc;
                    }, {} as Record<string, { solved: number; wrong: number; blank: number }>);

                    for (const [topicId, counts] of Object.entries(groupedLogs)) {
                      addLog(topicId, {
                        date: e.date,
                        source: e.publisher + " Deneme",
                        kind: "soru",
                        solved: counts.solved,
                        wrong: counts.wrong,
                        blank: counts.blank,
                      });
                    }
                    setOpen(false);
                    toast.success("Detaylı deneme sonucu eklendi ve konu analizine yansıtıldı!");
                  }}
                />
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="gecmis" className="space-y-6">
        <TabsList>
          <TabsTrigger value="gecmis">Geçmiş Denemeler</TabsTrigger>
          <TabsTrigger value="analiz">Eksik Konu Analizi</TabsTrigger>
        </TabsList>
        <TabsContent value="gecmis" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-6">
              <NetChart
                id="tytGrad"
                title="TYT Net İlerlemesi"
                data={tyt}
                color="oklch(0.7 0.157 159.5)"
                maxQuestions={EXAM_QUESTION_COUNTS.TYT}
              />
              <NetChart
                id="aytGrad"
                title="AYT Net İlerlemesi"
                data={ayt}
                color="oklch(0.45 0.09 220)"
                maxQuestions={EXAM_QUESTION_COUNTS.AYT}
              />
            </div>
            
            <Card className="rounded-3xl border-border p-6 shadow-soft flex flex-col">
              <h3 className="font-display text-lg font-bold text-brand-deep">
                TYT Ortalama Başarı Grafiği
              </h3>
              <p className="text-sm text-muted-foreground mt-1 mb-4">
                Tüm TYT denemelerindeki branş bazlı ortalama başarın (%)
              </p>
              <div className="flex-1 min-h-[300px]">
                {radarData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                      <PolarGrid stroke="var(--border)" />
                      <PolarAngleAxis dataKey="subject" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 13 }} />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                      <Radar
                        name="Başarı %"
                        dataKey="pct"
                        stroke="oklch(0.7 0.157 159.5)"
                        fill="oklch(0.7 0.157 159.5)"
                        fillOpacity={0.4}
                      />
                      <Tooltip 
                        formatter={(value: number) => [`%${value}`, "Ortalama Başarı"]}
                        contentStyle={{ borderRadius: "12px", border: "1px solid var(--border)", boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                    Henüz TYT denemesi bulunmuyor.
                  </div>
                )}
              </div>
            </Card>
          </div>

          <Tabs defaultValue="tyt" className="w-full mt-8">
            <TabsList className="w-full max-w-sm grid grid-cols-2">
              <TabsTrigger value="tyt">TYT Denemeleri</TabsTrigger>
              <TabsTrigger value="ayt">AYT Denemeleri</TabsTrigger>
            </TabsList>
            <TabsContent value="tyt">
              {renderTable(tytRows, "TYT")}
            </TabsContent>
            <TabsContent value="ayt">
              {renderTable(aytRows, "AYT")}
            </TabsContent>
          </Tabs>

        </TabsContent>
        <TabsContent value="analiz">
          <ExamAnalysis />
        </TabsContent>
      </Tabs>
      <ExamDetailDialog exam={selectedExam} open={!!selectedExam} onOpenChange={(o) => !o && setSelectedExam(null)} />
    </div>
  );
}
