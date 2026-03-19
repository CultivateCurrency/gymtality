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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Video,
  Upload,
  Plus,
  Loader2,
  Play,
  Clock,
  Eye,
  Trash2,
  FileVideo,
} from "lucide-react";
import { useApi, apiFetch } from "@/hooks/use-api";
import { useUpload } from "@/hooks/use-upload";

interface WorkoutVideo {
  id: string;
  name: string;
  description: string | null;
  category: string;
  type: string;
  videoUrl: string | null;
  createdAt: string;
}

interface VideosResponse {
  workoutPlans: WorkoutVideo[];
}

export default function CoachVideosPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Strength");
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const { upload, uploading: uploadingFile } = useUpload();

  const { data, loading, refetch } = useApi<VideosResponse>(
    "/api/workouts?type=VIDEO"
  );
  const videos = data?.workoutPlans ?? [];

  const handleUpload = async () => {
    if (!title.trim()) return;
    setUploading(true);
    try {
      // Upload video file first if present
      let videoUrl: string | undefined;
      if (videoFile) {
        const result = await upload(videoFile, "workout-videos", "video");
        videoUrl = result.url;
      }

      await apiFetch("/api/workouts", {
        method: "POST",
        body: JSON.stringify({
          name: title,
          description,
          category,
          type: "VIDEO",
          difficulty: "INTERMEDIATE",
          duration: 0,
          videoUrl,
        }),
      });
      setTitle("");
      setDescription("");
      setCategory("Strength");
      setVideoFile(null);
      setDialogOpen(false);
      refetch();
    } catch {
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await apiFetch(`/api/workouts/${id}`, { method: "DELETE" });
      refetch();
    } catch {}
  };

  const categories = [
    "Strength",
    "Cardio",
    "HIIT",
    "Yoga",
    "Meditation",
    "Flexibility",
    "Nutrition",
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Video className="h-8 w-8 text-orange-500" />
            Workout Videos
          </h1>
          <p className="text-zinc-400 mt-1">Upload and manage your workout videos</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger>
            <Button className="bg-orange-500 hover:bg-orange-600 text-white">
              <Plus className="h-4 w-4 mr-2" />
              Upload Video
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-zinc-900 border-zinc-800">
            <DialogHeader>
              <DialogTitle className="text-white">Upload Workout Video</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-zinc-400 mb-1 block">Video Title</label>
                <Input
                  placeholder="e.g., Full Body HIIT Workout"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="bg-zinc-800 border-zinc-700 text-white"
                />
              </div>

              <div>
                <label className="text-xs text-zinc-400 mb-1 block">Description</label>
                <textarea
                  placeholder="Describe the workout video..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full rounded-lg bg-zinc-800 border border-zinc-700 text-white px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div>
                <label className="text-xs text-zinc-400 mb-1 block">Category</label>
                <div className="grid grid-cols-3 gap-2">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setCategory(cat)}
                      className={`px-3 py-2 rounded-lg border text-sm transition ${
                        category === cat
                          ? "border-orange-500 bg-orange-500/10 text-orange-500"
                          : "border-zinc-700 text-zinc-300 hover:border-zinc-600"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs text-zinc-400 mb-1 block">Video File</label>
                <div className="border-2 border-dashed border-zinc-700 rounded-lg p-6 text-center hover:border-zinc-600 transition cursor-pointer">
                  <input
                    type="file"
                    accept="video/*"
                    onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
                    className="hidden"
                    id="video-upload"
                  />
                  <label htmlFor="video-upload" className="cursor-pointer">
                    <Upload className="h-8 w-8 text-zinc-500 mx-auto mb-2" />
                    <p className="text-sm text-zinc-400">
                      {videoFile ? videoFile.name : "Click to select video file"}
                    </p>
                    <p className="text-xs text-zinc-600 mt-1">
                      MP4, MOV, AVI up to 500MB
                    </p>
                  </label>
                </div>
              </div>

              <Button
                onClick={handleUpload}
                disabled={uploading || !title.trim()}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white"
              >
                {uploading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Upload className="h-4 w-4 mr-2" />
                )}
                Upload Video
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 text-orange-500 animate-spin" />
        </div>
      )}

      {/* Empty */}
      {!loading && videos.length === 0 && (
        <div className="text-center py-16">
          <FileVideo className="h-12 w-12 text-zinc-700 mx-auto mb-3" />
          <p className="text-zinc-400">No videos uploaded yet</p>
          <p className="text-zinc-600 text-sm mt-1">
            Upload your first workout video to share with members
          </p>
        </div>
      )}

      {/* Videos Grid */}
      {!loading && videos.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {videos.map((video) => (
            <Card
              key={video.id}
              className="bg-zinc-900 border-zinc-800 overflow-hidden group"
            >
              <div className="aspect-video bg-zinc-800 flex items-center justify-center relative">
                {video.videoUrl ? (
                  <video
                    src={video.videoUrl}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Video className="h-10 w-10 text-zinc-600" />
                )}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                  <Play className="h-12 w-12 text-white" />
                </div>
              </div>
              <CardContent className="pt-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-white font-medium text-sm truncate">
                      {video.name}
                    </h3>
                    <p className="text-xs text-zinc-500 mt-1">{video.category}</p>
                    <p className="text-xs text-zinc-600 mt-1">
                      {new Date(video.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDelete(video.id)}
                    className="p-1.5 text-zinc-500 hover:text-red-400 transition"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
