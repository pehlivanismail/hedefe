import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ChevronLeft, ChevronRight, Plus, GripVertical } from "lucide-react";
import { addWeeks, endOfWeek, format, startOfWeek } from "date-fns";
import { tr } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
  SUBJECT_OPTIONS,
  useDemoData,
} from "@/lib/demo-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/odevler")({
  head: () => ({
    meta: [
      { title: "Ödevler ve Hedefler — Hedefe.net" },
      {
        name: "description",
        content:
          "Haftalık çalışma planını kanban görünümünde yönet: ödev ekle, günler arasında taşı, tamamla.",
      },
      { property: "og:title", content: "Ödevler ve Hedefler — Hedefe.net" },
      {
        property: "og:description",
        content: "Haftalık kanban çalışma planı.",
      },
    ],
  }),
  component: Odevler,
});

function Odevler() {
  const { tasks, addTask, toggleTask, moveTask, currentStudent } =
    useDemoData();
  const [weekOffset, setWeekOffset] = useState(0);
  const [open, setOpen] = useState(false);
  const [dragId, setDragId] = useState<string | null>(null);
  const [form, setForm] = useState({ subject: "Matematik", title: "", day: "0" });

  const base = addWeeks(new Date(), weekOffset);
  const start = startOfWeek(base, { weekStartsOn: 1 });
  const end = endOfWeek(base, { weekStartsOn: 1 });
  const weekTasks = tasks.filter((t) => t.studentId === currentStudent?.id);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-brand-deep">
            📝 Ödevler ve Hedefler
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Haftalık planını sürükleyerek düzenle.
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-xl">
              <Plus className="size-4" /> Ödev Ekle
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="font-display text-brand-deep">
                Yeni Ödev
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Ders</Label>
                <Select
                  value={form.subject}
                  onValueChange={(v) => setForm({ ...form, subject: v })}
                >
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
                <Label>Başlık</Label>
                <Input
                  value={form.title}
                  placeholder="Ör: Türev Test 2"
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Gün</Label>
                <Select
                  value={form.day}
                  onValueChange={(v) => setForm({ ...form, day: v })}
                >
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
              <Button
                className="w-full rounded-xl"
                onClick={() => {
                  if (!form.title.trim()) {
                    toast.error("Başlık gerekli");
                    return;
                  }
                  addTask({
                    subject: form.subject,
                    title: form.title,
                    day: Number(form.day),
                    studentId: currentStudent?.id ?? "s1",
                  });
                  setForm({ ...form, title: "" });
                  setOpen(false);
                  toast.success("Ödev eklendi");
                }}
              >
                Kaydet
              </Button>
            </div>
          </DialogContent>
        </Dialog>
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
        {DAYS.map((day, i) => {
          const dayTasks = weekTasks.filter((t) => t.day === i);
          return (
            <div
              key={day}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => {
                if (dragId) moveTask(dragId, i);
                setDragId(null);
              }}
              className="flex w-64 shrink-0 flex-col rounded-2xl bg-secondary/60 p-3"
            >
              <div className="mb-3 flex items-center justify-between px-1">
                <span className="font-display text-sm font-bold text-brand-deep">
                  {day}
                </span>
                <span className="rounded-full bg-card px-2 py-0.5 text-[11px] font-semibold text-muted-foreground">
                  {dayTasks.length}
                </span>
              </div>
              <div className="space-y-2">
                {dayTasks.map((t) => (
                  <div
                    key={t.id}
                    draggable
                    onDragStart={() => setDragId(t.id)}
                    className={cn(
                      "group cursor-grab rounded-xl border border-border bg-card p-3 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-soft",
                      t.done && "opacity-55",
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span className="rounded-full bg-brand-soft px-2 py-0.5 text-[11px] font-semibold text-brand-deep">
                        {t.subject}
                      </span>
                      <GripVertical className="size-3.5 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                    </div>
                    <div className="mt-2 flex items-start gap-2">
                      <Checkbox
                        checked={t.done}
                        onCheckedChange={() => toggleTask(t.id)}
                        className="mt-0.5"
                      />
                      <span
                        className={cn(
                          "text-sm leading-snug",
                          t.done && "text-muted-foreground line-through",
                        )}
                      >
                        {t.title}
                      </span>
                    </div>
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
    </div>
  );
}
