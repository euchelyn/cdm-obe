export type PrivRole = 
  | 'faculty'
  | 'mis'
  | 'pc'
  | 'registrar';

export type BaseUser = {
    name: string;
    email?: string | null;
    contact_number?: string | null;
};

export type FacultyUser = BaseUser & {
    faculty_id: string;
    department?: string | null;
    program?: string | null;
};

export type MISUser = BaseUser & {
    mis_id: string;
}

export type ProgramChairUser = BaseUser & {
    program_chair_id: string;
    department?: string | null;
    program?: string | null;
}

export type RegistrarUser = BaseUser & {
    registrar_id: string;
}

export type UserPayload = 
    | FacultyUser
    | MISUser
    | ProgramChairUser 
    | RegistrarUser;