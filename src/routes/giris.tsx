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
  component: () => <AuthForm role="student" />,
});
