"use client";

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, ArrowLeft, Edit, Check } from "lucide-react";
import { MobileDock } from '@/components/MobileDock';
import { Toaster } from "@/components/ui/sonner"
import { toast } from "sonner"
import { useRouter } from 'next/navigation';

export default function EditDeckPage({ params }: { params: { id: string } }) {
  const [front, setFront] = useState("");
  const [back, setBack] = useState("");
  const [flashcards, setFlashcards] = useState<any[]>([]);
  const [deckName, setDeckName] = useState("");
  const [isEditingName, setIsEditingName] = useState(false);
  const [newDeckName, setNewDeckName] = useState("");
  const supabase = createClientComponentClient();
  const router = useRouter();

  useEffect(() => {
    fetchDeckDetails();
    fetchFlashcards();
  }, []);

  const fetchDeckDetails = async () => {
    const { data, error } = await supabase
      .from('decks')
      .select('name')
      .eq('id', params.id)
      .single();

    if (error) {
      console.error('Error fetching deck details:', error);
      toast.error('Failed to load deck details');
    } else {
      setDeckName(data.name);
      setNewDeckName(data.name);
    }
  };

  const fetchFlashcards = async () => {
    const { data, error } = await supabase
      .from('flashcards')
      .select('*')
      .eq('deck_id', params.id);

    if (error) {
      console.error('Error fetching flashcards:', error);
      toast.error('Failed to load flashcards');
    } else {
      setFlashcards(data);
    }
  };

  const addFlashcard = async () => {
    if (front.trim() && back.trim()) {
      const { data, error } = await supabase
        .from('flashcards')
        .insert({ front: front.trim(), back: back.trim(), deck_id: params.id })
        .select()
        .single();

      if (error) {
        console.error('Error adding flashcard:', error);
        toast.error('Failed to add flashcard');
      } else {
        setFlashcards([...flashcards, data]);
        setFront("");
        setBack("");
        toast.success('Flashcard added successfully');
      }
    } else {
      toast.error("Please enter both front and back of the flashcard.");
    }
  };

  const updateDeckName = async () => {
    if (newDeckName.trim() && newDeckName !== deckName) {
      const { error } = await supabase
        .from('decks')
        .update({ name: newDeckName.trim() })
        .eq('id', params.id);

      if (error) {
        console.error('Error updating deck name:', error);
        toast.error('Failed to update deck name');
      } else {
        setDeckName(newDeckName.trim());
        setIsEditingName(false);
        toast.success('Deck name updated successfully');
      }
    } else {
      setIsEditingName(false);
      setNewDeckName(deckName);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-slate-200 pb-16">
      <div className="flex-grow overflow-auto px-2 py-4 pb-2">
        <div className="max-w-md mx-auto">
          <Button 
            onClick={() => router.back()} 
            className="mb-4"
            variant="outline"
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Go Back
          </Button>
          <MobileDock />
          <Card className="w-full mb-8">
            <CardHeader>
              <div className="flex items-center justify-between">
                {isEditingName ? (
                  <Input
                    value={newDeckName}
                    onChange={(e) => setNewDeckName(e.target.value)}
                    className="mr-2"
                  />
                ) : (
                  <CardTitle className="text-xl font-bold">Edit Deck: {deckName}</CardTitle>
                )}
                <Button
                  onClick={() => isEditingName ? updateDeckName() : setIsEditingName(true)}
                  variant="outline"
                  size="icon"
                >
                  {isEditingName ? <Check className="h-4 w-4" /> : <Edit className="h-4 w-4" />}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-4">
                <Input
                  type="text"
                  placeholder="Front (question)"
                  value={front}
                  onChange={(e) => setFront(e.target.value)}
                />
                <Textarea
                  placeholder="Back (answer)"
                  value={back}
                  onChange={(e) => setBack(e.target.value)}
                />
                <Button onClick={addFlashcard} className="w-full">
                  <Plus className="mr-2 h-4 w-4" /> Add Flashcard
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Flashcards in this Deck</CardTitle>
            </CardHeader>
            <CardContent>
              {flashcards.length > 0 ? (
                <ul className="space-y-2">
                  {flashcards.map((card) => (
                    <li key={card.id} className="border-b pb-2">
                      <p className="font-medium">Front: {card.front}</p>
                      <p className="text-sm text-muted-foreground">Back: {card.back}</p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-center text-muted-foreground">No flashcards in this deck yet</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      <Toaster />
    </div>
  );
}