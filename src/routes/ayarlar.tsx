import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
    KeyRound,
    Target,
    GraduationCap,
    TriangleAlert,
    UserRound,
    Loader2,
    Unlink,
    Trash2,
    Save,
    Users,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { TRACK_LABELS, type Track } from "@/lib/demo-data";

import { PairInvites } from "@/components/pair-invites";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export const Route = createFileRoute("/ayarlar")({
    head: () => ({
        meta: [
            { title: "Hesap Ayarları — Hedefe.net" },
            {
                name: "description",
                content:
                    "Profil bilgileri, hedef, parola değiştirme, koç bağlantısı ve hesap silme ayarları.",
            },
            { property: "og:title", content: "Hesap Ayarları — Hedefe.net" },
            {
                property: "og:description",
                content: "Hedefini, parolanı ve koç bağlantını yönet.",
            },
        ],
    }),
    component: AccountPage,
});

function AccountPage() {
    const { user, role, student, coach, coachList, loading, refresh, setCoach, signOut } =
        useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!loading && !user) void navigate({ to: "/giris" });
    }, [loading, user, navigate]);

    if (loading || !user) {
        return (
            <div className="flex min-h-[50vh] items-center justify-center">
                <Loader2 className="size-6 animate-spin text-primary" />
            </div>
        );
    }

    const me = role === "student" ? student : coach;
    const myCoach = student?.coachId
        ? coachList.find((c) => c.id === student.coachId)
        : undefined;

    return (
        <div className="mx-auto max-w-2xl space-y-6">
            <div>
                <h1 className="font-display text-2xl font-bold text-brand-deep">
                    ⚙️ Hesap Ayarları
                </h1>
                <p className="mt-1 text-sm text-muted-foreground">
                    {me?.name} · {me?.email} · {role === "student" ? "Öğrenci" : role === "parent" ? "Veli" : "Koç"}
                </p>
            </div>

            <ProfileSection />
            {role === "student" && <TargetSection />}
            <PasswordSection />
            {role === "student" && (
                <CoachSection coachName={myCoach?.name} onDisconnect={async () => {
                    await setCoach(null);
                    await refresh();
                    toast.success("Koç bağlantısı kaldırıldı.");
                }} />
            )}
            {role === "coach" && <MyStudentsSection />}
            {role !== "coach" && <ParentLinkSection />}
            <PairInvites role={(role ?? "student") as "student" | "coach" | "parent"} />
            <DangerSection
                onDelete={async () => {
                    await supabase.rpc("delete_user" as any);
                    await signOut();
                    toast.success("Hesabın silindi. Yolun açık olsun! 🎓");
                    void navigate({ to: "/", replace: true });
                }}
            />
        </div>
    );
}

function SectionTitle({ icon, title }: { icon: React.ReactNode; title: string }) {
    return (
        <p className="flex items-center gap-2 font-display text-lg font-bold text-brand-deep">
            <span className="flex size-7 items-center justify-center rounded-lg bg-brand-soft text-brand-deep">
                {icon}
            </span>
            {title}
        </p>
    );
}

