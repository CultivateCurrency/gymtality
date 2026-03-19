"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Search,
  Filter,
  Dumbbell,
  User,
  Calendar,
  MessageCircle,
  Heart,
  Play,
  Loader2,
  Compass,
  Users,
} from "lucide-react";
import { useApi } from "@/hooks/use-api";

const EQUIPMENT_FILTERS = ["None", "Dumbbells", "Barbell", "Resistance Bands", "Kettlebell", "Machine"];
const BODY_PARTS = ["Chest", "Back", "Legs", "Arms", "Core", "Shoulders", "Full Body"];

interface WorkoutPlan {
  id: string;
  name: string;
  type: string;
  category: string | null;
  difficulty: string | null;
  coverImage: string | null;
  coach: { id: string; fullName: string; username: string; profilePhoto: string | null };
  _count: { likes: number; saves: number; sessions: number };
}

interface Coach {
  id: string;
  fullName: string;
  username: string;
  profilePhoto: string | null;
  role: string;
}

interface Post {
  id: string;
  title: string | null;
  caption: string | null;
  createdAt: string;
  user: { id: string; fullName: string; username: string; profilePhoto: string | null };
  _count: { likes: number; comments: number; saves: number };
}

interface EventItem {
  id: string;
  title: string;
  type: string;
  startTime: string;
  location: string | null;
}

