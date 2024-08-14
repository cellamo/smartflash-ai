// app/study/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Rotate3D, ThumbsUp, ThumbsDown, Zap, Plus, Settings, Play, Edit } from "lucide-react";
import { MobileDock } from '@/components/MobileDock';
import { Toaster } from "@/components/ui/sonner"
import { toast } from "sonner"
import { useSearchParams } from 'next/navigation';

interface Deck {
  id: number;
  name: string;
  cardCount: number;
  lastStudied: string;
}

const mockDecks: Deck[] = [
  { id: 1, name: "General Knowledge", cardCount: 50, lastStudied: "2 days ago" },
  { id: 2, name: "Programming Concepts", cardCount: 100, lastStudied: "1 week ago" },
  { id: 3, name: "Spanish Vocabulary", cardCount: 200, lastStudied: "3 days ago" },
];

export default function StudyPage() {
  const [decks, setDecks] = useState<Deck[]>(mockDecks);
  const [newDeckName, setNewDeckName] = useState("");
  const searchParams = useSearchParams();

  const createNewDeck = () => {
    if (newDeckName.trim()) {
      const newDeck: Deck = {
        id: decks.length + 1,
        name: newDeckName,
        cardCount: 0,
        lastStudied: "Never"
      };
      setDecks([...decks, newDeck]);
      setNewDeckName("");
    }
  };

  useEffect(() => {
    if (searchParams.get('sessionEnded') === 'true') {
      toast.success("Keep up the good work! You've completed your session.");
    }
  }, [searchParams]);

  return (
    <div className="container mx-auto pb-14 px-4 py-10 max-w-4xl bg-slate-200">
      <h1 className="text-3xl font-bold text-center mb-8">Your Study Decks</h1>
      <MobileDock />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {decks.map((deck) => (
          <Card key={deck.id} className="flex flex-col">
            <CardHeader>
              <CardTitle>{deck.name}</CardTitle>
            </CardHeader>
            <CardContent className="flex-grow">
              <p className="text-sm text-muted-foreground mb-4">
                {deck.cardCount} cards • Last studied: {deck.lastStudied}
              </p>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/study/${deck.id}`}>
                    <Play className="mr-2 h-4 w-4" /> Study
                  </Link>
                </Button>
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/edit-deck/${deck.id}`}>
                    <Edit className="mr-2 h-4 w-4" /> Edit
                  </Link>
                </Button>
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/deck-settings/${deck.id}`}>
                    <Settings className="mr-2 h-4 w-4" /> Settings
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="mt-8 flex flex-col sm:flex-row items-center gap-4">
        <Input
          type="text"
          placeholder="New deck name"
          value={newDeckName}
          onChange={(e) => setNewDeckName(e.target.value)}
          className="flex-grow"
        />
        <Button onClick={createNewDeck} className="w-full sm:w-auto">
          <Plus className="mr-2 h-4 w-4" /> Create New Deck
        </Button>
      </div>
      <Toaster />
    </div>
  );
}
