"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dumbbell,
  Brain,
  Leaf,
  Apple,
  BookOpen,
  Music,
  ShoppingBag,
  Plus,
  Edit3,
  Trash2,
  Star,
  Eye,
  Search,
  FolderTree,
  Layers,
  Loader2,
  MessageSquare,
  Users,
} from "lucide-react";
import { useApi } from "@/hooks/use-api";
import { useUpload } from "@/hooks/use-upload";

// ---- Types ----
interface WorkoutPlan {
  id: string;
  title: string;
  description: string | null;
  type: string;
  category: string | null;
  difficulty: string | null;
  isPublished: boolean;
  isFeatured: boolean;
  coachId: string;
  coach: { id: string; fullName: string; username: string } | null;
  _count: { sessions: number; likes: number };
}

interface WorkoutsApiResponse {
  success: boolean;
  data: {
    plans: WorkoutPlan[];
    pagination: { total: number; page: number; limit: number; totalPages: number };
  };
}

interface Category {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
  order: number;
  children: Category[];
}

interface Book {
  id: string;
  title: string;
  author: string;
  language: string;
  category: string;
  subcategory: string | null;
  coverImage: string | null;
  about: string | null;
}

interface Album {
  id: string;
  name: string;
  title: string | null;
  subTitle: string | null;
  description: string | null;
  coverImage: string | null;
  category: string | null;
  _count: { songs: number };
}

interface Song {
  id: string;
  name: string;
  artist: string;
  genre: string | null;
  lyrics: string | null;
  duration: number;
  audioUrl: string | null;
  order: number;
  album: { id: string; name: string };
}

interface Post {
  id: string;
  caption: string | null;
  title: string | null;
  createdAt: string;
  user: { fullName: string; username: string };
  _count: { likes: number; comments: number };
}

// ---- Tabs ----
const contentTabs = [
  { id: "categories", label: "Categories", icon: FolderTree },
  { id: "workouts", label: "Workouts", icon: Dumbbell },
  { id: "exercises", label: "Exercises", icon: Layers },
  { id: "books", label: "Books / E-Books", icon: BookOpen },
  { id: "music", label: "Music", icon: Music },
  { id: "community", label: "Community", icon: MessageSquare },
  { id: "meditation", label: "Meditation", icon: Brain },
  { id: "yoga", label: "Yoga", icon: Leaf },
  { id: "foods", label: "Healthy Foods", icon: Apple },
  { id: "products", label: "Products", icon: ShoppingBag },
];

const sampleExercises = [
  { id: 1, name: "Barbell Squat", bodyPart: "Legs", equipment: "Barbell", difficulty: "Intermediate" },
  { id: 2, name: "Push-Up", bodyPart: "Chest", equipment: "None", difficulty: "Beginner" },
  { id: 3, name: "Deadlift", bodyPart: "Back", equipment: "Barbell", difficulty: "Advanced" },
  { id: 4, name: "Plank", bodyPart: "Core", equipment: "None", difficulty: "Beginner" },
  { id: 5, name: "Pull-Up", bodyPart: "Back", equipment: "Pull-Up Bar", difficulty: "Intermediate" },
];

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

