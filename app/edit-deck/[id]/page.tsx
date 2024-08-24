"use client";

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, ArrowLeft, Edit, Check, Trash2, Search } from "lucide-react";
import { MobileDock } from '@/components/MobileDock';
import { Toaster } from "@/components/ui/sonner"
import { toast } from "sonner"
import { useRouter } from 'next/navigation';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

export default function EditDeckPage({ params }: { params: { id: string } }) {
  const [front, setFront] = useState("");
  const [back, setBack] = useState("");
  const [flashcards, setFlashcards] = useState<any[]>([]);
  const [deckName, setDeckName] = useState("");
  const [isEditingName, setIsEditingName] = useState(false);
  const [newDeckName, setNewDeckName] = useState("");
  const supabase = createClientComponentClient();
  const router = useRouter();

  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingCardId, setEditingCardId] = useState<string | null>(null);
  const [editFront, setEditFront] = useState("");
  const [editBack, setEditBack] = useState("");
  const [description, setDescription] = useState("");
  const [editDescription, setEditDescription] = useState("");

  const cardsPerPage = 5;

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
        .insert({ front: front.trim(), back: back.trim(), description: description.trim(), deck_id: params.id })
        .select()
        .single();

      if (error) {
        console.error('Error adding flashcard:', error);
        toast.error('Failed to add flashcard');
      } else {
        setFlashcards([...flashcards, data]);
        setFront("");
        setBack("");
        setDescription("");
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

  const filteredFlashcards = flashcards.filter(card =>
    card.front.toLowerCase().includes(searchTerm.toLowerCase()) ||
    card.back.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const indexOfLastCard = currentPage * cardsPerPage;
  const indexOfFirstCard = indexOfLastCard - cardsPerPage;
  const currentCards = filteredFlashcards.slice(indexOfFirstCard, indexOfLastCard);

  const totalPages = Math.ceil(filteredFlashcards.length / cardsPerPage);

  const deleteFlashcard = async (id: string) => {
    const { error } = await supabase
      .from('flashcards')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting flashcard:', error);
      toast.error('Failed to delete flashcard');
    } else {
      setFlashcards(flashcards.filter(card => card.id !== id));
      toast.success('Flashcard deleted successfully');
    }
  };

  const startEditingCard = (card: any) => {
    setEditingCardId(card.id);
    setEditFront(card.front);
    setEditBack(card.back);
    setEditDescription(card.description || "");
  };

  const updateFlashcard = async () => {
    if (editingCardId && editFront.trim() && editBack.trim()) {
      const { error } = await supabase
        .from('flashcards')
        .update({
          front: editFront.trim(),
          back: editBack.trim(),
          notes: editDescription.trim(),
        })
        .eq('id', editingCardId);

      if (error) {
        console.error('Error updating flashcard:', error);
        toast.error('Failed to update flashcard');
      } else {
        setFlashcards(flashcards.map(card =>
          card.id === editingCardId ? {
            ...card,
            front: editFront.trim(),
            back: editBack.trim(),
            notes: editDescription.trim(),
          } : card
        ));
        setEditingCardId(null);
        toast.success('Flashcard updated successfully');
      }
    }
  };

  const deleteDeck = async () => {
    const confirmDelete = window.confirm("Are you sure you want to delete this deck? This action cannot be undone.");
    if (confirmDelete) {
      const { error } = await supabase
        .from('decks')
        .delete()
        .eq('id', params.id);

      if (error) {
        console.error('Error deleting deck:', error);
        toast.error('Failed to delete deck');
      } else {
        toast.success('Deck deleted successfully');
        router.push('/decks'); // Redirect to the decks list page
      }
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
                <Textarea
                  placeholder="Notes (optional)"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
                <Button onClick={addFlashcard} className="w-full">
                  <Plus className="mr-2 h-4 w-4" /> Add Flashcard
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="mb-4">
            <CardHeader>
              <CardTitle className="text-xl">Flashcards in this Deck</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4 relative">
                <Input
                  type="text"
                  placeholder="Search flashcards..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10"
                />
                <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>
              {currentCards.length > 0 ? (
                <ul className="space-y-4">
                  {currentCards.map((card) => (
                    <li key={card.id} className="border p-4 rounded-md">
                      {editingCardId === card.id ? (
                        <div className="space-y-2">
                          <Input
                            value={editFront}
                            onChange={(e) => setEditFront(e.target.value)}
                            placeholder="Front (question)"
                          />
                          <Textarea
                            value={editBack}
                            onChange={(e) => setEditBack(e.target.value)}
                            placeholder="Back (answer)"
                          />
                          <Textarea
                            value={editDescription}
                            onChange={(e) => setEditDescription(e.target.value)}
                            placeholder="Notes (optional)"
                          />
                          <div className="flex justify-end space-x-2">
                            <Button onClick={() => setEditingCardId(null)} variant="outline" size="sm">Cancel</Button>
                            <Button onClick={updateFlashcard} size="sm">Save</Button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium mb-2">Front: {card.front}</p>
                            <p className="text-sm text-muted-foreground mb-2">Back: {card.back}</p>
                            {card.description && (
                              <p className="text-xs text-muted-foreground">Notes: {card.description}</p>
                            )}
                          </div>
                          <div className="flex space-x-2 ml-2">
                            <Button onClick={() => startEditingCard(card)} variant="outline" size="icon" className="h-8 w-8">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button onClick={() => deleteFlashcard(card.id)} variant="destructive" size="icon" className="h-8 w-8">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              ) : (                <p className="text-center text-muted-foreground">No flashcards found</p>
              )}
              {totalPages > 1 && (
                <div className="flex justify-center mt-4 space-x-2">
                  <Button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    variant="outline"
                  >
                    Previous
                  </Button>
                  <span className="self-center">{currentPage} of {totalPages}</span>
                  <Button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    variant="outline"
                  >
                    Next
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" className="w-full mt-4">
                    <Trash2 className="mr-2 h-4 w-4" /> Delete Deck
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete your deck and all its flashcards.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={deleteDeck}>Delete</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
        </div>
      </div>
      <Toaster />
    </div>
  );
}