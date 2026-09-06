import type { Track } from "@/lib/demo-data";

export type ExamKind = "TYT" | "AYT";

export type NetBucket = "turkce" | "matematik" | "sosyal" | "fen";

/** Sınav başına toplam soru sayısı (ÖSYM standartları) */
export const EXAM_QUESTION_COUNTS: Record<ExamKind, number> = {
  TYT: 120,
  AYT: 80,
};

export type SectionDef = {
  key: string;
  label: string;
  questions: number;
  bucket: NetBucket;
};

/** ÖSYM standart süreleri (dakika) */
export const EXAM_DURATION: Record<ExamKind, number> = {
  TYT: 165,
  AYT: 180,
};

export const TYT_SECTIONS: SectionDef[] = [
  { key: "tyt-turkce", label: "Türkçe", questions: 40, bucket: "turkce" },
  { key: "tyt-tarih", label: "Tarih", questions: 5, bucket: "sosyal" },
  { key: "tyt-cografya", label: "Coğrafya", questions: 5, bucket: "sosyal" },
  { key: "tyt-felsefe", label: "Felsefe", questions: 5, bucket: "sosyal" },
  { key: "tyt-din", label: "Din Kültürü", questions: 5, bucket: "sosyal" },
  { key: "tyt-mat", label: "Matematik", questions: 40, bucket: "matematik" },
  { key: "tyt-fizik", label: "Fizik", questions: 7, bucket: "fen" },
  { key: "tyt-kimya", label: "Kimya", questions: 7, bucket: "fen" },
  { key: "tyt-biyoloji", label: "Biyoloji", questions: 6, bucket: "fen" },
];

export const AYT_SECTIONS: Record<Track, SectionDef[]> = {
  sayisal: [
    { key: "ayt-mat", label: "Matematik", questions: 40, bucket: "matematik" },
    { key: "ayt-fizik", label: "Fizik", questions: 14, bucket: "fen" },
    { key: "ayt-kimya", label: "Kimya", questions: 13, bucket: "fen" },
    { key: "ayt-biyoloji", label: "Biyoloji", questions: 13, bucket: "fen" },
  ],
  esit: [
    { key: "ayt-ea-mat", label: "Matematik", questions: 40, bucket: "matematik" },
    {
      key: "ayt-ea-edebiyat",
      label: "Türk Dili ve Edebiyatı",
      questions: 24,
      bucket: "turkce",
    },
    { key: "ayt-ea-tarih1", label: "Tarih-1", questions: 10, bucket: "sosyal" },
    { key: "ayt-ea-cog1", label: "Coğrafya-1", questions: 6, bucket: "sosyal" },
  ],
  sozel: [
    {
      key: "ayt-sz-edebiyat",
      label: "Türk Dili ve Edebiyatı",
      questions: 24,
      bucket: "turkce",
    },
    { key: "ayt-sz-tarih1", label: "Tarih-1", questions: 10, bucket: "sosyal" },
    { key: "ayt-sz-cog1", label: "Coğrafya-1", questions: 6, bucket: "sosyal" },
    { key: "ayt-sz-tarih2", label: "Tarih-2", questions: 11, bucket: "sosyal" },
    { key: "ayt-sz-cog2", label: "Coğrafya-2", questions: 11, bucket: "sosyal" },
    {
      key: "ayt-sz-felsefe",
      label: "Felsefe Grubu",
      questions: 12,
      bucket: "sosyal",
    },
    {
      key: "ayt-sz-din",
      label: "Din Kültürü ve Ahlak Bilgisi",
      questions: 6,
      bucket: "sosyal",
    },
  ],
};

export function sectionsFor(kind: ExamKind, track: Track): SectionDef[] {
  return kind === "TYT" ? TYT_SECTIONS : AYT_SECTIONS[track];
}

/** 4 yanlış 1 doğruyu götürür */
export function netOf(questions: number, wrong: number, blank: number) {
  const correct = Math.max(0, questions - wrong - blank);
  return Math.max(0, correct - wrong / 4);
}

export function formatDuration(min: number) {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m ? `${h} saat ${m} dk` : `${h} saat`;
}
