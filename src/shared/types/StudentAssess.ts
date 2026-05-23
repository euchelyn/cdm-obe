export interface StudentAssessment {
  _id?: string;
  assessment_id: string;
  block_id: string;
  student_id: string;
  submitted_at?: string;
  createdAt?: string;
  updatedAt?: string;
  assessment?: object;
  block?: object;
  student?: object;
  po_scores?: Record<string, number>;
}
