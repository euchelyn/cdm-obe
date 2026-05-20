export interface QuestionResult {
  _id?: string;
  student_assessment_id: string;
  question_id: string;
  is_correct: boolean;
  createdAt?: string;
  updatedAt?: string;
  question?: object;
  student_assessment?: object;
}