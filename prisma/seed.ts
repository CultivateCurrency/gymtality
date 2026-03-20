import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});
const prisma = new PrismaClient({ adapter } as any);

// ============================================
// HELPERS
// ============================================

async function hashPassword(password: string) {
  return bcrypt.hash(password, 12);
}

function daysFromNow(days: number) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d;
}

function daysAgo(days: number) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d;
}

function hoursFromNow(hours: number) {
  const d = new Date();
  d.setHours(d.getHours() + hours);
  return d;
}

// ============================================
// MAIN SEED
// ============================================

async function main() {
  console.log("🌱 Starting seed...\n");

  // ── TENANT ──────────────────────────────────
  console.log("  Creating tenant...");
  const tenant = await prisma.tenant.upsert({
    where: { slug: "gymtality" },
    update: {},
    create: {
      slug: "gymtality",
      name: "Gymtality",
      primaryColor: "#FF6B00",
      accentColor: "#1A1A2E",
      plan: "ENTERPRISE",
      status: "ACTIVE",
      features: [
        "workouts",
        "community",
        "events",
        "music",
        "streaming",
        "shop",
        "goals",
        "challenges",
        "messaging",
        "referrals",
        "donations",
        "books",
      ],
      settings: {
        allowCoachSignup: true,
        requireEmailVerification: true,
        maxFileUploadMB: 500,
      },
    },
  });
  const T = tenant.id;

  // ── PASSWORDS ───────────────────────────────
  const memberPass = await hashPassword("Member123!");
  const coachPass = await hashPassword("Coach123!");
  const adminPass = await hashPassword("Admin123!");

  // ── ADMIN USER ──────────────────────────────
  console.log("  Creating admin...");
  const admin = await prisma.user.upsert({
    where: { tenantId_email: { tenantId: T, email: "admin@gymtality.fit" } },
    update: {},
    create: {
      tenantId: T,
      fullName: "Gymtality Admin",
      username: "gymtality_admin",
      email: "admin@gymtality.fit",
      passwordHash: adminPass,
      role: "ADMIN",
      emailVerified: true,
      points: 0,
    },
  });
  await prisma.userProfile.upsert({
    where: { userId: admin.id },
    update: {},
    create: { userId: admin.id, bio: "Platform administrator" },
  });

  // ── COACHES ─────────────────────────────────
  console.log("  Creating coaches...");
  const coachData = [
    {
      fullName: "Marcus Thompson",
      username: "coach_marcus",
      email: "marcus@gymtality.fit",
      category: "WORKOUT_TRAINER" as const,
      bio: "NASM Certified Personal Trainer with 8 years of experience. Specializing in strength training and body transformation.",
      certifications: ["NASM-CPT", "CrossFit Level 2", "First Aid/CPR"],
    },
    {
      fullName: "Priya Sharma",
      username: "coach_priya",
      email: "priya@gymtality.fit",
      category: "YOGA" as const,
      bio: "RYT-500 Yoga Instructor. Blending traditional Ashtanga with modern flow for all levels.",
      certifications: ["RYT-500", "Prenatal Yoga Cert", "Meditation Teacher Training"],
    },
    {
      fullName: "Jamal Robinson",
      username: "coach_jamal",
      email: "jamal@gymtality.fit",
      category: "WORKOUT_TRAINER" as const,
      bio: "Former D1 athlete turned coach. HIIT, functional fitness, and athletic performance specialist.",
      certifications: ["ACE-CPT", "CSCS", "TRX Certified"],
    },
    {
      fullName: "Elena Vasquez",
      username: "coach_elena",
      email: "elena@gymtality.fit",
      category: "MEDITATION" as const,
      bio: "Mindfulness coach and certified meditation teacher. Helping you find calm in the chaos.",
      certifications: ["CMT", "MBSR Teacher", "Breathwork Facilitator"],
    },
    {
      fullName: "Derek Kim",
      username: "coach_derek",
      email: "derek@gymtality.fit",
      category: "HEALTHY_FOODS" as const,
      bio: "Certified Nutritionist and meal-prep expert. Fueling your gains the right way.",
      certifications: ["CNS", "Sports Nutrition Diploma", "ServSafe"],
    },
  ];

  const coaches: any[] = [];
  for (const c of coachData) {
    const user = await prisma.user.upsert({
      where: { tenantId_email: { tenantId: T, email: c.email } },
      update: {},
      create: {
        tenantId: T,
        fullName: c.fullName,
        username: c.username,
        email: c.email,
        passwordHash: coachPass,
        role: "COACH",
        emailVerified: true,
        points: Math.floor(Math.random() * 500) + 100,
      },
    });
    await prisma.userProfile.upsert({
      where: { userId: user.id },
      update: {},
      create: { userId: user.id, bio: c.bio },
    });
    await prisma.coachProfile.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
        category: c.category,
        certifications: c.certifications,
        bio: c.bio,
        approvalStatus: "APPROVED",
        approvedAt: daysAgo(30),
        commissionRate: 0.8,
      },
    });
    coaches.push(user);
  }

  // ── MEMBERS ─────────────────────────────────
  console.log("  Creating members...");
  const memberData = [
    {
      fullName: "Alex Rivera",
      username: "alex_gym",
      email: "alex@example.com",
      bio: "Fitness beginner on a transformation journey. 30 lbs down, 20 to go!",
      age: 28,
      gender: "Male",
      weight: 185,
      height: 70,
      activityLevel: "Moderate",
      goals: ["Weight Loss", "Build Muscle"],
    },
    {
      fullName: "Sarah Chen",
      username: "sarah_fit",
      email: "sarah@example.com",
      bio: "Marathon runner and yoga enthusiast. Training for my 5th half marathon.",
      age: 32,
      gender: "Female",
      weight: 135,
      height: 65,
      activityLevel: "Very Active",
      goals: ["Improve Endurance", "Flexibility"],
    },
    {
      fullName: "Jordan Williams",
      username: "jwilliams",
      email: "jordan@example.com",
      bio: "Powerlifter. Chasing that 1000 lb club. Currently at 920.",
      age: 26,
      gender: "Male",
      weight: 210,
      height: 72,
      activityLevel: "Very Active",
      goals: ["Build Strength", "Competition Prep"],
    },
    {
      fullName: "Mia Torres",
      username: "mia_wellness",
      email: "mia@example.com",
      bio: "New mom getting back into fitness. Love group classes and accountability.",
      age: 31,
      gender: "Female",
      weight: 155,
      height: 64,
      activityLevel: "Light",
      goals: ["Weight Loss", "Core Strength", "Energy"],
    },
    {
      fullName: "Tyler Brooks",
      username: "tyler_b",
      email: "tyler@example.com",
      bio: "CrossFit convert. If it involves a barbell, I'm in.",
      age: 24,
      gender: "Male",
      weight: 175,
      height: 69,
      activityLevel: "Very Active",
      goals: ["Build Muscle", "Athletic Performance"],
    },
    {
      fullName: "Keisha Johnson",
      username: "keisha_j",
      email: "keisha@example.com",
      bio: "Dance fitness lover and Zumba addict. Making fitness fun!",
      age: 29,
      gender: "Female",
      weight: 145,
      height: 66,
      activityLevel: "Moderate",
      goals: ["Stay Active", "Flexibility", "Mental Health"],
    },
    {
      fullName: "Ryan Patel",
      username: "ryan_p",
      email: "ryan@example.com",
      bio: "Software engineer by day, gym rat by night. Trying to fix my desk posture.",
      age: 27,
      gender: "Male",
      weight: 170,
      height: 68,
      activityLevel: "Moderate",
      goals: ["Posture", "Build Muscle", "Flexibility"],
    },
    {
      fullName: "Nina Okafor",
      username: "nina_strong",
      email: "nina@example.com",
      bio: "Bodybuilding bikini competitor. Prep season starts now!",
      age: 25,
      gender: "Female",
      weight: 130,
      height: 63,
      activityLevel: "Very Active",
      goals: ["Competition Prep", "Lean Muscle", "Diet"],
    },
    {
      fullName: "Chris Donovan",
      username: "chris_d",
      email: "chris@example.com",
      bio: "Former couch potato. Six months into my fitness journey and loving it.",
      age: 35,
      gender: "Male",
      weight: 220,
      height: 71,
      activityLevel: "Light",
      goals: ["Weight Loss", "Cardiovascular Health"],
    },
    {
      fullName: "Aisha Mohammed",
      username: "aisha_m",
      email: "aisha@example.com",
      bio: "Pilates instructor in training. Love low-impact, high-results workouts.",
      age: 30,
      gender: "Female",
      weight: 140,
      height: 67,
      activityLevel: "Active",
      goals: ["Core Strength", "Flexibility", "Certification"],
    },
  ];

  const members: any[] = [];
  for (const m of memberData) {
    const user = await prisma.user.upsert({
      where: { tenantId_email: { tenantId: T, email: m.email } },
      update: {},
      create: {
        tenantId: T,
        fullName: m.fullName,
        username: m.username,
        email: m.email,
        passwordHash: memberPass,
        role: "MEMBER",
        emailVerified: true,
        points: Math.floor(Math.random() * 300) + 50,
      },
    });
    await prisma.userProfile.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
        bio: m.bio,
        age: m.age,
        gender: m.gender,
        weight: m.weight,
        height: m.height,
        activityLevel: m.activityLevel,
        goals: m.goals,
        preferredDays: ["Monday", "Wednesday", "Friday"],
      },
    });
    members.push(user);
  }

  // ── CATEGORIES ──────────────────────────────
  console.log("  Creating categories...");
  const categoryData = [
    { name: "Strength Training", slug: "strength-training", icon: "dumbbell", order: 1 },
    { name: "Cardio", slug: "cardio", icon: "heart-pulse", order: 2 },
    { name: "Yoga", slug: "yoga", icon: "sun", order: 3 },
    { name: "HIIT", slug: "hiit", icon: "zap", order: 4 },
    { name: "Meditation", slug: "meditation", icon: "brain", order: 5 },
    { name: "Nutrition", slug: "nutrition", icon: "apple", order: 6 },
    { name: "CrossFit", slug: "crossfit", icon: "flame", order: 7 },
    { name: "Pilates", slug: "pilates", icon: "move", order: 8 },
  ];

  const categories: any[] = [];
  for (const cat of categoryData) {
    const c = await prisma.category.upsert({
      where: { tenantId_slug: { tenantId: T, slug: cat.slug } },
      update: {},
      create: { tenantId: T, ...cat },
    });
    categories.push(c);
  }

  // Sub-categories
  const subCatData = [
    { name: "Upper Body", slug: "upper-body", parentSlug: "strength-training", order: 1 },
    { name: "Lower Body", slug: "lower-body", parentSlug: "strength-training", order: 2 },
    { name: "Full Body", slug: "full-body", parentSlug: "strength-training", order: 3 },
    { name: "Running", slug: "running", parentSlug: "cardio", order: 1 },
    { name: "Cycling", slug: "cycling", parentSlug: "cardio", order: 2 },
    { name: "Vinyasa", slug: "vinyasa", parentSlug: "yoga", order: 1 },
    { name: "Power Yoga", slug: "power-yoga", parentSlug: "yoga", order: 2 },
  ];

  for (const sub of subCatData) {
    const parent = categories.find(
      (c: any) => c.slug === sub.parentSlug
    );
    if (parent) {
      await prisma.category.upsert({
        where: { tenantId_slug: { tenantId: T, slug: sub.slug } },
        update: {},
        create: {
          tenantId: T,
          name: sub.name,
          slug: sub.slug,
          parentId: parent.id,
          order: sub.order,
        },
      });
    }
  }

  // ── WORKOUT PLANS + EXERCISES ───────────────
  console.log("  Creating workout plans & exercises...");
  const workoutPlans = [
    {
      coachIdx: 0, // Marcus
      name: "Beginner Full Body Blast",
      description:
        "A 4-week program designed for beginners. Build a strong foundation with compound movements and progressive overload.",
      type: "GYM" as const,
      category: "Strength Training",
      subcategory: "Full Body",
      difficulty: "Beginner",
      exercises: [
        { name: "Barbell Squat", targetBodyParts: ["Quads", "Glutes"], sets: 3, reps: 10, restSeconds: 90, order: 1, description: "Stand with feet shoulder-width apart. Lower until thighs are parallel to the ground." },
        { name: "Bench Press", targetBodyParts: ["Chest", "Triceps", "Shoulders"], sets: 3, reps: 10, restSeconds: 90, order: 2, description: "Lie flat on bench. Lower bar to chest, press up explosively." },
        { name: "Bent-Over Row", targetBodyParts: ["Back", "Biceps"], sets: 3, reps: 10, restSeconds: 60, order: 3, description: "Hinge at hips, pull barbell to lower chest. Squeeze shoulder blades." },
        { name: "Overhead Press", targetBodyParts: ["Shoulders", "Triceps"], sets: 3, reps: 8, restSeconds: 60, order: 4, description: "Press barbell overhead from shoulder height. Full lockout at top." },
        { name: "Romanian Deadlift", targetBodyParts: ["Hamstrings", "Glutes", "Lower Back"], sets: 3, reps: 10, restSeconds: 90, order: 5, description: "Hinge at hips with slight knee bend. Lower bar along shins." },
        { name: "Plank Hold", targetBodyParts: ["Core"], sets: 3, reps: 1, restSeconds: 30, order: 6, duration: 45, description: "Hold a straight-arm plank position. Keep core tight, body in a line." },
      ],
    },
    {
      coachIdx: 0, // Marcus
      name: "Hypertrophy Push/Pull/Legs",
      description:
        "An intermediate 6-day PPL split focused on muscle hypertrophy. High volume, moderate intensity.",
      type: "GYM" as const,
      category: "Strength Training",
      subcategory: "Full Body",
      difficulty: "Intermediate",
      exercises: [
        { name: "Incline Dumbbell Press", targetBodyParts: ["Upper Chest", "Shoulders"], sets: 4, reps: 12, restSeconds: 60, order: 1, description: "Set bench to 30 degrees. Press dumbbells up and together." },
        { name: "Cable Flyes", targetBodyParts: ["Chest"], sets: 3, reps: 15, restSeconds: 45, order: 2, description: "Set cables at chest height. Bring hands together in a hugging motion." },
        { name: "Lateral Raises", targetBodyParts: ["Shoulders"], sets: 4, reps: 15, restSeconds: 45, order: 3, description: "Raise dumbbells to the side until arms are parallel to ground." },
        { name: "Tricep Pushdown", targetBodyParts: ["Triceps"], sets: 3, reps: 12, restSeconds: 45, order: 4, description: "Push cable attachment down, fully extending elbows." },
        { name: "Skull Crushers", targetBodyParts: ["Triceps"], sets: 3, reps: 12, restSeconds: 45, order: 5, description: "Lower EZ bar to forehead, extend back up." },
      ],
    },
    {
      coachIdx: 2, // Jamal
      name: "30-Minute HIIT Burner",
      description:
        "Fast-paced HIIT circuit. No equipment needed. Perfect for busy schedules — maximum calorie burn in minimum time.",
      type: "HOME" as const,
      category: "HIIT",
      difficulty: "Intermediate",
      exercises: [
        { name: "Burpees", targetBodyParts: ["Full Body"], sets: 4, reps: 10, restSeconds: 30, order: 1, description: "Drop to push-up, jump back up with hands overhead." },
        { name: "Mountain Climbers", targetBodyParts: ["Core", "Cardio"], sets: 4, reps: 20, restSeconds: 20, order: 2, description: "In plank position, drive knees to chest alternately at speed." },
        { name: "Jump Squats", targetBodyParts: ["Quads", "Glutes"], sets: 4, reps: 15, restSeconds: 30, order: 3, description: "Squat down, explode up into a jump. Land softly." },
        { name: "High Knees", targetBodyParts: ["Cardio", "Core"], sets: 4, reps: 30, restSeconds: 20, order: 4, duration: 30, description: "Run in place, driving knees as high as possible." },
        { name: "Push-Up to T-Rotation", targetBodyParts: ["Chest", "Core", "Shoulders"], sets: 3, reps: 10, restSeconds: 30, order: 5, description: "Do a push-up, then rotate into a side plank. Alternate sides." },
      ],
    },
    {
      coachIdx: 1, // Priya
      name: "Morning Vinyasa Flow",
      description:
        "A gentle 45-minute yoga flow to start your day. Focus on breath, flexibility, and setting intentions.",
      type: "HOME" as const,
      category: "Yoga",
      subcategory: "Vinyasa",
      difficulty: "Beginner",
      exercises: [
        { name: "Sun Salutation A", targetBodyParts: ["Full Body"], sets: 1, reps: 5, restSeconds: 0, order: 1, duration: 300, description: "Flow through mountain pose, forward fold, plank, cobra, downward dog." },
        { name: "Warrior I → II Flow", targetBodyParts: ["Legs", "Core", "Arms"], sets: 1, reps: 3, restSeconds: 0, order: 2, duration: 180, description: "Transition between Warrior I and II, holding each for 5 breaths." },
        { name: "Tree Pose Hold", targetBodyParts: ["Balance", "Legs", "Core"], sets: 1, reps: 2, restSeconds: 0, order: 3, duration: 120, description: "Stand on one foot, place other foot on inner thigh. Each side." },
        { name: "Seated Forward Fold", targetBodyParts: ["Hamstrings", "Lower Back"], sets: 1, reps: 1, restSeconds: 0, order: 4, duration: 120, description: "Sit with legs extended, fold forward reaching for toes." },
        { name: "Savasana", targetBodyParts: ["Full Body"], sets: 1, reps: 1, restSeconds: 0, order: 5, duration: 300, description: "Lie flat on back, close eyes, focus on breath. Full relaxation." },
      ],
    },
    {
      coachIdx: 2, // Jamal
      name: "Athletic Performance Program",
      description:
        "8-week program for athletes. Plyometrics, agility, and sport-specific conditioning.",
      type: "GYM" as const,
      category: "CrossFit",
      difficulty: "Advanced",
      exercises: [
        { name: "Power Clean", targetBodyParts: ["Full Body"], sets: 5, reps: 3, restSeconds: 120, order: 1, description: "Explosive pull from floor to front rack position. Focus on hip drive." },
        { name: "Box Jumps", targetBodyParts: ["Quads", "Glutes", "Calves"], sets: 4, reps: 8, restSeconds: 60, order: 2, description: "Jump onto a 24-30 inch box. Step down, reset, repeat." },
        { name: "Sled Push", targetBodyParts: ["Quads", "Glutes", "Cardio"], sets: 4, reps: 1, restSeconds: 90, order: 3, duration: 30, description: "Push weighted sled for 40 yards. Stay low, drive through legs." },
        { name: "Battle Ropes", targetBodyParts: ["Arms", "Core", "Cardio"], sets: 4, reps: 1, restSeconds: 45, order: 4, duration: 30, description: "Alternate arm waves for 30 seconds. Keep core engaged." },
        { name: "Agility Ladder Drills", targetBodyParts: ["Agility", "Cardio"], sets: 3, reps: 4, restSeconds: 30, order: 5, description: "In-out, lateral, and Ickey shuffle patterns through the ladder." },
      ],
    },
    {
      coachIdx: 3, // Elena
      name: "Stress Relief Meditation Series",
      description:
        "A 2-week guided meditation program. Learn breathwork, body scans, and mindfulness techniques.",
      type: "HOME" as const,
      category: "Meditation",
      difficulty: "Beginner",
      exercises: [
        { name: "Box Breathing", targetBodyParts: ["Breathing"], sets: 1, reps: 1, restSeconds: 0, order: 1, duration: 300, description: "Inhale 4 counts, hold 4, exhale 4, hold 4. Repeat for 5 minutes." },
        { name: "Body Scan Meditation", targetBodyParts: ["Full Body"], sets: 1, reps: 1, restSeconds: 0, order: 2, duration: 600, description: "Slowly scan attention from toes to crown. Notice and release tension." },
        { name: "Loving-Kindness Meditation", targetBodyParts: ["Mental"], sets: 1, reps: 1, restSeconds: 0, order: 3, duration: 600, description: "Send wishes of well-being to yourself, loved ones, and all beings." },
      ],
    },
  ];

  const createdPlans: any[] = [];
  for (const wp of workoutPlans) {
    const plan = await prisma.workoutPlan.create({
      data: {
        tenantId: T,
        coachId: coaches[wp.coachIdx].id,
        name: wp.name,
        description: wp.description,
        type: wp.type,
        category: wp.category,
        subcategory: wp.subcategory || null,
        difficulty: wp.difficulty,
        exercises: {
          create: wp.exercises.map((ex) => ({
            name: ex.name,
            description: ex.description,
            targetBodyParts: ex.targetBodyParts,
            sets: ex.sets,
            reps: ex.reps,
            restSeconds: ex.restSeconds,
            order: ex.order,
            duration: ex.duration || null,
          })),
        },
      },
      include: { exercises: true },
    });
    createdPlans.push(plan);
  }

  // ── WORKOUT SESSIONS (history for members) ──
  console.log("  Creating workout sessions...");
  for (let i = 0; i < 5; i++) {
    const member = members[i];
    const plan = createdPlans[i % createdPlans.length];
    for (let d = 1; d <= 3; d++) {
      const startedAt = daysAgo(d * 3);
      await prisma.workoutSession.create({
        data: {
          userId: member.id,
          planId: plan.id,
          startedAt,
          completedAt: new Date(startedAt.getTime() + 45 * 60 * 1000),
          duration: 45,
          forgeScore: Math.floor(Math.random() * 40) + 60,
          exercises: {
            create: plan.exercises.slice(0, 3).map((ex: any) => ({
              exerciseId: ex.id,
              setsCompleted: ex.sets,
              repsCompleted: ex.reps,
              weight: Math.floor(Math.random() * 100) + 50,
              completed: true,
            })),
          },
        },
      });
    }
  }

  // ── COMMUNITY POSTS ─────────────────────────
  console.log("  Creating community posts...");
  const postData = [
    { userIdx: 0, title: "First month complete!", caption: "30 days in and I can already see changes. Down 8 lbs and my squat is up 30 lbs. This community keeps me going. 💪" },
    { userIdx: 1, title: "Race day ready", caption: "Just finished my last long run before the half marathon. 13.1 miles in 1:52. Feeling confident! Who else is racing this weekend?" },
    { userIdx: 2, title: "New PR alert!", caption: "Hit a 405 lb deadlift today! 1000 lb club here I come. Shoutout to Coach Jamal for the programming." },
    { userIdx: 3, title: "Postpartum fitness journey", caption: "5 months postpartum and finally feeling strong again. Remember: progress is progress, no matter how small." },
    { userIdx: 4, title: "CrossFit Open results", caption: "Finished in the top 20% of my region! Never thought I'd be here when I started 2 years ago." },
    { userIdx: 5, title: "Zumba class was FIRE today", caption: "If you haven't tried the Tuesday evening Zumba class, you're missing out. Best cardio that doesn't feel like cardio!" },
    { userIdx: 6, title: "Desk worker stretching routine", caption: "Coach Priya's yoga flow has been a game changer for my back pain. 10 mins every morning before work." },
    { userIdx: 7, title: "12 weeks out from competition", caption: "Prep is going well. Macros dialed in, training on point. Coach Derek's meal plans are everything." },
    { userIdx: 8, title: "6 month transformation", caption: "From 260 to 220 in 6 months. Still a long way to go but I'm never going back to the old me." },
    { userIdx: 9, title: "Pilates certification update", caption: "Passed my first practical exam! One step closer to teaching. Thank you all for the encouragement." },
    { userIdx: 0, title: "Meal prep Sunday", caption: "Chicken, rice, and veggies for the week. Boring but effective. What's everyone else prepping?" },
    { userIdx: 2, title: "Training split advice", caption: "Thinking of switching from PPL to Upper/Lower. Anyone made this switch? How did it go?" },
  ];

  const createdPosts: any[] = [];
  for (const p of postData) {
    const post = await prisma.post.create({
      data: {
        tenantId: T,
        userId: members[p.userIdx].id,
        title: p.title,
        caption: p.caption,
      },
    });
    createdPosts.push(post);
  }

  // Comments on posts
  const commentData = [
    { postIdx: 0, userIdx: 1, text: "Amazing progress! Keep it up! 🔥" },
    { postIdx: 0, userIdx: 4, text: "The first month is the hardest. You've got this!" },
    { postIdx: 2, userIdx: 4, text: "BEAST MODE! That's incredible." },
    { postIdx: 2, userIdx: 0, text: "Goals!! I'm working toward 315 right now." },
    { postIdx: 3, userIdx: 5, text: "So inspiring. You're doing amazing, mama!" },
    { postIdx: 3, userIdx: 9, text: "This is beautiful. Strength looks different for everyone." },
    { postIdx: 5, userIdx: 3, text: "I need to try this class! What time on Tuesdays?" },
    { postIdx: 6, userIdx: 9, text: "Priya's flows are the best. My back thanks her daily." },
    { postIdx: 8, userIdx: 0, text: "40 lbs is incredible! What was your biggest change?" },
    { postIdx: 8, userIdx: 3, text: "So motivating! You should be so proud." },
    { postIdx: 11, userIdx: 7, text: "I did PPL to Upper/Lower. More recovery time was huge for me." },
    { postIdx: 11, userIdx: 4, text: "Upper/Lower is great if you can train 4 days. PPL needs 6." },
  ];

  for (const c of commentData) {
    await prisma.comment.create({
      data: {
        postId: createdPosts[c.postIdx].id,
        userId: members[c.userIdx].id,
        text: c.text,
      },
    });
  }

  // Likes on posts
  for (const post of createdPosts) {
    const numLikes = Math.floor(Math.random() * 6) + 2;
    const shuffled = [...members].sort(() => 0.5 - Math.random()).slice(0, numLikes);
    for (const member of shuffled) {
      await prisma.like.create({
        data: { userId: member.id, postId: post.id },
      }).catch(() => {}); // skip duplicates
    }
  }

  // ── COMMUNITY GROUPS ────────────────────────
  console.log("  Creating groups...");
  const groupData = [
    { name: "Morning Crew", description: "For the early birds who train before sunrise. 5 AM gang rise up!", creatorIdx: 0 },
    { name: "Weight Loss Warriors", description: "Support group for anyone on a weight loss journey. Share wins, struggles, and tips.", creatorIdx: 3 },
    { name: "Powerlifting Club", description: "Squat. Bench. Deadlift. Repeat. All levels welcome.", creatorIdx: 2 },
    { name: "Yoga & Mindfulness", description: "A peaceful corner for yoga practitioners and meditation enthusiasts.", creatorIdx: 5 },
    { name: "Recipe Exchange", description: "Share your favorite healthy recipes, meal prep tips, and nutrition hacks.", creatorIdx: 7 },
  ];

  for (const g of groupData) {
    const group = await prisma.group.create({
      data: {
        tenantId: T,
        name: g.name,
        description: g.description,
        createdById: members[g.creatorIdx].id,
        members: {
          create: [
            { userId: members[g.creatorIdx].id, role: "CREATOR" },
            ...Array.from({ length: 4 }, (_, i) => ({
              userId: members[(g.creatorIdx + i + 1) % members.length].id,
              role: "MEMBER" as const,
            })),
          ],
        },
      },
    });
  }

  // ── FOLLOWS ─────────────────────────────────
  console.log("  Creating follow relationships...");
  // Members follow coaches
  for (const member of members) {
    for (const coach of coaches.slice(0, 3)) {
      await prisma.follow.create({
        data: { followerId: member.id, followingId: coach.id, status: "ACCEPTED" },
      }).catch(() => {});
    }
  }
  // Some members follow each other
  for (let i = 0; i < members.length - 1; i++) {
    await prisma.follow.create({
      data: { followerId: members[i].id, followingId: members[i + 1].id, status: "ACCEPTED" },
    }).catch(() => {});
  }

  // ── EVENTS ──────────────────────────────────
  console.log("  Creating events...");
  const eventData = [
    {
      coachIdx: 0,
      title: "Strength Fundamentals Workshop",
      description: "Learn proper form for the big 5 compound lifts. Open to all levels. Bring your lifting shoes!",
      type: "WORKSHOP" as const,
      startTime: daysFromNow(3),
      endTime: new Date(daysFromNow(3).getTime() + 2 * 60 * 60 * 1000),
      capacity: 20,
      location: "Gymtality Main Floor",
      price: 25,
    },
    {
      coachIdx: 1,
      title: "Sunrise Yoga on the Rooftop",
      description: "Start your Saturday with a 60-minute flow on the rooftop. Mats provided. All levels.",
      type: "LIVE_CLASS" as const,
      startTime: daysFromNow(5),
      endTime: new Date(daysFromNow(5).getTime() + 60 * 60 * 1000),
      capacity: 30,
      location: "Rooftop Studio",
      price: 0,
    },
    {
      coachIdx: 2,
      title: "HIIT Boot Camp",
      description: "45 minutes of pure intensity. Bring water, a towel, and your game face.",
      type: "LIVE_CLASS" as const,
      startTime: daysFromNow(1),
      endTime: new Date(daysFromNow(1).getTime() + 45 * 60 * 1000),
      capacity: 25,
      location: "Outdoor Training Area",
      price: 10,
    },
    {
      coachIdx: 3,
      title: "Meditation & Breathwork Evening",
      description: "Guided meditation session followed by breathwork techniques for stress relief and better sleep.",
      type: "LIVE_CLASS" as const,
      startTime: daysFromNow(7),
      endTime: new Date(daysFromNow(7).getTime() + 60 * 60 * 1000),
      capacity: 40,
      location: "Zen Room",
      price: 0,
    },
    {
      coachIdx: 4,
      title: "Nutrition Q&A: Meal Prep Mastery",
      description: "Live Q&A on macro counting, meal timing, and prep strategies. Bring your questions!",
      type: "WORKSHOP" as const,
      startTime: daysFromNow(10),
      endTime: new Date(daysFromNow(10).getTime() + 90 * 60 * 1000),
      capacity: 50,
      location: "Virtual (Zoom)",
      price: 15,
    },
    {
      coachIdx: 2,
      title: "Friday Night Throwdown",
      description: "Team-based fitness competition. 3 WODs, partner format. Prizes for top 3 teams!",
      type: "CHALLENGE_EVENT" as const,
      startTime: daysFromNow(12),
      endTime: new Date(daysFromNow(12).getTime() + 3 * 60 * 60 * 1000),
      capacity: 40,
      location: "Gymtality Arena",
      price: 20,
    },
    {
      coachIdx: 0,
      title: "1-on-1 Personal Training Session",
      description: "Private training session with Coach Marcus. Assessment + customized program design.",
      type: "APPOINTMENT" as const,
      startTime: daysFromNow(2),
      endTime: new Date(daysFromNow(2).getTime() + 60 * 60 * 1000),
      capacity: 1,
      location: "Private Training Room",
      price: 75,
    },
    {
      coachIdx: 1,
      title: "Yoga for Runners",
      description: "Specifically designed for runners. Focus on hip openers, hamstring flexibility, and recovery.",
      type: "IN_PERSON" as const,
      startTime: daysFromNow(8),
      endTime: new Date(daysFromNow(8).getTime() + 75 * 60 * 1000),
      capacity: 15,
      location: "Studio B",
      price: 0,
    },
  ];

  const createdEvents: any[] = [];
  for (const e of eventData) {
    const event = await prisma.event.create({
      data: {
        tenantId: T,
        coachId: coaches[e.coachIdx].id,
        title: e.title,
        description: e.description,
        type: e.type,
        startTime: e.startTime,
        endTime: e.endTime,
        capacity: e.capacity,
        location: e.location,
        price: e.price,
      },
    });
    createdEvents.push(event);
  }

  // Bookings for events
  for (let i = 0; i < createdEvents.length; i++) {
    const numBookings = Math.min(Math.floor(Math.random() * 6) + 2, members.length);
    const shuffled = [...members].sort(() => 0.5 - Math.random()).slice(0, numBookings);
    for (const member of shuffled) {
      await prisma.eventBooking.create({
        data: {
          eventId: createdEvents[i].id,
          userId: member.id,
          status: "BOOKED",
        },
      }).catch(() => {});
    }
  }

  // ── MUSIC ───────────────────────────────────
  console.log("  Creating music albums & songs...");
  const albumData = [
    {
      name: "Gymtality Beats Vol. 1",
      title: "Gymtality Beats Vol. 1",
      subTitle: "High Energy Workout Mix",
      description: "The ultimate workout soundtrack. Heavy bass, fast BPM, pure motivation.",
      category: "Workout",
      songs: [
        { name: "Iron Will", artist: "Gymtality Audio", genre: "Electronic", duration: 224 },
        { name: "No Limits", artist: "Gymtality Audio", genre: "Electronic", duration: 198 },
        { name: "Beast Mode", artist: "Gymtality Audio", genre: "Hip-Hop", duration: 210 },
        { name: "Rise Up", artist: "Gymtality Audio", genre: "Electronic", duration: 245 },
        { name: "Unbreakable", artist: "Gymtality Audio", genre: "Rock", duration: 232 },
        { name: "Final Rep", artist: "Gymtality Audio", genre: "Electronic", duration: 189 },
      ],
    },
    {
      name: "Zen Flow",
      title: "Zen Flow",
      subTitle: "Yoga & Meditation Sounds",
      description: "Peaceful ambient tracks for yoga, stretching, and meditation sessions.",
      category: "Yoga",
      songs: [
        { name: "Morning Light", artist: "Calm Collective", genre: "Ambient", duration: 360 },
        { name: "River Stones", artist: "Calm Collective", genre: "Ambient", duration: 420 },
        { name: "Lotus Bloom", artist: "Calm Collective", genre: "Ambient", duration: 310 },
        { name: "Deep Breath", artist: "Calm Collective", genre: "Ambient", duration: 380 },
        { name: "Mountain Silence", artist: "Calm Collective", genre: "Ambient", duration: 440 },
      ],
    },
    {
      name: "Cardio Hits",
      title: "Cardio Hits",
      subTitle: "Keep Moving Collection",
      description: "Upbeat tracks to keep your heart rate up during cardio sessions.",
      category: "Cardio",
      songs: [
        { name: "Run the World", artist: "Pulse", genre: "Pop", duration: 203 },
        { name: "Faster", artist: "Pulse", genre: "Dance", duration: 187 },
        { name: "Heartbeat", artist: "Pulse", genre: "EDM", duration: 215 },
        { name: "Don't Stop", artist: "Pulse", genre: "Pop", duration: 196 },
        { name: "Sweat It Out", artist: "Pulse", genre: "Dance", duration: 222 },
        { name: "Endorphin Rush", artist: "Pulse", genre: "EDM", duration: 234 },
      ],
    },
    {
      name: "Lift Heavy",
      title: "Lift Heavy",
      subTitle: "Powerlifting Anthems",
      description: "Heavy metal and hard-hitting tracks for your heaviest sets.",
      category: "Strength",
      songs: [
        { name: "Plates On", artist: "Iron Sound", genre: "Metal", duration: 248 },
        { name: "Max Out", artist: "Iron Sound", genre: "Metal", duration: 267 },
        { name: "Chalk Up", artist: "Iron Sound", genre: "Rock", duration: 230 },
        { name: "PR Day", artist: "Iron Sound", genre: "Metal", duration: 285 },
      ],
    },
  ];

  for (const album of albumData) {
    await prisma.album.create({
      data: {
        tenantId: T,
        name: album.name,
        title: album.title,
        subTitle: album.subTitle,
        description: album.description,
        category: album.category,
        songs: {
          create: album.songs.map((s, i) => ({
            name: s.name,
            artist: s.artist,
            genre: s.genre,
            duration: s.duration,
            order: i + 1,
          })),
        },
      },
    });
  }

  // Playlists for a few members
  for (let i = 0; i < 3; i++) {
    await prisma.playlist.create({
      data: {
        userId: members[i].id,
        name: `${members[i].fullName}'s Workout Mix`,
      },
    });
  }

  // ── BOOKS ───────────────────────────────────
  console.log("  Creating books...");
  const bookData = [
    { title: "The Gymtality Method", author: "Marcus Thompson", language: "English", category: "Strength Training", about: "A comprehensive guide to progressive overload and periodization for natural lifters." },
    { title: "Mindful Movement", author: "Priya Sharma", language: "English", category: "Yoga", about: "Connecting breath to movement — a modern approach to traditional yoga practices." },
    { title: "HIIT Science", author: "Jamal Robinson", language: "English", category: "HIIT", about: "The research behind high-intensity interval training and how to program it effectively." },
    { title: "Calm in Chaos", author: "Elena Vasquez", language: "English", category: "Meditation", about: "Practical meditation techniques for busy professionals. 10 minutes a day can change your life." },
    { title: "Fuel Your Fire", author: "Derek Kim", language: "English", category: "Nutrition", about: "Nutrition fundamentals for athletes and fitness enthusiasts. Meal plans, macro guides, and recipes." },
    { title: "The Home Gym Blueprint", author: "Marcus Thompson", language: "English", category: "Fitness", about: "Build an effective home gym on any budget. Equipment guides, space planning, and programming." },
  ];

  for (const b of bookData) {
    await prisma.book.create({
      data: { tenantId: T, ...b },
    });
  }

  // ── PRODUCTS (SHOP) ─────────────────────────
  console.log("  Creating products...");
  const productData = [
    { name: "Gymtality T-Shirt", description: "Premium cotton blend tee with the Gymtality logo. Available in Black, White, and Orange.", price: 29.99, category: "Apparel", stock: 150 },
    { name: "Gymtality Performance Hoodie", description: "Heavyweight fleece hoodie. Perfect for warming up or cool-down walks. Embroidered logo.", price: 59.99, category: "Apparel", stock: 80 },
    { name: "Gymtality Shaker Bottle", description: "28oz BPA-free shaker with mixing ball. Leak-proof lid. Gymtality orange accent.", price: 14.99, category: "Accessories", stock: 200 },
    { name: "Resistance Band Set (5-Pack)", description: "Light to heavy resistance bands with door anchor. Carry bag included.", price: 24.99, category: "Equipment", stock: 120 },
    { name: "Gymtality Lifting Straps", description: "Heavy-duty cotton lifting straps with neoprene padding. One size fits all.", price: 16.99, category: "Equipment", stock: 100 },
    { name: "Gymtality Pre-Workout (30 servings)", description: "Clean energy formula. 200mg caffeine, beta-alanine, citrulline. Tropical Punch flavor.", price: 39.99, category: "Supplements", stock: 75 },
    { name: "Whey Protein (2 lbs)", description: "100% whey protein isolate. 25g protein per scoop. Chocolate and Vanilla flavors.", price: 44.99, category: "Supplements", stock: 90 },
    { name: "Gymtality Gym Bag", description: "Durable nylon duffle with shoe compartment, water bottle pocket, and ventilated section.", price: 49.99, category: "Accessories", stock: 60 },
    { name: "Yoga Mat (6mm)", description: "Non-slip, eco-friendly TPE yoga mat. 72 x 24 inches. Includes carry strap.", price: 34.99, category: "Equipment", stock: 85 },
    { name: "Wrist Wraps (Pair)", description: "12-inch wrist wraps for bench press and overhead movements. Thumb loop, velcro closure.", price: 12.99, category: "Equipment", stock: 130 },
  ];

  const createdProducts: any[] = [];
  for (const p of productData) {
    const product = await prisma.product.create({
      data: { tenantId: T, ...p },
    });
    createdProducts.push(product);
  }

  // A couple of orders
  const order1 = await prisma.order.create({
    data: {
      userId: members[0].id,
      total: 74.98,
      status: "DELIVERED",
      shippingAddress: { street: "123 Main St", city: "San Jose", state: "CA", zip: "95101" },
      items: {
        create: [
          { productId: createdProducts[0].id, quantity: 1, price: 29.99 },
          { productId: createdProducts[5].id, quantity: 1, price: 39.99 },
        ],
      },
    },
  });

  const order2 = await prisma.order.create({
    data: {
      userId: members[2].id,
      total: 56.98,
      status: "SHIPPED",
      shippingAddress: { street: "456 Oak Ave", city: "Austin", state: "TX", zip: "73301" },
      items: {
        create: [
          { productId: createdProducts[4].id, quantity: 1, price: 16.99 },
          { productId: createdProducts[6].id, quantity: 1, price: 44.99 },
        ],
      },
    },
  });

  // ── SUBSCRIPTIONS ───────────────────────────
  console.log("  Creating subscriptions...");
  const subPlans: Array<"BASIC" | "PREMIUM" | "ELITE"> = [
    "PREMIUM", "ELITE", "PREMIUM", "BASIC", "ELITE",
    "BASIC", "PREMIUM", "ELITE", "BASIC", "PREMIUM",
  ];
  for (let i = 0; i < members.length; i++) {
    await prisma.subscription.upsert({
      where: { userId: members[i].id },
      update: {},
      create: {
        userId: members[i].id,
        plan: subPlans[i],
        interval: i % 3 === 0 ? "YEARLY" : "MONTHLY",
        status: "ACTIVE",
        currentPeriodEnd: daysFromNow(30),
      },
    });
  }

  // ── DONATIONS ───────────────────────────────
  console.log("  Creating donations...");
  const donationData = [
    { userIdx: 0, coachIdx: 0, amount: 25, message: "Thanks for the amazing program, Coach Marcus!" },
    { userIdx: 2, coachIdx: 2, amount: 50, message: "That programming got me to 405. You earned this!" },
    { userIdx: 1, coachIdx: 1, amount: 15, message: "Your morning flows keep me sane. Namaste 🙏" },
    { userIdx: 7, coachIdx: 4, amount: 30, message: "Your meal plans are chef's kiss. Literally." },
    { userIdx: 8, coachIdx: 0, amount: 20, message: "40 lbs down thanks to your guidance!" },
  ];

  for (const d of donationData) {
    await prisma.donation.create({
      data: {
        userId: members[d.userIdx].id,
        coachId: coaches[d.coachIdx].id,
        amount: d.amount,
        message: d.message,
      },
    });
  }

  // ── STREAMS ─────────────────────────────────
  console.log("  Creating streams...");
  const streamData = [
    { coachIdx: 0, title: "Full Body Strength Live", category: "Strength", type: "PUBLIC" as const, status: "SCHEDULED" as const, scheduledAt: daysFromNow(2) },
    { coachIdx: 1, title: "Evening Yoga Flow", category: "Yoga", type: "MEMBERS_ONLY" as const, status: "SCHEDULED" as const, scheduledAt: daysFromNow(4) },
    { coachIdx: 2, title: "HIIT Party Friday", category: "HIIT", type: "PUBLIC" as const, status: "SCHEDULED" as const, scheduledAt: daysFromNow(6) },
    { coachIdx: 3, title: "Guided Sleep Meditation", category: "Meditation", type: "PUBLIC" as const, status: "ENDED" as const, scheduledAt: daysAgo(3), startedAt: daysAgo(3), endedAt: new Date(daysAgo(3).getTime() + 45 * 60 * 1000), viewerCount: 127 },
    { coachIdx: 0, title: "Deadlift Form Check Q&A", category: "Strength", type: "PUBLIC" as const, status: "ENDED" as const, scheduledAt: daysAgo(7), startedAt: daysAgo(7), endedAt: new Date(daysAgo(7).getTime() + 60 * 60 * 1000), viewerCount: 89 },
  ];

  for (const s of streamData) {
    await prisma.stream.create({
      data: {
        tenantId: T,
        hostId: coaches[s.coachIdx].id,
        title: s.title,
        category: s.category,
        type: s.type,
        status: s.status,
        scheduledAt: s.scheduledAt,
        startedAt: s.startedAt || null,
        endedAt: s.endedAt || null,
        viewerCount: s.viewerCount || 0,
      },
    });
  }

  // ── GOALS ───────────────────────────────────
  console.log("  Creating goals...");
  const goalData = [
    { userIdx: 0, type: "weight", title: "Lose 20 lbs", target: 165, current: 185, unit: "lbs", targetDate: daysFromNow(90) },
    { userIdx: 0, type: "strength", title: "Bench Press 225 lbs", target: 225, current: 185, unit: "lbs", targetDate: daysFromNow(120) },
    { userIdx: 1, type: "cardio", title: "Sub-1:45 Half Marathon", target: 105, current: 112, unit: "minutes", targetDate: daysFromNow(60) },
    { userIdx: 2, type: "strength", title: "1000 lb Club", target: 1000, current: 920, unit: "lbs", targetDate: daysFromNow(90) },
    { userIdx: 3, type: "weight", title: "Get back to pre-baby weight", target: 140, current: 155, unit: "lbs", targetDate: daysFromNow(120) },
    { userIdx: 4, type: "custom", title: "Complete 100 WODs this year", target: 100, current: 42, unit: "WODs", targetDate: daysFromNow(270) },
    { userIdx: 6, type: "custom", title: "Touch toes (hamstring flexibility)", target: 1, current: 0, unit: "achieved", targetDate: daysFromNow(60) },
    { userIdx: 8, type: "weight", title: "Get under 200 lbs", target: 200, current: 220, unit: "lbs", targetDate: daysFromNow(90) },
  ];

  for (const g of goalData) {
    await prisma.goal.create({
      data: {
        tenantId: T,
        userId: members[g.userIdx].id,
        type: g.type,
        title: g.title,
        target: g.target,
        current: g.current,
        unit: g.unit,
        targetDate: g.targetDate,
      },
    });
  }

  // ── CHALLENGES ──────────────────────────────
  console.log("  Creating challenges...");
  const challenge1 = await prisma.challenge.create({
    data: {
      tenantId: T,
      title: "30-Day Squat Challenge",
      description: "Start at 50 squats on Day 1, add 10 per day. Can you hit 340 on Day 30?",
      type: "THIRTY_DAY",
      startDate: daysAgo(5),
      endDate: daysFromNow(25),
      goal: { type: "squats", startReps: 50, dailyIncrease: 10 },
      pointsReward: 500,
    },
  });

  const challenge2 = await prisma.challenge.create({
    data: {
      tenantId: T,
      title: "10K Steps Daily",
      description: "Hit 10,000 steps every day for 2 weeks. Track with your wearable or phone.",
      type: "STEP",
      startDate: daysFromNow(1),
      endDate: daysFromNow(15),
      goal: { dailySteps: 10000, totalDays: 14 },
      pointsReward: 300,
    },
  });

  // Add participants
  for (let i = 0; i < 6; i++) {
    await prisma.challengeParticipant.create({
      data: {
        challengeId: challenge1.id,
        userId: members[i].id,
        progress: { daysCompleted: Math.floor(Math.random() * 5), totalSquats: Math.floor(Math.random() * 500) + 200 },
      },
    }).catch(() => {});
  }

  // ── QUESTIONNAIRE ───────────────────────────
  console.log("  Creating questionnaire...");
  const questionData = [
    { question: "What is your primary fitness goal?", type: "MULTIPLE_CHOICE" as const, options: ["Lose Weight", "Build Muscle", "Improve Endurance", "Increase Flexibility", "General Health"], category: "GOALS" as const, order: 1 },
    { question: "How many days per week can you commit to exercise?", type: "MULTIPLE_CHOICE" as const, options: ["1-2 days", "3-4 days", "5-6 days", "Every day"], category: "LIFESTYLE" as const, order: 2 },
    { question: "Do you have any injuries or physical limitations?", type: "TEXT" as const, options: [], category: "PHYSICAL_HEALTH" as const, order: 3 },
    { question: "Rate your current fitness level (1-10)", type: "SCALE" as const, options: [], category: "PHYSICAL_HEALTH" as const, order: 4 },
    { question: "Do you follow a specific diet?", type: "MULTIPLE_CHOICE" as const, options: ["No specific diet", "Keto", "Vegan/Vegetarian", "Paleo", "Intermittent Fasting", "Other"], category: "LIFESTYLE" as const, order: 5 },
    { question: "Do you have access to a gym?", type: "YES_NO" as const, options: ["Yes", "No"], category: "LIFESTYLE" as const, order: 6 },
    { question: "What equipment do you have access to?", type: "MULTIPLE_CHOICE" as const, options: ["Full Gym", "Dumbbells Only", "Resistance Bands", "Bodyweight Only", "Home Gym Setup"], category: "LIFESTYLE" as const, order: 7 },
    { question: "How would you rate your stress level?", type: "SCALE" as const, options: [], category: "MENTAL_HEALTH" as const, order: 8 },
    { question: "What time of day do you prefer to work out?", type: "MULTIPLE_CHOICE" as const, options: ["Early Morning (5-7 AM)", "Morning (7-10 AM)", "Midday (11 AM-1 PM)", "Afternoon (2-5 PM)", "Evening (6-9 PM)"], category: "LIFESTYLE" as const, order: 9 },
    { question: "Anything else we should know about your health or fitness background?", type: "TEXT" as const, options: [], category: "GENERAL" as const, order: 10 },
  ];

  for (const q of questionData) {
    await prisma.questionnaire.create({
      data: { tenantId: T, ...q },
    });
  }

  // ── CMS PAGES ───────────────────────────────
  console.log("  Creating CMS pages...");
  const cmsData = [
    {
      key: "about",
      title: "About Gymtality",
      content: `<h2>About Gymtality</h2>
<p>Gymtality is more than a gym — it's a community-driven platform built for people who are serious about transforming their lives through fitness.</p>
<p>Founded in 2026, our mission is to make world-class coaching, programming, and community accessible to everyone — whether you train at home, in a gym, or on the go.</p>
<h3>What Makes Us Different</h3>
<ul>
<li><strong>Expert Coaches</strong> — Every coach on our platform is certified and vetted</li>
<li><strong>Personalized Programs</strong> — AI-driven recommendations based on your goals and progress</li>
<li><strong>Community First</strong> — Connect with like-minded people on the same journey</li>
<li><strong>All-in-One Platform</strong> — Workouts, nutrition, streaming, events, shop, and more</li>
</ul>`,
    },
    {
      key: "privacy",
      title: "Privacy Policy",
      content: `<h2>Privacy Policy</h2>
<p>Last updated: March 2026</p>
<p>Gymtality ("we", "our", "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, and share your personal information when you use our platform.</p>
<h3>Information We Collect</h3>
<p>We collect information you provide directly to us, such as when you create an account, complete your fitness questionnaire, make a purchase, or contact us for support.</p>
<h3>How We Use Your Information</h3>
<p>We use your information to provide, maintain, and improve our services, process transactions, send communications, and personalize your experience.</p>
<h3>Data Security</h3>
<p>We implement industry-standard security measures to protect your personal information. Your data is encrypted in transit and at rest.</p>`,
    },
    {
      key: "terms",
      title: "Terms & Conditions",
      content: `<h2>Terms & Conditions</h2>
<p>Last updated: March 2026</p>
<p>By accessing or using Gymtality, you agree to be bound by these Terms & Conditions.</p>
<h3>Account Registration</h3>
<p>You must provide accurate and complete information when creating an account. You are responsible for maintaining the security of your account credentials.</p>
<h3>Subscriptions & Payments</h3>
<p>Subscription fees are billed in advance on a monthly or annual basis. You may cancel your subscription at any time through your account settings.</p>
<h3>Code of Conduct</h3>
<p>You agree to use Gymtality respectfully. Harassment, spam, or abusive behavior will result in account suspension or termination.</p>`,
    },
    {
      key: "terms-professional",
      title: "Professional Terms & Conditions",
      content: `<h2>Professional Terms & Conditions</h2>
<p>Last updated: March 2026</p>
<p>These terms apply to coaches and professionals using the Gymtality platform to offer their services.</p>
<h3>Coach Requirements</h3>
<p>All coaches must hold valid certifications in their area of expertise. Certifications must be uploaded and verified during the approval process.</p>
<h3>Commission & Payouts</h3>
<p>Coaches receive 80% of all revenue generated through the platform. Payouts are processed monthly via Stripe Connect.</p>`,
    },
  ];

  for (const page of cmsData) {
    await prisma.cmsPage.upsert({
      where: { tenantId_key: { tenantId: T, key: page.key } },
      update: { title: page.title, content: page.content },
      create: { tenantId: T, ...page },
    });
  }

  // ── NOTIFICATIONS ───────────────────────────
  console.log("  Creating notifications...");
  const notifData = [
    { userIdx: 0, type: "WORKOUT_COMPLETED" as const, title: "Workout Complete!", message: "Great job finishing Beginner Full Body Blast! You earned 85 Gymtality points." },
    { userIdx: 0, type: "LIKE" as const, title: "New Like", message: "Sarah Chen liked your post 'First month complete!'" },
    { userIdx: 1, type: "COMMENT" as const, title: "New Comment", message: "Tyler Brooks commented on your post: 'Race day ready'" },
    { userIdx: 2, type: "EVENT_REMINDER" as const, title: "Event Tomorrow", message: "HIIT Boot Camp starts tomorrow at the Outdoor Training Area. Don't forget your water!" },
    { userIdx: 3, type: "SUBSCRIPTION_RENEWAL" as const, title: "Subscription Renewed", message: "Your Basic plan has been renewed for another month. Next billing date: April 19, 2026." },
    { userIdx: 7, type: "COACH_MESSAGE" as const, title: "Message from Coach Derek", message: "Your updated meal plan for weeks 9-12 is ready. Check your messages!" },
    { userIdx: 8, type: "CHALLENGE_REMINDER" as const, title: "Challenge Update", message: "You're 3 days into the 30-Day Squat Challenge! Keep the streak going." },
    { userIdx: 4, type: "PAYMENT_SUCCESS" as const, title: "Payment Confirmed", message: "Your payment of $20.00 for Friday Night Throwdown has been processed." },
  ];

  for (const n of notifData) {
    await prisma.notification.create({
      data: {
        userId: members[n.userIdx].id,
        type: n.type,
        title: n.title,
        message: n.message,
      },
    });
  }

  // ── AFFILIATE LINKS ─────────────────────────
  console.log("  Creating affiliate/referral links...");
  for (let i = 0; i < 5; i++) {
    await prisma.affiliateLink.create({
      data: {
        userId: members[i].id,
        code: `GYMTALITY${members[i].username.toUpperCase()}`,
        campaignName: "Member Referral",
        clicks: Math.floor(Math.random() * 50) + 5,
        conversions: Math.floor(Math.random() * 5),
      },
    }).catch(() => {});
  }

  // ── CLIENT NOTES (Coach CRM) ────────────────
  console.log("  Creating client notes...");
  const coachProfiles = await prisma.coachProfile.findMany();
  if (coachProfiles.length > 0) {
    const marcusProfile = coachProfiles.find((cp: any) => cp.userId === coaches[0].id);
    if (marcusProfile) {
      const noteData = [
        { clientIdx: 0, note: "Alex is progressing well on the beginner program. Ready to increase weight on squats next week. Good form overall.", tags: ["progress", "squat"] },
        { clientIdx: 8, note: "Chris has dropped 40 lbs — incredible. Watch his lower back on deadlifts, slight rounding under load.", tags: ["weight-loss", "form-check"] },
        { clientIdx: 2, note: "Jordan is close to 1000 lb club. Program peaking cycle starting next month for competition.", tags: ["powerlifting", "competition"] },
      ];
      for (const n of noteData) {
        await prisma.clientNote.create({
          data: {
            coachProfileId: marcusProfile.id,
            clientUserId: members[n.clientIdx].id,
            note: n.note,
            tags: n.tags,
          },
        });
      }
    }
  }

  // ── REPORTS (Moderation) ────────────────────
  console.log("  Creating sample reports...");
  await prisma.report.create({
    data: {
      reporterId: members[5].id,
      targetType: "POST",
      targetId: createdPosts[11].id,
      reason: "This post seems like spam / self-promotion.",
      status: "PENDING",
    },
  });

  // ── DONE ────────────────────────────────────
  console.log("\n✅ Seed complete!\n");
  console.log("  📊 Summary:");
  console.log("  ─────────────────────────────────");
  console.log("  1  Tenant (Gymtality)");
  console.log("  1  Admin user");
  console.log("  5  Coaches (all approved)");
  console.log("  10 Members (with profiles + subscriptions)");
  console.log("  8  Categories + 7 sub-categories");
  console.log("  6  Workout plans (with 3-6 exercises each)");
  console.log("  15 Workout sessions (history)");
  console.log("  12 Community posts + comments + likes");
  console.log("  5  Community groups (with members)");
  console.log("  30+ Follow relationships");
  console.log("  8  Events (with bookings)");
  console.log("  4  Music albums (21 songs total)");
  console.log("  3  Playlists");
  console.log("  6  Books");
  console.log("  10 Products");
  console.log("  2  Orders");
  console.log("  10 Subscriptions");
  console.log("  5  Donations");
  console.log("  5  Streams (3 scheduled, 2 ended)");
  console.log("  8  Goals");
  console.log("  2  Challenges (with participants)");
  console.log("  10 Questionnaire questions");
  console.log("  4  CMS pages");
  console.log("  8  Notifications");
  console.log("  5  Affiliate/referral links");
  console.log("  3  Client notes");
  console.log("  1  Moderation report");
  console.log("  ─────────────────────────────────\n");
  console.log("  🔑 Login credentials:");
  console.log("  Admin:   admin@gymtality.fit     / Admin123!");
  console.log("  Coach:   marcus@gymtality.fit    / Coach123!");
  console.log("  Member:  alex@example.com        / Member123!\n");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error("❌ Seed failed:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
