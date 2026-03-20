export default function AboutPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <div className="max-w-4xl mx-auto px-6 py-16 space-y-16">
        {/* Hero */}
        <div className="text-center space-y-4">
          <h1 className="text-5xl font-bold">
            About <span className="text-orange-500">Gymtality</span>
          </h1>
          <p className="text-xl text-zinc-400 max-w-2xl mx-auto">
            Building the future of fitness, one workout at a time.
          </p>
        </div>

        {/* Mission */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-orange-500">Our Mission</h2>
          <p className="text-zinc-300 leading-relaxed">
            Gymtality exists to make world-class fitness accessible to
            everyone. We connect members with expert coaches, provide powerful
            tools for tracking progress, and build communities that keep people
            motivated on their fitness journey.
          </p>
          <p className="text-zinc-300 leading-relaxed">
            Whether you train at home or in the gym, are just starting out or
            competing at the highest level, Gymtality gives you the platform,
            the coaching, and the community to reach your goals.
          </p>
        </section>

        {/* Vision */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-orange-500">Our Vision</h2>
          <p className="text-zinc-300 leading-relaxed">
            We envision a world where every gym, studio, and wellness business has
            access to technology that was previously only available to the largest
            fitness chains. Through our white-label platform, we empower gym
            owners to offer their members a premium digital experience under their
            own brand.
          </p>
        </section>

        {/* What We Offer */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold text-orange-500">What We Offer</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                title: "Personalized Workouts",
                desc: "Browse hundreds of workout plans created by certified coaches, tailored to your goals and fitness level.",
              },
              {
                title: "Live Streaming",
                desc: "Join live workout classes from anywhere. Interact with coaches in real-time and train with a community.",
              },
              {
                title: "Expert Coaching",
                desc: "Connect with certified fitness professionals for personalized guidance, nutrition advice, and accountability.",
              },
              {
                title: "Community",
                desc: "Share your journey, join groups, challenge friends, and stay motivated with a supportive fitness community.",
              },
              {
                title: "Progress Tracking",
                desc: "Log workouts, track your Gymtality Score, set goals, and see your improvement over time.",
              },
              {
                title: "Events & Classes",
                desc: "Book in-person classes, virtual workshops, and special fitness events with a tap.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="p-6 bg-zinc-900 border border-zinc-800 rounded-xl"
              >
                <h3 className="text-lg font-semibold text-white mb-2">
                  {item.title}
                </h3>
                <p className="text-sm text-zinc-400">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Team */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold text-orange-500">Our Team</h2>
          <p className="text-zinc-300 leading-relaxed">
            Gymtality is built by a passionate team of fitness enthusiasts,
            engineers, and designers who believe technology can transform the way
            people train, connect, and grow.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { name: "Founder & CEO", role: "Vision & Strategy" },
              { name: "Head of Engineering", role: "Platform & Infrastructure" },
              { name: "Head of Fitness", role: "Content & Coaching" },
            ].map((member) => (
              <div
                key={member.name}
                className="p-6 bg-zinc-900 border border-zinc-800 rounded-xl text-center"
              >
                <div className="w-16 h-16 rounded-full bg-orange-500/20 mx-auto mb-3 flex items-center justify-center">
                  <span className="text-orange-500 text-xl font-bold">
                    {member.name[0]}
                  </span>
                </div>
                <h3 className="font-semibold text-white">{member.name}</h3>
                <p className="text-sm text-zinc-500">{member.role}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Footer CTA */}
        <section className="text-center py-8 border-t border-zinc-800">
          <p className="text-zinc-400">
            Ready to start your fitness journey?{" "}
            <a href="/signup" className="text-orange-500 hover:underline font-medium">
              Join Gymtality today.
            </a>
          </p>
        </section>
      </div>
    </div>
  );
}
