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
  Search,
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
  flatTopics,
  useDemoData,
  type Task,
  type TaskKind,
  type TopicOption,
} from "@/lib/demo-data";
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

function TopicPicker({
  topics,
  value,
  onSelect,
}: {
  topics: TopicOption[];
  value: TopicOption | null;
  onSelect: (t: TopicOption) => void;
}) {
  const [q, setQ] = useState("");
  const filtered = useMemo(() => {
    const needle = q.toLocaleLowerCase("tr");
    return topics
      .filter((t) => t.label.toLocaleLowerCase("tr").includes(needle))
      .slice(0, 60);
  }, [topics, q]);

  return (
    <div className="space-y-2">
      <Label>Konu</Label>
      <div className="relative">
        <Search className="absolute top-2.5 left-3 size-4 text-muted-foreground" />
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Ders, alan veya konu ara…"
          className="pl-9"
        />
      </div>
      <div className="max-h-52 space-y-1 overflow-y-auto rounded-xl border border-border p-1">
        {filtered.map((t) => (
          <button
            key={t.topicId}
            type="button"
            onClick={() => onSelect(t)}
            className={cn(
              "w-full rounded-lg px-3 py-2 text-left text-sm transition-colors hover:bg-secondary",
              value?.topicId === t.topicId && "bg-brand-soft text-brand-deep",
            )}
          >
            <span className="block font-medium">{t.topicName}</span>
            <span className="block text-xs text-muted-foreground">
              {t.examName} · {t.subjectName} · {t.areaName}
            </span>
          </button>
        ))}
        {filtered.length === 0 && (
          <p className="px-3 py-6 text-center text-xs text-muted-foreground">
            Konu bulunamadı
          </p>
        )}
      </div>
    </div>
  );
}

function Odevler() {
  const {
    tasks,
    addTask,
    completeTask,
    moveTask,
    currentStudent,
    examData,
    addLog,
    addMockExam,
  } = useDemoData();

  const [weekOffset, setWeekOffset] = useState(0);
  const [dragId, setDragId] = useState<string | null>(null);
  const [addKind, setAddKind] = useState<TaskKind | null>(null);
  const [active, setActive] = useState<Task | null>(null);

  const topics = useMemo(
    () =>
      currentStudent ? flatTopics(examsForStudent(examData, currentStudent)) : [],
    [examData, currentStudent],
  );

  const [picked, setPicked] = useState<TopicOption | null>(null);
  const [day, setDay] = useState("0");
  const [note, setNote] = useState("");

  const [res, setRes] = useState({ solved: "", wrong: "", blank: "" });
  const [mock, setMock] = useState({
    publisher: "",
    type: "TYT",
    turkce: "",
    matematik: "",
    sosyal: "",
    fen: "",
  });

  const base = addWeeks(new Date(), weekOffset);
  const start = startOfWeek(base, { weekStartsOn: 1 });
  const end = endOfWeek(base, { weekStartsOn: 1 });
  const weekTasks = tasks.filter((t) => t.studentId === currentStudent?.id);

  const openAdd = (kind: TaskKind) => {
    setPicked(null);
    setNote("");
    setDay("0");
    setAddKind(kind);
  };

  const openRecord = (t: Task) => {
    setRes({ solved: "", wrong: "", blank: "" });
    setMock({
      publisher: "",
      type: "TYT",
      turkce: "",
      matematik: "",
      sosyal: "",
      fen: "",
    });
    setActive(t);
  };

  const saveTask = () => {
    if (!picked) {
      toast.error("Lütfen bir konu seç");
      return;
    }
    addTask({
      kind: addKind ?? "konu",
      subject: picked.subjectName,
      title: note.trim() || picked.topicName,
      topicId: picked.topicId,
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
            <TopicPicker topics={topics} value={picked} onSelect={setPicked} />
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
                  if (active.topicId)
                    addLog(active.topicId, {
                      date: new Date().toLocaleDateString("tr-TR"),
                      source: active.title,
                      solved,
                      wrong,
                      blank,
                    });
                  completeTask(active.id, { solved, wrong, blank });
                  setActive(null);
                  toast.success("Soru çözümü kaydedildi");
                }}
              >
                Sonucu kaydet
              </Button>
            </div>
          )}

          {active?.kind === "deneme" && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Kurum / Yayın</Label>
                  <Input
                    value={mock.publisher}
                    placeholder="Ör: 3D Yayınları"
                    onChange={(e) =>
                      setMock({ ...mock, publisher: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Tür</Label>
                  <Select
                    value={mock.type}
                    onValueChange={(v) => setMock({ ...mock, type: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="TYT">TYT</SelectItem>
                      <SelectItem value="AYT">AYT</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {(["turkce", "matematik", "sosyal", "fen"] as const).map((k) => (
                  <div key={k} className="space-y-2">
                    <Label className="capitalize">
                      {k === "turkce"
                        ? "Türkçe net"
                        : k === "matematik"
                          ? "Matematik net"
                          : k === "sosyal"
                            ? "Sosyal net"
                            : "Fen net"}
                    </Label>
                    <Input
                      type="number"
                      step="0.25"
                      value={mock[k]}
                      onChange={(e) => setMock({ ...mock, [k]: e.target.value })}
                    />
                  </div>
                ))}
              </div>
              <Button
                className="w-full rounded-xl"
                onClick={() => {
                  if (!mock.publisher.trim()) {
                    toast.error("Kurum adı gerekli");
                    return;
                  }
                  const id = addMockExam({
                    date: new Date().toLocaleDateString("tr-TR"),
                    publisher: mock.publisher.trim(),
                    type: mock.type === "AYT" ? "AYT" : "TYT",
                    turkce: Number(mock.turkce) || 0,
                    matematik: Number(mock.matematik) || 0,
                    sosyal: Number(mock.sosyal) || 0,
                    fen: Number(mock.fen) || 0,
                  });
                  completeTask(active.id, { mockExamId: id });
                  setActive(null);
                  toast.success("Deneme sonucu kaydedildi");
                }}
              >
                Denemeyi kaydet
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {topics.length === 0 && (
        <Card className="rounded-2xl border-dashed p-6 text-center text-sm text-muted-foreground">
          Konu listesi için önce giriş yapmalısın.
        </Card>
      )}
    </div>
  );
}
