import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  CalendarIcon,
  GraduationCap,
  Search,
  TriangleAlert,
  UserRound,
} from "lucide-react";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  DAYS,
  TASK_KIND_LABELS,
  TRACK_LABELS,
  daysUntilYks,
  examsForStudent,
  overallStats,
  subjectScoresOf,
  subjectStats,
  useDemoData,
  weakestTopics,
  type MockExam,
  type Student,
  type Task,
  type Track,
} from "@/lib/demo-data";
import { PairInvites } from "@/components/pair-invites";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/koc")({
  head: () => ({
    meta: [
      { title: "Koç Paneli — Hedefe.net" },
      {
        name: "description",
        content:
          "Öğrencilerini takip et, konu bazlı zayıf noktaları gör ve ödev ata. Hedefe.net koç paneli.",
      },
      { property: "og:title", content: "Koç Paneli — Hedefe.net" },
      {
        property: "og:description",
        content: "Öğrenci takibi, konu analizi, ödev atama ve istatistikler.",
      },
    ],
  }),
  component: KocPaneli,
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

function KocPaneli() {
  const { tasks, addTask, session, currentCoach, studentList, examData } =
    useDemoData();
  const myStudents = studentList;
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [trackFilter, setTrackFilter] = useState<Track | "all">("all");
  const [subject, setSubject] = useState("");
  const [areaId, setAreaId] = useState("");
  const [taskKind, setTaskKind] = useState<"konu" | "soru">("soru");
  const [examScope, setExamScope] = useState("TYT");
  const [description, setDescription] = useState("");
  const [denemeNote, setDenemeNote] = useState("");
  const [due, setDue] = useState<Date | undefined>(new Date());
  const [denemeDue, setDenemeDue] = useState<Date | undefined>(new Date());


  const pendingOf = (id: string) =>
    tasks.filter((t) => t.studentId === id && !t.done).length;

  const visible = useMemo(
    () =>
      myStudents
        .filter((s) => trackFilter === "all" || s.track === trackFilter)
        .filter((s) =>
          `${s.name} ${s.target}`.toLocaleLowerCase("tr").includes(
            query.toLocaleLowerCase("tr"),
          ),
        )
        .sort((a, b) => pendingOf(b.id) - pendingOf(a.id)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [myStudents, query, trackFilter, tasks],
  );

  const student =
    myStudents.find((s) => s.id === selectedId) ?? visible[0] ?? myStudents[0];

  /** Öğrencinin sınavlarındaki dersler: "TYT Matematik", "AYT Fizik" ... */
  const subjectOptions = useMemo(() => {
    if (!student) return [];
    return examsForStudent(examData, student).flatMap((e) =>
      e.subjects.map((s) => ({
        value: `${e.name.startsWith("AYT") ? "AYT" : "TYT"} ${s.name}`,
        areas: s.areas.map((a) => ({ id: a.id, name: a.name })),
      })),
    );
  }, [examData, student]);

  const selectedSubject =
    subjectOptions.find((s) => s.value === subject) ?? subjectOptions[0] ?? null;
  const selectedArea =
    selectedSubject?.areas.find((a) => a.id === areaId) ?? null;



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
      <div className="mx-auto max-w-lg space-y-4">
        <Card className="rounded-3xl border-border p-10 text-center shadow-soft">
          <h1 className="font-display text-2xl font-bold text-brand-deep">
            Henüz öğrencin yok
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Öğrencini e-posta ile davet et; kabul ettiğinde burada görünür.
            <br/>
            DEBUG: coachId: {currentCoach?.id}, studentList: {studentList.map(s => s.id).join(',')}
          </p>
        </Card>
        <PairInvites role="coach" />
      </div>
    );
  }


  const studentTasks = tasks.filter((t) => t.studentId === student.id);
  const pending = studentTasks.filter((t) => !t.done).length;

  return (
    <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
      <aside className="space-y-3">
        <div className="flex items-baseline justify-between">
          <h2 className="font-display text-lg font-bold text-brand-deep">
            Öğrencilerim
          </h2>
          <span className="text-xs text-muted-foreground">
            {visible.length}/{myStudents.length}
          </span>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Öğrenci ara"
            className="pl-9"
          />
        </div>

        <div className="flex flex-wrap gap-1.5">
          {(["all", "sayisal", "esit", "sozel"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTrackFilter(t)}
              className={cn(
                "rounded-full border border-border px-3 py-1 text-xs font-medium transition-colors",
                trackFilter === t
                  ? "border-primary bg-primary text-primary-foreground"
                  : "bg-card text-muted-foreground hover:bg-brand-soft",
              )}
            >
              {t === "all" ? "Tümü" : TRACK_LABELS[t].replace("AYT ", "")}
            </button>
          ))}
        </div>

        <div className="max-h-[560px] space-y-1.5 overflow-y-auto pr-1">
          {visible.map((s) => {
            const p = pendingOf(s.id);
            const stats = overallStats(examsForStudent(examData, s));
            return (
              <button
                key={s.id}
                onClick={() => setSelectedId(s.id)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-xl border border-border bg-card px-3 py-2 text-left transition-colors hover:border-primary",
                  s.id === student.id && "border-primary bg-brand-soft",
                )}
              >
                <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-brand-deep text-[11px] font-bold text-primary-foreground">
                  {s.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .slice(0, 2)}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold text-brand-deep">
                    {s.name}
                  </span>
                  <span className="block truncate text-[11px] text-muted-foreground">
                    {TRACK_LABELS[s.track]} · {stats.topics} konu
                  </span>
                </span>
                {p > 0 && (
                  <span className="shrink-0 rounded-full bg-destructive/10 px-2 py-0.5 text-[11px] font-bold text-destructive">
                    {p}
                  </span>
                )}
              </button>
            );
          })}
          {visible.length === 0 && (
            <p className="px-1 py-6 text-center text-xs text-muted-foreground">
              Eşleşen öğrenci yok.
            </p>
          )}
        </div>
        <PairInvites role="coach" />
      </aside>


      <div className="space-y-6">
        <Card className="rounded-3xl border-border bg-brand-deep p-8 text-primary-foreground shadow-soft">
          <p className="text-xs font-semibold uppercase tracking-widest opacity-80">
            Seçili öğrenci · TYT + {TRACK_LABELS[student.track]}
          </p>
          <h1 className="mt-2 font-display text-3xl font-bold">
            {student.name}
          </h1>
          <p className="mt-1 text-primary">{student.target}</p>
          <p className="mt-4 font-display text-2xl font-bold">
            {daysUntilYks()} gün kaldı ·{" "}
            <span className="text-primary">{pending} bekleyen görev</span>
          </p>
        </Card>

        <Tabs defaultValue="analiz">
          <TabsList className="flex-wrap rounded-3xl">
            <TabsTrigger value="analiz" className="rounded-full">
              Konu Analizi
            </TabsTrigger>
            <TabsTrigger value="plan" className="rounded-full">
              Haftalık Plan
            </TabsTrigger>
            <TabsTrigger value="gunluk" className="rounded-full">
              Çalışma Günlüğü
            </TabsTrigger>

            <TabsTrigger value="denemeler" className="rounded-full">
              Denemeler
            </TabsTrigger>
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

          <TabsContent value="analiz" className="mt-4">
            <TopicAnalysis student={student} />
          </TabsContent>

          <TabsContent value="plan" className="mt-4">
            <StudentWeek tasks={studentTasks} />
          </TabsContent>

          <TabsContent value="gunluk" className="mt-4">
            <StudyJournal tasks={studentTasks} />
          </TabsContent>


          <TabsContent value="denemeler" className="mt-4">
            <StudentMockExams student={student} />
          </TabsContent>

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
                  <span className="flex items-center gap-1.5">
                    <span className="rounded-full bg-brand-soft px-2 py-0.5 text-[11px] font-semibold text-brand-deep">
                      {t.subject}
                    </span>
                    {t.assignedBy === "coach" && <CoachBadge />}
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
            <Tabs defaultValue="calisma">
              <TabsList className="rounded-3xl">
                <TabsTrigger value="calisma" className="rounded-full">
                  Çalışma Ödevi
                </TabsTrigger>
                <TabsTrigger value="deneme" className="rounded-full">
                  Deneme Ödevi
                </TabsTrigger>
              </TabsList>

              <TabsContent value="calisma" className="mt-4">
                <Card className="max-w-xl rounded-3xl border-border p-6 shadow-soft">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Ödev Türü</Label>
                      <Select
                        value={taskKind}
                        onValueChange={(v) => setTaskKind(v as "konu" | "soru")}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="konu">Konu Çalışması</SelectItem>
                          <SelectItem value="soru">Soru Çözümü</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Ders</Label>
                      <Select
                        value={selectedSubject?.value ?? ""}
                        onValueChange={(v) => {
                          setSubject(v);
                          setAreaId("");
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Ders seç" />
                        </SelectTrigger>
                        <SelectContent>
                          {subjectOptions.map((s) => (
                            <SelectItem key={s.value} value={s.value}>
                              {s.value}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>
                        Alan{" "}
                        <span className="text-xs font-normal text-muted-foreground">
                          (opsiyonel)
                        </span>
                      </Label>
                      <Select
                        value={areaId}
                        onValueChange={(v) => setAreaId(v === "__all" ? "" : v)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Ders geneli" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="__all">Ders geneli</SelectItem>
                          {(selectedSubject?.areas ?? []).map((a) => (
                            <SelectItem key={a.id} value={a.id}>
                              {a.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Ödev Açıklaması</Label>
                      <Textarea
                        rows={3}
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
                        if (!selectedSubject) {
                          toast.error("Ders seç");
                          return;
                        }
                        const title =
                          description.trim() ||
                          selectedArea?.name ||
                          selectedSubject.value;
                        const day = due ? (due.getDay() + 6) % 7 : 0;
                        addTask({
                          kind: taskKind,
                          subject: selectedSubject.value,
                          areaName: selectedArea?.name,
                          areaId: selectedArea?.id ?? null,
                          topicId: null,
                          title,
                          day,
                          studentId: student.id,
                          assignedBy: "coach",
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

              <TabsContent value="deneme" className="mt-4">
                <Card className="max-w-xl rounded-3xl border-border p-6 shadow-soft">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Deneme Türü</Label>
                      <Select value={examScope} onValueChange={setExamScope}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="TYT">TYT Denemesi</SelectItem>
                          <SelectItem value="AYT">AYT Denemesi</SelectItem>
                          {subjectOptions.map((s) => (
                            <SelectItem key={s.value} value={s.value}>
                              {s.value} Branş Denemesi
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Açıklama (opsiyonel)</Label>
                      <Textarea
                        rows={3}
                        value={denemeNote}
                        placeholder="Ör: Süre tutarak çöz"
                        onChange={(e) => setDenemeNote(e.target.value)}
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
                              !denemeDue && "text-muted-foreground",
                            )}
                          >
                            <CalendarIcon className="size-4" />
                            {denemeDue
                              ? format(denemeDue, "d MMMM yyyy", { locale: tr })
                              : "Tarih seç"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={denemeDue}
                            onSelect={setDenemeDue}
                            className={cn("p-3 pointer-events-auto")}
                          />
                        </PopoverContent>
                      </Popover>
                    </div>

                    <Button
                      className="w-full rounded-xl"
                      onClick={() => {
                        const label =
                          examScope === "TYT"
                            ? "TYT Denemesi"
                            : examScope === "AYT"
                              ? "AYT Denemesi"
                              : `${examScope} Branş Denemesi`;
                        const day = denemeDue
                          ? (denemeDue.getDay() + 6) % 7
                          : 0;
                        addTask({
                          kind: "deneme",
                          subject: examScope,
                          title: denemeNote.trim() || label,
                          topicId: null,
                          areaId: null,
                          day,
                          studentId: student.id,
                          assignedBy: "coach",
                        });
                        setDenemeNote("");
                        toast.success(`${student.name} için deneme ödevi verildi`);
                      }}
                    >
                      Deneme Ödevi Ver
                    </Button>
                  </div>
                </Card>
              </TabsContent>
            </Tabs>
          </TabsContent>


          <TabsContent value="istatistik" className="mt-4">
            <StudentScores student={student} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function TopicAnalysis({ student }: { student: Student }) {
  const { examData } = useDemoData();
  const mine = examsForStudent(examData, student);
  const stats = overallStats(mine);
  const weak = weakestTopics(mine, 5);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="rounded-2xl border-border p-5 shadow-soft">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Genel hakimiyet
          </p>
          <p className="mt-2 font-display text-4xl font-extrabold text-primary">
            %{stats.success}
          </p>
        </Card>
        <Card className="rounded-2xl border-border p-5 shadow-soft">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Öğrenme borcu
          </p>
          <p className="mt-2 font-display text-4xl font-extrabold text-destructive">
            {stats.debt}
          </p>
        </Card>
        <Card className="rounded-2xl border-border p-5 shadow-soft">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Takip edilen konu
          </p>
          <p className="mt-2 font-display text-4xl font-extrabold text-brand-deep">
            {stats.topics}
          </p>
        </Card>
      </div>

      <Card className="rounded-3xl border-border p-6 shadow-soft">
        <h3 className="flex items-center gap-2 font-display text-lg font-bold text-brand-deep">
          <TriangleAlert className="size-4 text-destructive" /> En zayıf 5 konu
        </h3>
        <ul className="mt-4 space-y-2">
          {weak.map((w) => (
            <li
              key={w.topic.id}
              className="flex items-center justify-between gap-3 rounded-xl border border-border bg-secondary/40 px-4 py-2.5"
            >
              <span className="min-w-0">
                <span className="block truncate text-sm font-medium text-foreground">
                  {w.topic.name}
                </span>
                <span className="block truncate text-[11px] text-muted-foreground">
                  {w.exam} · {w.subject} · {w.area}
                </span>
              </span>
              <span className="flex shrink-0 items-center gap-3">
                <MasteryDots level={w.topic.mastery} />
                <span className="rounded-full bg-destructive/10 px-2 py-0.5 text-[11px] font-semibold text-destructive">
                  Borç: {w.topic.debt}
                </span>
              </span>
            </li>
          ))}
        </ul>
      </Card>

      {mine.map((exam) => (
        <section key={exam.id} className="space-y-3">
          <div className="flex flex-wrap items-center gap-3">
            <h3 className="font-display text-xl font-bold text-brand-deep">
              {exam.name}
            </h3>
            <Badge className="rounded-full bg-primary text-primary-foreground">
              Başarı: %{overallStats([exam]).success}
            </Badge>
            <Badge className="rounded-full bg-destructive/10 text-destructive">
              Borç: {overallStats([exam]).debt}
            </Badge>
          </div>

          <Accordion type="multiple" className="space-y-3">
            {exam.subjects.map((subject) => {
              const s = subjectStats(subject);
              return (
                <AccordionItem
                  key={subject.id}
                  value={`${exam.id}-${subject.id}`}
                  className="overflow-hidden rounded-2xl border border-border bg-card shadow-soft"
                >
                  <AccordionTrigger className="px-5 py-4 hover:no-underline">
                    <div className="flex w-full items-center justify-between pr-3">
                      <span className="font-display text-base font-semibold text-brand-deep">
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
                    <div className="space-y-3">
                      {subject.areas.map((area) => (
                        <div
                          key={area.id}
                          className="rounded-xl border border-border bg-secondary/40 p-3"
                        >
                          <p className="text-sm font-semibold text-brand-deep">
                            {area.name}
                          </p>
                          <ul className="mt-2 space-y-1">
                            {area.topics.map((t) => (
                              <li
                                key={t.id}
                                className={cn(
                                  "grid grid-cols-[1fr_auto] items-center gap-3 rounded-lg px-3 py-2",
                                  t.debt >= 5 && "bg-destructive/5",
                                )}
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
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        </section>
      ))}
    </div>
  );
}

function StudentScores({ student }: { student: Student }) {
  const { examData } = useDemoData();
  const scores = subjectScoresOf(examsForStudent(examData, student));

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {scores.map((s) => (
        <Card key={s.name} className="rounded-2xl border-border p-5 shadow-soft">
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
  );
}

function CoachBadge() {
  return (
    <span
      title="Koçun verdiği ödev"
      aria-label="Koçun verdiği ödev"
      className="flex size-5 items-center justify-center rounded-full bg-brand-deep text-primary-foreground"
    >
      <GraduationCap className="size-3" />
    </span>
  );
}

function StudentWeek({ tasks }: { tasks: Task[] }) {
  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {DAYS.map((d, i) => {
        const dayTasks = tasks.filter((t) => t.day === i);
        return (
          <div
            key={d}
            className="flex w-60 shrink-0 flex-col rounded-2xl bg-secondary/60 p-3"
          >
            <div className="mb-3 flex items-center justify-between px-1">
              <span className="font-display text-sm font-bold text-brand-deep">
                {d}
              </span>
              <span className="rounded-full bg-card px-2 py-0.5 text-[11px] font-semibold text-muted-foreground">
                {dayTasks.length}
              </span>
            </div>
            <div className="space-y-2">
              {dayTasks.map((t) => (
                <div
                  key={t.id}
                  className={cn(
                    "rounded-xl border border-border bg-card p-3 shadow-sm",
                    t.done && "opacity-55",
                  )}
                >
                  <div className="flex items-center gap-1.5">
                    <span className="rounded-full bg-brand-soft px-2 py-0.5 text-[11px] font-semibold text-brand-deep">
                      {TASK_KIND_LABELS[t.kind]}
                    </span>
                    {t.assignedBy === "coach" && <CoachBadge />}
                  </div>
                  <p
                    className={cn(
                      "mt-2 text-sm leading-snug font-medium",
                      t.done && "text-muted-foreground line-through",
                    )}
                  >
                    {t.title}
                  </p>
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    {t.subject}
                    {t.done && t.result?.solved != null
                      ? ` · ${t.result.solved} soru · ${t.result.wrong ?? 0} yanlış`
                      : ""}
                  </p>
                </div>
              ))}
              {dayTasks.length === 0 && (
                <p className="rounded-xl border border-dashed border-border px-3 py-6 text-center text-xs text-muted-foreground">
                  Boş gün
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

const netTotal = (e: MockExam) => e.turkce + e.matematik + e.sosyal + e.fen;

function StudentMockExams({ student }: { student: Student }) {
  const { mockExamList } = useDemoData();
  const rows = mockExamList.filter(
    (e) => e.studentId === student.id,
  );

  if (rows.length === 0) {
    return (
      <Card className="rounded-3xl border-dashed p-8 text-center text-sm text-muted-foreground">
        Bu öğrencinin kayıtlı denemesi yok.
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden rounded-3xl border-border p-0 shadow-soft">
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
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((e, i) => (
            <TableRow key={e.id} className={cn(i % 2 === 1 && "bg-secondary/30")}>
              <TableCell>{e.date}</TableCell>
              <TableCell className="font-medium">{e.publisher}</TableCell>
              <TableCell className="text-muted-foreground">{e.type}</TableCell>
              <TableCell className="text-right">{e.turkce}</TableCell>
              <TableCell className="text-right">{e.matematik}</TableCell>
              <TableCell className="text-right">{e.sosyal}</TableCell>
              <TableCell className="text-right">{e.fen}</TableCell>
              <TableCell className="text-right">
                <span className="rounded-full bg-brand-soft px-3 py-1 font-display text-sm font-bold text-brand-deep">
                  {netTotal(e).toFixed(1)}
                </span>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}

type JournalGroup = {
  key: string;
  label: string;
  rows: Task[];
};

function trDate(iso: string) {
  const d = new Date(`${iso}T00:00:00`);
  return format(d, "d MMMM yyyy EEEE", { locale: tr });
}

function weekLabel(iso: string) {
  const d = new Date(`${iso}T00:00:00`);
  const day = (d.getDay() + 6) % 7;
  const start = new Date(d);
  start.setDate(d.getDate() - day);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  return {
    key: start.toISOString().slice(0, 10),
    label: `${format(start, "d MMM", { locale: tr })} — ${format(end, "d MMM yyyy", { locale: tr })}`,
  };
}

function StudyJournal({ tasks }: { tasks: Task[] }) {
  const [mode, setMode] = useState<"gun" | "hafta">("gun");

  const groups = useMemo<JournalGroup[]>(() => {
    const done = tasks.filter((t) => t.done && t.completedAt);
    const map = new Map<string, JournalGroup>();
    for (const t of done) {
      const iso = t.completedAt!;
      const g =
        mode === "gun"
          ? { key: iso, label: trDate(iso) }
          : weekLabel(iso);
      const cur = map.get(g.key) ?? { ...g, rows: [] };
      cur.rows.push(t);
      map.set(g.key, cur);
    }
    return Array.from(map.values()).sort((a, b) => (a.key < b.key ? 1 : -1));
  }, [tasks, mode]);

  if (groups.length === 0) {
    return (
      <Card className="rounded-3xl border-dashed p-8 text-center text-sm text-muted-foreground">
        Bu öğrencinin tamamlanmış çalışma kaydı yok.
      </Card>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex gap-1.5">
        {(["gun", "hafta"] as const).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={cn(
              "rounded-full border border-border px-4 py-1.5 text-xs font-semibold transition-colors",
              mode === m
                ? "border-primary bg-primary text-primary-foreground"
                : "bg-card text-muted-foreground hover:bg-brand-soft",
            )}
          >
            {m === "gun" ? "Günlük" : "Haftalık"}
          </button>
        ))}
      </div>

      {groups.map((g) => {
        const solved = g.rows.reduce((n, t) => n + (t.result?.solved ?? 0), 0);
        const wrong = g.rows.reduce((n, t) => n + (t.result?.wrong ?? 0), 0);
        const blank = g.rows.reduce((n, t) => n + (t.result?.blank ?? 0), 0);
        const correct = solved - wrong - blank;
        return (
          <Card
            key={g.key}
            className="overflow-hidden rounded-3xl border-border p-0 shadow-soft"
          >
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-secondary/50 px-5 py-3">
              <span className="font-display text-sm font-bold text-brand-deep">
                {g.label}
              </span>
              <span className="flex flex-wrap gap-2 text-[11px] font-semibold">
                <span className="rounded-full bg-card px-2.5 py-0.5 text-muted-foreground">
                  {g.rows.length} çalışma
                </span>
                <span className="rounded-full bg-brand-soft px-2.5 py-0.5 text-brand-deep">
                  {solved} soru
                </span>
                <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-primary">
                  {Math.max(0, correct)} doğru
                </span>
                <span className="rounded-full bg-destructive/10 px-2.5 py-0.5 text-destructive">
                  {wrong} yanlış
                </span>
                <span className="rounded-full bg-muted px-2.5 py-0.5 text-muted-foreground">
                  {blank} boş
                </span>
              </span>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tür</TableHead>
                  <TableHead>Ders</TableHead>
                  <TableHead>Alan / Konu</TableHead>
                  <TableHead>Kaynak</TableHead>
                  <TableHead className="text-right">Soru</TableHead>
                  <TableHead className="text-right">Doğru</TableHead>
                  <TableHead className="text-right">Yanlış</TableHead>
                  <TableHead className="text-right">Boş</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {g.rows.map((t, i) => {
                  const s = t.result?.solved;
                  const w = t.result?.wrong ?? 0;
                  const b = t.result?.blank ?? 0;
                  return (
                    <TableRow
                      key={t.id}
                      className={cn(i % 2 === 1 && "bg-secondary/30")}
                    >
                      <TableCell>
                        <span className="flex items-center gap-1.5">
                          <span className="rounded-full bg-brand-soft px-2 py-0.5 text-[11px] font-semibold text-brand-deep">
                            {TASK_KIND_LABELS[t.kind]}
                          </span>
                          {t.assignedBy === "coach" && <CoachBadge />}
                        </span>
                      </TableCell>
                      <TableCell className="font-medium">{t.subject}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {t.areaName ?? t.title}
                      </TableCell>
                      <TableCell>{t.result?.source ?? "—"}</TableCell>
                      <TableCell className="text-right">{s ?? "—"}</TableCell>
                      <TableCell className="text-right">
                        {s != null ? Math.max(0, s - w - b) : "—"}
                      </TableCell>
                      <TableCell className="text-right">
                        {s != null ? w : "—"}
                      </TableCell>
                      <TableCell className="text-right">
                        {s != null ? b : "—"}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </Card>
        );
      })}
    </div>
  );
}
