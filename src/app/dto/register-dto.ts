import { z } from "zod";

export const registerSchema = z.object({
  firstName: z
    .string()
    .trim()
    .min(2, "First name must be at least 2 characters")
    .max(45),
  lastName: z.string().trim().max(45).optional(),
  email: z.email().trim().toLowerCase().max(322),
  password: z.string().min(8, "Password must be at least 8 characters").max(72),
});

export type RegisterPayload = z.infer<typeof registerSchema>;
