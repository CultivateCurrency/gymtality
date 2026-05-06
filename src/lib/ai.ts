import { anthropic } from "./anthropic";

const MODEL = "claude-haiku-4-5-20251001";

export async function generateWorkoutPlan(input: {
  goal: string;
  level: string;
  equipment: string[];
  durationMins: number;
  focus?: string;
}): Promise<string> {
  const systemPrompt = `You are an expert personal trainer and strength coach. Generate structured, safe, and effective workout plans. Format your response in clear markdown with sections for warm-up, main workout (with sets, reps, rest periods), and cool-down. Be specific about weights/intensity based on level. Always prioritize proper form.`;

  const userMessage = `Create a ${input.durationMins}-minute ${input.level} workout plan with the following details:
- Goal: ${input.goal}
- Available equipment: ${input.equipment.join(", ")}
${input.focus ? `- Focus area: ${input.focus}` : ""}

Include: warm-up (5 min), main workout with exercise names, sets, reps, rest periods, and a cool-down (5 min). Add brief form notes for key exercises.`;

  const message = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 1024,
    system: systemPrompt,
    messages: [{ role: "user", content: userMessage }],
  });

  return message.content[0].type === "text" ? message.content[0].text : "";
}

export async function generateMindsetCoaching(input: {
  mood: string;
  challenge?: string;
}): Promise<string> {
  const systemPrompt = `You are a sports psychologist and mindset coach specializing in athletic performance and personal growth. Provide warm, direct, actionable coaching that acknowledges feelings without being dismissive, then pivots to practical mental strategies. Keep responses to 2-3 focused paragraphs. Never be preachy or generic.`;

  const userMessage = `My current mood/mental state: ${input.mood}${input.challenge ? `\nCurrent challenge: ${input.challenge}` : ""}

Please give me targeted mindset coaching for today's training.`;

  const message = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 512,
    system: systemPrompt,
    messages: [{ role: "user", content: userMessage }],
  });

  return message.content[0].type === "text" ? message.content[0].text : "";
}

export async function generateMusicRecommendations(input: {
  workoutType: string;
  tempo?: string;
  genre?: string;
}): Promise<string> {
  const systemPrompt = `You are an expert music curator who specializes in workout and athletic performance playlists. Recommend 4-5 specific genres, artists, and playlist vibes that match the workout context. For each recommendation, include the genre, 2-3 artist names, the energy/vibe description, and why it works for this workout type. Format as a clean numbered list.`;

  const userMessage = `Recommend music for: ${input.workoutType}${input.tempo ? ` (${input.tempo} tempo)` : ""}${input.genre ? `, preferably ${input.genre} style` : ""}.`;

  const message = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 512,
    system: systemPrompt,
    messages: [{ role: "user", content: userMessage }],
  });

  return message.content[0].type === "text" ? message.content[0].text : "";
}

export async function generateCoachReply(input: {
  message: string;
  context?: string;
}): Promise<string> {
  const systemPrompt = `You are a certified personal trainer and nutrition coach with 10+ years of experience. Provide evidence-based, practical advice on training, nutrition, recovery, and performance. Always prioritize safety — for any medical, injury, or health condition questions, recommend consulting a licensed healthcare professional. Be direct, specific, and helpful. Keep responses concise (3-5 sentences for simple questions, more for complex ones).`;

  const userContent = input.context
    ? `User context: ${input.context}\n\nQuestion: ${input.message}`
    : input.message;

  const message = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 768,
    system: systemPrompt,
    messages: [{ role: "user", content: userContent }],
  });

  return message.content[0].type === "text" ? message.content[0].text : "";
}
