import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Flame,
  TriangleAlert,
  Target,
  UserRound,
  GraduationCap,
  ArrowRight,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  daysUntilYks,
  useDemoData,
  examsForStudent,
  subjectScoresOf,
  overallStats,
  TRACK_LABELS,
  type Student,
} from "@/lib/demo-data";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Özet — Hedefe.net YKS Paneli" },
      {
        name: "description",
        content:
          "YKS 2027 geri sayımı, aktif öğrenme borcu ve ders bazlı konu hakimiyeti tek ekranda.",
      },
      { property: "og:title", content: "Özet — Hedefe.net YKS Paneli" },
      {
        property: "og:description",
        content: "Geri sayım, öğrenme borcu ve konu hakimiyeti özetin.",
      },
    ],
  }),
  component: Index,
});

function ScoreBar({ name, score }: { name: string; score: number }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-soft transition-transform hover:-translate-y-0.5">
      <div className="flex items-baseline justify-between">
        <span className="font-display text-sm font-semibold text-brand-deep">
          {name}
        </span>
        <span className="text-sm font-bold text-primary">
          %{score.toFixed(1)}
        </span>
      </div>
      <div className="mt-3 h-3.5 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full transition-[width] duration-700"
          style={{
            width: `${score}%`,
            background: `linear-gradient(90deg, oklch(0.85 0.16 85), oklch(${0.72 - score / 1400} ${0.05 + score / 900} ${85 + score * 0.75}))`,
          }}
        />
      </div>
    </div>
  );
}

function Index() {
  const { loading, user, role } = useAuth();
  const { currentStudent } = useDemoData();

  if (loading) {
    return (
      <div className="py-20 text-center text-sm text-muted-foreground">
        Yükleniyor…
      </div>
    );
  }
  if (!user) return <Landing />;
  if (role === "coach") return <CoachWelcome />;
  if (!currentStudent) return <Landing />;
  return <Ozet student={currentStudent} />;
}

function Landing() {
  return (
    <div className="space-y-10">
      <section className="relative overflow-hidden rounded-3xl bg-brand-deep px-6 py-14 text-primary-foreground sm:px-12 sm:py-20">
        <div className="absolute -right-24 -top-24 size-80 rounded-full bg-primary/25 blur-3xl" />
        <div className="relative max-w-2xl">
          <span className="inline-flex items-center gap-2 rounded-full bg-primary/20 px-3 py-1 text-xs font-semibold uppercase tracking-widest">
            <Target className="size-3.5" /> YKS 2027
          </span>
          <h1 className="mt-4 font-display text-4xl font-extrabold tracking-tight sm:text-6xl">
            Hedefine giden yolu <span className="text-primary">planla</span>
          </h1>
          <p className="mt-4 text-base opacity-80 sm:text-lg">
            Konu takibi, haftalık ödevler, deneme analizleri ve koçunla ortak
            çalışma paneli — hepsi tek yerde.
          </p>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <Card className="rounded-3xl border-border p-8 shadow-soft">
          <div className="flex items-center gap-2 font-display text-xl font-bold text-brand-deep">
            <UserRound className="size-5 text-primary" /> Öğrenci Girişi
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            E-posta ve şifrenle giriş yap; hedefini, alanını ve haftalık
            planını tek panelde takip et.
          </p>
          <Link
            to="/giris"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-soft transition-transform hover:-translate-y-0.5"
          >
            Öğrenci olarak devam et <ArrowRight className="size-4" />
          </Link>
        </Card>

        <Card className="rounded-3xl border-border p-8 shadow-soft">
          <div className="flex items-center gap-2 font-display text-xl font-bold text-brand-deep">
            <GraduationCap className="size-5 text-primary" /> Koç Girişi
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            Koçlar kendi hesaplarıyla girer ve yalnızca kendilerini koç olarak
            seçen öğrencileri görür.
          </p>
          <Link
            to="/koc-giris"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-brand-deep px-6 py-3 text-sm font-semibold text-primary-foreground shadow-soft transition-transform hover:-translate-y-0.5"
          >
            Koç olarak devam et <ArrowRight className="size-4" />
          </Link>
        </Card>
      </section>
    </div>
  );
}


