"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Send,
  Phone,
  VideoIcon,
  MoreVertical,
  Plus,
  Info,
} from "lucide-react";

interface Conversation {
  id: string;
  name: string;
  lastMessage: string;
  time: string;
  unread: number;
  online: boolean;
}

const CONVERSATIONS: Conversation[] = [
  {
    id: "1",
    name: "Coach Mike",
    lastMessage: "Great session today! Keep up the form on those squats.",
    time: "2m",
    unread: 2,
    online: true,
  },
  {
    id: "2",
    name: "Sarah Chen",
    lastMessage: "Are you joining the yoga class tomorrow?",
    time: "1h",
    unread: 0,
    online: true,
  },
  {
    id: "3",
    name: "Alex Rivera",
    lastMessage: "That deadlift PR was insane! What program are you on?",
    time: "3h",
    unread: 1,
    online: false,
  },
  {
    id: "4",
    name: "Powerlifting Crew",
    lastMessage: "Mike: Competition sign-ups close Friday",
    time: "5h",
    unread: 0,
    online: false,
  },
  {
    id: "5",
    name: "Forge Support",
    lastMessage: "Your subscription has been renewed successfully.",
    time: "1d",
    unread: 0,
    online: false,
  },
];

export default function MessagesPage() {
  const [selectedChat, setSelectedChat] = useState<string>("1");
  const [searchQuery, setSearchQuery] = useState("");
  const [message, setMessage] = useState("");

  const activeChat = CONVERSATIONS.find((c) => c.id === selectedChat);

  const filteredConversations = CONVERSATIONS.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex h-[calc(100vh-7rem)] gap-0 rounded-xl overflow-hidden border border-zinc-800">
        {/* Conversation List */}
        <div className="w-80 shrink-0 bg-zinc-900 border-r border-zinc-800 flex flex-col">
          {/* List Header */}
          <div className="p-4 border-b border-zinc-800 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white">Messages</h2>
              <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-white hover:bg-zinc-800">
                <Plus className="h-5 w-5" />
              </Button>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
              <Input
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 h-9"
              />
            </div>
          </div>

          {/* Conversations */}
          <div className="flex-1 overflow-y-auto">
            {filteredConversations.map((chat) => (
              <button
                key={chat.id}
                onClick={() => setSelectedChat(chat.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-left transition ${
                  selectedChat === chat.id
                    ? "bg-zinc-800"
                    : "hover:bg-zinc-800/50"
                }`}
              >
                <div className="relative">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-zinc-700 text-zinc-300 text-sm">
                      {chat.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  {chat.online && (
                    <div className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 rounded-full border-2 border-zinc-900" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-white text-sm truncate">{chat.name}</span>
                    <span className="text-xs text-zinc-500 shrink-0">{chat.time}</span>
                  </div>
                  <p className="text-xs text-zinc-400 truncate">{chat.lastMessage}</p>
                </div>
                {chat.unread > 0 && (
                  <span className="bg-orange-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center shrink-0">
                    {chat.unread}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Chat Window */}
        <div className="flex-1 flex flex-col bg-zinc-950">
          {activeChat ? (
            <>
              {/* Chat Header */}
              <div className="flex items-center justify-between px-6 py-3 border-b border-zinc-800 bg-zinc-900">
                <div className="flex items-center gap-3">
                  <Avatar className="h-9 w-9">
                    <AvatarFallback className="bg-zinc-700 text-zinc-300 text-sm">
                      {activeChat.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold text-white text-sm">{activeChat.name}</p>
                    <p className="text-xs text-zinc-500">
                      {activeChat.online ? "Online" : "Offline"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-white hover:bg-zinc-800">
                    <Phone className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-white hover:bg-zinc-800">
                    <VideoIcon className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-white hover:bg-zinc-800">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Chat Body (Placeholder) */}
              <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
                <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 max-w-sm space-y-3">
                  <Info className="h-8 w-8 text-orange-500 mx-auto" />
                  <h3 className="font-semibold text-white">QuickBlox Integration Coming Soon</h3>
                  <p className="text-sm text-zinc-400">
                    Real-time messaging, group chats, audio and video calls powered by QuickBlox will be available in an upcoming release.
                  </p>
                  <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30">
                    In Development
                  </Badge>
                </div>
              </div>

              {/* Message Input */}
              <div className="p-4 border-t border-zinc-800 bg-zinc-900">
                <div className="flex items-center gap-2">
                  <Input
                    placeholder="Type a message..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="flex-1 bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        setMessage("");
                      }
                    }}
                  />
                  <Button
                    className="bg-orange-500 hover:bg-orange-600 text-white"
                    onClick={() => setMessage("")}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-zinc-500">Select a conversation to start chatting</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
