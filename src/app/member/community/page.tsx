"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Heart,
  MessageCircle,
  Bookmark,
  Share2,
  Image as ImageIcon,
  Video,
  Plus,
  Search,
  Users,
  Loader2,
} from "lucide-react";
import { useApi, apiFetch } from "@/hooks/use-api";
import { useSession } from "next-auth/react";

function timeAgo(date: string) {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

interface Post {
  id: string;
  title: string | null;
  caption: string | null;
  mediaType: string | null;
  mediaUrl: string | null;
  createdAt: string;
  user: { id: string; fullName: string; username: string; profilePhoto: string | null };
  _count: { likes: number; comments: number; saves: number };
}

interface Group {
  id: string;
  name: string;
  description: string | null;
  _count: { members: number };
}

interface PostsResponse {
  posts: Post[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}

interface GroupsResponse {
  groups: Group[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}

export default function CommunityPage() {
  const [newPostTitle, setNewPostTitle] = useState("");
  const [newPostCaption, setNewPostCaption] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const { data: session } = useSession();
  const userId = (session?.user as any)?.id;

  const { data: postsData, loading: postsLoading, refetch: refetchPosts } = useApi<PostsResponse>("/api/community/posts?page=1&limit=20");
  const { data: groupsData, loading: groupsLoading, refetch: refetchGroups } = useApi<GroupsResponse>("/api/community/groups?page=1&limit=20");

  const posts = postsData?.posts ?? [];
  const groups = groupsData?.groups ?? [];

  const handlePublish = async () => {
    if (!newPostCaption.trim()) return;
    try {
      await apiFetch("/api/community/posts", {
        method: "POST",
        body: JSON.stringify({ title: newPostTitle || null, caption: newPostCaption }),
      });
      setNewPostTitle("");
      setNewPostCaption("");
      setDialogOpen(false);
      refetchPosts();
    } catch {
      // handle error silently
    }
  };

  const handleLike = async (postId: string) => {
    if (!userId) return;
    try {
      await apiFetch(`/api/community/posts/${postId}/like`, {
        method: "POST",
        body: JSON.stringify({ userId }),
      });
      refetchPosts();
    } catch {}
  };

  const handleSave = async (postId: string) => {
    if (!userId) return;
    try {
      await apiFetch(`/api/community/posts/${postId}/save`, {
        method: "POST",
        body: JSON.stringify({ userId }),
      });
      refetchPosts();
    } catch {}
  };

  const handleJoinGroup = async (groupId: string) => {
    if (!userId) return;
    try {
      await apiFetch(`/api/community/groups/${groupId}`, {
        method: "POST",
        body: JSON.stringify({ userId }),
      });
      refetchGroups();
    } catch {}
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">Community</h1>
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="border-zinc-800 text-zinc-300 hover:bg-zinc-800"
          >
            <Search className="h-4 w-4 mr-2" />
            Search
          </Button>
        </div>
      </div>

      <Tabs defaultValue="feed" className="w-full">
        <TabsList className="bg-zinc-900 border border-zinc-800">
          <TabsTrigger value="feed" className="data-[state=active]:bg-orange-500 data-[state=active]:text-white">
            Feed
          </TabsTrigger>
          <TabsTrigger value="groups" className="data-[state=active]:bg-orange-500 data-[state=active]:text-white">
            Groups
          </TabsTrigger>
          <TabsTrigger value="discover" className="data-[state=active]:bg-orange-500 data-[state=active]:text-white">
            Discover
          </TabsTrigger>
        </TabsList>

        <TabsContent value="feed" className="space-y-4 mt-4">
          {/* Create Post */}
          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="pt-4">
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger className="w-full text-left">
                  <div className="flex items-center gap-3 cursor-pointer">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-orange-500/20 text-orange-500">
                        {(session?.user?.name || "U").charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 bg-zinc-800 rounded-lg px-4 py-3 text-sm text-zinc-500 hover:bg-zinc-700 transition">
                      Share your workout, progress, or thoughts...
                    </div>
                    <div className="flex gap-2">
                      <button className="p-2 rounded-lg hover:bg-zinc-800 text-zinc-400">
                        <ImageIcon className="h-5 w-5" />
                      </button>
                      <button className="p-2 rounded-lg hover:bg-zinc-800 text-zinc-400">
                        <Video className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </DialogTrigger>
                <DialogContent className="bg-zinc-900 border-zinc-800">
                  <DialogHeader>
                    <DialogTitle className="text-white">Create Post</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <Input
                      placeholder="Post title (optional)"
                      value={newPostTitle}
                      onChange={(e) => setNewPostTitle(e.target.value)}
                      className="bg-zinc-800 border-zinc-700 text-white"
                    />
                    <Textarea
                      placeholder="What's on your mind?"
                      value={newPostCaption}
                      onChange={(e) => setNewPostCaption(e.target.value)}
                      rows={4}
                      className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
                    />
                    <div className="flex gap-2">
                      <Button variant="outline" className="border-zinc-700 text-zinc-300">
                        <ImageIcon className="h-4 w-4 mr-2" />
                        Photo
                      </Button>
                      <Button variant="outline" className="border-zinc-700 text-zinc-300">
                        <Video className="h-4 w-4 mr-2" />
                        Video
                      </Button>
                    </div>
                    <Button
                      className="w-full bg-orange-500 hover:bg-orange-600 text-white"
                      onClick={handlePublish}
                    >
                      Publish
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>

          {/* Loading */}
          {postsLoading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 text-orange-500 animate-spin" />
            </div>
          )}

          {/* Posts Feed */}
          {posts.map((post) => (
            <Card key={post.id} className="bg-zinc-900 border-zinc-800">
              <CardContent className="pt-4 space-y-4">
                {/* Post Header */}
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-zinc-700 text-zinc-300">
                      {post.user.fullName.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-semibold text-white text-sm">
                      {post.user.fullName}
                    </p>
                    <p className="text-xs text-zinc-500">
                      @{post.user.username} · {timeAgo(post.createdAt)}
                    </p>
                  </div>
                </div>

                {/* Post Content */}
                {post.title && (
                  <h3 className="font-semibold text-white">{post.title}</h3>
                )}
                {post.caption && (
                  <p className="text-zinc-300 text-sm leading-relaxed">
                    {post.caption}
                  </p>
                )}

                {/* Media */}
                {post.mediaUrl ? (
                  post.mediaType === "VIDEO" ? (
                    <video src={post.mediaUrl} controls className="w-full rounded-lg" />
                  ) : (
                    <img src={post.mediaUrl} alt="" className="w-full rounded-lg" />
                  )
                ) : (
                  <div className="h-48 bg-zinc-800 rounded-lg flex items-center justify-center">
                    {post.mediaType === "VIDEO" ? (
                      <Video className="h-10 w-10 text-zinc-600" />
                    ) : (
                      <ImageIcon className="h-10 w-10 text-zinc-600" />
                    )}
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center gap-6 pt-2 border-t border-zinc-800">
                  <button
                    onClick={() => handleLike(post.id)}
                    className="flex items-center gap-1.5 text-zinc-400 hover:text-red-400 transition text-sm"
                  >
                    <Heart className="h-4 w-4" />
                    {post._count.likes}
                  </button>
                  <button className="flex items-center gap-1.5 text-zinc-400 hover:text-blue-400 transition text-sm">
                    <MessageCircle className="h-4 w-4" />
                    {post._count.comments}
                  </button>
                  <button
                    onClick={() => handleSave(post.id)}
                    className="flex items-center gap-1.5 text-zinc-400 hover:text-orange-400 transition text-sm"
                  >
                    <Bookmark className="h-4 w-4" />
                    {post._count.saves}
                  </button>
                  <button className="flex items-center gap-1.5 text-zinc-400 hover:text-green-400 transition text-sm ml-auto">
                    <Share2 className="h-4 w-4" />
                  </button>
                </div>
              </CardContent>
            </Card>
          ))}

          {/* Empty */}
          {!postsLoading && posts.length === 0 && (
            <div className="text-center py-8">
              <p className="text-zinc-400">No posts yet. Be the first to share!</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="groups" className="space-y-4 mt-4">
          <Button className="bg-orange-500 hover:bg-orange-600 text-white mb-4">
            <Plus className="h-4 w-4 mr-2" />
            Create Group
          </Button>

          {groupsLoading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 text-orange-500 animate-spin" />
            </div>
          )}

          {groups.map((group) => (
            <Card key={group.id} className="bg-zinc-900 border-zinc-800 hover:border-orange-500/50 transition cursor-pointer">
              <CardContent className="pt-4 flex items-center gap-4">
                <div className="p-3 rounded-xl bg-zinc-800">
                  <Users className="h-8 w-8 text-orange-500" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-white">{group.name}</h3>
                  {group.description && (
                    <p className="text-sm text-zinc-400">{group.description}</p>
                  )}
                  <p className="text-xs text-zinc-500 mt-1">{group._count.members} members</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-zinc-700 text-zinc-300"
                  onClick={() => handleJoinGroup(group.id)}
                >
                  Join
                </Button>
              </CardContent>
            </Card>
          ))}

          {!groupsLoading && groups.length === 0 && (
            <div className="text-center py-8">
              <p className="text-zinc-400">No groups yet. Create the first one!</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="discover" className="mt-4">
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
            <Input
              placeholder="Search people..."
              className="pl-10 bg-zinc-900 border-zinc-800 text-white placeholder:text-zinc-500"
            />
          </div>
          <p className="text-zinc-400 text-center py-8">
            Search for people to follow and connect with.
          </p>
        </TabsContent>
      </Tabs>
    </div>
  );
}
