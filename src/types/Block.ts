export interface Block {
  _id?: string;
  faculty_course_id: string;
  name: string;
  school_year: string;
  semester: string;
  faculty_course?: object;
  createdAt?: string;
  updatedAt?: string;
}