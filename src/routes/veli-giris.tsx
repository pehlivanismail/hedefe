import { createFileRoute } from "@tanstack/react-router";
import { AuthForm } from "@/components/auth-form";

export const Route = createFileRoute("/veli-giris")({
  head: () => ({
    meta: [
      { title: "Veli Girişi — Hedefe.net" },
      {
        name: "description",
        content:
          "Hedefe.net veli hesabınla giriş yap; çocuğunun çalışmalarını takip et ve koçuyla iletişim kur.",
      },
      { property: "og:title", content: "Veli Girişi — Hedefe.net" },
      {
        property: "og:description",
        content: "Çocuğunun YKS hazırlığını takip etmek için veli girişi.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => (
    <div className="flex min-h-[calc(100vh-10rem)] flex-col items-center justify-center py-10">
      <div className="w-full max-w-md">
        <AuthForm role="parent" />
      </div>
    </div>
  ),
});
