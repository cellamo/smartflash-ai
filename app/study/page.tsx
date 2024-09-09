"use client";

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Settings, Play, Edit, BookOpen, Search, ChevronUp, ChevronDown } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { MobileDock } from '@/components/MobileDock';
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import { useSearchParams } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Deck {
  id: string;
  name: string;
  description: string;
  card_count: number;
  last_studied: string | null;
  created_at: string;
  review_limit: number;
  new_cards_per_day: number;
  review_order: 'random' | 'fixed';
  min_ease_factor: number;
  max_ease_factor: number;
  enable_ai_hints: boolean;
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
  const [selectedDeck, setSelectedDeck] = useState<Deck | null>(null);
  const [reviewLimit, setReviewLimit] = useState(20);
  const [newCardsPerDay, setNewCardsPerDay] = useState(10);
  const [reviewOrder, setReviewOrder] = useState<'random' | 'fixed'>('random');
  const [minEaseFactor, setMinEaseFactor] = useState(130);
  const [maxEaseFactor, setMaxEaseFactor] = useState(250);
  const [enableAIHints, setEnableAIHints] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

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

  function formatLastStudied(dateString: string | null): string {
    if (!dateString) return 'Never';

    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffMinutes = Math.floor(diffTime / (1000 * 60));
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays <= 7) return `${diffDays} days ago`;
    if (diffDays <= 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays <= 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
  }

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

  const openSettings = (deck: Deck) => {
    setSelectedDeck(deck);
    setReviewLimit(deck.review_limit || 20);
    setNewCardsPerDay(deck.new_cards_per_day || 10);
    setReviewOrder(deck.review_order || 'random');
    setMinEaseFactor(deck.min_ease_factor || 130);
    setMaxEaseFactor(deck.max_ease_factor || 250);
    setEnableAIHints(deck.enable_ai_hints || false);
    setIsSettingsOpen(true);
  };

  const saveDeckSettings = async () => {
    if (selectedDeck) {
      const { data, error } = await supabase
        .from('decks')
        .update({
          review_limit: reviewLimit,
          new_cards_per_day: newCardsPerDay,
          review_order: reviewOrder,
          min_ease_factor: minEaseFactor,
          max_ease_factor: maxEaseFactor,
          enable_ai_hints: enableAIHints,
        })
        .eq('id', selectedDeck.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating deck settings:', error);
        toast.error('Failed to update deck settings');
      } else {
        setDecks(decks.map(deck => deck.id === data.id ? data : deck));
        toast.success('Deck settings updated successfully');
        setIsSettingsOpen(false);
      }
    }
  };

  if (loading) {
    return <div>Loading decks...</div>;
  }

  return (
    <>
      <div className="mb-4 flex items-center justify-between gap-2">
        <div className="w-1/2 max-w-[180px]">
          <Button 
            onClick={() => setIsDialogOpen(true)} 
            className="dark:bg-gray-700 dark:text-white whitespace-nowrap w-full"
          >
            <Plus className="mr-1 h-4 w-4" /> New Deck
          </Button>
        </div>
        <div className="flex items-center w-1/2 justify-end">
          <Select value={sortOption} onValueChange={(value: SortOption) => setSortOption(value)}>
          <SelectTrigger className="w-[140px] dark:bg-gray-700 dark:text-white text-sm">
          <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="lastStudied">Last Studied</SelectItem>
              <SelectItem value="creationTime">Created</SelectItem>
              <SelectItem value="alphabetical">A-Z</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')}
            className="dark:bg-gray-700 dark:text-white ml-1 w-[40px]"
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
                <CardDescription className="text-sm text-muted-foreground mb-4 dark:text-gray-400">{deck.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-sm text-muted-foreground mb-4 dark:text-gray-400">
                  {deck.card_count} cards • Last studied: {formatLastStudied(deck.last_studied)}
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
                  <Button variant="outline" size="sm" onClick={() => openSettings(deck)} className="dark:text-gray-300 dark:bg-gray-700 dark:hover:text-white">
                    <Settings className="mr-2 h-4 w-4" /> Settings
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

      <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Deck Settings: {selectedDeck?.name}</DialogTitle>
            <DialogDescription>
              Customize your deck settings here.
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="h-[400px]">
            <div className="mr-4">
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="reviewLimit" className="text-right">
                    Daily Review Limit
                  </Label>
                  <Input
                    id="reviewLimit"
                    type="number"
                    value={reviewLimit}
                    onChange={(e) => setReviewLimit(Number(e.target.value))}
                    className="col-span-3"
                  />
                </div>
                <p className="text-sm text-muted-foreground">
                  The maximum number of cards to review each day.
                </p>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="newCardsPerDay" className="text-right">
                    New Cards Per Day
                  </Label>
                  <Input
                    id="newCardsPerDay"
                    type="number"
                    value={newCardsPerDay}
                    onChange={(e) => setNewCardsPerDay(Number(e.target.value))}
                    className="col-span-3"
                  />
                </div>
                <p className="text-sm text-muted-foreground">
                  The number of new cards to introduce each day.
                </p>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="reviewOrder" className="text-right">
                    Review Order
                  </Label>
                  <Select value={reviewOrder} onValueChange={(value: 'random' | 'fixed') => setReviewOrder(value)}>
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select review order" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="random">Random</SelectItem>
                      <SelectItem value="fixed">Fixed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <p className="text-sm text-muted-foreground">
                  The order in which cards are reviewed.
                </p>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right">Ease Factor Range</Label>
                  <div className="col-span-3">
                    <Slider
                      min={100}
                      max={300}
                      step={10}
                      value={[minEaseFactor, maxEaseFactor]}
                      onValueChange={([min, max]) => {
                        setMinEaseFactor(min);
                        setMaxEaseFactor(max);
                      }}
                      className="[&_[role=slider]]:h-4 [&_[role=slider]]:w-4"
                    />
                    <div className="flex justify-between mt-2">
                      <span>{minEaseFactor}%</span>
                      <span>{maxEaseFactor}%</span>
                    </div>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  The range of ease factors used to adjust card difficulty.
                </p>
                <div className="flex items-center justify-between">
                  <Label htmlFor="enableAIHints">Enable AI-Assisted Hints</Label>
                  <Switch
                    id="enableAIHints"
                    checked={enableAIHints}
                    onCheckedChange={setEnableAIHints}
                    className="dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <p className="text-sm text-muted-foreground">
                  Enable AI-generated hints for reviewing cards.
                </p>
              </div>
            </div>
          </ScrollArea>
          <DialogFooter>
            <Button onClick={saveDeckSettings} className="dark:bg-gray-700 dark:text-white">Save changes</Button>
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
