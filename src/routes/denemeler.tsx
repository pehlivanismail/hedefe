import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus } from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
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
import { useDemoData, type MockExam } from "@/lib/demo-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/denemeler")({
  head: () => ({
    meta: [
      { title: "Denemeler — Hedefe.net" },
      {
        name: "description",
        content:
          "TYT ve AYT deneme netlerinin grafiği ve geçmiş deneme sonuçları tablosu.",
      },
      { property: "og:title", content: "Denemeler — Hedefe.net" },
      {
        property: "og:description",
        content: "TYT ve AYT net ilerlemeni takip et.",
      },
    ],
  }),
  component: Denemeler,
});

const total = (e: MockExam) => e.turkce + e.matematik + e.sosyal + e.fen;

function NetChart({
  title,
  data,
  color,
  id,
}: {
  title: string;
  data: { date: string; net: number }[];
  color: string;
  id: string;
}) {
  return (
    <Card className="rounded-3xl border-border p-6 shadow-soft">
      <h3 className="font-display text-lg font-bold text-brand-deep">{title}</h3>
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
            <YAxis tickLine={false} axisLine={false} fontSize={12} />
            <Tooltip
              contentStyle={{
                borderRadius: 12,
                border: "1px solid var(--border)",
                background: "var(--card)",
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

const SECTIONS = [
  { key: "turkce", label: "Türkçe", max: 40 },
  { key: "matematik", label: "Matematik", max: 40 },
  { key: "sosyal", label: "Sosyal", max: 20 },
  { key: "fen", label: "Fen", max: 20 },
] as const;

type SectionKey = (typeof SECTIONS)[number]["key"];
type Entry = Record<SectionKey, { dogru: string; yanlis: string }>;

const emptyEntry = (): Entry => ({
  turkce: { dogru: "", yanlis: "" },
  matematik: { dogru: "", yanlis: "" },
  sosyal: { dogru: "", yanlis: "" },
  fen: { dogru: "", yanlis: "" },
});

const net = (c: { dogru: string; yanlis: string }) =>
  Math.max(0, (Number(c.dogru) || 0) - (Number(c.yanlis) || 0) / 4);

function Denemeler() {
  const { mockExamList, addMockExam } = useDemoData();
  const rows = mockExamList;
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<"TYT" | "AYT">("TYT");
  const [publisher, setPublisher] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [entry, setEntry] = useState<Entry>(emptyEntry);

  const totalNet = SECTIONS.reduce((sum, s) => sum + net(entry[s.key]), 0);

  const tyt = rows
    .filter((e) => e.type === "TYT")
    .map((e) => ({ date: e.date.slice(0, 5), net: total(e) }));
  const ayt = rows
    .filter((e) => e.type === "AYT")
    .map((e) => ({ date: e.date.slice(0, 5), net: total(e) }));

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
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="font-display text-brand-deep">
                Yeni Deneme Sonucu
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Sınav Türü</Label>
                  <Select
                    value={type}
                    onValueChange={(v) => setType(v as "TYT" | "AYT")}
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
                <div className="space-y-2">
                  <Label>Tarih</Label>
                  <Input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Kurum / Yayın</Label>
                <Input
                  value={publisher}
                  placeholder="Ör: Endemik Yayınları"
                  onChange={(e) => setPublisher(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Doğru / Yanlış</Label>
                <div className="space-y-2 rounded-xl border border-border p-3">
                  {SECTIONS.map((s) => (
                    <div key={s.key} className="flex items-center gap-3">
                      <span className="w-24 text-sm font-medium">{s.label}</span>
                      <Input
                        type="number"
                        min={0}
                        max={s.max}
                        placeholder="Doğru"
                        value={entry[s.key].dogru}
                        onChange={(e) =>
                          setEntry({
                            ...entry,
                            [s.key]: { ...entry[s.key], dogru: e.target.value },
                          })
                        }
                      />
                      <Input
                        type="number"
                        min={0}
                        max={s.max}
                        placeholder="Yanlış"
                        value={entry[s.key].yanlis}
                        onChange={(e) =>
                          setEntry({
                            ...entry,
                            [s.key]: { ...entry[s.key], yanlis: e.target.value },
                          })
                        }
                      />
                      <span className="w-14 text-right font-display text-sm font-bold text-brand-deep">
                        {net(entry[s.key]).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
                <p className="text-right text-sm text-muted-foreground">
                  Toplam net:{" "}
                  <span className="font-display font-bold text-brand-deep">
                    {totalNet.toFixed(2)}
                  </span>
                </p>
              </div>

              <Button
                className="w-full rounded-xl"
                onClick={() => {
                  if (!publisher.trim()) {
                    toast.error("Kurum adı gerekli");
                    return;
                  }
                  addMockExam({
                    date: new Date(date).toLocaleDateString("tr-TR"),
                    publisher: publisher.trim(),
                    type,
                    turkce: Number(net(entry.turkce).toFixed(2)),
                    matematik: Number(net(entry.matematik).toFixed(2)),
                    sosyal: Number(net(entry.sosyal).toFixed(2)),
                    fen: Number(net(entry.fen).toFixed(2)),
                  });
                  setEntry(emptyEntry());
                  setPublisher("");
                  setOpen(false);
                  toast.success("Deneme sonucu eklendi");
                }}
              >
                Kaydet
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <NetChart
          id="tytGrad"
          title="TYT Net İlerlemesi"
          data={tyt}
          color="oklch(0.7 0.157 159.5)"
        />
        <NetChart
          id="aytGrad"
          title="AYT Net İlerlemesi"
          data={ayt}
          color="oklch(0.45 0.09 220)"
        />
      </div>

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
                    {total(e).toFixed(1)}
                  </span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
