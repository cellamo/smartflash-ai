"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Check, X, ArrowLeft, Upload, Info } from "lucide-react";
import { MobileDock } from "@/components/MobileDock";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { useRouter } from "next/navigation";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

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

export default function AnkiImportPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [importedDeck, setImportedDeck] = useState<Deck | null>(null);
  const supabase = createClientComponentClient();
  const router = useRouter();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
  
    setIsLoading(true);
  
    try {
      const formData = new FormData();
      formData.append('file', file);
  
      const response = await fetch('/api/import-anki', {
        method: 'POST',
        body: formData,
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to import Anki deck');
      }
  
      const data = await response.json();
      const importedDeck: Deck = {
        name: data.deckName,
        description: "Imported from Anki .apkg file",
        flashcards: data.cards,
      };
  
      setImportedDeck(importedDeck);
      toast.success("Anki deck imported successfully!");
    } catch (error: any) {
      console.error("Error importing Anki deck:", error);
      toast.error(`Failed to import Anki deck: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAccept = async () => {
    if (!importedDeck) return;

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const { data: deck, error: deckError } = await supabase
        .from("decks")
        .insert({
          user_id: user.id,
          name: importedDeck.name,
          description: importedDeck.description,
        })
        .select()
        .single();

      if (deckError) throw deckError;

      const flashcardsToInsert = importedDeck.flashcards.map((card) => ({
        deck_id: deck.id,
        front: card.front,
        back: card.back,
        notes: card.notes,
      }));

      const { error: flashcardsError } = await supabase
        .from("flashcards")
        .insert(flashcardsToInsert);
      if (flashcardsError) throw flashcardsError;

      toast.success("Anki deck saved successfully!");
      setImportedDeck(null);
    } catch (error) {
      console.error("Error saving deck:", error);
      toast.error("Failed to save Anki deck");
    }
  };

  const handleDecline = () => {
    setImportedDeck(null);
    toast.info("Anki deck import cancelled");
  };

  return (
    <div className="flex flex-col h-screen bg-slate-200 dark:bg-slate-900 pb-16">
      <div className="flex-grow overflow-auto px-2 py-4 pb-2">
        <div className="max-w-md mx-auto">
          <Button
            onClick={() => router.back()}
            className="mb-4"
            variant="outline"
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Go Back
          </Button>
          <Card className="w-full mb-8">
            <CardHeader>
              <CardTitle className="text-xl font-bold">
                Import Anki Deck
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Alert className="mb-6 bg-blue-50 dark:bg-blue-900 border-blue-200 dark:border-blue-700">
                <Info className="h-5 w-5 text-blue-500 dark:text-blue-400" />
                <AlertTitle className="text-lg font-semibold mb-2">
                  How to Export Your Anki Deck
                </AlertTitle>
                <AlertDescription>
                  <ol className="list-decimal list-inside space-y-3 mt-3">
                    <li className="flex items-start">
                      <span className="mr-2">1.</span>
                      <span>Open Anki and navigate to the Decks view</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2">2.</span>
                      <span>
                        Click &quot;Actions&quot; on your desired deck
                      </span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2">3.</span>
                      <span>Select &quot;Share&quot;</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2">4.</span>
                      <span>Enter the deck name as the title</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2">5.</span>
                      <span>Add a description (optional)</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2">6.</span>
                      <span>Check the copyright checkbox</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2">7.</span>
                      <span>Click &quot;Share&quot;</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2">8.</span>
                      <span>
                        Wait briefly, then click the &quot;here&quot; link to
                        view the shared deck
                      </span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2">9.</span>
                      <span>Scroll down and click &quot;Download&quot;</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2">10.</span>
                      <span>
                        Click &quot;Remove&quot; to make your deck private again
                      </span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2">11.</span>
                      <span>Upload the downloaded .apkg file here</span>
                    </li>
                  </ol>
                </AlertDescription>
              </Alert>
              <input
                type="file"
                accept=".apkg"
                onChange={handleFileUpload}
                className="hidden"
                id="anki-file-input"
              />
              <Button
                onClick={() =>
                  document.getElementById("anki-file-input")?.click()
                }
                className="w-full dark:bg-gray-700 dark:text-white"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Importing...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" /> Select Anki .apkg File
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {importedDeck && (
            <Card className="w-full mb-8">
              <CardHeader>
                <CardTitle className="text-xl font-bold">
                  Imported Anki Deck: {importedDeck.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-4">{importedDeck.description}</p>
                <div className="relative w-full">
                  <Carousel className="w-full">
                    <CarouselContent className="px-8">
                      {importedDeck.flashcards.map((card, index) => (
                        <CarouselItem key={index}>
                          <Card className="p-4 shadow-lg h-full dark:bg-gray-800 dark:border-gray-700 dark:shadow-gray-600">
                            <div className="space-y-2">
                              <div>
                                <strong className="text-sm text-gray-600 dark:text-gray-400">
                                  Front:
                                </strong>
                                <p className="mt-1 dark:text-gray-100">
                                  {card.front}
                                </p>
                              </div>
                              <div>
                                <strong className="text-sm text-gray-600 dark:text-gray-400">
                                  Back:
                                </strong>
                                <p className="mt-1 dark:text-gray-100">
                                  {card.back}
                                </p>
                              </div>
                              <div>
                                <strong className="text-sm text-gray-600 dark:text-gray-400">
                                  Notes:
                                </strong>
                                <p className="mt-1 dark:text-gray-100">
                                  {card.notes}
                                </p>
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
                  <Button
                    onClick={handleAccept}
                    className="w-1/2 mr-2 bg-green-600 dark:bg-green-900 dark:text-white"
                  >
                    <Check className="mr-2 h-4 w-4" /> Accept
                  </Button>
                  <Button
                    onClick={handleDecline}
                    variant="destructive"
                    className="w-1/2 ml-2 bg-red-600 dark:bg-red-900 dark:text-white"
                  >
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
