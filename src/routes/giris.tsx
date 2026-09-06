import { createFileRoute } from "@tanstack/react-router";
import { AuthForm } from "@/components/auth-form";

export const Route = createFileRoute("/giris")({
  head: () => ({
    meta: [
      { title: "Öğrenci Girişi — Hedefe.net" },
      {
        name: "description",
        content:
          "Hedefe.net öğrenci hesabınla giriş yap veya yeni hesap oluştur; YKS çalışma paneline eriş.",
      },
      { property: "og:title", content: "Öğrenci Girişi — Hedefe.net" },
      {
        property: "og:description",
        content: "YKS çalışma paneline öğrenci girişi.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => (
    <div className="flex min-h-[calc(100vh-10rem)] flex-col items-center justify-center py-10">
      <div className="w-full max-w-md">
        <AuthForm role="student" />
        <div className="mt-8 text-center text-sm text-muted-foreground">
          İletişim: <a href="mailto:iletisim@hedefe.net" className="underline hover:text-primary transition-colors">iletisim@hedefe.net</a>
        </div>
      </div>
    </div>
  ),
});
