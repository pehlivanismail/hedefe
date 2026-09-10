import data from "./exam-templates.json";

export type ExamQuestion = {
  qNum: number;
  domain: string;
  subject: string;
  area: string;
  topic: string;
  topicId: string;
  difficulty: string;
  note: string;
};

export type ExamTemplate = {
  id: string;
  name: string;
  category: string;
  examScope: string;
  questions: ExamQuestion[];
};

export const EXAM_TEMPLATES = data.templates as ExamTemplate[];
