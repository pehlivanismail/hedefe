import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  GripVertical,
  ListChecks,
  Plus,
} from "lucide-react";
import { addWeeks, endOfWeek, format, startOfWeek } from "date-fns";
import { tr } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import {
  DAYS,
  TASK_KIND_LABELS,
  examsForStudent,
  useDemoData,
  type Task,
  type TaskKind,
} from "@/lib/demo-data";
import { MockExamForm } from "@/components/mock-exam-form";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/odevler")({
  head: () => ({
    meta: [
      { title: "Ödevler ve Hedefler — Hedefe.net" },
      {
        name: "description",
        content:
          "Haftalık çalışma planını konu bazında yönet: konu çalışması, soru çözümü ve deneme ödevleri ekle, sonuçlarını kaydet.",
      },
      { property: "og:title", content: "Ödevler ve Hedefler — Hedefe.net" },
      {
        property: "og:description",
        content: "Konu bazlı haftalık çalışma planı ve sonuç kaydı.",
      },
    ],
  }),
  component: Odevler,
});

const KIND_STYLE: Record<TaskKind, string> = {
  konu: "bg-brand-soft text-brand-deep",
  soru: "bg-secondary text-foreground",
  deneme: "bg-warning/15 text-warning",
};

function Odevler() {
  const {
    tasks,
    addTask,
    completeTask,
    moveTask,
    currentStudent,
    examData,
    addLog,
    addAreaLog,
    addMockExam,
  } = useDemoData();

  const [weekOffset, setWeekOffset] = useState(0);
  const [dragId, setDragId] = useState<string | null>(null);
  const [addKind, setAddKind] = useState<TaskKind | null>(null);
  const [active, setActive] = useState<Task | null>(null);

  const subjects = useMemo(() => {
    if (!currentStudent) return [];
    return examsForStudent(examData, currentStudent).flatMap((e) =>
      e.subjects.map((s) => ({ ...s, examName: e.name })),
    );
  }, [examData, currentStudent]);

  const [subjectId, setSubjectId] = useState("");
  const [areaId, setAreaId] = useState("");
  const [topicId, setTopicId] = useState("");
  const [examScope, setExamScope] = useState("TYT");
  const [day, setDay] = useState("0");
  const [note, setNote] = useState("");

  const subject = subjects.find((s) => s.id === subjectId) ?? null;
  const area = subject?.areas.find((a) => a.id === areaId) ?? null;
  const topic = area?.topics.find((t) => t.id === topicId) ?? null;

  /** Deneme ödevleri için benzersiz dersler (TYT/AYT önekli branş denemesi) */
  const denemeSubjects = useMemo(() => {
    const seen = new Map<string, string>();
    for (const s of subjects) {
      const prefix = s.examName.startsWith("AYT") ? "AYT" : "TYT";
      seen.set(`${prefix} ${s.name}`, `${prefix} ${s.name} Branş Denemesi`);
    }
    return Array.from(seen, ([value, label]) => ({ value, label })).sort(
      (a, b) => a.label.localeCompare(b.label, "tr"),
    );
  }, [subjects]);

  const [res, setRes] = useState({ solved: "", wrong: "", blank: "" });

  const base = addWeeks(new Date(), weekOffset);
  const start = startOfWeek(base, { weekStartsOn: 1 });
  const end = endOfWeek(base, { weekStartsOn: 1 });
  const weekTasks = tasks.filter((t) => t.studentId === currentStudent?.id);

  const openAdd = (kind: TaskKind) => {
    setSubjectId("");
    setAreaId("");
    setTopicId("");
    setExamScope("TYT");
    setNote("");
    setDay("0");
    setAddKind(kind);
  };


  const openRecord = (t: Task) => {
    setRes({ solved: "", wrong: "", blank: "" });
    setActive(t);
  };

  const saveTask = () => {
    if (addKind === "deneme") {
      const label =
        examScope === "TYT"
          ? "TYT Denemesi"
          : examScope === "AYT"
            ? "AYT Denemesi"
            : (denemeSubjects.find((d) => d.value === examScope)?.label ??
              `${examScope} Branş Denemesi`);
      addTask({
        kind: "deneme",
        subject: examScope,
        title: note.trim() || label,
        topicId: null,
        areaId: null,
        day: Number(day),
        studentId: currentStudent?.id ?? "s1",
      });
      setAddKind(null);
      toast.success("Deneme eklendi");
      return;
    }
    if (!subject) {
      toast.error("Lütfen bir ders seç");
      return;
    }
    if (!area) {
      toast.error("Lütfen bir alan seç");
      return;
    }
    addTask({
      kind: addKind ?? "konu",
      subject: subject.name,
      title: note.trim() || topic?.name || area.name,
      topicId: topic ? topic.id : null,
      areaId: topic ? null : area.id,
      day: Number(day),
      studentId: currentStudent?.id ?? "s1",
    });
    setAddKind(null);
    toast.success(`${TASK_KIND_LABELS[addKind ?? "konu"]} eklendi`);
  };


  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-brand-deep">
            📝 Ödevler ve Hedefler
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Konu listenden seç, haftaya yerleştir, tamamlarken sonucunu kaydet.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button className="rounded-xl" onClick={() => openAdd("konu")}>
            <BookOpen className="size-4" /> Konu Çalışması Ekle
          </Button>
          <Button
            variant="secondary"
            className="rounded-xl"
            onClick={() => openAdd("soru")}
          >
            <ListChecks className="size-4" /> Soru Çözümü Ekle
          </Button>
          <Button
            variant="outline"
            className="rounded-xl"
            onClick={() => openAdd("deneme")}
          >
            <ClipboardList className="size-4" /> Deneme Ekle
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3 shadow-soft">
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full"
          onClick={() => setWeekOffset((w) => w - 1)}
          aria-label="Önceki hafta"
        >
          <ChevronLeft className="size-4" />
        </Button>
        <span className="font-display text-sm font-semibold text-brand-deep">
          {format(start, "d MMM", { locale: tr })} —{" "}
          {format(end, "d MMM", { locale: tr })}
        </span>
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full"
          onClick={() => setWeekOffset((w) => w + 1)}
          aria-label="Sonraki hafta"
        >
          <ChevronRight className="size-4" />
        </Button>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4">
        {DAYS.map((d, i) => {
          const dayTasks = weekTasks.filter((t) => t.day === i);
          return (
            <div
              key={d}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => {
                if (dragId) moveTask(dragId, i);
                setDragId(null);
              }}
              className="flex w-64 shrink-0 flex-col rounded-2xl bg-secondary/60 p-3"
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
                  <button
                    key={t.id}
                    type="button"
                    draggable
                    onDragStart={() => setDragId(t.id)}
                    onClick={() => openRecord(t)}
                    className={cn(
                      "group w-full cursor-pointer rounded-xl border border-border bg-card p-3 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-soft",
                      t.done && "opacity-55",
                    )}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={cn(
                          "rounded-full px-2 py-0.5 text-[11px] font-semibold",
                          KIND_STYLE[t.kind],
                        )}
                      >
                        {TASK_KIND_LABELS[t.kind]}
                      </span>
                      <GripVertical className="size-3.5 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
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
                  </button>
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

      {/* Ödev ekleme */}
      <Dialog open={addKind !== null} onOpenChange={(o) => !o && setAddKind(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-display text-brand-deep">
              {addKind ? TASK_KIND_LABELS[addKind] : ""} Ekle
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {addKind === "deneme" ? (
              <div className="space-y-2">
                <Label>Deneme Türü</Label>
                <Select value={examScope} onValueChange={setExamScope}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seç" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="TYT">TYT Denemesi</SelectItem>
                    <SelectItem value="AYT">AYT Denemesi</SelectItem>
                    {denemeSubjects.map((d) => (
                      <SelectItem key={d.value} value={d.value}>
                        {d.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  <Label>Ders</Label>
                  <Select
                    value={subjectId}
                    onValueChange={(v) => {
                      setSubjectId(v);
                      setAreaId("");
                      setTopicId("");
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Ders seç" />
                    </SelectTrigger>
                    <SelectContent>
                      {subjects.map((s) => (
                        <SelectItem key={s.id} value={s.id}>
                          {s.examName} · {s.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Alan</Label>
                  <Select
                    value={areaId}
                    onValueChange={(v) => {
                      setAreaId(v);
                      setTopicId("");
                    }}
                    disabled={!subject}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Alan seç" />
                    </SelectTrigger>
                    <SelectContent>
                      {(subject?.areas ?? []).map((a) => (
                        <SelectItem key={a.id} value={a.id}>
                          {a.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>
                    Konu{" "}
                    <span className="text-xs font-normal text-muted-foreground">
                      (opsiyonel — boş bırakırsan alan geneli sayılır)
                    </span>
                  </Label>
                  <Select
                    value={topicId}
                    onValueChange={(v) => setTopicId(v === "__all" ? "" : v)}
                    disabled={!area}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Tüm alan" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__all">Tüm alan</SelectItem>
                      {(area?.topics ?? []).map((t) => (
                        <SelectItem key={t.id} value={t.id}>
                          {t.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}

            <div className="space-y-2">
              <Label>Açıklama (opsiyonel)</Label>
              <Input
                value={note}
                placeholder="Ör: 40 soruluk test"
                onChange={(e) => setNote(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Gün</Label>
              <Select value={day} onValueChange={setDay}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DAYS.map((d, i) => (
                    <SelectItem key={d} value={String(i)}>
                      {d}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button className="w-full rounded-xl" onClick={saveTask}>
              <Plus className="size-4" /> Kaydet
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Sonuç kaydı */}
      <Dialog open={active !== null} onOpenChange={(o) => !o && setActive(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-display text-brand-deep">
              {active ? TASK_KIND_LABELS[active.kind] : ""} — {active?.title}
            </DialogTitle>
          </DialogHeader>

          {active?.kind === "konu" && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                {active.subject} konusunu çalıştıysan işaretle.
              </p>
              <Button
                className="w-full rounded-xl"
                disabled={active.done}
                onClick={() => {
                  completeTask(active.id);
                  setActive(null);
                  toast.success("Konu çalışması tamamlandı");
                }}
              >
                {active.done ? "Zaten tamamlandı" : "Tamamlandı olarak işaretle"}
              </Button>
            </div>
          )}

          {active?.kind === "soru" && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                {(["solved", "wrong", "blank"] as const).map((k) => (
                  <div key={k} className="space-y-2">
                    <Label>
                      {k === "solved" ? "Çözülen" : k === "wrong" ? "Yanlış" : "Boş"}
                    </Label>
                    <Input
                      type="number"
                      min={0}
                      value={res[k]}
                      onChange={(e) => setRes({ ...res, [k]: e.target.value })}
                    />
                  </div>
                ))}
              </div>
              <Button
                className="w-full rounded-xl"
                onClick={() => {
                  const solved = Number(res.solved);
                  if (!solved) {
                    toast.error("Çözülen soru sayısı gerekli");
                    return;
                  }
                  const wrong = Number(res.wrong) || 0;
                  const blank = Number(res.blank) || 0;
                  const log = {
                    date: new Date().toLocaleDateString("tr-TR"),
                    source: active.title,
                    solved,
                    wrong,
                    blank,
                  };
                  if (active.topicId) addLog(active.topicId, log);
                  else if (active.areaId) addAreaLog(active.areaId, log);
                  completeTask(active.id, { solved, wrong, blank });
                  setActive(null);
                  toast.success("Soru çözümü kaydedildi");
                }}
              >
                Sonucu kaydet
              </Button>
            </div>
          )}

          {active?.kind === "deneme" &&
            (() => {
              const s = active.subject;
              const brans = /^(TYT|AYT) (.+)$/.exec(s);
              const scopeProps =
                s === "TYT" || s === "AYT"
                  ? { fixedKind: s as "TYT" | "AYT" }
                  : brans
                    ? {
                        fixedKind: brans[1] as "TYT" | "AYT",
                        onlySubject: brans[2]!,
                      }
                    : { onlySubject: s };
              return (
                <MockExamForm
                  track={currentStudent?.track ?? "sayisal"}
                  submitLabel="Denemeyi kaydet"
                  {...scopeProps}

                  onSave={(e) => {
                    const id = addMockExam(e);
                    completeTask(active.id, { mockExamId: id });
                    setActive(null);
                    toast.success("Deneme sonucu kaydedildi");
                  }}
                />
              );
            })()}
        </DialogContent>
      </Dialog>

      {subjects.length === 0 && (
        <Card className="rounded-2xl border-dashed p-6 text-center text-sm text-muted-foreground">
          Konu listesi için önce giriş yapmalısın.
        </Card>
      )}
    </div>
  );
}
