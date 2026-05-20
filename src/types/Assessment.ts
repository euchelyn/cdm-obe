import { Question } from "./Question";
import { Rubric } from "./StudentAssessment";

export interface Assessment {
  _id?: string;
  faculty_course_id: string;
  type: 'final_exam' | 'rubric';
  program_outcomes: Record<string, number>; // { A: 50, B: 50 }
  created_by: string;
  createdAt?: string;
  updatedAt?: string;
  questions?: Record<string, Question>;    // embedded on GET
  rubrics?: Record<string, Rubric>;        // embedded on GET
  faculty_course?: object;
}
