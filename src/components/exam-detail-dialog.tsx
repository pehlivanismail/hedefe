import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { type MockExam } from "@/lib/demo-data";
import { EXAM_TEMPLATES } from "@/lib/exam-templates";
import { CheckCircle2, XCircle } from "lucide-react";
import { realExams } from "@/lib/topics-data";
import { useMemo } from "react";

export function ExamDetailDialog({
  exam,
  open,
  onOpenChange,
}: {
  exam: MockExam | null;
  open: boolean;
  onOpenChange: (o: boolean) => void;
}) {
  const topicNames = useMemo(() => {
    const map = new Map<string, string>();
    for (const re of realExams) {
      for (const s of re.subjects) {
        for (const a of s.areas) {
          for (const t of a.topics) {
            map.set(t.id, t.name);
          }
        }
      }
    }
    return map;
  }, []);

  if (!exam) return null;

  const template = EXAM_TEMPLATES.find((t) => t.id === exam.templateId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col p-0 overflow-hidden">
        <DialogHeader className="px-6 py-4 border-b border-border bg-secondary/30">
          <DialogTitle className="font-display text-brand-deep flex items-center gap-2">
            {exam.publisher} Deneme Analizi
            <span className="text-xs font-normal text-muted-foreground bg-background px-2 py-1 rounded-full border border-border">
              {exam.date}
            </span>
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-6">
          {!template || !exam.detailedLogs ? (
            <div className="text-center py-12 text-muted-foreground">
              <p>Bu deneme için detaylı soru analizi bulunmuyor.</p>
              <p className="text-sm mt-2">("Hızlı Giriş" ile kaydedilmiş olabilir)</p>
              <div className="mt-8 grid grid-cols-4 gap-4 max-w-sm mx-auto">
                <div className="bg-secondary/50 p-3 rounded-xl">
                  <div className="text-xs text-muted-foreground">Türkçe</div>
                  <div className="font-bold">{exam.turkce}</div>
                </div>
                <div className="bg-secondary/50 p-3 rounded-xl">
                  <div className="text-xs text-muted-foreground">Matematik</div>
                  <div className="font-bold">{exam.matematik}</div>
                </div>
                <div className="bg-secondary/50 p-3 rounded-xl">
                  <div className="text-xs text-muted-foreground">Sosyal</div>
                  <div className="font-bold">{exam.sosyal}</div>
                </div>
                <div className="bg-secondary/50 p-3 rounded-xl">
                  <div className="text-xs text-muted-foreground">Fen</div>
                  <div className="font-bold">{exam.fen}</div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-8">
              {Array.from(new Set(template.questions.map((q) => q.domain))).map((domain) => {
                const domainQuestions = template.questions.filter((q) => q.domain === domain);
                
                const weakTopicIds = new Set(
                  exam.detailedLogs!
                    .filter(log => {
                      const isWeak = log.status === "wrong" || log.status === "blank" || (log as any).isWrong !== undefined;
                      // if isWrong is false, it meant blank in the old schema, so it's a weak topic too!
                      // old schema: isWrong: true (wrong), isWrong: false (blank). 
                      // correct questions were NOT logged at all in the old schema.
                      const isError = log.status ? (log.status !== "correct") : true; 
                      return isError && domainQuestions.some(q => q.topicId === log.topicId);
                    })
                    .map(l => l.topicId)
                );
                
                const allDomainTopicIds = new Set(domainQuestions.map(q => q.topicId).filter(Boolean) as string[]);
                
                const strongTopicIds = new Set(
                  Array.from(allDomainTopicIds).filter(id => !weakTopicIds.has(id))
                );

                return (
                  <div key={domain} className="space-y-4">
                    <h3 className="font-display font-bold text-lg text-brand-deep border-b border-border pb-2">
                      {domain}
                    </h3>
                    
                    <div className="grid md:grid-cols-2 gap-4">
                      {/* Güçlü Konular */}
                      <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-4">
                        <div className="flex items-center gap-2 mb-3 text-emerald-600 font-semibold text-sm">
                          <CheckCircle2 className="size-4" />
                          Güçlü Konular (Hatasız)
                        </div>
                        {strongTopicIds.size === 0 ? (
                          <div className="text-sm text-muted-foreground italic">Yok</div>
                        ) : (
                          <ul className="space-y-1.5">
                            {Array.from(strongTopicIds).map(id => (
                              <li key={id} className="text-sm text-brand-deep font-medium">
                                • {topicNames.get(id) || id}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>

                      {/* Zayıf Konular */}
                      <div className="bg-destructive/5 border border-destructive/20 rounded-2xl p-4">
                        <div className="flex items-center gap-2 mb-3 text-destructive font-semibold text-sm">
                          <XCircle className="size-4" />
                          Zayıf Konular (Yanlış/Boş)
                        </div>
                        {weakTopicIds.size === 0 ? (
                          <div className="text-sm text-muted-foreground italic">Yok</div>
                        ) : (
                          <ul className="space-y-1.5">
                            {Array.from(weakTopicIds).map(id => {
                              const errors = exam.detailedLogs!.filter(l => l.topicId === id);
                              const wrong = errors.filter(e => e.status === "wrong" || (e as any).isWrong === true).length;
                              const blank = errors.filter(e => e.status === "blank" || (e as any).isWrong === false).length;
                              return (
                                <li key={id} className="text-sm text-brand-deep font-medium flex justify-between">
                                  <span>• {topicNames.get(id) || id}</span>
                                  <span className="text-xs text-muted-foreground">
                                    {wrong > 0 && <span className="text-destructive mr-1">{wrong}Y</span>}
                                    {blank > 0 && <span>{blank}B</span>}
                                  </span>
                                </li>
                              )
                            })}
                          </ul>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
