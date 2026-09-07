import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth";
import { useDemoData } from "@/lib/demo-data";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { PairInvites } from "@/components/pair-invites";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { LogOut } from "lucide-react";

export const Route = createFileRoute("/ayarlar")({
  component: AyarlarSayfasi,
});

function AyarlarSayfasi() {
  const { user, role, student, coach, setCoach, signOut, refresh } = useAuth();
  const { currentStudent } = useDemoData();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [target, setTarget] = useState(student?.target || "");
  const [deleteConfirmation, setDeleteConfirmation] = useState("");

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) return;
    if (password !== passwordConfirm) {
      toast.error("Şifreler eşleşmiyor.");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) {
      toast.error("Şifre güncellenemedi: " + error.message);
    } else {
      toast.success("Şifreniz başarıyla güncellendi.");
      setPassword("");
      setPasswordConfirm("");
    }
  };

  const handleTargetChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    const { error } = await supabase
      .from("profiles")
      .update({ target })
      .eq("id", user.id);
    setLoading(false);
    if (error) {
      toast.error("Hedef güncellenemedi: " + error.message);
    } else {
      toast.success("Hedefiniz güncellendi.");
      refresh();
    }
  };

  const handleDisconnect = async () => {
    if (!confirm("Bağlantıyı kesmek istediğinize emin misiniz?")) return;
    setLoading(true);
    try {
      await setCoach(null);
      toast.success("Bağlantı başarıyla kesildi.");
    } catch (e: any) {
      toast.error("Hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmation !== "Hesabimi sil") return;
    setLoading(true);
    try {
      const { error } = await supabase.rpc('delete_user');
      if (error) throw error;
      toast.success("Hesabınız silindi.");
      await signOut();
      navigate({ to: "/" });
    } catch (e: any) {
      toast.error("Hesap silinirken hata oluştu: " + e.message);
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="mx-auto max-w-2xl space-y-8 p-4 pb-20 sm:p-8">
      <div>
        <h1 className="font-display text-2xl font-bold text-brand-deep">Ayarlar</h1>
        <p className="text-sm text-muted-foreground">Hesap bilgilerinizi ve eşleşmelerinizi yönetin.</p>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        <div className="space-y-6">
          <Card className="p-6 rounded-3xl border-border shadow-soft">
            <h2 className="font-display text-lg font-bold text-brand-deep mb-4">Şifre Değiştir</h2>
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">Yeni Şifre</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="En az 6 karakter"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="passwordConfirm">Yeni Şifre (Tekrar)</Label>
                <Input
                  id="passwordConfirm"
                  type="password"
                  value={passwordConfirm}
                  onChange={(e) => setPasswordConfirm(e.target.value)}
                  placeholder="En az 6 karakter"
                  required
                />
              </div>
              <Button type="submit" disabled={loading} className="w-full rounded-full">
                Güncelle
              </Button>
            </form>
          </Card>

          {role === "student" && (
            <Card className="p-6 rounded-3xl border-border shadow-soft">
              <h2 className="font-display text-lg font-bold text-brand-deep mb-4">Hedef Belirle</h2>
              <form onSubmit={handleTargetChange} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="target">Üniversite / Bölüm Hedefin</Label>
                  <Input
                    id="target"
                    value={target}
                    onChange={(e) => setTarget(e.target.value)}
                    placeholder="Örn: Boğaziçi Bilgisayar"
                  />
                </div>
                <Button type="submit" disabled={loading} className="w-full rounded-full">
                  Kaydet
                </Button>
              </form>
            </Card>
          )}

          <Button 
            variant="destructive" 
            className="w-full rounded-full bg-destructive/10 text-destructive hover:bg-destructive/20 hover:text-destructive"
            onClick={() => {
              signOut();
              navigate({ to: "/" });
            }}
          >
            <LogOut className="mr-2 h-4 w-4" /> Çıkış Yap
          </Button>

          <Card className="p-6 rounded-3xl border-destructive/20 bg-destructive/5 shadow-soft">
            <h2 className="font-display text-lg font-bold text-destructive mb-4">Hesabımı Sil</h2>
            <div className="space-y-4">
              <p className="text-sm text-destructive/80">
                Bu işlem geri alınamaz ve tüm verileriniz kalıcı olarak silinir. Onaylamak için aşağıdaki alana <strong>Hesabimi sil</strong> yazın.
              </p>
              <Input
                value={deleteConfirmation}
                onChange={(e) => setDeleteConfirmation(e.target.value)}
                placeholder="Hesabimi sil"
                className="border-destructive/30 focus-visible:ring-destructive/50"
              />
              <Button 
                variant="destructive" 
                disabled={deleteConfirmation !== "Hesabimi sil" || loading}
                className="w-full rounded-full"
                onClick={handleDeleteAccount}
              >
                Hesabımı Kalıcı Olarak Sil
              </Button>
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="p-6 rounded-3xl border-border shadow-soft">
            <h2 className="font-display text-lg font-bold text-brand-deep mb-4">Eşleşmeler</h2>
            
            {role === "student" && student?.coachId ? (
              <div className="rounded-xl border border-border p-4 mb-4">
                <p className="text-sm font-semibold text-brand-deep">Mevcut Koçun</p>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Aktif bir koçla çalışıyorsun.</span>
                  <Button variant="outline" size="sm" onClick={handleDisconnect} disabled={loading}>
                    Bağlantıyı Kes
                  </Button>
                </div>
              </div>
            ) : role === "student" ? (
              <p className="text-sm text-muted-foreground mb-4">Henüz bir koçla eşleşmedin.</p>
            ) : null}

            <PairInvites role={role || "student"} />
          </Card>
        </div>
      </div>
    </div>
  );
}
