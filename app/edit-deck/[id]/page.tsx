"use client";
import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, ArrowLeft, Edit, Check, Search, ChevronLeft, ChevronRight, Trash2 } from "lucide-react";
import { MobileDock } from '@/components/MobileDock';
import { Toaster } from "@/components/ui/sonner"
import { toast } from "sonner"
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Deck {
  id: string;
  name: string;
  description: string;
  card_count: number;
  last_studied: string | null;
  created_at: string;
}

export default function EditDeckPage({ params }: { params: { id: string } }) {
  const [front, setFront] = useState("");
  const [back, setBack] = useState("");
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);

  const [isEditingName, setIsEditingName] = useState(false);
  const [newDeckName, setNewDeckName] = useState("");

  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [newDeckDescription, setNewDeckDescription] = useState("");

  const [notes, setNotes] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const cardsPerPage = 5;
  const supabase = createClientComponentClient();
  const router = useRouter();
  const [deck, setDeck] = useState<Deck>({
    id: "",
    name: "",
    description: "",
    card_count: 0,
    last_studied: null,
    created_at: ""
  });

  useEffect(() => {
    fetchDeckDetails();
    fetchFlashcards();
  }, [params.id]);

  const fetchDeckDetails = async () => {
    const { data, error } = await supabase
      .from('decks')
      .select('id,name,description,created_at,card_count,last_studied')
      .eq('id', params.id)
      .single();

    if (error) {
      console.error('Error fetching deck details:', error);
      toast.error('Failed to load deck details');
    } else if (data) {
      setDeck({
        id: data.id,
        name: data.name,
        description: data.description,
        created_at: data.created_at,
        card_count: data.card_count ?? 0,
        last_studied: data.last_studied ?? null
      });
      setNewDeckName(data.name);
      setNewDeckDescription(data.description);
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
        .insert({
          front: front.trim(),
          back: back.trim(),
          notes: notes.trim(),
          deck_id: params.id,
          created_at: new Date().toISOString(),
          last_reviewed: null,
          review_count: 0,
          ease_factor: 2.5,
          interval: 0,
          due_date: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        console.error('Error adding flashcard:', error);
        toast.error('Failed to add flashcard');
      } else {
        setFlashcards([...flashcards, data]);
        setFront("");
        setBack("");
        setNotes("");
        toast.success('Flashcard added successfully');
      }
    } else {
      toast.error("Please enter both front and back of the flashcard.");
    }
  };

  const updateDeckName = async () => {
    if (newDeckName.trim() && newDeckName !== deck.name) {
      const { error } = await supabase
        .from('decks')
        .update({ name: newDeckName.trim() })
        .eq('id', params.id);

      if (error) {
        console.error('Error updating deck name:', error);
        toast.error('Failed to update deck name');
      } else {
        setDeck({ ...deck, name: newDeckName.trim() });
        setIsEditingName(false);
        toast.success('Deck name updated successfully');
      }
    } else {
      setIsEditingName(false);
      setNewDeckName(deck.name);
    }
  };

  const updateDeckDescription = async () => {
    if (newDeckDescription.trim() && newDeckDescription !== deck.description) {
      const { error } = await supabase
        .from('decks')
        .update({ description: newDeckDescription.trim() })
        .eq('id', params.id);

      if (error) {
        console.error('Error updating deck description:', error);
        toast.error('Failed to update deck description');
      } else {
        setDeck({ ...deck, description: newDeckDescription.trim() });
        setIsEditingDescription(false);
        toast.success('Deck description updated successfully');
      }
    } else {
      setIsEditingDescription(false);
      setNewDeckDescription(deck.description);
    }
  };

  const deleteDeck = async () => {
    toast.custom((t) => (
      <Card>
        <CardHeader>
          <CardTitle>Confirm Deletion</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Are you sure you want to delete this deck? This action cannot be undone.</p>
          <div className="flex justify-end space-x-2 mt-4">
            <Button variant="outline" onClick={() => toast.dismiss(t)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={() => confirmDelete(t)}>
              Delete
            </Button>
          </div>
        </CardContent>
      </Card>
    ), { duration: 5000 });
  };

  const confirmDelete = async (t: any) => {
    const { error } = await supabase
      .from('decks')
      .delete()
      .eq('id', params.id);
    if (error) {
      console.error('Error deleting deck:', error);
      toast.error('Failed to delete deck');
    } else {
      toast.success('Deck deleted successfully');
      router.push('/'); // Redirect to home or another appropriate page
    }
    toast.dismiss(t);
  };

  const deleteFlashcard = (flashcardId: string) => {
    toast.custom((t) => (
      <Card>
        <CardHeader>
          <CardTitle>Confirm Deletion</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Are you sure you want to delete this flashcard?</p>
          <div className="flex justify-end space-x-2 mt-4">
            <Button variant="outline" onClick={() => toast.dismiss(t)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={() => confirmDeleteFlashcard(flashcardId, t)}>
              Delete
            </Button>
          </div>
        </CardContent>
      </Card>
    ), { duration: 5000 });
  };

  const confirmDeleteFlashcard = async (flashcardId: string, t: any) => {
    const { error } = await supabase
      .from('flashcards')
      .delete()
      .eq('id', flashcardId);

    if (error) {
      console.error('Error deleting flashcard:', error);
      toast.error('Failed to delete flashcard');
    } else {
      setFlashcards(flashcards.filter(card => card.id !== flashcardId));
      toast.success('Flashcard deleted successfully');
    }
    toast.dismiss(t);
  };


  const filteredFlashcards = flashcards.filter(card =>
    card.front.toLowerCase().includes(searchTerm.toLowerCase()) ||
    card.back.toLowerCase().includes(searchTerm.toLowerCase()) ||
    card.notes?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const indexOfLastCard = currentPage * cardsPerPage;
  const indexOfFirstCard = indexOfLastCard - cardsPerPage;
  const currentCards = filteredFlashcards.slice(indexOfFirstCard, indexOfLastCard);

  const totalPages = Math.ceil(filteredFlashcards.length / cardsPerPage);

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
          <MobileDock />
          <Card className="w-full mb-8">
            <CardHeader>
              <div className="flex items-center justify-between">
                {isEditingName ? (
                  <Input
                    value={newDeckName}
                    onChange={(e) => setNewDeckName(e.target.value)}
                    className="mr-2 dark:bg-gray-700 dark:text-white"
                  />
                ) : (
                  <CardTitle className="text-xl font-bold">Edit Deck: {deck.name}</CardTitle>
                )}
                <Button
                  onClick={() => isEditingName ? updateDeckName() : setIsEditingName(true)}
                  variant="outline"
                  size="icon"
                >
                  {isEditingName ? <Check className="h-4 w-4" /> : <Edit className="h-4 w-4" />}
                </Button>
              </div>
              <CardDescription className="text-sm text-muted-foreground mb-4 dark:text-gray-400 flex items-center justify-between">
                {isEditingDescription ? (
                  <Input
                    value={newDeckDescription}
                    onChange={(e) => setNewDeckDescription(e.target.value)}
                    className="mr-2 dark:bg-gray-700 dark:text-white"
                  />
                ) : (
                  deck.description || <span className="italic text-gray-500">No description available</span>
                )}
                <Button
                  onClick={() => isEditingDescription ? updateDeckDescription() : setIsEditingDescription(true)}
                  variant="outline"
                  size="icon"
                >
                  {isEditingDescription ? <Check className="h-4 w-4" /> : <Edit className="h-4 w-4" />}
                </Button>
              </CardDescription>
              <CardDescription className="text-sm text-muted-foreground mb-4 dark:text-gray-400">
                {flashcards.length} cards • Created {new Date(deck.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '.')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-4">
                <Input
                  type="text"
                  placeholder="Front (question)"
                  value={front}
                  onChange={(e) => setFront(e.target.value)}
                  className="dark:bg-gray-700 dark:text-white"
                />
                <Textarea
                  placeholder="Back (answer)"
                  value={back}
                  onChange={(e) => setBack(e.target.value)}
                  className="dark:bg-gray-700 dark:text-white"
                />
                <Textarea
                  placeholder="Additional notes (optional)"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="dark:bg-gray-700 dark:text-white"
                />
                <Button onClick={addFlashcard} className="w-full dark:bg-gray-700 dark:text-white">
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
              <div className="mb-4 relative">
                <Input
                  type="text"
                  placeholder="Search flashcards..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 dark:bg-gray-700 dark:text-white"
                />
                <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>
              {currentCards.length > 0 ? (
                <ul className="space-y-2">
                  {currentCards.map((card) => (
                    <li key={card.id} className="border-b pb-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">Front: {card.front}</p>
                          <p className="text-sm text-muted-foreground">Back: {card.back}</p>
                          {card.notes && (
                            <p className="text-xs text-muted-foreground mt-1">Notes: {card.notes}</p>
                          )}
                        </div>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm" onClick={() => deleteFlashcard(card.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                          <Link href={`/edit-flashcard/${card.id}`}>
                            <Button variant="outline" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (<p className="text-center text-muted-foreground">No flashcards found</p>
              )}
              <div className="flex justify-between items-center mt-4">
                <Button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  variant="outline"
                  size="sm"
                >
                  <ChevronLeft className="h-4 w-4 mr-2" /> Previous
                </Button>
                <span className="text-sm text-muted-foreground">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  variant="outline"
                  size="sm"
                >
                  Next <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="px-2 py-4">
          <Button
            onClick={deleteDeck}
            className="w-full"
            variant="destructive"
          >
            Delete Deck
          </Button>
        </div>
      </div>

      <Toaster />
    </div>
  );
}

interface Flashcard {
  id: string;
  front: string;
  back: string;
  deck_id: string;
  notes: string;
  created_at: string;
  last_reviewed: string | null;
  review_count: number;
  ease_factor: number;
  interval: number;
  due_date: string;
}