// ============================================================
// MAIN PAGE
// ============================================================
export default function AdminContentPage() {
  const [activeTab, setActiveTab] = useState("categories");
  const [searchQuery, setSearchQuery] = useState("");
  const { upload: uploadFile, uploading: fileUploading } = useUpload();

  // ---- Workouts ----
  const { data: workoutsData, loading: workoutsLoading, error: workoutsError } = useApi<WorkoutsApiResponse>(
    activeTab === "workouts" ? "/api/workouts?limit=50" : null
  );
  const workoutPlans = workoutsData?.data?.plans ?? [];
  const workoutTotal = workoutsData?.data?.pagination?.total ?? 0;
  const featuredCount = workoutPlans.filter((p) => p.isFeatured).length;

  // ---- Categories ----
  const { data: categoriesData, loading: catsLoading, refetch: refetchCats } = useApi<Category[]>(
    activeTab === "categories" ? "/api/admin/categories" : null
  );
  const categories = categoriesData || [];
  const [catModal, setCatModal] = useState(false);
  const [catEditing, setCatEditing] = useState<Category | null>(null);
  const [catParentId, setCatParentId] = useState<string | null>(null);
  const [catForm, setCatForm] = useState({ name: "", description: "", icon: "", order: 0 });
  const [catDeleteConfirm, setCatDeleteConfirm] = useState<string | null>(null);

  async function saveCat() {
    const payload = { name: catForm.name, description: catForm.description || null, icon: catForm.icon || null, order: catForm.order, parentId: catParentId };
    if (catEditing) {
      await fetch(`/api/admin/categories/${catEditing.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    } else {
      await fetch("/api/admin/categories", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    }
    setCatModal(false); setCatEditing(null); setCatParentId(null);
    refetchCats();
  }

  async function deleteCat(id: string) {
    await fetch(`/api/admin/categories/${id}`, { method: "DELETE" });
    setCatDeleteConfirm(null);
    refetchCats();
  }

  // ---- Books ----
  const { data: booksData, loading: booksLoading, refetch: refetchBooks } = useApi<{ success: boolean; data: Book[] }>(
    activeTab === "books" ? "/api/admin/books" : null
  );
  const books = booksData?.data || [];
  const [bookModal, setBookModal] = useState(false);
  const [bookEditing, setBookEditing] = useState<Book | null>(null);
  const [bookForm, setBookForm] = useState({ title: "", author: "", language: "English", category: "", subcategory: "", coverImage: "", about: "" });
  const [bookDeleteConfirm, setBookDeleteConfirm] = useState<string | null>(null);

  async function saveBook() {
    const payload = { ...bookForm, subcategory: bookForm.subcategory || null, coverImage: bookForm.coverImage || null, about: bookForm.about || null };
    if (bookEditing) {
      await fetch(`/api/admin/books/${bookEditing.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    } else {
      await fetch("/api/admin/books", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    }
    setBookModal(false); setBookEditing(null);
    refetchBooks();
  }

  async function deleteBook(id: string) {
    await fetch(`/api/admin/books/${id}`, { method: "DELETE" });
    setBookDeleteConfirm(null);
    refetchBooks();
  }

  // ---- Music ----
  const { data: albumsData, loading: albumsLoading, refetch: refetchAlbums } = useApi<{ success: boolean; data: Album[] }>(
    activeTab === "music" ? "/api/admin/music/albums" : null
  );
  const [selectedAlbumId, setSelectedAlbumId] = useState<string | null>(null);
  const { data: songsData, loading: songsLoading, refetch: refetchSongs } = useApi<{ success: boolean; data: Song[] }>(
    activeTab === "music" && selectedAlbumId ? `/api/admin/music/songs?albumId=${selectedAlbumId}` : null
  );
  const albums = albumsData?.data || [];
  const songs = songsData?.data || [];

  const [albumModal, setAlbumModal] = useState(false);
  const [albumEditing, setAlbumEditing] = useState<Album | null>(null);
  const [albumForm, setAlbumForm] = useState({ name: "", title: "", subTitle: "", description: "", coverImage: "", category: "" });
  const [albumDeleteConfirm, setAlbumDeleteConfirm] = useState<string | null>(null);

  const [songModal, setSongModal] = useState(false);
  const [songEditing, setSongEditing] = useState<Song | null>(null);
  const [songForm, setSongForm] = useState({ albumId: "", name: "", artist: "", genre: "", lyrics: "", duration: 0, audioUrl: "" });
  const [songDeleteConfirm, setSongDeleteConfirm] = useState<string | null>(null);

  async function saveAlbum() {
    const payload = { ...albumForm, title: albumForm.title || null, subTitle: albumForm.subTitle || null, description: albumForm.description || null, coverImage: albumForm.coverImage || null, category: albumForm.category || null };
    if (albumEditing) {
      await fetch(`/api/admin/music/albums/${albumEditing.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    } else {
      await fetch("/api/admin/music/albums", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    }
    setAlbumModal(false); setAlbumEditing(null);
    refetchAlbums();
  }

  async function deleteAlbum(id: string) {
    await fetch(`/api/admin/music/albums/${id}`, { method: "DELETE" });
    setAlbumDeleteConfirm(null);
    if (selectedAlbumId === id) setSelectedAlbumId(null);
    refetchAlbums();
  }

  async function saveSong() {
    const payload = { ...songForm, genre: songForm.genre || null, lyrics: songForm.lyrics || null, audioUrl: songForm.audioUrl || null };
    if (songEditing) {
      await fetch(`/api/admin/music/songs/${songEditing.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    } else {
      await fetch("/api/admin/music/songs", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    }
    setSongModal(false); setSongEditing(null);
    refetchSongs();
  }

  async function deleteSong(id: string) {
    await fetch(`/api/admin/music/songs/${id}`, { method: "DELETE" });
    setSongDeleteConfirm(null);
    refetchSongs();
  }

  // ---- Community ----
  const { data: communityData, loading: communityLoading, refetch: refetchCommunity } = useApi<{ success: boolean; data: { posts: Post[] } }>(
    activeTab === "community" ? "/api/community/posts?limit=30" : null
  );
  const posts = communityData?.data?.posts || [];

  async function removePost(id: string) {
    await fetch(`/api/admin/moderation`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ reportId: id, status: "RESOLVED" }) });
    refetchCommunity();
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white">Content Management</h1>
        <p className="text-zinc-400 mt-1">Manage all platform content: workouts, books, music, categories, and more.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {contentTabs.map((tab) => (
          <Button
            key={tab.id}
            variant={activeTab === tab.id ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveTab(tab.id)}
            className={
              activeTab === tab.id
                ? "bg-orange-500 hover:bg-orange-600 text-white shrink-0"
                : "border-zinc-700 text-zinc-300 hover:bg-zinc-800 shrink-0"
            }
          >
            <tab.icon className="h-4 w-4 mr-1.5" />
            {tab.label}
          </Button>
        ))}
      </div>

      {/* Search + Actions Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
          <Input
            placeholder={`Search ${activeTab}...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-zinc-900 border-zinc-800 text-white"
          />
        </div>
        {activeTab === "categories" && (
          <Button onClick={() => { setCatEditing(null); setCatParentId(null); setCatForm({ name: "", description: "", icon: "", order: categories.length }); setCatModal(true); }} className="bg-orange-500 hover:bg-orange-600 text-white">
            <Plus className="h-4 w-4 mr-2" />Add Category
          </Button>
        )}
        {activeTab === "books" && (
          <Button onClick={() => { setBookEditing(null); setBookForm({ title: "", author: "", language: "English", category: "", subcategory: "", coverImage: "", about: "" }); setBookModal(true); }} className="bg-orange-500 hover:bg-orange-600 text-white">
            <Plus className="h-4 w-4 mr-2" />Add Book
          </Button>
        )}
        {activeTab === "music" && (
          <Button onClick={() => { setAlbumEditing(null); setAlbumForm({ name: "", title: "", subTitle: "", description: "", coverImage: "", category: "" }); setAlbumModal(true); }} className="bg-orange-500 hover:bg-orange-600 text-white">
            <Plus className="h-4 w-4 mr-2" />Add Album
          </Button>
        )}
        {activeTab !== "categories" && activeTab !== "books" && activeTab !== "music" && (
          <Button className="bg-orange-500 hover:bg-orange-600 text-white">
            <Plus className="h-4 w-4 mr-2" />Add New
          </Button>
        )}
      </div>

      {/* =========== CATEGORIES TAB =========== */}
      {activeTab === "categories" && (
        <div className="space-y-4">
          {catsLoading && <div className="flex items-center gap-2 text-zinc-400 py-8"><Loader2 className="h-4 w-4 animate-spin" /> Loading categories...</div>}
          {!catsLoading && categories.length === 0 && (
            <Card className="bg-zinc-900 border-zinc-800">
              <CardContent className="py-12 text-center text-zinc-500">No categories yet. Add your first category.</CardContent>
            </Card>
          )}
          {categories.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase())).map((cat) => (
            <Card key={cat.id} className="bg-zinc-900 border-zinc-800">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      {cat.icon && <span className="text-lg">{cat.icon}</span>}
                      <h3 className="font-semibold text-white text-lg">{cat.name}</h3>
                    </div>
                    {cat.description && <p className="text-sm text-zinc-400 mt-1">{cat.description}</p>}
                    {cat.children.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {cat.children.map((sub) => (
                          <div key={sub.id} className="flex items-center gap-1">
                            <Badge className="bg-zinc-800 text-zinc-300 border-zinc-700">{sub.name}</Badge>
                            <button
                              onClick={() => setCatDeleteConfirm(sub.id)}
                              className="text-zinc-600 hover:text-red-400 transition"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                        ))}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => { setCatEditing(null); setCatParentId(cat.id); setCatForm({ name: "", description: "", icon: "", order: cat.children.length }); setCatModal(true); }}
                          className="h-6 border-dashed border-zinc-700 text-zinc-500 hover:text-orange-400 hover:border-orange-500/30 text-xs"
                        >
                          <Plus className="h-3 w-3 mr-1" />Add Sub
                        </Button>
                      </div>
                    )}
                    {cat.children.length === 0 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => { setCatEditing(null); setCatParentId(cat.id); setCatForm({ name: "", description: "", icon: "", order: 0 }); setCatModal(true); }}
                        className="mt-3 h-6 border-dashed border-zinc-700 text-zinc-500 hover:text-orange-400 hover:border-orange-500/30 text-xs"
                      >
                        <Plus className="h-3 w-3 mr-1" />Add Sub-Category
                      </Button>
                    )}
                  </div>
                  <div className="flex gap-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => { setCatEditing(cat); setCatParentId(null); setCatForm({ name: cat.name, description: cat.description || "", icon: cat.icon || "", order: cat.order }); setCatModal(true); }}
                      className="border-zinc-700 text-zinc-400 hover:bg-zinc-800 hover:text-white"
                    >
                      <Edit3 className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCatDeleteConfirm(cat.id)}
                      className="border-zinc-700 text-zinc-400 hover:bg-red-500/10 hover:text-red-400"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* =========== WORKOUTS TAB =========== */}
      {activeTab === "workouts" && (
        <div className="space-y-4">
          {!workoutsLoading && !workoutsError && workoutsData && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="bg-zinc-900 border-zinc-800"><CardContent className="pt-4 pb-4"><p className="text-xs text-zinc-500 uppercase">Total Workouts</p><p className="text-2xl font-bold text-white mt-1">{workoutTotal}</p></CardContent></Card>
              <Card className="bg-zinc-900 border-zinc-800"><CardContent className="pt-4 pb-4"><p className="text-xs text-zinc-500 uppercase">Featured</p><p className="text-2xl font-bold text-amber-400 mt-1">{featuredCount}</p></CardContent></Card>
              <Card className="bg-zinc-900 border-zinc-800"><CardContent className="pt-4 pb-4"><p className="text-xs text-zinc-500 uppercase">Published</p><p className="text-2xl font-bold text-green-400 mt-1">{workoutPlans.filter((p) => p.isPublished).length}</p></CardContent></Card>
              <Card className="bg-zinc-900 border-zinc-800"><CardContent className="pt-4 pb-4"><p className="text-xs text-zinc-500 uppercase">Drafts</p><p className="text-2xl font-bold text-zinc-400 mt-1">{workoutPlans.filter((p) => !p.isPublished).length}</p></CardContent></Card>
            </div>
          )}
          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="pt-6">
              {workoutsLoading && <div className="flex items-center justify-center py-16 gap-3 text-zinc-400"><Loader2 className="h-5 w-5 animate-spin" /><span>Loading workouts...</span></div>}
              {workoutsError && <div className="py-16 text-center"><p className="text-red-400 font-medium">Failed to load workouts</p></div>}
              {!workoutsLoading && !workoutsError && (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-zinc-800">
                        <th className="text-left py-3 px-4 text-xs font-medium text-zinc-500 uppercase">Workout</th>
                        <th className="text-left py-3 px-4 text-xs font-medium text-zinc-500 uppercase">Coach</th>
                        <th className="text-left py-3 px-4 text-xs font-medium text-zinc-500 uppercase">Category</th>
                        <th className="text-left py-3 px-4 text-xs font-medium text-zinc-500 uppercase">Difficulty</th>
                        <th className="text-left py-3 px-4 text-xs font-medium text-zinc-500 uppercase">Sessions</th>
                        <th className="text-left py-3 px-4 text-xs font-medium text-zinc-500 uppercase">Status</th>
                        <th className="text-right py-3 px-4 text-xs font-medium text-zinc-500 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {workoutPlans.length === 0 ? (
                        <tr><td colSpan={7} className="py-12 text-center text-zinc-500">No workouts found.</td></tr>
                      ) : workoutPlans.map((plan) => (
                        <tr key={plan.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition">
                          <td className="py-3 px-4 text-sm font-medium text-white">{plan.title}</td>
                          <td className="py-3 px-4 text-sm text-zinc-400">{plan.coach?.fullName ?? "Unknown"}</td>
                          <td className="py-3 px-4">{plan.category ? <Badge className="bg-zinc-800 text-zinc-300 border-zinc-700">{plan.category}</Badge> : <span className="text-zinc-600 text-sm">—</span>}</td>
                          <td className="py-3 px-4 text-sm text-zinc-300">{plan.difficulty ?? "—"}</td>
                          <td className="py-3 px-4 text-sm text-zinc-400 flex items-center gap-1"><Eye className="h-3 w-3" /> {plan._count.sessions}</td>
                          <td className="py-3 px-4">
                            <Badge className={plan.isPublished ? "bg-green-500/10 text-green-400 border-green-500/20" : "bg-zinc-800 text-zinc-400 border-zinc-700"}>
                              {plan.isPublished ? "Published" : "Draft"}
                            </Badge>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center justify-end gap-2">
                              <Button variant="outline" size="sm" className="border-zinc-700 text-zinc-400 hover:bg-zinc-800 hover:text-white"><Edit3 className="h-3 w-3" /></Button>
                              <Button variant="outline" size="sm" className="border-zinc-700 text-zinc-400 hover:bg-red-500/10 hover:text-red-400"><Trash2 className="h-3 w-3" /></Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* =========== EXERCISES TAB =========== */}
      {activeTab === "exercises" && (
        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="pt-6">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-zinc-800">
                    <th className="text-left py-3 px-4 text-xs font-medium text-zinc-500 uppercase">Exercise</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-zinc-500 uppercase">Body Part</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-zinc-500 uppercase">Equipment</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-zinc-500 uppercase">Difficulty</th>
                    <th className="text-right py-3 px-4 text-xs font-medium text-zinc-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sampleExercises.map((ex) => (
                    <tr key={ex.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition">
                      <td className="py-3 px-4 text-sm font-medium text-white">{ex.name}</td>
                      <td className="py-3 px-4"><Badge className="bg-zinc-800 text-zinc-300 border-zinc-700">{ex.bodyPart}</Badge></td>
                      <td className="py-3 px-4 text-sm text-zinc-400">{ex.equipment}</td>
                      <td className="py-3 px-4 text-sm text-zinc-300">{ex.difficulty}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="outline" size="sm" className="border-zinc-700 text-zinc-400 hover:bg-zinc-800 hover:text-white"><Edit3 className="h-3 w-3" /></Button>
                          <Button variant="outline" size="sm" className="border-zinc-700 text-zinc-400 hover:bg-red-500/10 hover:text-red-400"><Trash2 className="h-3 w-3" /></Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* =========== BOOKS TAB =========== */}
      {activeTab === "books" && (
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-blue-400" />
              Books / Audio Books / E-Books ({books.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {booksLoading && <div className="flex items-center gap-2 text-zinc-400 py-8"><Loader2 className="h-4 w-4 animate-spin" /> Loading books...</div>}
            {!booksLoading && books.length === 0 && <p className="text-center text-zinc-500 py-8">No books yet. Add your first book.</p>}
            <div className="space-y-3">
              {books.filter(b => b.title.toLowerCase().includes(searchQuery.toLowerCase()) || b.author.toLowerCase().includes(searchQuery.toLowerCase())).map((book) => (
                <div key={book.id} className="flex items-start gap-4 p-4 bg-zinc-800/50 rounded-lg border border-zinc-800">
                  {book.coverImage ? (
                    <img src={book.coverImage} alt={book.title} className="w-12 h-16 object-cover rounded" />
                  ) : (
                    <div className="w-12 h-16 bg-blue-500/10 rounded flex items-center justify-center">
                      <BookOpen className="h-5 w-5 text-blue-400" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-white">{book.title}</h4>
                    <p className="text-sm text-zinc-400">by {book.author}</p>
                    <div className="flex flex-wrap gap-2 mt-1">
                      <Badge className="bg-zinc-800 text-zinc-300 border-zinc-700 text-xs">{book.category}</Badge>
                      {book.subcategory && <Badge className="bg-zinc-800 text-zinc-400 border-zinc-700 text-xs">{book.subcategory}</Badge>}
                      <Badge className="bg-zinc-800 text-zinc-500 border-zinc-700 text-xs">{book.language}</Badge>
                    </div>
                    {book.about && <p className="text-xs text-zinc-500 mt-1 truncate">{book.about}</p>}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      variant="outline" size="sm"
                      onClick={() => { setBookEditing(book); setBookForm({ title: book.title, author: book.author, language: book.language, category: book.category, subcategory: book.subcategory || "", coverImage: book.coverImage || "", about: book.about || "" }); setBookModal(true); }}
                      className="border-zinc-700 text-zinc-400 hover:bg-zinc-800 hover:text-white"
                    >
                      <Edit3 className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="outline" size="sm"
                      onClick={() => setBookDeleteConfirm(book.id)}
                      className="border-zinc-700 text-zinc-400 hover:bg-red-500/10 hover:text-red-400"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* =========== MUSIC TAB =========== */}
      {activeTab === "music" && (
        <div className="grid md:grid-cols-2 gap-6">
          {/* Albums */}
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-white flex items-center gap-2">
                  <Music className="h-5 w-5 text-purple-400" />
                  Music Albums ({albums.length})
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              {albumsLoading && <div className="flex items-center gap-2 text-zinc-400 py-4"><Loader2 className="h-4 w-4 animate-spin" /> Loading...</div>}
              {!albumsLoading && albums.length === 0 && <p className="text-zinc-500 text-sm py-4">No albums yet.</p>}
              <div className="space-y-2">
                {albums.map((album) => (
                  <div
                    key={album.id}
                    onClick={() => setSelectedAlbumId(album.id === selectedAlbumId ? null : album.id)}
                    className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition ${selectedAlbumId === album.id ? "bg-purple-500/10 border-purple-500/30" : "bg-zinc-800/50 border-zinc-800 hover:bg-zinc-800"}`}
                  >
                    <div className="p-2 rounded bg-purple-500/10"><Music className="h-4 w-4 text-purple-400" /></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-medium truncate">{album.name}</p>
                      {album.title && <p className="text-zinc-400 text-xs">{album.title}</p>}
                      <p className="text-zinc-500 text-xs">{album._count.songs} songs</p>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost" size="sm"
                        onClick={(e) => { e.stopPropagation(); setAlbumEditing(album); setAlbumForm({ name: album.name, title: album.title || "", subTitle: album.subTitle || "", description: album.description || "", coverImage: album.coverImage || "", category: album.category || "" }); setAlbumModal(true); }}
                        className="text-zinc-400 hover:text-white h-7 w-7 p-0"
                      >
                        <Edit3 className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost" size="sm"
                        onClick={(e) => { e.stopPropagation(); setAlbumDeleteConfirm(album.id); }}
                        className="text-zinc-400 hover:text-red-400 h-7 w-7 p-0"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Songs */}
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-white text-base">
                  {selectedAlbumId ? `Songs in: ${albums.find(a => a.id === selectedAlbumId)?.name || "Album"}` : "Songs (select album)"}
                </CardTitle>
                {selectedAlbumId && (
                  <Button
                    size="sm"
                    onClick={() => { setSongEditing(null); setSongForm({ albumId: selectedAlbumId ?? "", name: "", artist: "", genre: "", lyrics: "", duration: 0, audioUrl: "" }); setSongModal(true); }}
                    className="bg-orange-500 hover:bg-orange-600 text-white"
                  >
                    <Plus className="h-3 w-3 mr-1" /> Add Song
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {!selectedAlbumId && <p className="text-zinc-500 text-sm py-4">Click an album to view its songs.</p>}
              {selectedAlbumId && songsLoading && <div className="flex items-center gap-2 text-zinc-400 py-4"><Loader2 className="h-4 w-4 animate-spin" /> Loading songs...</div>}
              {selectedAlbumId && !songsLoading && songs.length === 0 && <p className="text-zinc-500 text-sm py-4">No songs in this album yet.</p>}
              <div className="space-y-2">
                {songs.map((song, i) => (
                  <div key={song.id} className="flex items-center gap-3 p-3 bg-zinc-800/50 rounded-lg border border-zinc-800">
                    <span className="text-zinc-500 text-xs w-5 text-center">{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-medium truncate">{song.name}</p>
                      <p className="text-zinc-400 text-xs">{song.artist}{song.genre ? ` · ${song.genre}` : ""}</p>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost" size="sm"
                        onClick={() => { setSongEditing(song); setSongForm({ albumId: song.album.id, name: song.name, artist: song.artist, genre: song.genre || "", lyrics: song.lyrics || "", duration: song.duration, audioUrl: song.audioUrl || "" }); setSongModal(true); }}
                        className="text-zinc-400 hover:text-white h-7 w-7 p-0"
                      >
                        <Edit3 className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost" size="sm"
                        onClick={() => setSongDeleteConfirm(song.id)}
                        className="text-zinc-400 hover:text-red-400 h-7 w-7 p-0"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* =========== COMMUNITY TAB =========== */}
      {activeTab === "community" && (
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-green-400" />
              Community Posts ({posts.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {communityLoading && <div className="flex items-center gap-2 text-zinc-400 py-8"><Loader2 className="h-4 w-4 animate-spin" /> Loading posts...</div>}
            {!communityLoading && posts.length === 0 && <p className="text-center text-zinc-500 py-8">No community posts found.</p>}
            <div className="space-y-3">
              {posts.filter(p => (p.caption || p.title || "").toLowerCase().includes(searchQuery.toLowerCase())).map((post) => (
                <div key={post.id} className="flex items-start gap-4 p-4 bg-zinc-800/50 rounded-lg border border-zinc-800">
                  <div className="w-8 h-8 rounded-full bg-orange-500/20 flex items-center justify-center text-orange-400 font-bold text-sm shrink-0">
                    {post.user.fullName[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-white text-sm font-medium">{post.user.fullName}</span>
                      <span className="text-zinc-500 text-xs">@{post.user.username}</span>
                      <span className="text-zinc-500 text-xs">· {formatDate(post.createdAt)}</span>
                    </div>
                    {post.title && <p className="text-zinc-300 text-sm font-medium mt-1">{post.title}</p>}
                    {post.caption && <p className="text-zinc-400 text-sm mt-1 line-clamp-2">{post.caption}</p>}
                    <div className="flex gap-4 mt-2 text-xs text-zinc-500">
                      <span>❤️ {post._count.likes}</span>
                      <span>💬 {post._count.comments}</span>
                    </div>
                  </div>
                  <Button
                    variant="outline" size="sm"
                    className="border-zinc-700 text-zinc-400 hover:bg-red-500/10 hover:text-red-400 shrink-0"
                    title="Remove Post"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* =========== MEDITATION / YOGA TABS =========== */}
      {(activeTab === "meditation" || activeTab === "yoga") && (
        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="py-16 text-center">
            <div className="p-4 rounded-full bg-zinc-800 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              {activeTab === "meditation" ? <Brain className="h-8 w-8 text-purple-500" /> : <Leaf className="h-8 w-8 text-green-500" />}
            </div>
            <h3 className="text-lg font-semibold text-white">{activeTab === "meditation" ? "Meditation" : "Yoga"} Content</h3>
            <p className="text-zinc-400 mt-2">Manage {activeTab} sessions, guides, and programs.</p>
            <Button className="mt-4 bg-orange-500 hover:bg-orange-600 text-white">
              <Plus className="h-4 w-4 mr-2" />Add {activeTab === "meditation" ? "Meditation" : "Yoga"} Content
            </Button>
          </CardContent>
        </Card>
      )}

      {/* =========== FOODS TAB =========== */}
      {activeTab === "foods" && (
        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="py-16 text-center">
            <div className="p-4 rounded-full bg-zinc-800 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <Apple className="h-8 w-8 text-green-500" />
            </div>
            <h3 className="text-lg font-semibold text-white">Healthy Foods Library</h3>
            <p className="text-zinc-400 mt-2">Manage recipes, meal plans, and nutrition guides.</p>
            <Button className="mt-4 bg-orange-500 hover:bg-orange-600 text-white"><Plus className="h-4 w-4 mr-2" />Add Food Content</Button>
          </CardContent>
        </Card>
      )}

      {/* =========== PRODUCTS TAB =========== */}
      {activeTab === "products" && (
        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="py-16 text-center">
            <div className="p-4 rounded-full bg-zinc-800 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <ShoppingBag className="h-8 w-8 text-orange-500" />
            </div>
            <h3 className="text-lg font-semibold text-white">Merchandise & Products</h3>
            <p className="text-zinc-400 mt-2">Manage apparel, supplements, equipment, and other products.</p>
            <Button className="mt-4 bg-orange-500 hover:bg-orange-600 text-white"><Plus className="h-4 w-4 mr-2" />Add Product</Button>
          </CardContent>
        </Card>
      )}

      {/* =========== CATEGORY MODAL =========== */}
      <Dialog open={catModal} onOpenChange={setCatModal}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-white">
          <DialogHeader>
            <DialogTitle>{catEditing ? "Edit Category" : catParentId ? "Add Sub-Category" : "Add Category"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {catParentId && !catEditing && (
              <p className="text-zinc-400 text-sm">Adding sub-category under: <span className="text-white">{categories.find(c => c.id === catParentId)?.name}</span></p>
            )}
            <div>
              <Label>Name *</Label>
              <Input className="bg-zinc-800 border-zinc-700 text-white mt-1" value={catForm.name} onChange={e => setCatForm({ ...catForm, name: e.target.value })} placeholder="e.g. Physical Health" />
            </div>
            <div>
              <Label>Description</Label>
              <Input className="bg-zinc-800 border-zinc-700 text-white mt-1" value={catForm.description} onChange={e => setCatForm({ ...catForm, description: e.target.value })} placeholder="Optional description" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Icon (emoji)</Label>
                <Input className="bg-zinc-800 border-zinc-700 text-white mt-1" value={catForm.icon} onChange={e => setCatForm({ ...catForm, icon: e.target.value })} placeholder="e.g. 💪" />
              </div>
              <div>
                <Label>Order</Label>
                <Input type="number" className="bg-zinc-800 border-zinc-700 text-white mt-1" value={catForm.order} onChange={e => setCatForm({ ...catForm, order: parseInt(e.target.value) || 0 })} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setCatModal(false)} className="text-zinc-400">Cancel</Button>
            <Button onClick={saveCat} disabled={!catForm.name} className="bg-orange-500 hover:bg-orange-600 text-white">
              {catEditing ? "Save Changes" : "Add"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cat Delete Confirm */}
      <Dialog open={!!catDeleteConfirm} onOpenChange={() => setCatDeleteConfirm(null)}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-white">
          <DialogHeader><DialogTitle>Delete Category</DialogTitle></DialogHeader>
          <p className="text-zinc-400">Delete this category? Sub-categories may also be deleted.</p>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setCatDeleteConfirm(null)} className="text-zinc-400">Cancel</Button>
            <Button onClick={() => catDeleteConfirm && deleteCat(catDeleteConfirm)} className="bg-red-600 hover:bg-red-700 text-white">Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* =========== BOOK MODAL =========== */}
      <Dialog open={bookModal} onOpenChange={setBookModal}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-white max-w-lg">
          <DialogHeader>
            <DialogTitle>{bookEditing ? "Edit Book" : "Add Book / E-Book"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Book Name *</Label>
              <Input className="bg-zinc-800 border-zinc-700 text-white mt-1" value={bookForm.title} onChange={e => setBookForm({ ...bookForm, title: e.target.value })} placeholder="Book title" />
            </div>
            <div>
              <Label>Author Name *</Label>
              <Input className="bg-zinc-800 border-zinc-700 text-white mt-1" value={bookForm.author} onChange={e => setBookForm({ ...bookForm, author: e.target.value })} placeholder="Author name" />
            </div>
            <div>
              <Label>About the Book</Label>
              <Input className="bg-zinc-800 border-zinc-700 text-white mt-1" value={bookForm.about} onChange={e => setBookForm({ ...bookForm, about: e.target.value })} placeholder="Short description" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Category *</Label>
                <Input className="bg-zinc-800 border-zinc-700 text-white mt-1" value={bookForm.category} onChange={e => setBookForm({ ...bookForm, category: e.target.value })} placeholder="e.g. Fitness" />
              </div>
              <div>
                <Label>Sub-Category</Label>
                <Input className="bg-zinc-800 border-zinc-700 text-white mt-1" value={bookForm.subcategory} onChange={e => setBookForm({ ...bookForm, subcategory: e.target.value })} placeholder="Optional" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Language</Label>
                <Input className="bg-zinc-800 border-zinc-700 text-white mt-1" value={bookForm.language} onChange={e => setBookForm({ ...bookForm, language: e.target.value })} />
              </div>
              <div>
                <Label>Cover Picture</Label>
                <div className="flex gap-2 mt-1">
                  <Input className="bg-zinc-800 border-zinc-700 text-white flex-1" value={bookForm.coverImage} onChange={e => setBookForm({ ...bookForm, coverImage: e.target.value })} placeholder="URL or upload..." />
                  <label className="shrink-0">
                    <Button type="button" variant="outline" size="sm" className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 cursor-pointer">
                      <span>{fileUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Upload"}</span>
                    </Button>
                    <input type="file" accept="image/*" className="hidden" onChange={async (e) => { const f = e.target.files?.[0]; if (f) { try { const r = await uploadFile(f, "book-covers", "image"); setBookForm(prev => ({ ...prev, coverImage: r.url })); } catch {} } }} />
                  </label>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setBookModal(false)} className="text-zinc-400">Cancel</Button>
            <Button onClick={saveBook} disabled={!bookForm.title || !bookForm.author} className="bg-orange-500 hover:bg-orange-600 text-white">
              {bookEditing ? "Save Changes" : "Add Book"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Book Delete Confirm */}
      <Dialog open={!!bookDeleteConfirm} onOpenChange={() => setBookDeleteConfirm(null)}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-white">
          <DialogHeader><DialogTitle>Delete Book</DialogTitle></DialogHeader>
          <p className="text-zinc-400">Delete this book? This cannot be undone.</p>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setBookDeleteConfirm(null)} className="text-zinc-400">Cancel</Button>
            <Button onClick={() => bookDeleteConfirm && deleteBook(bookDeleteConfirm)} className="bg-red-600 hover:bg-red-700 text-white">Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* =========== ALBUM MODAL =========== */}
      <Dialog open={albumModal} onOpenChange={setAlbumModal}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-white max-w-lg">
          <DialogHeader>
            <DialogTitle>{albumEditing ? "Edit Album" : "Add Music Album"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Album Name *</Label>
              <Input className="bg-zinc-800 border-zinc-700 text-white mt-1" value={albumForm.name} onChange={e => setAlbumForm({ ...albumForm, name: e.target.value })} placeholder="e.g. Beast Mode Vol.1" />
            </div>
            <div>
              <Label>Album Title</Label>
              <Input className="bg-zinc-800 border-zinc-700 text-white mt-1" value={albumForm.title} onChange={e => setAlbumForm({ ...albumForm, title: e.target.value })} placeholder="Display title" />
            </div>
            <div>
              <Label>Album Sub-Title</Label>
              <Input className="bg-zinc-800 border-zinc-700 text-white mt-1" value={albumForm.subTitle} onChange={e => setAlbumForm({ ...albumForm, subTitle: e.target.value })} placeholder="Sub-title" />
            </div>
            <div>
              <Label>Album Description</Label>
              <Input className="bg-zinc-800 border-zinc-700 text-white mt-1" value={albumForm.description} onChange={e => setAlbumForm({ ...albumForm, description: e.target.value })} placeholder="Short description" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Category</Label>
                <Input className="bg-zinc-800 border-zinc-700 text-white mt-1" value={albumForm.category} onChange={e => setAlbumForm({ ...albumForm, category: e.target.value })} placeholder="e.g. Workout" />
              </div>
              <div>
                <Label>Album Image</Label>
                <div className="flex gap-2 mt-1">
                  <Input className="bg-zinc-800 border-zinc-700 text-white flex-1" value={albumForm.coverImage} onChange={e => setAlbumForm({ ...albumForm, coverImage: e.target.value })} placeholder="URL or upload..." />
                  <label className="shrink-0">
                    <Button type="button" variant="outline" size="sm" className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 cursor-pointer">
                      <span>{fileUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Upload"}</span>
                    </Button>
                    <input type="file" accept="image/*" className="hidden" onChange={async (e) => { const f = e.target.files?.[0]; if (f) { try { const r = await uploadFile(f, "album-covers", "image"); setAlbumForm(prev => ({ ...prev, coverImage: r.url })); } catch {} } }} />
                  </label>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setAlbumModal(false)} className="text-zinc-400">Cancel</Button>
            <Button onClick={saveAlbum} disabled={!albumForm.name} className="bg-orange-500 hover:bg-orange-600 text-white">
              {albumEditing ? "Save Changes" : "Add Album"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Album Delete Confirm */}
      <Dialog open={!!albumDeleteConfirm} onOpenChange={() => setAlbumDeleteConfirm(null)}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-white">
          <DialogHeader><DialogTitle>Delete Album</DialogTitle></DialogHeader>
          <p className="text-zinc-400">Delete this album and all its songs? This cannot be undone.</p>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setAlbumDeleteConfirm(null)} className="text-zinc-400">Cancel</Button>
            <Button onClick={() => albumDeleteConfirm && deleteAlbum(albumDeleteConfirm)} className="bg-red-600 hover:bg-red-700 text-white">Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* =========== SONG MODAL =========== */}
      <Dialog open={songModal} onOpenChange={setSongModal}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-white max-w-lg">
          <DialogHeader>
            <DialogTitle>{songEditing ? "Edit Song" : "Add Song to Album"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Album</Label>
              <Select value={songForm.albumId ?? ''} onValueChange={v => setSongForm({ ...songForm, albumId: v ?? songForm.albumId })}>
                <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white mt-1">
                  <SelectValue placeholder="Select album..." />
                </SelectTrigger>
                <SelectContent className="bg-zinc-800 border-zinc-700">
                  {albums.map(a => <SelectItem key={a.id} value={a.id} className="text-white">{a.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Song Title *</Label>
              <Input className="bg-zinc-800 border-zinc-700 text-white mt-1" value={songForm.name} onChange={e => setSongForm({ ...songForm, name: e.target.value })} placeholder="Song title" />
            </div>
            <div>
              <Label>Artist Name *</Label>
              <Input className="bg-zinc-800 border-zinc-700 text-white mt-1" value={songForm.artist} onChange={e => setSongForm({ ...songForm, artist: e.target.value })} placeholder="Artist name" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Genre</Label>
                <Input className="bg-zinc-800 border-zinc-700 text-white mt-1" value={songForm.genre} onChange={e => setSongForm({ ...songForm, genre: e.target.value })} placeholder="e.g. Hip Hop" />
              </div>
              <div>
                <Label>Duration (seconds)</Label>
                <Input type="number" className="bg-zinc-800 border-zinc-700 text-white mt-1" value={songForm.duration} onChange={e => setSongForm({ ...songForm, duration: parseInt(e.target.value) || 0 })} />
              </div>
            </div>
            <div>
              <Label>Song File</Label>
              <div className="flex gap-2 mt-1">
                <Input className="bg-zinc-800 border-zinc-700 text-white flex-1" value={songForm.audioUrl} onChange={e => setSongForm({ ...songForm, audioUrl: e.target.value })} placeholder="URL or upload..." />
                <label className="shrink-0">
                  <Button type="button" variant="outline" size="sm" className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 cursor-pointer">
                    <span>{fileUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Upload"}</span>
                  </Button>
                  <input type="file" accept="audio/*" className="hidden" onChange={async (e) => { const f = e.target.files?.[0]; if (f) { try { const r = await uploadFile(f, "songs", "audio"); setSongForm(prev => ({ ...prev, audioUrl: r.url })); } catch {} } }} />
                </label>
              </div>
            </div>
            <div>
              <Label>Song Lyrics</Label>
              <Input className="bg-zinc-800 border-zinc-700 text-white mt-1" value={songForm.lyrics} onChange={e => setSongForm({ ...songForm, lyrics: e.target.value })} placeholder="Paste lyrics here..." />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setSongModal(false)} className="text-zinc-400">Cancel</Button>
            <Button onClick={saveSong} disabled={!songForm.name || !songForm.artist || !songForm.albumId} className="bg-orange-500 hover:bg-orange-600 text-white">
              {songEditing ? "Save Changes" : "Add Song"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Song Delete Confirm */}
      <Dialog open={!!songDeleteConfirm} onOpenChange={() => setSongDeleteConfirm(null)}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-white">
          <DialogHeader><DialogTitle>Delete Song</DialogTitle></DialogHeader>
          <p className="text-zinc-400">Delete this song? This cannot be undone.</p>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setSongDeleteConfirm(null)} className="text-zinc-400">Cancel</Button>
            <Button onClick={() => songDeleteConfirm && deleteSong(songDeleteConfirm)} className="bg-red-600 hover:bg-red-700 text-white">Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
