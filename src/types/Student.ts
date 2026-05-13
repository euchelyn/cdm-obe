export type StudentStatus =
  | "Active"
  | "Pending"
  | "Inactive";

export type Student = {
  _id?: string;
  name: string;
  id: string;
  batch: string;
  program: string;
  birthday: string;
  status: StudentStatus;
};
