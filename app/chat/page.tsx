"use client";

import { useEffect, useState, useRef } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  MessageSquare,
  Plus,
  Trash2,
  Zap,
} from "lucide-react";
import { MobileDock } from "@/components/MobileDock";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import Link from "next/link";
import { Label } from "@/components/ui/label";

interface Deck {
  id: string;
  name: string;
}

interface ChatSession {
  id: string;
  deck_id: string;
  user_id: string;
  created_at: string;
  last_message: string;
  model: string;
}

interface Profile {
  id: string;
  role: string;
}

export default function ChatPage() {
  const [decks, setDecks] = useState<Deck[]>([]);
  const [selectedDeck, setSelectedDeck] = useState<string>("");
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [profile, setProfile] = useState<Profile | null>(null);
  const sessionsPerPage = 5;
  const supabase = createClientComponentClient();
  const [filter, setFilter] = useState<string>("");
  const [selectedModel, setSelectedModel] = useState<string>("gpt4o-mini");
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchProfile();
    fetchDecks();
    fetchChatSessions();
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const height = window.innerHeight;
        containerRef.current.style.height = height < 645 ? 'auto' : '100vh';
        containerRef.current.style.minHeight = height < 645 ? '100vh' : 'auto';
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const fetchProfile = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, role")
        .eq("id", user.id)
        .single();

      if (error) {
        console.error("Error fetching profile:", error);
        toast.error("Failed to fetch profile");
      } else {
        setProfile(data);
      }
    }
  };

  const fetchDecks = async () => {
    const { data, error } = await supabase.from("decks").select("id, name");

    if (error) {
      console.error("Error fetching decks:", error);
      toast.error("Failed to fetch decks");
    } else {
      setDecks(data);
    }
  };

  const fetchChatSessions = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      const { data, error } = await supabase
        .from("chat_sessions")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching chat sessions:", error);
        toast.error("Failed to fetch chat sessions");
      } else {
        setChatSessions(data);
      }
    }
  };

  const handleStartNewChat = async () => {
    if (selectedDeck) {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        if (profile?.role === 'free' && chatSessions.length >= 3) {
          toast.error("Free users can only create up to 3 chats. Upgrade to premium for unlimited chats!");
          return;
        }
  
        const { data, error } = await supabase
          .from('chat_sessions')
          .insert({
            user_id: user.id,
            deck_id: selectedDeck,
            last_message: "New conversation started",
            model: selectedModel
          })
          .select()
          .single();
  
        if (error) {
          console.error('Error creating new chat session:', error);
          toast.error('Failed to start new chat session');
        } else {
          setChatSessions([data, ...chatSessions]);
          toast.success("New chat session started!");
        }
      }
    } else {
      toast.error("Please select a deck to start a new chat.");
    }
  };

  const handleDeleteChat = async (chatId: string) => {
    if (profile?.role !== 'premium') {
      toast.error("Only premium users can delete chats.");
      return;
    }
  
    toast.custom((t: any) => (
      <Card>
        <CardHeader>
          <CardTitle>Confirm Deletion</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Are you sure you want to delete this chat?</p>
          <div className="flex justify-end space-x-2 mt-4">
            <Button variant="outline" onClick={() => toast.dismiss(t)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={() => confirmDelete(chatId, t)}>
              Delete
            </Button>
          </div>
        </CardContent>
      </Card>
    ), { duration: 5000 });
  };

  const confirmDelete = async (chatId: string, toastId: string) => {
    const { error } = await supabase
      .from('chat_sessions')
      .delete()
      .eq('id', chatId);
  
    if (error) {
      console.error('Error deleting chat session:', error);
      toast.error('Failed to delete chat session');
    } else {
      setChatSessions(chatSessions.filter(session => session.id !== chatId));
      toast.success("Chat session deleted successfully!");
    }
    toast.dismiss(toastId);
  };

  const indexOfLastSession = currentPage * sessionsPerPage;
  const indexOfFirstSession = indexOfLastSession - sessionsPerPage;
  const currentSessions = chatSessions.slice(
    indexOfFirstSession,
    indexOfLastSession
  );

  const totalPages = Math.ceil(chatSessions.length / sessionsPerPage);

  if (profile && profile.role === "free") {
    return (
      <div className="flex flex-col h-screen pb-20 bg-slate-200 dark:bg-slate-900">
        <div className="flex-grow overflow-scroll px-2 py-4 pb-2">
          <div className="h-full max-w-2xl mx-auto flex flex-col">
            <Card className="mb-4">
              <CardHeader className="flex flex-row items-center justify-center space-y-0 pb-2">
                <MessageSquare className="h-6 w-6 text-primary mr-2" />
                <CardTitle className="text-xl font-bold">
                  AI Tutor Chats
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center mb-4 text-yellow-600 ">
                  You are on the free tier. Upgrade to premium to unlock AI Tutor Chats!
                </CardDescription>
                <Link href="/app" className="w-full">
                  <Button className="w-full dark:bg-gray-700 dark:text-white">
                    <Zap className="h-4 w-4 mr-2" /> Upgrade to Premium
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
        <MobileDock />
        <Toaster />
      </div>
    );
  }

  return (
    <div ref={containerRef} className="flex flex-col pb-20 bg-slate-200 dark:bg-slate-900 overflow-auto">
      <div className="flex-grow px-2 py-4 pb-2">
        <div className="max-w-2xl mx-auto flex flex-col">
          <Card className="mb-4">
            <CardHeader className="flex flex-row items-center justify-center space-y-0 pb-2">
              <MessageSquare className="h-6 w-6 text-primary mr-2" />
              <CardTitle className="text-xl font-bold">
                AI Tutor Chats
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center mb-4">
                Start a new chat or continue an existing conversation with your
                AI tutor!
              </CardDescription>
              {profile && profile.role === "free" && (
                <CardDescription className="text-center mb-4 text-yellow-600">
                  You are on the free tier. Upgrade to premium for unlimited
                  chats!
                </CardDescription>
              )}
              <div className="flex flex-col gap-4 mb-4">
                <div>
                  <Label htmlFor="deck-select">Select a deck</Label>
                  <Select onValueChange={setSelectedDeck} value={selectedDeck}>
                    <SelectTrigger id="deck-select" className="w-full dark:bg-gray-700 dark:text-white">
                      <SelectValue placeholder="Select a deck" />
                    </SelectTrigger>
                    <SelectContent>
                      {decks.map((deck) => (
                        <SelectItem key={deck.id} value={deck.id}>{deck.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="model-select">Select a model</Label>
                  <Select onValueChange={setSelectedModel} value={selectedModel}>
                    <SelectTrigger id="model-select" className="w-full dark:bg-gray-700 dark:text-white">
                      <SelectValue placeholder="Select a model" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gpt4o-mini">GPT-4o</SelectItem>
                      <SelectItem value="gemini-1.5-flash">Gemini 1.5 Flash</SelectItem>
                      <SelectItem value="gemini-1.5-pro">Gemini 1.5 Pro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={handleStartNewChat} className="w-full dark:bg-gray-700 dark:text-white">
                  <Plus className="h-4 w-4 mr-2" /> New Chat
                </Button>
              </div>
              <div>
                <input
                  type="text"
                  placeholder="Filter by deck name"
                  className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white"
                  onChange={(e) => setFilter(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>
          <Card className="flex-grow overflow-scroll">
            <CardContent className="overflow-y-auto ">
            {currentSessions
  .filter(session => {
    const deckName = decks.find(deck => deck.id === session.deck_id)?.name || '';
    return deckName.toLowerCase().includes(filter.toLowerCase());
  })
  .map((session) => (
    <div key={session.id} className="list-none">
      <Card className="hover:bg-slate-100 dark:hover:bg-gray-700 transition-colors">
        <CardContent className="p-4">
          <div className="flex justify-between items-center">
            <Link href={`/chat/${session.id}`} className="flex-grow">
              <div>
                <h3 className="font-semibold">
                  {decks.find(deck => deck.id === session.deck_id)?.name || 'Unknown Deck'}
                </h3>
                <p className="text-sm text-muted-foreground">{session.last_message}</p>
              </div>
            </Link>
            <div className="flex items-center">
              <span className="text-xs text-muted-foreground mr-2">
                {new Date(session.created_at).toLocaleString()}
              </span>
              {profile?.role === 'premium' && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteChat(session.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
              <ArrowRight className="h-4 w-4" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  ))}

            </CardContent>
          </Card>

          {totalPages > 1 && (
            <div className="flex justify-center items-center mt-4 space-x-2">
              <Button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                variant="outline"
                size="sm"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span>
                {currentPage} / {totalPages}
              </span>
              <Button
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages}
                variant="outline"
                size="sm"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </div>
      <MobileDock />
      <Toaster />
    </div>
  );
}
