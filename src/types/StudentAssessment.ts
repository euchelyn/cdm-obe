export interface Rubric {
  _id?: string;
  assessment_id: string;
  criteria: string;
  program_outcomes: Record<string, number>; // { A: 60, B: 40 } must total 100
  levels: {
    excellent: string;
    good: string;
    fair: string;
    poor: string;
  };
  order?: number;
  createdAt?: string;
  updatedAt?: string;
}
