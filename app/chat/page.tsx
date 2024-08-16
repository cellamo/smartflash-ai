"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MessageSquare, Plus, ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { MobileDock } from '@/components/MobileDock';
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import Link from 'next/link';

interface Deck {
  id: string;
  name: string;
}

interface ChatSession {
  id: string;
  deckId: string;
  deckName: string;
  lastMessage: string;
  timestamp: string;
}

const mockDecks: Deck[] = [
  { id: "1", name: "General Knowledge" },
  { id: "2", name: "Programming Concepts" },
  { id: "3", name: "Spanish Vocabulary" },
];

const mockChatSessions: ChatSession[] = [
  { id: "chat1", deckId: "2", deckName: "Programming Concepts", lastMessage: "Can you explain inheritance?", timestamp: "2023-04-15 14:30" },
  { id: "chat2", deckId: "3", deckName: "Spanish Vocabulary", lastMessage: "How do you say 'hello' in Spanish?", timestamp: "2023-04-14 09:15" },
  { id: "chat3", deckId: "1", deckName: "General Knowledge", lastMessage: "What's the capital of France?", timestamp: "2023-04-13 11:45" },
  { id: "chat4", deckId: "2", deckName: "Programming Concepts", lastMessage: "Explain async/await in JavaScript", timestamp: "2023-04-12 16:20" },
  { id: "chat5", deckId: "3", deckName: "Spanish Vocabulary", lastMessage: "How to conjugate 'ser' in present tense?", timestamp: "2023-04-11 10:00" },
  { id: "chat6", deckId: "1", deckName: "General Knowledge", lastMessage: "Who wrote 'To Kill a Mockingbird'?", timestamp: "2023-04-10 13:50" },
];

export default function ChatPage() {
  const [selectedDeck, setSelectedDeck] = useState<string>("");
  const [chatSessions, setChatSessions] = useState<ChatSession[]>(mockChatSessions);
  const [currentPage, setCurrentPage] = useState(1);
  const sessionsPerPage = 5;

  const handleStartNewChat = () => {
    if (selectedDeck) {
      const selectedDeckName = mockDecks.find(deck => deck.id === selectedDeck)?.name;
      const newChatSession: ChatSession = {
        id: `chat${Date.now()}`,
        deckId: selectedDeck,
        deckName: selectedDeckName || "",
        lastMessage: "New conversation started",
        timestamp: new Date().toLocaleString(),
      };
      setChatSessions([newChatSession, ...chatSessions]);
      toast.success("New chat session started!");
    } else {
      toast.error("Please select a deck to start a new chat.");
    }
  };

  const indexOfLastSession = currentPage * sessionsPerPage;
  const indexOfFirstSession = indexOfLastSession - sessionsPerPage;
  const currentSessions = chatSessions.slice(indexOfFirstSession, indexOfLastSession);

  const totalPages = Math.ceil(chatSessions.length / sessionsPerPage);

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] bg-slate-200">
      <div className="flex-grow overflow-hidden px-2 py-4 pb-2">
        <div className="h-full max-w-2xl mx-auto flex flex-col">
          <Card className="mb-4">
            <CardHeader className="flex flex-row items-center justify-center space-y-0 pb-2">
              <MessageSquare className="h-6 w-6 text-primary mr-2" />
              <CardTitle className="text-xl font-bold">AI Tutor Chats</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center mb-4">
                Start a new chat or continue an existing conversation with your AI tutor!
              </CardDescription>
              <div className="flex gap-2 mb-4">
                <Select onValueChange={setSelectedDeck} value={selectedDeck}>
                  <SelectTrigger className="flex-grow">
                    <SelectValue placeholder="Select a deck" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockDecks.map((deck) => (
                      <SelectItem key={deck.id} value={deck.id}>{deck.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button onClick={handleStartNewChat}>
                  <Plus className="h-4 w-4 mr-2" /> New Chat
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="flex-grow overflow-hidden">
            <CardHeader>
              <CardTitle className="text-lg">Your Chat Sessions</CardTitle>
            </CardHeader>
            <CardContent className="overflow-y-auto max-h-[calc(100vh-16rem)]"> {/* Adjust max height for scrollability */}
              {currentSessions.length > 0 ? (
                <ul className="space-y-2">
                  {currentSessions.map((session) => (
                    <li key={session.id}>
                      <Link href={`/chat/${session.id}`}>
                        <Card className="hover:bg-slate-100 transition-colors">
                          <CardContent className="p-4">
                            <div className="flex justify-between items-center">
                              <div>
                                <h3 className="font-semibold">{session.deckName}</h3>
                                <p className="text-sm text-muted-foreground">{session.lastMessage}</p>
                              </div>
                              <div className="flex items-center">
                                <span className="text-xs text-muted-foreground mr-2">{session.timestamp}</span>
                                <ArrowRight className="h-4 w-4" />
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-center text-muted-foreground">No chat sessions yet. Start a new chat to begin!</p>
              )}
            </CardContent>
          </Card>

          {totalPages > 1 && (
            <div className="flex justify-center items-center mt-4 space-x-2">
              <Button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                variant="outline"
                size="sm"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span>{currentPage} / {totalPages}</span>
              <Button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
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