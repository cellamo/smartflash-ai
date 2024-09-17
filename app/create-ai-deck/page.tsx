"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Wand2, Loader2, Check, X, Lock, ArrowLeft } from "lucide-react";
import { MobileDock } from "@/components/MobileDock";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { useRouter } from 'next/navigation'; // Ensure this import is included

interface Flashcard {
  front: string;
  back: string;
  notes: string;
}

interface Deck {
  name: string;
  description: string;
  flashcards: Flashcard[];
}

export default function CreateAIDeckPage() {
  const [notes, setNotes] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [generatedDeck, setGeneratedDeck] = useState<Deck | null>(null);
  const [userRole, setUserRole] = useState<string>("free");
  const supabase = createClientComponentClient();
  const router = useRouter(); // Add this line

  useEffect(() => {
    fetchUserRole();
  }, []);

  const fetchUserRole = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (data) {
        setUserRole(data.role);
      }
    }
  };

  const createAIDeck = async () => {

    if (userRole !== "premium") {
      toast.error("AI Deck generation is a premium feature. Please upgrade your account.");
      return;
    }

    if (notes.length < 100) {
      toast.error("Please enter at least 100 characters to generate an AI Deck.");
      return;
    }

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
      if (data.name && data.description && Array.isArray(data.flashcards)) {
        setGeneratedDeck(data);
      } else {
        throw new Error("Invalid deck structure generated");
      }
    } catch (error: unknown) {
      console.error("Error:", error);
      if (error instanceof Error) {
        toast.error(`Failed to create AI Deck: ${error.message}`);
      } else {
        toast.error("Failed to create AI Deck: An unknown error occurred");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const createAIDeckMock = async () => {
    setIsLoading(true);
    try {
      const mockData = {
        name: "Sample Deck",
        description: "This is a sample deck generated from AI",
        flashcards: [
          { front: "What is the capital of France?", back: "Paris", notes: "This is a sample flashcard" },
          { front: "What is the capital of Germany?", back: "Berlin", notes: "This is a sample flashcard" },
          { front: "What is the capital of Italy?", back: "Rome", notes: "This is a sample flashcard" },
          { front: "What is the capital of Spain?", back: "Madrid", notes: "This is a sample flashcard" },
          { front: "What is the capital of Portugal?", back: "Lisbon", notes: "This is a sample flashcard" },
        ]
      };

      setGeneratedDeck(mockData);
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to create AI Deck: An unknown error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAccept = async () => {
    if (!generatedDeck) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const { data: deck, error: deckError } = await supabase
        .from("decks")
        .insert({ user_id: user.id, name: generatedDeck.name, description: generatedDeck.description })
        .select()
        .single();

      if (deckError) throw deckError;

      const flashcardsToInsert = generatedDeck.flashcards.map(card => ({
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
      setGeneratedDeck(null);
    } catch (error) {
      console.error("Error saving deck:", error);
      toast.error("Failed to save AI Deck");
    }
  };

  const handleDecline = () => {
    setGeneratedDeck(null);
    toast.info("AI Deck declined");
  };

  return (
    <div className="flex flex-col h-screen bg-slate-200 dark:bg-slate-900 pb-16">
      <div className="flex-grow overflow-auto px-2 py-4 pb-2">
        <div className="max-w-md mx-auto">
          <Button
            onClick={() => router.back()} // Add this button
            className="mb-4"
            variant="outline"
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Go Back
          </Button>
          <Card className="w-full mb-8">
            <CardHeader>
              <CardTitle className="text-xl font-bold">
                Create AI Deck from Notes
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Wrap Textarea and Counter in a relative div */}
              <div className="relative">
                <Textarea
                  placeholder="Paste your class notes here..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="mb-4"
                  rows={10}
                />
                {/* Character Counter */}
                <span className="absolute bottom-2 right-2 text-xs text-gray-500">
                  {notes.length} characters
                </span>
              </div>
              <Button onClick={createAIDeck} className="w-full dark:bg-gray-700 dark:text-white" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : userRole !== "premium" ? (
                  <>
                    <Lock className="mr-2 h-4 w-4" /> Premium Feature
                  </>
                ) : (
                  <>
                    <Wand2 className="mr-2 h-4 w-4" /> Generate AI Deck
                  </>
                )}
              </Button>
              {userRole !== "premium" && (
                <p className="text-sm text-gray-500 mt-2">
                  Upgrade to premium to unlock AI Deck generation.
                </p>
              )}
            </CardContent>
          </Card>

          {generatedDeck && (
            <Card className="w-full mb-8">
              <CardHeader>
                <CardTitle className="text-xl font-bold">
                  Generated AI Deck: {generatedDeck.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-4">{generatedDeck.description}</p>
                <div className="relative w-full">
                  <Carousel className="w-full">
                    <CarouselContent className="px-8">
                      {generatedDeck.flashcards.map((card, index) => (
                        <CarouselItem key={index}>
                          <Card className="p-4 shadow-lg h-full dark:bg-gray-800 dark:border-gray-700 dark:shadow-gray-600">
                            <div className="space-y-2">
                              <div>
                                <strong className="text-sm text-gray-600 dark:text-gray-400">Front:</strong>
                                <p className="mt-1 dark:text-gray-100">{card.front}</p>
                              </div>
                              <div>
                                <strong className="text-sm text-gray-600 dark:text-gray-400">Back:</strong>
                                <p className="mt-1 dark:text-gray-100">{card.back}</p>
                              </div>
                              <div>
                                <strong className="text-sm text-gray-600 dark:text-gray-400">Notes:</strong>
                                <p className="mt-1 dark:text-gray-100">{card.notes}</p>
                              </div>
                            </div>
                          </Card>
                        </CarouselItem>
                      ))}
                    </CarouselContent>
                    <CarouselPrevious className="left-0 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600" />
                    <CarouselNext className="right-0 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600" />
                  </Carousel>
                </div>
                <div className="flex justify-between mt-4">
                  <Button onClick={handleAccept} className="w-1/2 mr-2 bg-green-600 dark:bg-green-900 dark:text-white">
                    <Check className="mr-2 h-4 w-4" /> Accept
                  </Button>
                  <Button onClick={handleDecline} variant="destructive" className="w-1/2 ml-2 bg-red-600 dark:bg-red-900 dark:text-white">
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
