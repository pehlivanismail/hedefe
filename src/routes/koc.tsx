import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { CalendarIcon, UserRound } from "lucide-react";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  DAYS,
  SUBJECT_OPTIONS,
  daysUntilYks,
  subjectScores,
  useDemoData,
} from "@/lib/demo-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/koc")({
  head: () => ({
    meta: [
      { title: "Koç Paneli — Hedefe.net" },
      {
        name: "description",
        content:
          "Öğrencilerini takip et, ödev ata ve istatistiklerini incele. Hedefe.net koç paneli.",
      },
      { property: "og:title", content: "Koç Paneli — Hedefe.net" },
      {
        property: "og:description",
        content: "Öğrenci takibi, ödev atama ve istatistikler.",
      },
    ],
  }),
  component: KocPaneli,
});

function KocPaneli() {
  const { tasks, addTask, session, currentCoach, studentList } = useDemoData();
  const myStudents = studentList.filter((s) => s.coachId === currentCoach?.id);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [subject, setSubject] = useState("Matematik");
  const [description, setDescription] = useState("");
  const [due, setDue] = useState<Date | undefined>(new Date());

  const student = myStudents.find((s) => s.id === selectedId) ?? myStudents[0];

  if (session?.role !== "coach") {
    return (
      <Card className="mx-auto max-w-lg rounded-3xl border-border p-10 text-center shadow-soft">
        <h1 className="font-display text-2xl font-bold text-brand-deep">
          Bu sayfa koçlara özeldir
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Devam etmek için koç hesabınla giriş yap.
        </p>
        <Link
          to="/"
          className="mt-6 inline-block rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-soft"
        >
          Giriş sayfasına dön
        </Link>
      </Card>
    );
  }

  if (!student) {
    return (
      <Card className="mx-auto max-w-lg rounded-3xl border-border p-10 text-center shadow-soft">
        <h1 className="font-display text-2xl font-bold text-brand-deep">
          Henüz öğrencin yok
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Öğrenciler kendi panellerinden seni koç olarak seçtiğinde burada
          görünürler.
        </p>
      </Card>
    );
  }
  const studentTasks = tasks.filter((t) => t.studentId === student.id);
  const pending = studentTasks.filter((t) => !t.done).length;

  return (
    <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
      <aside className="space-y-3">
        <h2 className="font-display text-lg font-bold text-brand-deep">
          Öğrencilerim
        </h2>
        {myStudents.map((s) => {
          const p = tasks.filter(
            (t) => t.studentId === s.id && !t.done,
          ).length;
          return (
            <button
              key={s.id}
              onClick={() => setSelectedId(s.id)}
              className={cn(
                "flex w-full items-center gap-3 rounded-2xl border border-border bg-card p-3 text-left transition-all hover:-translate-y-0.5 hover:shadow-soft",
                s.id === student.id && "border-primary bg-brand-soft",
              )}
            >
              <span className="flex size-9 items-center justify-center rounded-full bg-brand-deep text-primary-foreground">
                <UserRound className="size-4" />
              </span>
              <span className="min-w-0">
                <span className="block truncate text-sm font-semibold text-brand-deep">
                  {s.name}
                </span>
                <span className="block text-xs text-muted-foreground">
                  {p} bekleyen görev
                </span>
              </span>
            </button>
          );
        })}
      </aside>

      <div className="space-y-6">
        <Card className="rounded-3xl border-border bg-brand-deep p-8 text-primary-foreground shadow-soft">
          <p className="text-xs font-semibold uppercase tracking-widest opacity-80">
            Seçili öğrenci
          </p>
          <h1 className="mt-2 font-display text-3xl font-bold">{student.name}</h1>
          <p className="mt-1 text-primary">{student.target}</p>
          <p className="mt-4 font-display text-2xl font-bold">
            {daysUntilYks()} gün kaldı ·{" "}
            <span className="text-primary">{pending} bekleyen görev</span>
          </p>
        </Card>

        <Tabs defaultValue="genel">
          <TabsList className="rounded-full">
            <TabsTrigger value="genel" className="rounded-full">
              Genel Durum
            </TabsTrigger>
            <TabsTrigger value="odev" className="rounded-full">
              Ödev Ver
            </TabsTrigger>
            <TabsTrigger value="istatistik" className="rounded-full">
              İstatistikler
            </TabsTrigger>
          </TabsList>

          <TabsContent value="genel" className="mt-4 space-y-3">
            {studentTasks.length === 0 && (
              <p className="text-sm text-muted-foreground">
                Bu öğrenciye henüz ödev atanmadı.
              </p>
            )}
            {studentTasks.map((t) => (
              <div
                key={t.id}
                className="flex items-center justify-between rounded-2xl border border-border bg-card p-4 shadow-sm"
              >
                <div>
                  <span className="rounded-full bg-brand-soft px-2 py-0.5 text-[11px] font-semibold text-brand-deep">
                    {t.subject}
                  </span>
                  <p
                    className={cn(
                      "mt-1.5 text-sm",
                      t.done && "text-muted-foreground line-through",
                    )}
                  >
                    {t.title}
                  </p>
                </div>
                <span className="text-xs font-medium text-muted-foreground">
                  {DAYS[t.day]}
                </span>
              </div>
            ))}
          </TabsContent>

          <TabsContent value="odev" className="mt-4">
            <Card className="max-w-xl rounded-3xl border-border p-6 shadow-soft">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Ders</Label>
                  <Select value={subject} onValueChange={setSubject}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {SUBJECT_OPTIONS.map((s) => (
                        <SelectItem key={s} value={s}>
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Ödev Açıklaması</Label>
                  <Textarea
                    rows={4}
                    value={description}
                    placeholder="Ör: Türev Uygulamaları 40 soru çöz"
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Teslim Tarihi</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !due && "text-muted-foreground",
                        )}
                      >
                        <CalendarIcon className="size-4" />
                        {due
                          ? format(due, "d MMMM yyyy", { locale: tr })
                          : "Tarih seç"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={due}
                        onSelect={setDue}
                        className={cn("p-3 pointer-events-auto")}
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <Button
                  className="w-full rounded-xl"
                  onClick={() => {
                    if (!description.trim()) {
                      toast.error("Ödev açıklaması gerekli");
                      return;
                    }
                    const day = due ? (due.getDay() + 6) % 7 : 0;
                    addTask({
                      subject,
                      title: description,
                      day,
                      studentId: student.id,
                    });
                    setDescription("");
                    toast.success(`${student.name} için ödev atandı`);
                  }}
                >
                  Ata
                </Button>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="istatistik" className="mt-4">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {subjectScores.map((s) => (
                <Card
                  key={s.name}
                  className="rounded-2xl border-border p-5 shadow-soft"
                >
                  <div className="flex items-baseline justify-between">
                    <span className="font-display text-sm font-semibold text-brand-deep">
                      {s.name}
                    </span>
                    <span className="text-sm font-bold text-primary">
                      %{s.score.toFixed(1)}
                    </span>
                  </div>
                  <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{ width: `${s.score}%` }}
                    />
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
