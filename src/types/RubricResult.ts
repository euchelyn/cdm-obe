export interface RubricResult {
  _id?: string;
  student_assessment_id: string;
  rubric_id: string;
  level: 'excellent' | 'good' | 'fair' | 'poor';
  score?: number;
  createdAt?: string;
  updatedAt?: string;
  rubric?: object;
  student_assessment?: object;
}
