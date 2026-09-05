import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, BookOpen } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import {
  subjectStats,
  topicStats,
  useDemoData,
  examsForStudent,
  TRACK_LABELS,
  type Topic,
} from "@/lib/demo-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/konu-agaci")({
  head: () => ({
    meta: [
      { title: "Konu Ağacı — Hedefe.net" },
      {
        name: "description",
        content:
          "Sınav, ders, alan ve konu kırılımında hakimiyet takibi ve geçmiş çalışma kayıtları.",
      },
      { property: "og:title", content: "Konu Ağacı — Hedefe.net" },
      {
        property: "og:description",
        content: "Konu bazlı hakimiyet ve öğrenme borcu takibi.",
      },
    ],
  }),
  component: KonuAgaci,
});

function MasteryDots({ level }: { level: number }) {
  return (
    <span className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((i) => (
        <span
          key={i}
          className={cn(
            "size-2 rounded-full",
            i <= level ? "bg-primary" : "bg-muted-foreground/25",
          )}
        />
      ))}
    </span>
  );
}

function KonuAgaci() {
  const { examData, addLog } = useDemoData();
  const [active, setActive] = useState<Topic | null>(null);

  const current =
    active &&
    examData
      .flatMap((e) => e.subjects)
      .flatMap((s) => s.areas)
      .flatMap((a) => a.topics)
      .find((t) => t.id === active.id);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-bold text-brand-deep">
          📚 Konu Ağacı
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Sınav → Ders → Alan → Konu hiyerarşisinde hakimiyetini takip et.
        </p>
      </div>

      {examData.map((exam) => {
        const stats = topicStats(exam);
        return (
          <section key={exam.id} className="space-y-3">
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="font-display text-2xl font-bold text-brand-deep">
                {exam.name}
              </h2>
              <Badge className="rounded-full bg-primary text-primary-foreground">
                Başarı: %{stats.success}
              </Badge>
              <Badge className="rounded-full bg-destructive/10 text-destructive">
                Borç: {stats.debt}
              </Badge>
            </div>

            <Accordion type="multiple" className="space-y-3">
              {exam.subjects.map((subject) => {
                const s = subjectStats(subject);
                return (
                  <AccordionItem
                    key={subject.id}
                    value={subject.id}
                    className="overflow-hidden rounded-2xl border border-border bg-card shadow-soft"
                  >
                    <AccordionTrigger className="px-5 py-4 hover:no-underline">
                      <div className="flex w-full items-center justify-between pr-3">
                        <span className="flex items-center gap-2 font-display text-base font-semibold text-brand-deep">
                          <BookOpen className="size-4 text-primary" />
                          {subject.name}
                        </span>
                        <span className="text-xs font-medium text-muted-foreground">
                          %{s.success} · Borç {s.debt}
                        </span>
                      </div>
                    </AccordionTrigger>
                    <div className="h-1 w-full bg-muted">
                      <div
                        className="h-full bg-primary"
                        style={{ width: `${s.success}%` }}
                      />
                    </div>
                    <AccordionContent className="px-4 pb-4 pt-3">
                      <Accordion type="multiple" className="space-y-2">
                        {subject.areas.map((area) => (
                          <AccordionItem
                            key={area.id}
                            value={area.id}
                            className="rounded-xl border border-border bg-secondary/40"
                          >
                            <AccordionTrigger className="px-4 py-2.5 text-sm font-semibold hover:no-underline">
                              {area.name}
                            </AccordionTrigger>
                            <AccordionContent className="px-2 pb-2">
                              <ul className="space-y-1">
                                {area.topics.map((t) => (
                                  <li key={t.id}>
                                    <button
                                      onClick={() => setActive(t)}
                                      className="grid w-full grid-cols-[1fr_auto] items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors hover:bg-card"
                                    >
                                      <span className="text-sm text-foreground">
                                        {t.name}
                                      </span>
                                      <span className="flex items-center gap-3">
                                        <MasteryDots level={t.mastery} />
                                        <span className="rounded-full bg-destructive/10 px-2 py-0.5 text-[11px] font-semibold text-destructive">
                                          Borç: {t.debt}
                                        </span>
                                      </span>
                                    </button>
                                  </li>
                                ))}
                              </ul>
                            </AccordionContent>
                          </AccordionItem>
                        ))}
                      </Accordion>
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>
          </section>
        );
      })}

      <Dialog open={!!active} onOpenChange={(o) => !o && setActive(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="font-display text-brand-deep">
              {current?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-sm">
              <MasteryDots level={current?.mastery ?? 0} />
              <span className="text-muted-foreground">
                Öğrenme borcu: {current?.debt}
              </span>
            </div>
            <div className="rounded-xl border border-border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tarih</TableHead>
                    <TableHead>Kaynak</TableHead>
                    <TableHead className="text-right">Çözülen</TableHead>
                    <TableHead className="text-right">Yanlış</TableHead>
                    <TableHead className="text-right">Boş</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {current?.logs.length ? (
                    current.logs.map((l) => (
                      <TableRow key={l.id}>
                        <TableCell>{l.date}</TableCell>
                        <TableCell>{l.source}</TableCell>
                        <TableCell className="text-right">{l.solved}</TableCell>
                        <TableCell className="text-right text-destructive">
                          {l.wrong}
                        </TableCell>
                        <TableCell className="text-right">{l.blank}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="py-6 text-center text-sm text-muted-foreground"
                      >
                        Henüz çalışma kaydı yok.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
            <Button
              className="w-full rounded-xl"
              onClick={() => {
                if (!current) return;
                addLog(current.id, {
                  date: new Date().toLocaleDateString("tr-TR"),
                  source: "Hızlı Çalışma",
                  solved: 20,
                  wrong: 3,
                  blank: 1,
                });
                toast.success("Yeni çalışma eklendi");
              }}
            >
              <Plus className="size-4" /> Yeni Çalışma Ekle
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
