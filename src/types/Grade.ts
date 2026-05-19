export interface Grade {
  _id?: string;
  block_id: string;
  student_id: string;
  grade: number;
  remarks?: string;
  submitted_at?: string;
  createdAt?: string;
  updatedAt?: string;
}
