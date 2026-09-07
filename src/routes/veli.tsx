import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import { CalendarDays, Flame, TriangleAlert, Users } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PairInvites } from "@/components/pair-invites";
import { ParentCoachChat } from "@/components/parent-coach-chat";
import {
  StudentMockExams,
  StudentWeek,
  StudyJournal,
  StudentScores,
  TopicAnalysis,
} from "@/routes/koc";
import { useAuth } from "@/lib/auth";
import {
  daysUntilYks,
  examsForStudent,
  overallStats,
  useDemoData,
} from "@/lib/demo-data";

export const Route = createFileRoute("/veli")({
  head: () => ({
    meta: [
      { title: "Veli Paneli — Hedefe.net" },
      {
        name: "description",
        content:
          "Çocuğunun haftalık planını, günlük çalışmalarını ve deneme sonuçlarını takip et; koçuyla iletişim kur.",
      },
      { property: "og:title", content: "Veli Paneli — Hedefe.net" },
      {
        property: "og:description",
        content: "Çocuğunun YKS hazırlığını tek ekrandan takip et.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: VeliPaneli,
});

function VeliPaneli() {
  const { user, role, child, loading } = useAuth();
  const { tasks, studyLogs, examData, setViewStudentId } = useDemoData();

  useEffect(() => {
    setViewStudentId(child?.id ?? null);
  }, [child?.id, setViewStudentId]);

  if (loading) {
    return (
      <p className="py-20 text-center text-sm text-muted-foreground">
        Yükleniyor…
      </p>
    );
  }

  if (!user || role !== "parent") {
    return (
      <Card className="mx-auto mt-16 max-w-md rounded-3xl border-border p-10 text-center shadow-soft">
        <Users className="mx-auto size-10 text-primary" />
        <h1 className="mt-4 font-display text-2xl font-bold text-brand-deep">
          Veli Paneli
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Bu sayfayı görmek için veli hesabınla giriş yapmalısın.
        </p>
      </Card>
    );
  }

  if (!child) {
    return (
      <div className="mx-auto mt-12 max-w-xl space-y-6">
        <Card className="rounded-3xl border-border bg-brand-deep p-8 text-primary-foreground shadow-soft">
          <h1 className="font-display text-2xl font-bold">
            👋 Hoş geldin, veli paneli
          </h1>
          <p className="mt-2 text-sm opacity-80">
            Çocuğunun e-postasını girip davet gönder. Çocuğun daveti
            onayladığında haftalık planını, çalışmalarını ve deneme
            sonuçlarını buradan takip edebilirsin.
          </p>
        </Card>
        <PairInvites role="parent" />
      </div>
    );
  }

  const studentTasks = tasks.filter((t) => t.studentId === child.id);
  const pending = studentTasks.filter((t) => !t.done).length;
  const stats = overallStats(examsForStudent(examData, child, studyLogs));

  return (
    <div className="space-y-6 py-6">
      <Card className="rounded-3xl border-none bg-brand-deep p-8 text-primary-foreground shadow-soft">
        <p className="text-xs font-semibold uppercase tracking-widest opacity-70">
          Veli Paneli
        </p>
        <h1 className="mt-1 font-display text-3xl font-bold">
          {child.name}
        </h1>
        <p className="mt-1 text-sm opacity-80">
          🎯 {child.target || "Hedef belirlenmedi"}
        </p>
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl bg-white/10 p-4 backdrop-blur">
            <p className="flex items-center gap-2 text-xs opacity-80">
              <Flame className="size-4" /> YKS'ye kalan
            </p>
            <p className="mt-1 font-display text-2xl font-bold text-primary">
              {daysUntilYks()} gün
            </p>
          </div>
          <div className="rounded-2xl bg-white/10 p-4 backdrop-blur">
            <p className="flex items-center gap-2 text-xs opacity-80">
              <CalendarDays className="size-4" /> Bekleyen ödev
            </p>
            <p className="mt-1 font-display text-2xl font-bold">{pending}</p>
          </div>
          <div className="rounded-2xl bg-white/10 p-4 backdrop-blur">
            <p className="flex items-center gap-2 text-xs opacity-80">
              <TriangleAlert className="size-4" /> Öğrenme borcu
            </p>
            <p className="mt-1 font-display text-2xl font-bold text-destructive">
              {stats.debt}
            </p>
          </div>
        </div>
      </Card>

      <Tabs defaultValue="durum">
        <TabsList className="flex w-full flex-wrap justify-start rounded-full">
          <TabsTrigger value="durum" className="rounded-full">
            Genel Durum
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
          <TabsTrigger value="konu" className="rounded-full">
            Konu Analizi
          </TabsTrigger>
          <TabsTrigger value="mesaj" className="rounded-full">
            Koç ile İletişim
          </TabsTrigger>
        </TabsList>

        <TabsContent value="durum" className="mt-5">
          <StudentScores student={child} />
        </TabsContent>
        <TabsContent value="plan" className="mt-5">
          <StudentWeek tasks={studentTasks} />
        </TabsContent>
        <TabsContent value="gunluk" className="mt-5">
          <StudyJournal tasks={studentTasks} logs={studyLogs} />
        </TabsContent>
        <TabsContent value="denemeler" className="mt-5">
          <StudentMockExams student={child} />
        </TabsContent>
        <TabsContent value="konu" className="mt-5">
          <TopicAnalysis student={child} />
        </TabsContent>
        <TabsContent value="mesaj" className="mt-5">
          <ParentCoachChat
            studentId={child.id}
            parentId={user.id}
            coachId={child.coachId ?? null}
            studentName={child.name}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
