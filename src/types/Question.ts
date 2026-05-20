export interface Question {
  _id?: string;
  assessment_id: string;
  question: string;
  program_outcomes: Record<string, number>; // { A: 60, B: 40 } must total 100
  order?: number;
  createdAt?: string;
  updatedAt?: string;
}
