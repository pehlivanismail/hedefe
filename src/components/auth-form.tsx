import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { GraduationCap, Loader2, MailCheck, UserRound, Users } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { TRACK_LABELS, type Track } from "@/lib/demo-data";

type Role = "student" | "coach" | "parent";

function friendlyError(message: string) {
  if (/invalid login credentials/i.test(message))
    return "E-posta veya şifre hatalı.";
  if (/email not confirmed/i.test(message))
    return "E-posta adresini doğrulaman gerekiyor. Gelen kutunu kontrol et.";
  if (/user already registered/i.test(message))
    return "Bu e-posta ile bir hesap zaten var. Giriş yapmayı dene.";
  if (/password/i.test(message) && /least/i.test(message))
    return "Şifre en az 6 karakter olmalı.";
  return message;
}

export function AuthForm({ role }: { role: Role }) {
  const navigate = useNavigate();
  const isCoach = role === "coach";
  const isParent = role === "parent";
  const homeFor = isCoach ? "/koc" : isParent ? "/veli" : "/";
  const [tab, setTab] = useState("giris");
  const [busy, setBusy] = useState(false);
  const [confirmSent, setConfirmSent] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [target, setTarget] = useState("");
  const [title, setTitle] = useState("");
  const [track, setTrack] = useState<Track>("sayisal");

  const signIn = async () => {
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    setBusy(false);
    if (error) {
      toast.error(friendlyError(error.message));
      return;
    }
    toast.success("Giriş yapıldı");
    void navigate({ to: homeFor, replace: true });
  };

  const signUp = async () => {
    if (!fullName.trim()) {
      toast.error("Ad soyad gerekli");
      return;
    }
    setBusy(true);
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        emailRedirectTo: window.location.origin,
        data: {
          role,
          full_name: fullName.trim(),
          target: target.trim(),
          title: title.trim(),
          track,
        },
      },
    });
    setBusy(false);
    if (error) {
      toast.error(friendlyError(error.message));
      return;
    }
    if (!data.session) {
      setConfirmSent(true);
      return;
    }
    toast.success("Hesabın hazır");
    void navigate({ to: homeFor, replace: true });
  };

  if (confirmSent) {
    return (
      <Card className="mx-auto max-w-md rounded-3xl border-border p-10 text-center shadow-soft">
        <MailCheck className="mx-auto size-10 text-primary" />
        <h1 className="mt-4 font-display text-2xl font-bold text-brand-deep">
          E-postanı doğrula
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {email} adresine bir doğrulama bağlantısı gönderdik. Bağlantıya
          tıkladıktan sonra buradan giriş yapabilirsin.
        </p>
        <Button
          variant="outline"
          className="mt-6 rounded-xl"
          onClick={() => {
            setConfirmSent(false);
            setTab("giris");
          }}
        >
          Giriş ekranına dön
        </Button>
      </Card>
    );
  }

  return (
    <Card className="mx-auto max-w-md rounded-3xl border-border p-8 shadow-soft">
      <div className="flex items-center gap-2 font-display text-2xl font-bold text-brand-deep">
        {isCoach ? (
          <GraduationCap className="size-6 text-primary" />
        ) : isParent ? (
          <Users className="size-6 text-primary" />
        ) : (
          <UserRound className="size-6 text-primary" />
        )}
        {isCoach ? "Koç Girişi" : isParent ? "Veli Girişi" : "Öğrenci Girişi"}
      </div>
      <p className="mt-2 text-sm text-muted-foreground">
        {isCoach
          ? "Koç hesabınla giriş yap, öğrencilerini takip et."
          : isParent
            ? "Veli hesabınla giriş yap, çocuğunun gelişimini takip et."
            : "Hesabınla giriş yap, çalışma panelin seni bekliyor."}
      </p>

      <Tabs value={tab} onValueChange={setTab} className="mt-6">
        <TabsList className="w-full rounded-full">
          <TabsTrigger value="giris" className="flex-1 rounded-full">
            Giriş Yap
          </TabsTrigger>
          <TabsTrigger value="kayit" className="flex-1 rounded-full">
            Kayıt Ol
          </TabsTrigger>
        </TabsList>

        <TabsContent value="giris" className="mt-5 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">E-posta</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ornek@hedefe.net"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Şifre</Label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") void signIn();
              }}
            />
          </div>
          <Button
            className="w-full rounded-xl"
            disabled={busy || !email || !password}
            onClick={() => void signIn()}
          >
            {busy && <Loader2 className="size-4 animate-spin" />}
            Giriş Yap
          </Button>
        </TabsContent>

        <TabsContent value="kayit" className="mt-5 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Ad Soyad</Label>
            <Input
              id="name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Ad Soyad"
            />
          </div>
          {isParent ? null : isCoach ? (
            <div className="space-y-2">
              <Label htmlFor="title">Uzmanlık</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ör: Sayısal Koçu"
              />
            </div>
          ) : (
            <>
              <div className="space-y-2">
                <Label htmlFor="target">Hedefin</Label>
                <Input
                  id="target"
                  value={target}
                  onChange={(e) => setTarget(e.target.value)}
                  placeholder="Ör: Çapa Tıp Fakültesi"
                />
              </div>
              <div className="space-y-2">
                <Label>Alanın</Label>
                <Select
                  value={track}
                  onValueChange={(v) => setTrack(v as Track)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(Object.keys(TRACK_LABELS) as Track[]).map((t) => (
                      <SelectItem key={t} value={t}>
                        {TRACK_LABELS[t]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </>
          )}
          <div className="space-y-2">
            <Label htmlFor="email2">E-posta</Label>
            <Input
              id="email2"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ornek@hedefe.net"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password2">Şifre</Label>
            <Input
              id="password2"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="En az 6 karakter"
            />
          </div>
          <Button
            className="w-full rounded-xl"
            disabled={busy || !email || password.length < 6}
            onClick={() => void signUp()}
          >
            {busy && <Loader2 className="size-4 animate-spin" />}
            {isCoach
              ? "Koç Hesabı Oluştur"
              : isParent
                ? "Veli Hesabı Oluştur"
                : "Öğrenci Hesabı Oluştur"}
          </Button>
        </TabsContent>
      </Tabs>
    </Card>
  );
}
