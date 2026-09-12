import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Flame,
  TriangleAlert,
  Target,
  UserRound,
  GraduationCap,
  ArrowRight,
  BookOpenCheck,
  CalendarCheck,
  ChartLine,
  Users,
  ClipboardList,
  NotebookPen,
  CheckCircle2,
  Quote,
  Mail,
} from "lucide-react";
import { Card } from "@/components/ui/card";


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
      { title: "Hedefe.net — Ücretsiz YKS Takip Paneli" },
      {
        name: "description",
        content:
          "YKS 2027 hazırlığını ücretsiz takip et: konu hakimiyeti, ödev planı, deneme analizi ve koç paneli. Şimdi ve her zaman bedava.",
      },
      { property: "og:title", content: "Hedefe.net — Ücretsiz YKS Takip Paneli" },
      {
        property: "og:description",
        content: "YKS hazırlığını ücretsiz takip et: konu hakimiyeti, ödev planı, deneme analizi ve koç paneli.",
      },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "EducationalOrganization",
          name: "Hedefe.net",
          url: "https://hedefe.net",
          logo: "https://hedefe.net/og-image.png",
          description: "YKS hazırlığını ücretsiz takip et: konu hakimiyeti, ödev planı, deneme analizi ve koç paneli.",
          sameAs: []
        }),
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


const studentFeatures = [
  {
    icon: BookOpenCheck,
    title: "Konu Ağacı",
    text: "Sınav → ders → alan → konu kırılımında her konunun hakimiyetini 5 kademeli göstergeyle izle; eksiklerin asla kaybolmaz.",
  },
  {
    icon: CalendarCheck,
    title: "Haftalık Ödev Planı",
    text: "Pazartesi–Pazar tahtanda ödevlerini sürükle-bırakla planla; koçunun verdiği ödevler külah ikonuyla işaretlenir.",
  },
  {
    icon: ChartLine,
    title: "Deneme Analizi",
    text: "TYT (120 soru) ve AYT (80 soru) net ilerlemen grafiklerle; ders bazında yanlış ve boşların otomatik nete çevrilir.",
  },
  {
    icon: TriangleAlert,
    title: "Öğrenme Borcu",
    text: "Her yanlış ve boş soru 'borç' olarak birikir; neyi telafi etmen gerektiğini tek sayıda görürsün.",
  },
];

const coachFeatures = [
  {
    icon: Users,
    title: "Tüm Öğrenciler Tek Panelde",
    text: "Öğrencilerinin hedeflerini, geri sayımlarını ve bekleyen görevlerini soldaki listeden anında gör.",
  },
  {
    icon: ClipboardList,
    title: "Ödev ve Deneme Atama",
    text: "Konu çalışması, soru çözümü veya TYT/AYT branş denemesi ata; alan seçimiyle ödevi tam isabet hedefe ver.",
  },
  {
    icon: NotebookPen,
    title: "Çalışma Günlüğü",
    text: "Öğrencinin hangi gün, hangi kaynaktan, kaç soru çözdüğünü; doğru-yanlış-boş dağılımıyla günlük ve haftalık izle.",
  },
];

const steps = [
  {
    n: "1",
    title: "Hesabını aç",
    text: "Öğrenci veya koç olarak kaydol; hedefini ve alanını (Sayısal / Sözel / Eşit Ağırlık) belirle.",
  },
  {
    n: "2",
    title: "Koçunla eşleş",
    text: "Öğrenci koçunu, koç öğrencisini e-postayla davet eder. Karşı taraf onaylayınca bağlantı kurulur.",
  },
  {
    n: "3",
    title: "Birlikte takip et",
    text: "Çalışmalar kaydedilir, ödevler tamamlanır, denemeler analiz edilir — iki taraf da aynı tabloyu görür.",
  },
];

