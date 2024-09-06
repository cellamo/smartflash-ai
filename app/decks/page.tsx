"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Plus,
  Book,
  ArrowRight,
  PlusCircle,
  Download,
  Upload,
  Wand2,
} from "lucide-react";
import { GradientButton } from "@/components/ui/gradient-button";
import { MobileDock } from "@/components/MobileDock";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
interface Flashcard {
  id: number;
  front: string;
  back: string;
  notes: string;
  deck: string;
  timestamp: string;
}

export default function QuickAddFlashcardPage() {
  const [front, setFront] = useState("");
  const [back, setBack] = useState("");
  const [notes, setNotes] = useState("");
  const [selectedDeck, setSelectedDeck] = useState("");
  const [recentCards, setRecentCards] = useState<any[]>([]);
  const router = useRouter();
  const [selectedDeckId, setSelectedDeckId] = useState<string | null>(null);
  const supabase = createClientComponentClient();
  const [decks, setDecks] = useState<any[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newDeckName, setNewDeckName] = useState("");

  useEffect(() => {
    fetchDecks();
  }, []);

  const fetchDecks = async () => {
    const { data, error } = await supabase.from("decks").select("*");

    if (error) {
      console.error("Error fetching decks:", error);
      toast.error("Failed to load decks");
    } else {
      setDecks(data);
    }
  };

  useEffect(() => {
    fetchRecentCards();
  }, []);

  const fetchRecentCards = async () => {
    const { data, error } = await supabase
      .from("flashcards")
      .select("*, decks(name)")
      .order("created_at", { ascending: false })
      .limit(5);

    if (error) {
      console.error("Error fetching recent cards:", error);
      toast.error("Failed to load recent cards");
    } else {
      setRecentCards(data);
    }
  };

  const addFlashcard = async () => {
    if (front.trim() && back.trim() && selectedDeckId) {
      const { data, error } = await supabase
        .from("flashcards")
        .insert({
          front: front.trim(),
          back: back.trim(),
          deck_id: selectedDeckId,
        })
        .select()
        .single();

      if (error) {
        console.error("Error adding flashcard:", error);
        toast.error("Failed to add flashcard");
      } else {
        setRecentCards([data, ...recentCards.slice(0, 4)]);
        setFront("");
        setBack("");
        setNotes("");
        toast.success(`New flashcard added to deck!`);
      }
    } else {
      toast.error("Please enter the front, back, and select a deck.");
    }
  };

  const exportToAnki = () => {
    const ankiFormat = recentCards
      .map((card) => `${card.front}\t${card.back}\t${card.notes}`)
      .join("\n");
    const blob = new Blob([ankiFormat], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "anki_export.txt";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Exported to Anki format successfully!");
  };

  const importFromAnki = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        const lines = content.split("\n");
        const importedCards = lines.map((line, index) => {
          const [front, back, notes = ""] = line.split("\t");
          return {
            id: Date.now() + index,
            front: front.trim(),
            back: back.trim(),
            notes: notes.trim(),
            deck: selectedDeck || "Imported",
            timestamp: new Date().toLocaleString(),
          };
        });
        setRecentCards([...importedCards, ...recentCards]);
        toast.success(
          `Imported ${importedCards.length} flashcards successfully!`
        );
      };
      reader.readAsText(file);
    }
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

  return (
    <div className="flex flex-col h-screen bg-slate-200 dark:bg-slate-900 pb-16">
      <div className="flex-grow overflow-auto px-2 py-4 pb-2">
        <div className="max-w-md mx-auto">
          <MobileDock />
          <div className="max-w-md mx-auto">
            <Card className="w-full mb-8">
              <CardHeader className="flex flex-row items-center justify-center space-y-0 pb-2">
                <PlusCircle className="h-6 w-6 text-primary mr-2" />
                <CardTitle className="text-xl font-bold">
                  Quick Add Flashcard
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center">
                  Create new flashcards quickly. Expand your knowledge
                  effortlessly!
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="mb-6">
              <CardContent className="pt-6">
                <div className="flex flex-col gap-4 ">
                  <Input
                    type="text"
                    placeholder="Front (thing to learn or a question)"
                    value={front}
                    className="dark:bg-gray-700 dark:text-white"
                    onChange={(e) => setFront(e.target.value)}
                  />
                  <Input
                    type="text"
                    placeholder="Back (answer or definition)"
                    value={back}
                    className="dark:bg-gray-700 dark:text-white"
                    onChange={(e) => setBack(e.target.value)}
                  />
                  <Textarea
                    placeholder="Additional notes (optional)"
                    value={notes}
                    className="dark:bg-gray-700 dark:text-white"
                    onChange={(e) => setNotes(e.target.value)}
                  />
                  <Select onValueChange={(value) => setSelectedDeckId(value)}>
                    <SelectTrigger className="dark:bg-gray-700 dark:text-white">
                      <SelectValue placeholder="Select a deck" />
                    </SelectTrigger>
                    <SelectContent>
                      {decks.map((deck) => (
                        <SelectItem key={deck.id} value={deck.id}>
                          {deck.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button onClick={addFlashcard} className="w-full dark:bg-gray-700 dark:text-white">
                    <Plus className="mr-2 h-4 w-4" /> Add Flashcard
                  </Button>
                </div>
              </CardContent>
            </Card>
            <GradientButton
  onClick={() => router.push("/create-ai-deck")}
  className="w-full mb-6"
>
  <Wand2 className="mr-2 h-4 w-4" /> Create AI Deck from Notes
</GradientButton>

            <Button 
              onClick={() => setIsDialogOpen(true)} 
              className="w-full mb-6 dark:bg-gray-700 dark:text-white"
            >
              <Plus className="mr-2 h-4 w-4" /> Create New Deck
            </Button>

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

            <Card className="mb-6">
  <CardHeader>
    <CardTitle className="text-xl">Recently Added Flashcards</CardTitle>
  </CardHeader>
  <CardContent>
    {recentCards.length > 0 ? (
      <ul className="space-y-2">
        {recentCards.map((card: any) => (
          <li key={card.id} className="flex justify-between items-center">
            <span className="font-medium">{card.front}</span>
            <span className="text-sm text-muted-foreground">
              {card.decks?.name || card.deck || 'Unknown Deck'}
            </span>
          </li>
        ))}
      </ul>
    ) : (
      <p className="text-center text-muted-foreground">No recent flashcards</p>
    )}
  </CardContent>
</Card>

            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-xl">
                  Import Your Decks or Words
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-4">
                  <label htmlFor="import-file" className="w-full">
                    <Button className="w-full dark:bg-gray-700 dark:text-white">
                      <Upload className="mr-2 h-4 w-4" /> Import Deck from Anki
                    </Button>
                  </label>
                  <label htmlFor="import-words" className="w-full">
                    <Button className="w-full dark:bg-gray-700 dark:text-white">
                      <Upload className="mr-2 h-4 w-4" /> Import Words from TXT
                    </Button>
                  </label>
                  <label htmlFor="import-file" className="w-full">
                    <Button className="w-full dark:bg-gray-700 dark:text-white" onClick={() => router.push("/create-deck-json")}>
                      <Upload className="mr-2 h-4 w-4" /> Create Deck from JSON
                    </Button>
                  </label>
                  <input
                    id="import-words"
                    type="file"
                    accept=".txt"
                    style={{ display: "none" }}
                  />
                  <input
                    id="import-file"
                    type="file"
                    accept=".txt"
                    onChange={importFromAnki}
                    style={{ display: "none" }}
                  />
                </div>
              </CardContent>
            </Card>

            <div className="mt-6 text-center">
              <Button
                variant="link"
                className="text-primary"
                onClick={() => router.push("/study")}
              >
                <Book className="mr-2 h-4 w-4" /> Go to Study Section
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
      <MobileDock />
      <Toaster />
    </div>
  );
}