function CoachWelcome() {
  const { currentCoach, studentList } = useDemoData();
  const mine = studentList.filter((s) => s.coachId === currentCoach?.id);

  return (
    <Card className="rounded-3xl border-border p-10 text-center shadow-soft">
      <h1 className="font-display text-3xl font-bold text-brand-deep">
        Hoş geldin {currentCoach?.name}
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        {mine.length} öğrencin seni bekliyor.
      </p>
      <Link
        to="/koc"
        className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-soft"
      >
        Koç Paneline Git <ArrowRight className="size-4" />
      </Link>
    </Card>
  );
}

function CoachPicker({ student }: { student: Student }) {
  const { coachList } = useDemoData();
  const coach = coachList.find((c) => c.id === student.coachId);

  return (
    <div className="space-y-4">
      <Card className="rounded-3xl border-border p-6 shadow-soft">
        <p className="font-display text-lg font-bold text-brand-deep">
          🤝 Koçum
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          {coach
            ? `${coach.name} · ${coach.title}`
            : "Henüz bir koçunla eşleşmedin."}
        </p>
      </Card>
      <PairInvites role="student" />
    </div>
  );
}




function Ozet({ student }: { student: Student }) {
  const { examData } = useDemoData();
  const days = daysUntilYks();
  const mine = examsForStudent(examData, student);
  const scores = subjectScoresOf(mine);
  const debt = overallStats(mine).debt;


  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-3xl bg-brand-deep px-6 py-12 text-primary-foreground sm:px-12 sm:py-16">
        <div className="absolute -right-20 -top-20 size-72 rounded-full bg-primary/25 blur-3xl" />
        <div className="relative">
          <span className="inline-flex items-center gap-2 rounded-full bg-primary/20 px-3 py-1 text-xs font-semibold uppercase tracking-widest">
            <Target className="size-3.5" /> {student.name} · TYT +{" "}
            {TRACK_LABELS[student.track]}
          </span>

          <h1 className="mt-4 font-display text-4xl font-extrabold tracking-tight sm:text-6xl">
            🎯 YKS 2027 HEDEF
          </h1>
          <p className="mt-3 font-display text-2xl font-semibold text-primary sm:text-3xl">
            {student.target}
          </p>
        </div>
      </section>

      <CoachPicker student={student} />

      <section className="grid gap-6 md:grid-cols-2">
        <Card className="rounded-3xl border-border p-8 shadow-soft">
          <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            <Flame className="size-4 text-primary" /> 🔥 YKS'ye Kalan Süre
          </div>
          <p className="mt-4 font-display text-6xl font-extrabold text-primary sm:text-7xl">
            {days} <span className="text-4xl sm:text-5xl">Gün</span>
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            Her gün 1 konu tekrarı = sınava kadar {Math.round(days / 7)} hafta
            planlı çalışma.
          </p>
        </Card>

        <Card className="rounded-3xl border-border p-8 shadow-soft">
          <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            <TriangleAlert className="size-4 text-destructive" /> ⚠️ Aktif
            Öğrenme Borcu
          </div>
          <p className="mt-4 font-display text-6xl font-extrabold text-destructive sm:text-7xl">
            {debt}
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            Hata / Boş — çözülmeyi bekleyen sorular
          </p>
        </Card>
      </section>

      <section>
        <h2 className="font-display text-2xl font-bold text-brand-deep">
          Konu Hakimiyeti (Başarı Oranı)
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          TYT ve {TRACK_LABELS[student.track]} derslerindeki güncel başarı
          yüzden.
        </p>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {scores.map((s) => (
            <ScoreBar key={s.name} {...s} />
          ))}
        </div>
      </section>

      <p className="text-xs text-muted-foreground">
        Bu ekrandaki veriler örnek verilerdir.
      </p>

    </div>
  );
}