function Landing() {
  const { user, role } = useAuth();
  const panelLink = role === "coach" ? "/koc" : "/";

  return (
    <div className="space-y-16">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-3xl bg-brand-deep px-6 py-16 text-primary-foreground sm:px-12 sm:py-24">
        <div className="absolute -right-24 -top-24 size-80 rounded-full bg-primary/25 blur-3xl" />
        <div className="absolute -bottom-32 -left-16 size-72 rounded-full bg-primary/15 blur-3xl" />
        <div className="relative max-w-3xl">
          <span className="inline-flex items-center gap-2 rounded-full bg-primary/20 px-3 py-1 text-xs font-semibold uppercase tracking-widest">
            <Target className="size-3.5" /> Ücretsiz YKS 2027 Takip Paneli
          </span>
          <h1 className="mt-5 font-display text-4xl font-extrabold tracking-tight sm:text-6xl">
            Hedefine giden yolu <span className="text-primary">birlikte planla</span>
          </h1>
          <p className="mt-5 max-w-2xl text-base opacity-85 sm:text-lg">
            Hedefe.net, YKS öğrencileri ile eğitim koçlarını aynı çalışma masasına oturtur. <span className="font-semibold text-primary">MEBİ ve 3 Adım denemeleriyle</span> tam uyumlu detaylı konu analizi sayesinde eksiklerinizi anında tespit eder. Konu hakimiyeti, haftalık ödev planı ve öğrenme borcu tek ekranda; <span className="font-semibold text-primary">tamamen ücretsiz</span>.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary ring-1 ring-primary/20 backdrop-blur-sm">
              <span className="relative flex size-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex size-2 rounded-full bg-primary" />
              </span>
              Şimdi ve her zaman bedava
            </div>
            <div className="inline-flex items-center gap-2 rounded-full bg-amber-400/10 px-3 py-1.5 text-xs font-semibold text-amber-400 ring-1 ring-amber-400/20 backdrop-blur-sm">
              ✨ MEBİ & 3 Adım Denemeleri İle Uyumlu
            </div>
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            {user ? (
              <Link
                to={panelLink}
                className="inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3.5 text-sm font-semibold text-primary-foreground shadow-soft transition-transform hover:-translate-y-0.5"
              >
                Paneline Git <ArrowRight className="size-4" />
              </Link>
            ) : (
              <>
                <Link
                  to="/giris"
                  className="inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3.5 text-sm font-semibold text-primary-foreground shadow-soft transition-transform hover:-translate-y-0.5"
                >
                  Öğrenci olarak başla <ArrowRight className="size-4" />
                </Link>
                <Link
                  to="/koc-giris"
                  className="inline-flex items-center gap-2 rounded-full border border-primary-foreground/30 px-7 py-3.5 text-sm font-semibold transition-colors hover:bg-primary-foreground/10"
                >
                  Koç olarak başla
                </Link>
              </>
            )}
          </div>
          <div className="mt-8 inline-flex max-w-2xl items-start gap-3 rounded-2xl border border-primary/20 bg-primary/10 px-5 py-4 text-sm italic text-primary-foreground/90 shadow-sm backdrop-blur-sm sm:px-6 sm:text-base">
            <Quote className="mt-0.5 size-5 shrink-0 text-primary" />
            “Büyük bir fili yemenin tek yolu, onu küçük lokmalara bölmektir.”
          </div>
        </div>
      </section>

      {/* Neden Hedefe.net */}
      <section aria-labelledby="neden">
        <h2 id="neden" className="font-display text-3xl font-bold tracking-tight text-brand-deep">
          Neden Hedefe.net?
        </h2>
        <p className="mt-3 max-w-3xl text-muted-foreground">
          YKS hazırlığı bir maraton; çoğu öğrenci neyi bilmediğini, çoğu koç öğrencisinin o hafta ne yaptığını tam göremez. Hedefe.net bu iki kör noktayı kapatır: çalışma verisi öğrenciden gelir, yön koçtan — tablo ikisine de açıktır.
        </p>
      </section>

      {/* Öğrenciler için */}
      <section aria-labelledby="ogrenci">
        <div className="flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
            <UserRound className="size-5" />
          </span>
          <h2 id="ogrenci" className="font-display text-2xl font-bold text-brand-deep sm:text-3xl">
            Öğrenciler için
          </h2>
        </div>
        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          {studentFeatures.map((f) => (
            <Card key={f.title} className="rounded-3xl border-border p-6 shadow-soft transition-transform hover:-translate-y-0.5">
              <f.icon className="size-6 text-primary" />
              <h3 className="mt-3 font-display text-lg font-semibold text-brand-deep">{f.title}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">{f.text}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* Koçlar için */}
      <section aria-labelledby="koc">
        <div className="flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-2xl bg-brand-deep text-primary-foreground">
            <GraduationCap className="size-5" />
          </span>
          <h2 id="koc" className="font-display text-2xl font-bold text-brand-deep sm:text-3xl">
            Koçlar için
          </h2>
        </div>
        <div className="mt-6 grid gap-5 sm:grid-cols-3">
          {coachFeatures.map((f) => (
            <Card key={f.title} className="rounded-3xl border-border p-6 shadow-soft transition-transform hover:-translate-y-0.5">
              <f.icon className="size-6 text-primary" />
              <h3 className="mt-3 font-display text-lg font-semibold text-brand-deep">{f.title}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">{f.text}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* Nasıl çalışır */}
      <section aria-labelledby="nasil" className="rounded-3xl bg-brand-soft px-6 py-12 sm:px-12">
        <h2 id="nasil" className="font-display text-2xl font-bold text-brand-deep sm:text-3xl">
          Nasıl çalışır?
        </h2>
        <ol className="mt-8 grid gap-6 sm:grid-cols-3">
          {steps.map((s) => (
            <li key={s.n} className="relative">
              <span className="flex size-10 items-center justify-center rounded-full bg-primary font-display text-lg font-bold text-primary-foreground">{s.n}</span>
              <h3 className="mt-4 font-display text-lg font-semibold text-brand-deep">{s.title}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">{s.text}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* Son CTA */}
      <section className="relative overflow-hidden rounded-3xl bg-brand-deep px-6 py-14 text-center text-primary-foreground sm:px-12">
        <div className="absolute -left-20 -top-20 size-64 rounded-full bg-primary/20 blur-3xl" />
        <div className="relative">
          <CheckCircle2 className="mx-auto size-10 text-primary" />
          <h2 className="mt-4 font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
            Hedefin belli, planın burada.
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm opacity-85 sm:text-base">
            Bugün başla; ilk haftanı planla, ilk denemeni işle, koçunla aynı sayfada buluş. Hedefe.net <span className="font-semibold text-primary">şimdi ve her zaman ücretsiz</span>.
          </p>
          {!user && (
            <div className="mt-7 flex flex-wrap justify-center gap-3">
              <Link to="/giris" className="inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3.5 text-sm font-semibold text-primary-foreground shadow-soft transition-transform hover:-translate-y-0.5">
                Ücretsiz Başla <ArrowRight className="size-4" />
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* İletişim */}
      <section className="rounded-3xl border border-border bg-card px-6 py-12 text-center shadow-soft sm:px-12" aria-labelledby="iletisim">
        <div className="mx-auto max-w-xl">
          <span className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Mail className="size-6" />
          </span>
          <h2 id="iletisim" className="mt-5 font-display text-2xl font-bold text-brand-deep sm:text-3xl">
            Bize ulaşın
          </h2>
          <p className="mt-2 text-sm text-muted-foreground sm:text-base">
            Sorularınız, önerileriniz veya geri bildirimleriniz için bize her zaman yazabilirsiniz.
          </p>
          <a
            href="mailto:iletisim@hedefe.net"
            className="mt-5 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-soft transition-transform hover:-translate-y-0.5"
          >
            <Mail className="size-4" />
            iletisim@hedefe.net
          </a>
        </div>
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






function Ozet({ student }: { student: Student }) {
  const { examData, studyLogs } = useDemoData();
  const days = daysUntilYks();
  const mine = examsForStudent(examData, student, studyLogs);
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
    </div>
  );
}
