import { z } from "zod";

export const signUpSchema = z
  .object({
    fullName: z.string().min(2, "Full name must be at least 2 characters"),
    username: z
      .string()
      .min(3, "Username must be at least 3 characters")
      .max(30, "Username must be at most 30 characters")
      .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores"),
    email: z.string().email("Invalid email address"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[0-9]/, "Password must contain at least one number"),
    confirmPassword: z.string(),
    role: z.enum(["MEMBER", "COACH"]).default("MEMBER"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export const resetPasswordSchema = z
  .object({
    otp: z.string().length(6, "OTP must be 6 digits"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Must contain at least one uppercase letter")
      .regex(/[0-9]/, "Must contain at least one number"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const verifyOtpSchema = z.object({
  email: z.string().email(),
  otp: z.string().length(6, "OTP must be 6 digits"),
});

export const questionnaireSchema = z.object({
  age: z.number().min(13).max(120),
  gender: z.string().min(1, "Gender is required"),
  dob: z.string().min(1, "Date of birth is required"),
  height: z.number().positive("Height must be positive"),
  weight: z.number().positive("Weight must be positive"),
  activityLevel: z.enum(["LOW", "MODERATE", "HIGH"]),
  goals: z.array(z.string()).min(1, "Select at least one goal"),
  dietPreference: z.enum(["VEGETARIAN", "NON_VEGETARIAN"]),
  medicalConsiderations: z.string().optional(),
  equipmentAccess: z.enum(["HOME", "GYM", "BOTH"]),
  injuryFlags: z.array(z.string()).default([]),
  preferredDays: z.array(z.string()).min(1, "Select at least one day"),
});

export const createPostSchema = z.object({
  title: z.string().optional(),
  caption: z.string().max(2000, "Caption too long").optional(),
  mediaUrl: z.string().url().optional(),
  mediaType: z.enum(["IMAGE", "VIDEO"]).optional(),
});

export const workoutPlanSchema = z.object({
  name: z.string().min(1, "Workout name is required"),
  description: z.string().optional(),
  repetitions: z.boolean().default(false),
  type: z.enum(["HOME", "GYM"]).default("GYM"),
  category: z.string().optional(),
  subcategory: z.string().optional(),
  difficulty: z.string().optional(),
});

export const exerciseSchema = z.object({
  name: z.string().min(1, "Exercise name is required"),
  description: z.string().optional(),
  targetBodyParts: z.array(z.string()),
  duration: z.number().optional(),
  equipmentNeeded: z.string().optional(),
  videoUrl: z.string().optional(),
  sets: z.number().optional(),
  reps: z.number().optional(),
  restSeconds: z.number().optional(),
});

export type SignUpInput = z.infer<typeof signUpSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type QuestionnaireInput = z.infer<typeof questionnaireSchema>;
export type CreatePostInput = z.infer<typeof createPostSchema>;
export type WorkoutPlanInput = z.infer<typeof workoutPlanSchema>;
export type ExerciseInput = z.infer<typeof exerciseSchema>;
