import { openai } from "./openai-client";

const MODEL = "gpt-4o-mini";

// ── Types ──────────────────────────────────────────────────────────────────

export interface WorkoutExercise {
  exercise: string;
  sets: number;
  reps: string;
  rest: string;
  formNote?: string;
}

export interface WorkoutPhase {
  exercise: string;
  duration: string;
}

export interface GeneratedWorkout {
  warmUp: WorkoutPhase[];
  mainWorkout: WorkoutExercise[];
  coolDown: WorkoutPhase[];
  totalDurationMins: number;
  difficulty: string;
  notes?: string;
}

export interface GeneratedMindset {
  affirmation: string;
  motivationalMessage: string;
  actionStep: string;
  focus: string;
}

export interface CategorizedMusic {
  category: "beast_mode" | "calm" | "focus";
  recommendedPlaylistType: string;
}

export interface CoachResponse {
  reply: string;
  tips?: string[];
  safetyNote?: string;
}

// ── Helpers ────────────────────────────────────────────────────────────────

function parseJson<T>(raw: string | null | undefined): T {
  if (!raw) throw new Error("Empty response from AI");
  try {
    return JSON.parse(raw) as T;
  } catch {
    throw new Error("AI returned invalid JSON");
  }
}

async function chat(system: string, user: string): Promise<string> {
  const completion = await openai.chat.completions.create({
    model: MODEL,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
  });
  return completion.choices[0]?.message?.content ?? "";
}

// ── AI Functions ───────────────────────────────────────────────────────────

export async function generateWorkout(input: {
  goal: string;
  fitnessLevel: string;
  equipment: string[];
  duration: number;
  focus?: string;
}): Promise<GeneratedWorkout> {
  const system = `You are an expert personal trainer. Generate a structured workout plan and return it as JSON matching this exact shape:
{
  "warmUp": [{ "exercise": string, "duration": string }],
  "mainWorkout": [{ "exercise": string, "sets": number, "reps": string, "rest": string, "formNote": string }],
  "coolDown": [{ "exercise": string, "duration": string }],
  "totalDurationMins": number,
  "difficulty": string,
  "notes": string
}
Be specific about sets/reps based on fitness level. Include 3-5 main exercises. Always prioritize safety.`;

  const user = `Goal: ${input.goal}
Level: ${input.fitnessLevel}
Equipment: ${input.equipment.join(", ")}
Duration: ${input.duration} minutes${input.focus ? `\nFocus: ${input.focus}` : ""}`;

  const raw = await chat(system, user);
  return parseJson<GeneratedWorkout>(raw);
}

export async function generateMindset(input: {
  mood: string;
  goal: string;
  timeOfDay: string;
}): Promise<GeneratedMindset> {
  const system = `You are a sports psychologist and mindset coach. Return a JSON object with this exact shape:
{
  "affirmation": string,
  "motivationalMessage": string,
  "actionStep": string,
  "focus": string
}
affirmation: one powerful, personal sentence tailored to their mood and goal. motivationalMessage: 2-3 sentences of direct, energising coaching that fits the time of day and their current state. actionStep: one concrete thing to do right now. focus: one word or short phrase for today's mental focus. Be warm but direct. Never generic.`;

  const user = `Mood: ${input.mood}\nGoal: ${input.goal}\nTime of day: ${input.timeOfDay}`;

  const raw = await chat(system, user);
  return parseJson<GeneratedMindset>(raw);
}

export async function categorizeMusic(input: {
  title?: string;
  artist?: string;
  genre?: string;
  description?: string;
}): Promise<CategorizedMusic> {
  const system = `You are a fitness music expert. Given song metadata or a description, assign it a workout category and a recommended playlist type. Return a JSON object with this exact shape:
{
  "category": "beast_mode" | "calm" | "focus",
  "recommendedPlaylistType": string
}
category rules: "beast_mode" = high-energy, intense, motivating (HIIT, heavy lifting); "calm" = low intensity, recovery, stretching, meditation; "focus" = moderate energy, steady state, concentration (cardio, study, mobility). recommendedPlaylistType: a short descriptive label like "HIIT Power", "Recovery & Stretch", "Steady Cardio", "Deep Focus", etc.`;

  const parts = [
    input.title ? `Title: ${input.title}` : null,
    input.artist ? `Artist: ${input.artist}` : null,
    input.genre ? `Genre: ${input.genre}` : null,
    input.description ? `Description: ${input.description}` : null,
  ].filter(Boolean);

  const user = parts.join("\n") || "Unknown song";

  const raw = await chat(system, user);
  return parseJson<CategorizedMusic>(raw);
}

export async function coachAssistant(input: {
  message: string;
  goals?: string[];
}): Promise<CoachResponse> {
  const system = `You are an elite personal trainer and nutrition coach with a motivational, supportive style. Your job is to inspire and guide members toward their fitness goals. Return a JSON object with this exact shape:
{
  "reply": string,
  "tips": [string],
  "safetyNote": string | null
}
reply: 2-4 sentences — direct, evidence-based, energising. Acknowledge their effort and push them forward. tips: 2-3 short, actionable bullet points (empty array if not applicable). safetyNote: only include if there is a genuine safety concern, otherwise null. Always end on an empowering note. For medical questions always recommend consulting a healthcare professional.`;

  const goalLine = input.goals?.length ? `Member goals: ${input.goals.join(", ")}\n` : "";
  const user = `${goalLine}Question: ${input.message}`;

  const raw = await chat(system, user);
  return parseJson<CoachResponse>(raw);
}
