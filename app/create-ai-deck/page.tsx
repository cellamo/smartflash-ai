"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Wand2, Loader2, Check, X } from "lucide-react";
import { MobileDock } from "@/components/MobileDock";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

interface Flashcard {
  front: string;
  back: string;
  notes: string;
}

export default function CreateAIDeckPage() {
  const [notes, setNotes] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [generatedDeck, setGeneratedDeck] = useState<Flashcard[]>([]);
  const supabase = createClientComponentClient();

  const createAIDeck = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/generate-ai-deck", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || response.statusText);
      }

      const data = await response.json();
      if (Array.isArray(data.flashcards) && data.flashcards.length > 0) {
        setGeneratedDeck(data.flashcards);
      } else {
        throw new Error("No flashcards generated");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error(`Failed to create AI Deck: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAccept = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const { data: deck, error: deckError } = await supabase
        .from("decks")
        .insert({ user_id: user.id, name: "AI Generated Deck", description: "Generated from notes" })
        .select()
        .single();

      if (deckError) throw deckError;

      const flashcardsToInsert = generatedDeck.map(card => ({
        deck_id: deck.id,
        front: card.front,
        back: card.back,
        notes: card.notes
      }));

      const { error: flashcardsError } = await supabase
        .from("flashcards")
        .insert(flashcardsToInsert);

      if (flashcardsError) throw flashcardsError;

      toast.success("AI Deck accepted and saved!");
      setGeneratedDeck([]);
    } catch (error) {
      console.error("Error saving deck:", error);
      toast.error("Failed to save AI Deck");
    }
  };

  const handleDecline = () => {
    setGeneratedDeck([]);
    toast.info("AI Deck declined");
  };

  return (
    <div className="flex flex-col h-screen bg-slate-200 pb-16">
      <div className="flex-grow overflow-auto px-2 py-4 pb-2">
        <div className="max-w-md mx-auto">
          <Card className="w-full mb-8">
            <CardHeader>
              <CardTitle className="text-xl font-bold">
                Create AI Deck from Notes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Paste your class notes here..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="mb-4"
                rows={10}
              />
              <Button onClick={createAIDeck} className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Wand2 className="mr-2 h-4 w-4" /> Generate AI Deck
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {generatedDeck.length > 0 && (
            <Card className="w-full mb-8">
              <CardHeader>
                <CardTitle className="text-xl font-bold">
                  Generated AI Deck
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 mb-4">
                  {generatedDeck.map((card, index) => (
                    <Card key={index} className="p-4 shadow-lg">
                      <div className="space-y-2">
                        <div>
                          <strong className="text-sm text-gray-600">Front:</strong>
                          <p className="mt-1">{card.front}</p>
                        </div>
                        <div>
                          <strong className="text-sm text-gray-600">Back:</strong>
                          <p className="mt-1">{card.back}</p>
                        </div>
                        <div>
                          <strong className="text-sm text-gray-600">Notes:</strong>
                          <p className="mt-1">{card.notes}</p>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
                <div className="flex justify-between">
                  <Button onClick={handleAccept} className="w-1/2 mr-2">
                    <Check className="mr-2 h-4 w-4" /> Accept
                  </Button>
                  <Button onClick={handleDecline} variant="destructive" className="w-1/2 ml-2">
                    <X className="mr-2 h-4 w-4" /> Decline
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
      <MobileDock />
      <Toaster />
    </div>
  );
}
