import { z } from "zod";

export const loginFormSchema = z.object({
  // Accepts either a valid email OR a plain username (no spaces, min 3 chars)
  email: z
    .string()
    .min(1, "Email or username is required")
    .refine(
      (val) => {
        const isEmail = val.includes("@");
        if (isEmail) {
          return z.string().email().safeParse(val).success;
        }
        // Username: at least 3 chars, no spaces
        return val.trim().length >= 3 && !/\s/.test(val);
      },
      {
        message:
          "Enter a valid email address or username (min 3 characters, no spaces)",
      },
    ),

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
