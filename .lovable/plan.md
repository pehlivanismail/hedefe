# Hedefe.net — Student Study Dashboard

A modern, premium study-tracking app for a YKS 2027 student, plus a coach panel. Vibrant teal/green (#12B76A) with dark teal/navy accents, soft shadows, rounded cards, subtle glass blur on the header, and light micro-animations. Built with sample data first, so every screen is clickable and realistic.

## Pages

**Shared shell** — Sticky glassy top bar: "Hedefe.net" logo left; centered pill links "📊 Özet", "📚 Konu Ağacı", "📝 Ödevler ve Hedefler", "🎯 Denemeler"; right side shows the user email with an avatar and a quiet "Çıkış" button. Active pill is green; content sits on a soft off-white background. A link to the coach panel lives in the right-hand area.

**Özet (/)** — Dark-teal hero "🎯 YKS 2027 HEDEF / Çapa Tıp Fakültesi". Two big metric cards: countdown "287 Gün" in green, and "57 Hata/Boş" in red. Below, "Konu Hakimiyeti" grid with six thick rounded progress bars (Türkçe, Matematik, Fizik, Kimya, Biyoloji, Tarih), filled with a yellow→green gradient based on score.

**Konu Ağacı (/konu-agaci)** — Exam → Subject → Area → Topic. Exam header with "Başarı" and "Borç" badges; subject accordions with a thin progress bar on the card; area accordions inside; topic rows showing name, 5-dot mastery indicator and a small "Borç: X" badge. Clicking a topic opens a modal with a past-study-log table and a "➕ Yeni Çalışma Ekle" button that adds a log entry.

**Ödevler ve Hedefler (/odevler)** — Week selector with arrows, 7 day columns (Pazartesi–Pazar) that scroll horizontally on small screens. Task cards show a subject tag, a title and a checkbox; completed cards fade with strikethrough. Cards can be dragged between days. "➕ Ödev Ekle" opens a small form.

**Denemeler (/denemeler)** — "➕ Yeni Deneme Ekle" button, two smooth curved line charts with gradient fills (TYT and AYT net progress), and a clean table: Tarih, Kurum, Türkçe, Matematik, Sosyal, Fen, Toplam Net — total bolded and highlighted, alternating row shading.

**Koç Paneli (/koc)** — Left sidebar of students with avatar, name and "3 bekleyen görev" status. Main area shows the selected student's target and countdown, then tabs: Genel Durum, Ödev Ver, İstatistikler. "Ödev Ver" is a form (subject dropdown, description, due-date picker, "Ata") that adds the task into the shared planner data so it appears on the student's week.

## Notes

- Sample data lives in one shared in-memory store so coach-assigned tasks show up in the planner during a session; nothing persists after a refresh yet.
- Turkish labels throughout; responsive from phone to desktop.
- Countdown is computed from a fixed YKS 2027 date rather than hardcoded, so it stays truthful.

## Technical

- TanStack Start routes: `index.tsx`, `konu-agaci.tsx`, `odevler.tsx`, `denemeler.tsx`, `koc.tsx`; shared header/layout in `__root.tsx`.
- shadcn/ui (accordion, dialog, tabs, table, select, calendar/popover, checkbox, button, badge, card), Recharts for the charts, lucide-react icons, Motion for small transitions.
- Teal/green palette and gradients added as semantic tokens in `src/styles.css`; no hardcoded color classes in components.
- Shared demo state via a React context provider mounted in `__root.tsx`.
- Per-route `head()` metadata with distinct titles and descriptions.
