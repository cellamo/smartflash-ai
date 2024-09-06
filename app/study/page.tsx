"use client";

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Settings, Play, Edit, BookOpen, Search, ChevronUp, ChevronDown } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { MobileDock } from '@/components/MobileDock';
import { Toaster } from "@/components/ui/sonner"
import { toast } from "sonner"
import { useSearchParams } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Deck {
  id: string;
  name: string;
  card_count: number;
  last_studied: string | null;
  created_at: string;
}

type SortOption = 'lastStudied' | 'creationTime' | 'alphabetical';
type SortDirection = 'asc' | 'desc';

function StudyDecks() {
  const [decks, setDecks] = useState<Deck[]>([]);
  const [sortedDecks, setSortedDecks] = useState<Deck[]>([]);
  const [newDeckName, setNewDeckName] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [sortOption, setSortOption] = useState<SortOption>("creationTime");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const supabase = createClientComponentClient();

  useEffect(() => {
    fetchDecks();
  }, []);

  useEffect(() => {
    const filteredAndSortedDecks = filterAndSortDecks(decks, searchQuery, sortOption, sortDirection);
    setSortedDecks(filteredAndSortedDecks);
  }, [decks, searchQuery, sortOption, sortDirection]);

  const fetchDecks = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data, error } = await supabase
        .from('decks')
        .select('*')
        .eq('user_id', user.id);
      if (error) {
        console.error('Error fetching decks:', error);
        toast.error('Failed to load decks');
      } else {
        setDecks(data);
      }
    }
    setLoading(false);
  };

  const filterAndSortDecks = (decks: Deck[], query: string, sort: SortOption, direction: SortDirection) => {
    let filtered = decks;
    if (query.trim()) {
      const lowercaseQuery = query.toLowerCase();
      filtered = decks.filter(deck => 
        deck.name.toLowerCase().includes(lowercaseQuery)
      );
    }

    return filtered.sort((a, b) => {
      let comparison = 0;
      switch (sort) {
        case "lastStudied":
          const aDate = a.last_studied ? new Date(a.last_studied).getTime() : 0;
          const bDate = b.last_studied ? new Date(b.last_studied).getTime() : 0;
          comparison = aDate - bDate;
          break;
        case "creationTime":
          comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
          break;
        case "alphabetical":
          comparison = a.name.localeCompare(b.name, undefined, { sensitivity: 'base' });
          break;
      }
      return direction === 'asc' ? comparison : -comparison;
    });
  };

  const createNewDeck = async () => {
    if (newDeckName.trim()) {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data, error } = await supabase
          .from('decks')
          .insert({ name: newDeckName, user_id: user.id })
          .select()
          .single();
        if (error) {
          console.error('Error creating deck:', error);
          toast.error('Failed to create deck');
        } else {
          setDecks([...decks, data]);
          setNewDeckName("");
          setIsDialogOpen(false);
          toast.success('Deck created successfully');
        }
      }
    }
  };

  if (loading) {
    return <div>Loading decks...</div>;
  }

  return (
    <>
      <div className="mb-4 flex flex-wrap justify-between items-center gap-2">
        <Button 
          onClick={() => setIsDialogOpen(true)} 
          className="dark:bg-gray-700 dark:text-white"
        >
          <Plus className="mr-2 h-4 w-4" /> Create New Deck
        </Button>
        <div className="flex items-center space-x-2">
          <Select value={sortOption} onValueChange={(value: SortOption) => setSortOption(value)}>
            <SelectTrigger className="w-[140px] dark:bg-gray-700 dark:text-white">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="lastStudied">Last Studied</SelectItem>
              <SelectItem value="creationTime">Creation Time</SelectItem>
              <SelectItem value="alphabetical">Alphabetical</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')}
            className="dark:bg-gray-700 dark:text-white"
          >
            {sortDirection === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </div>
      </div>
      <div className="mb-4 relative">
        <Input
          type="text"
          placeholder="Search decks or cards"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="dark:bg-gray-700 dark:text-white pr-10"
        />
        <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
      </div>
      {sortedDecks.length === 0 ? (
        <Card className="text-center p-6">
          <CardHeader>
            <CardTitle>No Decks Found</CardTitle>
            <CardDescription>Try a different search or create a new deck!</CardDescription>
          </CardHeader>
          <CardContent>
            <Input
              type="text"
              placeholder="New deck name"
              value={newDeckName}
              onChange={(e) => setNewDeckName(e.target.value)}
              className="mb-4"
            />
            <Button onClick={createNewDeck}>
              <Plus className="mr-2 h-4 w-4" /> Create New Deck
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {sortedDecks.map((deck) => (
            <Card key={deck.id} className="flex flex-col dark:bg-gray-800">
              <CardHeader>
                <CardTitle className="dark:text-white">{deck.name}</CardTitle>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-sm text-muted-foreground mb-4 dark:text-gray-300">
                  {deck.card_count} cards • Last studied: {deck.last_studied || 'Never'}
                </p>
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" size="sm" asChild className="dark:text-gray-300 dark:bg-gray-700 dark:hover:text-white">
                    <Link href={`/study/${deck.id}`}>
                      <Play className="mr-2 h-4 w-4" /> Study
                    </Link>
                  </Button>
                  <Button variant="outline" size="sm" asChild className="dark:text-gray-300 dark:bg-gray-700 dark:hover:text-white">
                    <Link href={`/edit-deck/${deck.id}`}>
                      <Edit className="mr-2 h-4 w-4" /> Edit
                    </Link>
                  </Button>
                  <Button variant="outline" size="sm" asChild className="dark:text-gray-300 dark:bg-gray-700 dark:hover:text-white">
                    <Link href={`/deck-settings/${deck.id}`}>
                      <Settings className="mr-2 h-4 w-4" /> Settings
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Deck</DialogTitle>
            <DialogDescription>
              Enter a name for your new deck.
            </DialogDescription>
          </DialogHeader>
          <Input
            type="text"
            placeholder="Deck name"
            value={newDeckName}
            onChange={(e) => setNewDeckName(e.target.value)}
            className="mb-4"
          />
          <DialogFooter>
            <Button onClick={createNewDeck}>Create Deck</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function StudyContent() {
  const searchParams = useSearchParams();

  useEffect(() => {
    if (searchParams.get('sessionEnded') === 'true') {
      toast.success("Keep up the good work! You've completed your session.");
    }
  }, [searchParams]);

  return (
    <>
      <Card className="w-full max-w-md mx-auto mb-4">
        <CardHeader className="flex flex-row items-center justify-center space-y-0 pb-2">
          <BookOpen className="h-6 w-6 text-primary mr-2 dark:text-gray-300" />
          <CardTitle className="text-xl font-bold dark:text-white">Study Decks</CardTitle>
        </CardHeader>
        <CardContent>
          <CardDescription className="text-center dark:text-gray-300">
            Review and manage your flashcard decks. Ready to boost your knowledge?
          </CardDescription>
        </CardContent>
      </Card>
      <StudyDecks />
    </>
  );
}

export default function StudyPage() {

  return (
    <div className={`flex min-h-screen w-full flex-col pb-20 bg-slate-200 dark:bg-slate-900`}>
      <MobileDock />
      <div className="flex-grow overflow-auto px-2 py-4 pb-2">
          <div className="max-w-4xl mx-auto">
            <Suspense fallback={<div className="dark:text-white">Loading...</div>}>
              <StudyContent />
            </Suspense>
          </div>
      </div>
      <Toaster />
    </div>
  );
}