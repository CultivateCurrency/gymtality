import type {
  User,
  UserProfile,
  CoachProfile,
  Tenant,
  WorkoutPlan,
  Exercise,
  Post,
  Event,
  Subscription,
  Notification,
  UserRole,
} from "@/generated/prisma/client";

// Auth types
export interface SessionUser {
  id: string;
  tenantId: string;
  email: string;
  username: string;
  fullName: string;
  profilePhoto: string | null;
  role: UserRole;
}

export interface SignUpData {
  fullName: string;
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: "MEMBER" | "COACH";
}

export interface LoginData {
  email: string;
  password: string;
}

// Questionnaire
export interface QuestionnaireData {
  age: number;
  gender: string;
  dob: string;
  height: number;
  weight: number;
  activityLevel: "LOW" | "MODERATE" | "HIGH";
  goals: string[];
  dietPreference: "VEGETARIAN" | "NON_VEGETARIAN";
  medicalConsiderations?: string;
  equipmentAccess: "HOME" | "GYM" | "BOTH";
  injuryFlags: string[];
  preferredDays: string[];
}

// Workout types
export interface WorkoutPlanWithExercises extends WorkoutPlan {
  exercises: Exercise[];
  coach: Pick<User, "id" | "fullName" | "username" | "profilePhoto">;
  _count: {
    likes: number;
    saves: number;
    sessions: number;
  };
}

// Community types
export interface PostWithDetails extends Post {
  user: Pick<User, "id" | "fullName" | "username" | "profilePhoto">;
  _count: {
    likes: number;
    comments: number;
    saves: number;
  };
  isLiked?: boolean;
  isSaved?: boolean;
}

// Event types
export interface EventWithBookings extends Event {
  _count: {
    bookings: number;
  };
  isBooked?: boolean;
}

// Dashboard
export interface TodayScreenData {
  todayWorkout: WorkoutPlan | null;
  streakCount: number;
  nextEvent: Event | null;
  recentNotifications: Notification[];
  progressSummary: {
    workoutsThisWeek: number;
    totalWorkouts: number;
    currentStreak: number;
  };
}

// API Response
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Tenant theming
export interface TenantTheme {
  name: string;
  logo: string | null;
  primaryColor: string;
  accentColor: string;
  favicon: string | null;
}