function ProfileSection() {
    const { user, role, student, coach, refresh } = useAuth();
    const me = role === "student" ? student : coach;
    const [name, setName] = useState(me?.name ?? "");
    const [title, setTitle] = useState(coach?.title ?? "");
    const [track, setTrack] = useState<Track>(student?.track ?? "sayisal");
    const [busy, setBusy] = useState(false);

    const save = async () => {
        if (!user) return;
        setBusy(true);
        const { error } = await supabase
            .from("profiles")
            .update({
                full_name: name.trim(),
                ...(role === "student" ? { track } : { title: title.trim() }),
            })
            .eq("id", user.id);
        setBusy(false);
        if (error) {
            toast.error("Kaydedilemedi.");
            return;
        }
        await refresh();
        toast.success("Profil güncellendi.");
    };

    return (
        <Card className="rounded-3xl border-border p-6 shadow-soft">
            <SectionTitle icon={<UserRound className="size-4" />} title="Profil Bilgileri" />
            <div className="mt-4 space-y-4">
                <div>
                    <Label htmlFor="full_name">Ad Soyad</Label>
                    <Input
                        id="full_name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="mt-1"
                    />
                </div>
                {role === "student" ? (
                    <div>
                        <Label>Alan</Label>
                        <Select value={track} onValueChange={(v) => setTrack(v as Track)}>
                            <SelectTrigger className="mt-1">
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
                ) : (
                    <div>
                        <Label htmlFor="title">Unvan</Label>
                        <Input
                            id="title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="mt-1"
                            placeholder="ör. Eğitim Koçu"
                        />
                    </div>
                )}
                <Button onClick={save} disabled={busy} className="rounded-full">
                    {busy ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
                    Kaydet
                </Button>
            </div>
        </Card>
    );
}

function TargetSection() {
    const { user, student, refresh } = useAuth();
    const [target, setTarget] = useState(student?.target ?? "");
    const [busy, setBusy] = useState(false);

    const save = async () => {
        if (!user) return;
        setBusy(true);
        const { error } = await supabase
            .from("profiles")
            .update({ target: target.trim() })
            .eq("id", user.id);
        setBusy(false);
        if (error) {
            toast.error("Kaydedilemedi.");
            return;
        }
        await refresh();
        toast.success("Hedef güncellendi. 🎯");
    };

    return (
        <Card className="rounded-3xl border-border p-6 shadow-soft">
            <SectionTitle icon={<Target className="size-4" />} title="Hedefim" />
            <p className="mt-1 text-sm text-muted-foreground">
                Şu anki hedefin: <strong className="text-brand-deep">{student?.target}</strong>
            </p>
            <div className="mt-4 flex gap-2">
                <Input
                    value={target}
                    onChange={(e) => setTarget(e.target.value)}
                    placeholder="ör. Çapa Tıp Fakültesi"
                    className="flex-1"
                />
                <Button onClick={save} disabled={busy} className="rounded-full">
                    {busy ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
                    Kaydet
                </Button>
            </div>
        </Card>
    );
}

function PasswordSection() {
    const [pw, setPw] = useState("");
    const [pw2, setPw2] = useState("");
    const [busy, setBusy] = useState(false);

    const change = async () => {
        if (pw.length < 8) {
            toast.error("Parola en az 8 karakter olmalı.");
            return;
        }
        if (pw !== pw2) {
            toast.error("Parolalar eşleşmiyor.");
            return;
        }
        setBusy(true);
        const { error } = await supabase.auth.updateUser({ password: pw });
        setBusy(false);
        if (error) {
            toast.error("Parola değiştirilemedi.");
            return;
        }
        setPw("");
        setPw2("");
        toast.success("Parolan güncellendi. 🔑");
    };

    return (
        <Card className="rounded-3xl border-border p-6 shadow-soft">
            <SectionTitle icon={<KeyRound className="size-4" />} title="Parola Değiştir" />
            <div className="mt-4 space-y-3">
                <Input
                    type="password"
                    value={pw}
                    onChange={(e) => setPw(e.target.value)}
                    placeholder="Yeni parola (en az 8 karakter)"
                />
                <Input
                    type="password"
                    value={pw2}
                    onChange={(e) => setPw2(e.target.value)}
                    placeholder="Yeni parola (tekrar)"
                />
                <Button onClick={change} disabled={busy} variant="outline" className="rounded-full">
                    {busy ? <Loader2 className="size-4 animate-spin" /> : <KeyRound className="size-4" />}
                    Parolayı Güncelle
                </Button>
            </div>
        </Card>
    );
}

function MyStudentsSection() {
    const { myStudents, removeStudent, refresh } = useAuth();
    
    if (myStudents.length === 0) return null;
    
    return (
        <Card className="rounded-3xl border-border p-6 shadow-soft">
            <SectionTitle icon={<UserRound className="size-4" />} title="Öğrencilerim" />
            <p className="mt-1 text-sm text-muted-foreground mb-4">
                Bağlantıyı kestiğiniz öğrencilerin hedeflerini ve durumlarını göremezsiniz.
            </p>
            <div className="space-y-2">
                {myStudents.map(student => (
                    <div key={student.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border bg-brand-soft px-3 py-2">
                        <span className="text-sm font-medium text-brand-deep">
                            {student.name}
                        </span>
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button size="sm" variant="outline" className="rounded-full text-destructive">
                                    <Unlink className="size-4 mr-2" /> Bağlantıyı Kes
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Bağlantı kesilsin mi?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        <strong className="text-brand-deep">{student.name}</strong> ile bağlantınız kesilecek. İsterseniz daha sonra tekrar davet gönderebilirsiniz.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Vazgeç</AlertDialogCancel>
                                    <AlertDialogAction
                                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                        onClick={async () => {
                                            await removeStudent(student.id);
                                            await refresh();
                                            toast.success(`${student.name} ile bağlantı kesildi.`);
                                        }}
                                    >
                                        Bağlantıyı Kes
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                ))}
            </div>
        </Card>
    );
}

function CoachSection({
    coachName,
    onDisconnect,
}: {
    coachName: string | undefined;
    onDisconnect: () => Promise<void>;
}) {
    const [busy, setBusy] = useState(false);

    return (
        <Card className="rounded-3xl border-border p-6 shadow-soft">
            <SectionTitle icon={<GraduationCap className="size-4" />} title="Koç Bağlantısı" />
            {coachName ? (
                <>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Şu an <strong className="text-brand-deep">{coachName}</strong> ile çalışıyorsun.
                    </p>
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="outline" className="mt-4 rounded-full text-destructive">
                                <Unlink className="size-4" /> Koç Bağlantısını Kes
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Koç bağlantısı kesilsin mi?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    {coachName} artık çalışmalarını göremeyecek. İstediğin zaman yeni bir davet gönderebilirsin.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Vazgeç</AlertDialogCancel>
                                <AlertDialogAction
                                    disabled={busy}
                                    onClick={async () => {
                                        setBusy(true);
                                        await onDisconnect();
                                        setBusy(false);
                                    }}
                                >
                                    Evet, kes
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </>
            ) : (
                <p className="mt-1 text-sm text-muted-foreground">
                    Şu an bağlı bir koçun yok. Aşağıdan yeni bir koç daveti gönderebilirsin.
                </p>
            )}
        </Card>
    );
}

function DangerSection({ onDelete }: { onDelete: () => Promise<void> }) {
    const [busy, setBusy] = useState(false);
    const [confirmText, setConfirmText] = useState("");

    return (
        <Card className="rounded-3xl border-destructive/30 bg-destructive/5 p-6 shadow-soft">
            <SectionTitle icon={<TriangleAlert className="size-4" />} title="Tehlikeli Bölge" />
            <p className="mt-1 text-sm text-muted-foreground">
                Hesabını silersen profil bilgilerin ve koç bağlantıların kalıcı olarak kaldırılır. Bu işlem geri alınamaz.
            </p>
            <AlertDialog>
                <AlertDialogTrigger asChild>
                    <Button variant="destructive" className="mt-4 rounded-full">
                        <Trash2 className="size-4" /> Hesabımı Sil
                    </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Hesabın tamamen silinsin mi?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Onaylamak için aşağıya <strong>Hesabimi sil</strong> yaz.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <Input
                        value={confirmText}
                        onChange={(e) => setConfirmText(e.target.value)}
                        placeholder="Hesabimi sil"
                    />
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setConfirmText("")}>Vazgeç</AlertDialogCancel>
                        <AlertDialogAction
                            disabled={busy || confirmText !== "Hesabimi sil"}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            onClick={async () => {
                                setBusy(true);
                                try {
                                    await onDelete();
                                } catch {
                                    toast.error("Hesap silinemedi.");
                                }
                                setBusy(false);
                            }}
                        >
                            {busy ? <Loader2 className="size-4 animate-spin" /> : "Hesabı Sil"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </Card>
    );
}

function ParentLinkSection() {
    const { role, myParents, child, unlinkChild, refresh } = useAuth();
    const [busy, setBusy] = useState(false);
    const isParent = role === "parent";
    const list = isParent
        ? child
            ? [{ id: child.id, name: child.name, email: child.email }]
            : []
        : myParents;

    return (
        <Card className="rounded-3xl border-border p-6 shadow-soft">
            <SectionTitle
                icon={<Users className="size-4" />}
                title={isParent ? "Çocuğum" : "Veli Bağlantısı"}
            />
            {list.length === 0 ? (
                <p className="mt-1 text-sm text-muted-foreground">
                    {isParent
                        ? "Henüz bağlı bir çocuk yok. Aşağıdan davet gönderebilirsin."
                        : "Henüz bağlı bir veli yok. Aşağıdan velini davet edebilirsin; velin çalışmalarını görebilir ve koçunla iletişim kurabilir."}
                </p>
            ) : (
                <div className="mt-3 space-y-2">
                    {list.map((p) => (
                        <div
                            key={p.id}
                            className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border px-3 py-2"
                        >
                            <span className="text-sm text-brand-deep">
                                <strong>{p.name}</strong>{" "}
                                <span className="text-muted-foreground">{p.email}</span>
                            </span>
                            <Button
                                size="sm"
                                variant="outline"
                                className="rounded-full text-destructive"
                                disabled={busy}
                                onClick={async () => {
                                    setBusy(true);
                                    await unlinkChild(isParent ? p.id : (child?.id ?? p.id));
                                    await refresh();
                                    setBusy(false);
                                    toast.success("Bağlantı kaldırıldı.");
                                }}
                            >
                                <Unlink className="size-4" /> Bağlantıyı Kes
                            </Button>
                        </div>
                    ))}
                </div>
            )}
        </Card>
    );
}
