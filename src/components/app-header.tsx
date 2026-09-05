import { Link } from "@tanstack/react-router";
import { LogOut, UserRound, GraduationCap } from "lucide-react";
import { CURRENT_STUDENT } from "@/lib/demo-data";
import { cn } from "@/lib/utils";

const links = [
  { to: "/", label: "📊 Özet" },
  { to: "/konu-agaci", label: "📚 Konu Ağacı" },
  { to: "/odevler", label: "📝 Ödevler ve Hedefler" },
  { to: "/denemeler", label: "🎯 Denemeler" },
] as const;

export function AppHeader() {
  return (
    <header className="sticky top-0 z-50 glass-bar border-b border-border/70">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2">
          <span className="flex size-8 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <GraduationCap className="size-4" />
          </span>
          <span className="font-display text-lg font-bold tracking-tight text-brand-deep">
            Hedefe<span className="text-primary">.net</span>
          </span>
        </Link>

        <nav className="mx-auto hidden items-center gap-1 lg:flex">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              activeOptions={{ exact: l.to === "/" }}
              className="rounded-full px-4 py-2 text-sm font-medium text-muted-foreground transition-all hover:bg-accent hover:text-accent-foreground"
              activeProps={{
                className: cn(
                  "bg-primary text-primary-foreground shadow-soft hover:bg-primary hover:text-primary-foreground",
                ),
              }}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2 lg:ml-0">
          <Link
            to="/koc"
            className="hidden rounded-full px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground sm:block"
            activeProps={{ className: "bg-brand-deep text-primary-foreground" }}
          >
            Koç Paneli
          </Link>
          <div className="flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5">
            <span className="flex size-6 items-center justify-center rounded-full bg-brand-soft text-brand-deep">
              <UserRound className="size-3.5" />
            </span>
            <span className="hidden text-xs font-medium text-muted-foreground sm:inline">
              {CURRENT_STUDENT.email}
            </span>
          </div>
          <button className="flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive">
            <LogOut className="size-4" />
            <span className="hidden sm:inline">Çıkış</span>
          </button>
        </div>
      </div>

      <nav className="flex items-center gap-1 overflow-x-auto border-t border-border/60 px-4 py-2 lg:hidden">
        {links.map((l) => (
          <Link
            key={l.to}
            to={l.to}
            activeOptions={{ exact: l.to === "/" }}
            className="shrink-0 rounded-full px-3 py-1.5 text-xs font-medium text-muted-foreground"
            activeProps={{ className: "bg-primary text-primary-foreground" }}
          >
            {l.label}
          </Link>
        ))}
        <Link
          to="/koc"
          className="shrink-0 rounded-full px-3 py-1.5 text-xs font-medium text-muted-foreground"
          activeProps={{ className: "bg-brand-deep text-primary-foreground" }}
        >
          Koç
        </Link>
      </nav>
    </header>
  );
}
