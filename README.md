# Student Success Hub

**Crucial Instruction for Lovable Setup:** Before running these prompts, tell Lovable: *"I want to build a modern React web application using TailwindCSS and shadcn/ui. Please output fully functional, responsive React components with beautiful modern styling, micro-animations, and glassmorphism effects where appropriate. The primary color palette should be vibrant teal/green (similar to #12B76A) and dark teal/navy for accents."*




---




## 1. Top Navigation & Layout Shell

**Prompt:**

> "Create a sticky top navigation layout shell for a student dashboard. The navigation bar should be minimal and elegant. On the left, display a sleek logo 'Hedefe.net'. In the center, display 4 inline pill-shaped navigation links: '📊 Özet', '📚 Konu Ağacı', '📝 Ödevler ve Hedefler', '🎯 Denemeler'. On the far right, display the user's email with a subtle avatar icon, and a minimalist 'Çıkış' (Logout) button. The active navigation pill should have a vibrant green background, while inactive ones should have a subtle hover effect. The entire top bar must be sticky and float cleanly over the page content with a slight glassmorphism blur effect. Below this header, provide a main `<main>` container for the page content with a subtle off-white background."




## 2. 'Özet' (Dashboard) Page

**Prompt:**

> "Create a 'Dashboard Overview' page component for a student portal. At the top, create a large, bold, dark-teal Hero banner that says '🎯 YKS 2027 HEDEF' and 'Çapa Tıp Fakültesi'. Below the banner, place two large, side-by-side metric cards with soft shadows and rounded corners. Card 1: '🔥 YKS'YE KALAN SÜRE' with a massive, vibrant green countdown '287 Gün'. Card 2: '⚠️ AKTIF ÖĞRENME BORCU' displaying '57 Hata/Boş' in red. 

> Below the metric cards, create a 'Konu Hakimiyeti (Başarı Oranı)' section. This should be a responsive grid of 6 progress bars (Türkçe, Matematik, Fizik, Kimya, Biyoloji, Tarih). Each progress bar should be thick and rounded, showing a percentage (e.g., %80.0), with the filled portion colored in a gradient from yellow to green depending on the score. The design should feel extremely premium, spacious, and modern."




## 3. 'Konu Ağacı' (Mastery Tracker) Page

**Prompt:**

> "Create a highly interactive hierarchical 'Subject Mastery' component. The hierarchy is: Exam > Subject > Area > Topic. 

> 1. At the top level (e.g., 'AYT'), show a bold header with pill badges for 'Başarı: %45' and 'Borç: 12'.

> 2. Below it, create expandable accordion cards for Subjects (e.g., 'Biyoloji'). The Subject card should have a clean, thin progress bar along the bottom of the card itself.

> 3. Inside the expanded Subject, add one more accordion list the 'Areas' (e.g., 'Hücre').

> 4. Inside the Areas, list the 'Topics'. For each Topic, use a grid layout. Left side: the topic name. Right side: A subtle visual dot-indicator showing mastery level (e.g., 3 out of 5 dots filled green), and a tiny 'Borç: X' badge.

> 5. Clicking a Topic should open a beautiful modal or a sub-accordion containing a table of 'Geçmiş Çalışmalar' (Past Study Logs) and a prominent '➕ Yeni Çalışma Ekle' button. Make the styling compact but highly readable, using Tailwind CSS and Lucide icons."




## 4. 'Ödevler ve Hedefler' (Kanban Calendar) Page

**Prompt:**

> "Create a Weekly Study Planner component using a Kanban-board style layout. The top should have a week selector (e.g., '14 Eki - 20 Eki') with left/right arrows. Below that, create a 7-column horizontal scrolling grid, one column for each day of the week (Pazartesi to Pazar). 

> Each column should have a clean, light-gray background and a distinct header. Inside the columns, users should be able to see draggable 'Task Cards'. Each Task Card should display a Subject tag (e.g., 'Fizik'), a title (e.g., 'Newton Hareket Yasaları Test 1'), and a checkbox to mark it as completed. Completed cards should turn faded with a strikethrough effect. Add a '➕ Ödev Ekle' button at the top of the page. The design should feel heavily inspired by modern project management tools like Linear or Trello, but softer and tailored for students."




## 5. 'Denemeler' (Mock Exams) Page

**Prompt:**

> "Create a Mock Exam tracking page. At the top, include a '➕ Yeni Deneme Ekle' primary button. Below it, create two beautiful, interactive line charts (using Recharts or a placeholder). Chart 1: 'TYT Net İlerlemesi', Chart 2: 'AYT Net İlerlemesi'. The charts should have smooth, curved lines with gradient fills underneath them.

> Below the charts, create a clean, modern Data Table listing past exams. Columns should include: Tarih (Date), Kurum (Publisher), Türkçe Net, Matematik Net, Sosyal Net, Fen Net, and Toplam Net (Total). The 'Toplam Net' column should be bolded and highlighted. Use subtle alternating row colors and elegant typography for the table."




## 6. Coach Dashboard (Koç Paneli)

**Prompt:**

> "Create a Coach Dashboard for an educational platform. The layout should have a sidebar on the left listing 'My Students'. Each student in the list should show their name, a small avatar, and a status indicator (e.g., '3 pending tasks').

> The main content area should display the selected student's profile. At the top, show their target university and countdown. Below that, create a tabbed interface with 'Genel Durum' (Overview), 'Ödev Ver' (Assign Tasks), and 'İstatistikler' (Stats). In the 'Ödev Ver' tab, design a clean form to assign a task (Subject dropdown, Task Description text area, Due Date picker, and an 'Ata' submit button). Ensure the UI looks professional, authoritative, and data-rich, using Tailwind standard components (shadcn)."

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/fdf50712-42b7-4251-8261-bc44bb8fae19).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
