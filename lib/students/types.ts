export interface Profile {
  id: string;
  full_name: string;
  avatar_url: string | null;
  last_seen_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Student {
  profile_id: string;
  career: string | null;
  semester: number | null;
  enrolled_at: string;
}

export interface ProfileWithStudent extends Profile {
  student: Student | null;
}
