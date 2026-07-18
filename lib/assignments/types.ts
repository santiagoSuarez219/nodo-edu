import { SupabaseClient } from "@supabase/supabase-js";

export type AssignmentType = "practice" | "quiz" | "exam" | "homework";

export type ShowFeedbackOn = "submit" | "close" | "never";

export interface AssignmentVariantGroup {
  id: string;
  academic_course_id: string;
  grade_item_id: string | null;
  title: string;
  description: string | null;
  type: AssignmentType;
  opens_at: string | null;
  closes_at: string | null;
  time_limit_minutes: number | null;
  shuffle_questions: boolean;
  shuffle_choices: boolean;
  show_feedback_on: ShowFeedbackOn;
  max_attempts: number;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export interface AssignmentVariant {
  id: string;
  variant_group_id: string;
  variant_label: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface AssignmentQuestion {
  id: string;
  assignment_id: string;
  question_id: string;
  order_index: number;
  points: number;
  // Presente solo cuando la query hace join con `questions` (ver
  // _getGroupByIdForActor / getGroupDetail). Ver DEBT-007 en
  // docs/specs/backlog.md para los paths que todavía no lo traen.
  question?: {
    id: string;
    stem: string;
    type: string;
  };
}

export interface AssignmentGroupWithVariants extends AssignmentVariantGroup {
  variants: Array<
    AssignmentVariant & {
      questions: AssignmentQuestion[];
      total_points: number;
    }
  >;
}

export interface StudentAssignment {
  group: AssignmentVariantGroup;
  variant: AssignmentVariant;
  questions: AssignmentQuestion[];
  total_points: number;
}

export interface VariantAllocation {
  id: string;
  variant_group_id: string;
  enrollment_id: string;
  assignment_id: string;
  allocated_at: string;
}

export interface AssignmentInput {
  academic_course_id: string;
  grade_item_id?: string | null;
  title: string;
  description?: string | null;
  type: AssignmentType;
  opens_at?: string | null;
  closes_at?: string | null;
  time_limit_minutes?: number | null;
  shuffle_questions?: boolean;
  shuffle_choices?: boolean;
  show_feedback_on?: ShowFeedbackOn;
  max_attempts?: number;
}

export interface AssignmentVariantInput {
  variant_label: string;
  description?: string | null;
  questions: Array<{
    question_id: string;
    points: number;
    order_index: number;
  }>;
}

export interface AssignmentContext {
  supabase: SupabaseClient;
  actorId: string;
}
