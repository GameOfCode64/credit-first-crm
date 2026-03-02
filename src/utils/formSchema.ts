import { z } from "zod";

export const loginFormSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),

  password: z
    .string()
    .min(1, "Password is required")
    .min(6, "Password must be at least 6 characters"),

  role: z
    .enum(["ADMIN", "MANAGER", "EMPLOYEE"])
    .refine((val) => val !== undefined, {
      message: "Please select a role",
    }),

  rememberMe: z.boolean().optional(),
});

export type LoginFormValues = z.infer<typeof loginFormSchema>;
