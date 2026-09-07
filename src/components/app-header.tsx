import { Link, useNavigate } from "@tanstack/react-router";
import { LogOut, UserRound, GraduationCap } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { cn } from "@/lib/utils";

const links = [
  { to: "/", label: "📊 Özet" },
  { to: "/konu-agaci", label: "📚 Konu Ağacı" },
  { to: "/odevler", label: "📝 Ödevler ve Hedefler" },
  { to: "/denemeler", label: "🎯 Denemeler" },
] as const;

export function AppHeader() {
  const { user, role, student, coach, signOut } = useAuth();
  const navigate = useNavigate();
  const isStudent = role === "student";
  const isCoach = role === "coach";
  const name = student?.name || coach?.name || user?.email;
  const session = user;

  const handleSignOut = async () => {
    await signOut();
    void navigate({ to: "/", replace: true });
  };


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

        {isStudent && (
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
        )}

        <div className="ml-auto flex items-center gap-2">
          {isCoach && (
            <Link
              to="/koc"
              className="rounded-full px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
              activeProps={{ className: "bg-brand-deep text-primary-foreground" }}
            >
              Koç Paneli
            </Link>
          )}
          {session ? (
            <>
              <Link 
                to="/ayarlar" 
                className="flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 transition-colors hover:bg-accent"
              >
                <span className="flex size-6 items-center justify-center rounded-full bg-brand-soft text-brand-deep">
                  <UserRound className="size-3.5" />
                </span>
                <span className="hidden text-xs font-medium text-muted-foreground sm:inline">
                  {name}
                </span>
              </Link>
              <button
                onClick={() => void handleSignOut()}
                className="flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
              >
                <LogOut className="size-4" />
                <span className="hidden sm:inline">Çıkış</span>
              </button>
            </>
          ) : (
            <>
              <Link
                to="/koc-giris"
                className="rounded-full px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
              >
                Koç Girişi
              </Link>
              <Link
                to="/giris"
                className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-soft"
              >
                Giriş Yap
              </Link>
            </>
          )}
        </div>
      </div>

      {isStudent && (
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
        </nav>
      )}
    </header>
  );
}
