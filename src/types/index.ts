// Database model types (defined locally, mirroring backend schema)
export type UserRole = "ADMIN" | "COACH" | "MEMBER" | "GUEST" | "OWNER" | "SUPER_ADMIN";

export interface User {
  id: string;
  tenantId: string;
  email: string;
  username: string;
  fullName: string;
  profilePhoto: string | null;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserProfile {
  id: string;
  userId: string;
  tenantId: string;
  bio?: string | null;
  age?: number | null;
  gender?: string | null;
  weight?: number | null;
  height?: number | null;
}

export interface CoachProfile {
  id: string;
  userId: string;
  tenantId: string;
  specializations?: string[];
  certification?: string | null;
  yearsExperience?: number | null;
}

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  logo?: string | null;
  primaryColor?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface WorkoutPlan {
  id: string;
  tenantId: string;
  title: string;
  description?: string | null;
  coachId: string;
  duration?: number | null;
  difficulty?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Exercise {
  id: string;
  tenantId: string;
  workoutPlanId: string;
  name: string;
  sets?: number | null;
  reps?: number | null;
  duration?: number | null;
}

export interface Post {
  id: string;
  tenantId: string;
  userId: string;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Event {
  id: string;
  tenantId: string;
  title: string;
  description?: string | null;
  startTime: Date;
  endTime: Date;
  coachId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Subscription {
  id: string;
  tenantId: string;
  userId: string;
  planId: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Notification {
  id: string;
  tenantId: string;
  userId: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: Date;
}

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