interface WorkoutsResponse {
  plans: WorkoutPlan[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}

interface UsersResponse {
  users: Coach[];
  pagination: any;
}

interface PostsResponse {
  posts: Post[];
  pagination: any;
}

interface EventsResponse {
  events: EventItem[];
  pagination: any;
}

export default function ExplorePage() {
  const [search, setSearch] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [activeEquipment, setActiveEquipment] = useState<string[]>([]);
  const [activeBodyParts, setActiveBodyParts] = useState<string[]>([]);

  const searchQuery = search ? `&search=${encodeURIComponent(search)}` : "";

  const { data: workoutsData, loading: workoutsLoading } = useApi<WorkoutsResponse>(
    `/api/workouts?page=1&limit=6${searchQuery}`
  );
  const { data: coachesData, loading: coachesLoading } = useApi<UsersResponse>(
    `/api/admin/users?role=COACH&page=1&limit=6${search ? `&search=${encodeURIComponent(search)}` : ""}`
  );
  const { data: postsData, loading: postsLoading } = useApi<PostsResponse>(
    `/api/community/posts?page=1&limit=4${searchQuery}`
  );
  const { data: eventsData, loading: eventsLoading } = useApi<EventsResponse>(
    `/api/events?upcoming=true&limit=4${searchQuery}`
  );

  const workouts = workoutsData?.plans ?? [];
  const coaches = coachesData?.users ?? [];
  const posts = postsData?.posts ?? [];
  const events = eventsData?.events ?? [];
  const isLoading = workoutsLoading || coachesLoading || postsLoading || eventsLoading;

  const toggleEquipment = (eq: string) => {
    setActiveEquipment((prev) =>
      prev.includes(eq) ? prev.filter((e) => e !== eq) : [...prev, eq]
    );
  };

  const toggleBodyPart = (bp: string) => {
    setActiveBodyParts((prev) =>
      prev.includes(bp) ? prev.filter((b) => b !== bp) : [...prev, bp]
    );
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <Compass className="h-8 w-8 text-orange-500" />
          Explore
        </h1>
        <p className="text-zinc-400 mt-1">Search across workouts, coaches, events, and community</p>
      </div>

      {/* Search Bar */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
          <Input
            placeholder="Search workouts, coaches, events, posts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-zinc-900 border-zinc-800 text-white placeholder:text-zinc-500"
          />
        </div>
        <Button
          variant="outline"
          onClick={() => setShowFilters(!showFilters)}
          className="border-zinc-800 text-zinc-300 hover:bg-zinc-800"
        >
          <Filter className="h-4 w-4 mr-2" />
          Filters
        </Button>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="pt-4 space-y-4">
            <div>
              <p className="text-sm font-medium text-zinc-300 mb-3">Equipment Required</p>
              <div className="flex gap-2 flex-wrap">
                {EQUIPMENT_FILTERS.map((eq) => (
                  <Badge
                    key={eq}
                    variant="outline"
                    onClick={() => toggleEquipment(eq)}
                    className={`cursor-pointer transition ${
                      activeEquipment.includes(eq)
                        ? "border-orange-500 text-orange-500 bg-orange-500/10"
                        : "border-zinc-700 text-zinc-400 hover:border-orange-500 hover:text-orange-500"
                    }`}
                  >
                    {eq}
                  </Badge>
                ))}
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-zinc-300 mb-3">Body Parts Targeted</p>
              <div className="flex gap-2 flex-wrap">
                {BODY_PARTS.map((bp) => (
                  <Badge
                    key={bp}
                    variant="outline"
                    onClick={() => toggleBodyPart(bp)}
                    className={`cursor-pointer transition ${
                      activeBodyParts.includes(bp)
                        ? "border-orange-500 text-orange-500 bg-orange-500/10"
                        : "border-zinc-700 text-zinc-400 hover:border-orange-500 hover:text-orange-500"
                    }`}
                  >
                    {bp}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 text-orange-500 animate-spin" />
        </div>
      )}

      {!isLoading && (
        <>
          {/* Discover Workouts */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Dumbbell className="h-5 w-5 text-orange-500" />
                Discover Workouts
              </h2>
              <Link href="/member/workouts">
                <Button variant="link" className="text-orange-500 hover:text-orange-400">
                  View All
                </Button>
              </Link>
            </div>
            {workouts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {workouts.map((plan) => (
                  <Link key={plan.id} href={`/member/workouts/${plan.id}`}>
                    <Card className="bg-zinc-900 border-zinc-800 hover:border-orange-500/50 transition-all cursor-pointer group overflow-hidden h-full">
                      <div className="h-32 bg-gradient-to-br from-zinc-800 to-zinc-900 flex items-center justify-center relative">
                        {plan.coverImage ? (
                          <img src={plan.coverImage} alt={plan.name} className="w-full h-full object-cover" />
                        ) : (
                          <Dumbbell className="h-10 w-10 text-zinc-700" />
                        )}
                        <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition">
                          <div className="bg-orange-500 rounded-full p-1.5">
                            <Play className="h-4 w-4 text-white" />
                          </div>
                        </div>
                      </div>
                      <CardContent className="pt-3 space-y-2">
                        <h3 className="font-semibold text-white text-sm group-hover:text-orange-500 transition">
                          {plan.name}
                        </h3>
                        <p className="text-xs text-zinc-400 flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {plan.coach.fullName}
                        </p>
                        <div className="flex items-center gap-2">
                          {plan.category && (
                            <Badge variant="outline" className="border-zinc-700 text-zinc-400 text-xs">
                              {plan.category}
                            </Badge>
                          )}
                          {plan.difficulty && (
                            <Badge variant="outline" className="border-zinc-700 text-zinc-400 text-xs">
                              {plan.difficulty}
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-xs text-zinc-500">
                          <span className="flex items-center gap-1">
                            <Heart className="h-3 w-3" /> {plan._count.likes}
                          </span>
                          <span className="flex items-center gap-1">
                            <Dumbbell className="h-3 w-3" /> {plan._count.sessions}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-zinc-500 text-sm">No workouts found.</p>
            )}
          </div>

          {/* Popular Trainers */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Users className="h-5 w-5 text-orange-500" />
                Popular Trainers
              </h2>
            </div>
            {coaches.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {coaches.map((coach) => (
                  <Card
                    key={coach.id}
                    className="bg-zinc-900 border-zinc-800 hover:border-orange-500/50 transition cursor-pointer"
                  >
                    <CardContent className="pt-4 flex flex-col items-center text-center gap-2">
                      <Avatar className="h-16 w-16">
                        <AvatarFallback className="bg-orange-500/20 text-orange-500 text-lg">
                          {coach.fullName.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <h3 className="font-semibold text-white text-sm truncate w-full">
                        {coach.fullName}
                      </h3>
                      <p className="text-xs text-zinc-500">@{coach.username}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <p className="text-zinc-500 text-sm">No trainers found.</p>
            )}
          </div>

          {/* Upcoming Events */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Calendar className="h-5 w-5 text-orange-500" />
                Upcoming Events
              </h2>
              <Link href="/member/events">
                <Button variant="link" className="text-orange-500 hover:text-orange-400">
                  View All
                </Button>
              </Link>
            </div>
            {events.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {events.map((event) => (
                  <Card
                    key={event.id}
                    className="bg-zinc-900 border-zinc-800 hover:border-orange-500/50 transition cursor-pointer"
                  >
                    <CardContent className="pt-4 flex items-center gap-4">
                      <div className="p-3 rounded-xl bg-orange-500/10">
                        <Calendar className="h-6 w-6 text-orange-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-white text-sm truncate">{event.title}</h3>
                        <p className="text-xs text-zinc-400">
                          {new Date(event.startTime).toLocaleDateString("en-US", {
                            weekday: "short",
                            month: "short",
                            day: "numeric",
                            hour: "numeric",
                            minute: "2-digit",
                          })}
                        </p>
                        <Badge variant="outline" className="border-zinc-700 text-zinc-400 text-xs mt-1">
                          {event.type.replace("_", " ")}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <p className="text-zinc-500 text-sm">No upcoming events.</p>
            )}
          </div>

          {/* Community Posts */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <MessageCircle className="h-5 w-5 text-orange-500" />
                Community
              </h2>
              <Link href="/member/community">
                <Button variant="link" className="text-orange-500 hover:text-orange-400">
                  View All
                </Button>
              </Link>
            </div>
            {posts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {posts.map((post) => (
                  <Card
                    key={post.id}
                    className="bg-zinc-900 border-zinc-800 hover:border-orange-500/50 transition cursor-pointer"
                  >
                    <CardContent className="pt-4 space-y-2">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-zinc-700 text-zinc-300 text-xs">
                            {post.user.fullName.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium text-white">{post.user.fullName}</p>
                          <p className="text-xs text-zinc-500">@{post.user.username}</p>
                        </div>
                      </div>
                      {post.title && (
                        <h3 className="font-semibold text-white text-sm">{post.title}</h3>
                      )}
                      {post.caption && (
                        <p className="text-zinc-400 text-sm line-clamp-2">{post.caption}</p>
                      )}
                      <div className="flex items-center gap-4 text-xs text-zinc-500 pt-1">
                        <span className="flex items-center gap-1">
                          <Heart className="h-3 w-3" /> {post._count.likes}
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageCircle className="h-3 w-3" /> {post._count.comments}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <p className="text-zinc-500 text-sm">No community posts found.</p>
            )}
          </div>
        </>
      )}
    </div>
  );
}
