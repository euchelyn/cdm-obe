export interface FacultyCourse {
  _id?: string;
  faculty_id: string;
  course_id: string;
  school_year: string;
  semester: string;
  faculty?: object;
  course?: object;
  createdAt?: string;
  updatedAt?: string;
}