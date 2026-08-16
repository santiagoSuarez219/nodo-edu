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

// spec-051: usada tanto por el cambio voluntario (/cuenta) como por el cambio
// forzado (/cambiar-contrasena) — mismo schema, misma política de contraseñas
// que SignUpSchema (D5). El refine de "distinta de la actual" (D6) es lo que
// impide que el cambio forzado se "cumpla" reescribiendo la misma contraseña
// genérica que entregó el docente.
export const ChangePasswordSchema = z
  .object({
    current_password: z.string().min(1, "Ingresa tu contraseña actual"),
    new_password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
    new_password_confirmation: z.string().min(1, "Confirma tu nueva contraseña"),
  })
  .refine((data) => data.new_password === data.new_password_confirmation, {
    message: "Las contraseñas no coinciden",
    path: ["new_password_confirmation"],
  })
  .refine((data) => data.new_password !== data.current_password, {
    message: "La nueva contraseña debe ser distinta de la actual",
    path: ["new_password"],
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
export type ChangePasswordInput = z.infer<typeof ChangePasswordSchema>;
export type UpdateProfileInput = z.infer<typeof UpdateProfileSchema>;
