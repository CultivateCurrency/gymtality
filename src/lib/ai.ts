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

export interface MusicRecommendation {
  genre: string;
  artists: string[];
  vibe: string;
  bpm?: string;
  reason: string;
}

export interface CategorizedMusic {
  recommendations: MusicRecommendation[];
  playlistVibe: string;
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
  workoutType: string;
  tempo?: string;
  genre?: string;
}): Promise<CategorizedMusic> {
  const system = `You are an expert workout music curator. Return a JSON object with this exact shape:
{
  "recommendations": [
    {
      "genre": string,
      "artists": [string],
      "vibe": string,
      "bpm": string,
      "reason": string
    }
  ],
  "playlistVibe": string
}
Include 4-5 recommendations. Each artists array should have 2-3 names. bpm should be a range like "120-140 BPM". playlistVibe is a 1-sentence description of the overall energy.`;

  const user = `Workout type: ${input.workoutType}${input.tempo ? `\nTempo preference: ${input.tempo}` : ""}${input.genre ? `\nGenre preference: ${input.genre}` : ""}`;

  const raw = await chat(system, user);
  return parseJson<CategorizedMusic>(raw);
}

export async function coachAssistant(input: {
  message: string;
  context?: string;
}): Promise<CoachResponse> {
  const system = `You are a certified personal trainer and nutrition coach. Return a JSON object with this exact shape:
{
  "reply": string,
  "tips": [string],
  "safetyNote": string
}
reply: direct, evidence-based answer (2-4 sentences). tips: 2-3 practical bullet points (omit if not applicable, use empty array). safetyNote: only include if there is a genuine safety consideration, otherwise use null. For medical questions always recommend consulting a healthcare professional.`;

  const user = `${input.context ? `Context: ${input.context}\n\n` : ""}Question: ${input.message}`;

  const raw = await chat(system, user);
  return parseJson<CoachResponse>(raw);
}
