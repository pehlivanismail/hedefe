import { createFileRoute } from "@tanstack/react-router";
import { AuthForm } from "@/components/auth-form";

export const Route = createFileRoute("/koc-giris")({
  head: () => ({
    meta: [
      { title: "Koç Girişi — Hedefe.net" },
      {
        name: "description",
        content:
          "Hedefe.net koç hesabınla giriş yap veya yeni koç hesabı oluştur; öğrencilerini takip et.",
      },
      { property: "og:title", content: "Koç Girişi — Hedefe.net" },
      {
        property: "og:description",
        content: "Öğrencilerini takip etmek için koç girişi.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => <AuthForm role="coach" />,
});
