import { createServerSupabaseClient } from "@/lib/auth/server";
import type { Profile, Student, ProfileWithStudent } from "./types";

export async function getProfileByUserId(userId: string): Promise<Profile | null> {
  const supabase = await createServerSupabaseClient();
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();
  return data ?? null;
}

export async function getStudentByProfileId(profileId: string): Promise<Student | null> {
  const supabase = await createServerSupabaseClient();
  const { data } = await supabase
    .from("students")
    .select("*")
    .eq("profile_id", profileId)
    .single();
  return data ?? null;
}

export async function getProfileWithStudent(userId: string): Promise<ProfileWithStudent | null> {
  const supabase = await createServerSupabaseClient();
  const { data } = await supabase
    .from("profiles")
    .select("*, student:students(*)")
    .eq("id", userId)
    .single();

  if (!data) return null;
  const { student, ...profile } = data as Profile & { student: Student | null };
  return { ...profile, student: student ?? null };
}

export async function updateProfile(
  userId: string,
  fields: Partial<Pick<Profile, "full_name" | "avatar_url" | "github_username">>
): Promise<Profile | null> {
  const supabase = await createServerSupabaseClient();
  const { data } = await supabase
    .from("profiles")
    .update(fields)
    .eq("id", userId)
    .select()
    .single();
  return data ?? null;
}

export async function updateStudent(
  profileId: string,
  fields: Partial<Pick<Student, "career" | "semester">>
): Promise<Student | null> {
  const supabase = await createServerSupabaseClient();
  const { data } = await supabase
    .from("students")
    .update(fields)
    .eq("profile_id", profileId)
    .select()
    .single();
  return data ?? null;
}

// Crea el perfil on-demand si el trigger on_auth_user_created falló.
export async function ensureProfile(userId: string, email: string): Promise<Profile> {
  const existing = await getProfileByUserId(userId);
  if (existing) return existing;

  const supabase = await createServerSupabaseClient();
  const { data } = await supabase
    .from("profiles")
    .insert({ id: userId, full_name: email })
    .select()
    .single();

  return data!;
}
