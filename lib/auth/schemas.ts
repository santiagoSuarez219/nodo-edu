import { z } from "zod";
import { sanitizeGithubUsername } from "@/lib/students/github";

export const SignInSchema = z.object({
  email: z.string().email("Ingresa un correo válido"),
  password: z.string().min(1, "La contraseña es requerida"),
});

export const SignUpSchema = z
  .object({
    full_name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
    email: z.string().email("Ingresa un correo válido"),
    password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
    password_confirmation: z.string().min(1, "Confirma tu contraseña"),
    enrollment_code: z
      .string()
      .min(1, "Ingresa el código que te dio tu docente")
      .transform((code) => code.trim().toUpperCase()),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: "Las contraseñas no coinciden",
    path: ["password_confirmation"],
  });

export const UpdateProfileSchema = z.object({
  full_name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  career: z.string().optional(),
  semester: z.coerce
    .number()
    .int()
    .min(1)
    .max(20)
    .optional()
    .or(z.literal("")),
  // Opcional, sin validación de formato (spec-029): el formulario de /cuenta
  // siempre envía este campo (vacío si el usuario lo borró), así que se
  // sanea directamente a string | null en vez de preservar "no tocar".
  github_username: z
    .string()
    .optional()
    .transform((value) => sanitizeGithubUsername(value ?? "")),
});

export type SignInInput = z.infer<typeof SignInSchema>;
export type SignUpInput = z.infer<typeof SignUpSchema>;
export type UpdateProfileInput = z.infer<typeof UpdateProfileSchema>;
