"use client";
import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Save } from "lucide-react";
import { MobileDock } from '@/components/MobileDock';
import { Toaster } from "@/components/ui/sonner"
import { toast } from "sonner"
import { useRouter } from 'next/navigation';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Trash2 } from "lucide-react";

interface Flashcard {
  id: string;
  front: string;
  back: string;
  notes: string;
  deck_id: string;
}

export default function EditFlashcardPage({ params }: { params: { id: string } }) {
  const [flashcard, setFlashcard] = useState<Flashcard | null>(null);
  const supabase = createClientComponentClient();
  const router = useRouter();

  useEffect(() => {
    fetchFlashcard();
  }, [params.id]);

  const fetchFlashcard = async () => {
    const { data, error } = await supabase
      .from('flashcards')
      .select('*')
      .eq('id', params.id)
      .single();

    if (error) {
      console.error('Error fetching flashcard:', error);
      toast.error('Failed to load flashcard');
    } else {
      setFlashcard(data);
    }
  };

  const deleteFlashcard = async () => {
    if (!flashcard) return;

    const { error } = await supabase
      .from('flashcards')
      .delete()
      .eq('id', flashcard.id);
  
    if (error) {
      console.error('Error deleting flashcard:', error);
      toast.error('Failed to delete flashcard');
    } else {
      toast.success('Flashcard deleted successfully');
      router.push(`/edit-deck/${flashcard.deck_id}`);
    }
  };  

  const updateFlashcard = async () => {
    if (!flashcard) return;

    const { error } = await supabase
      .from('flashcards')
      .update({
        front: flashcard.front,
        back: flashcard.back,
        notes: flashcard.notes
      })
      .eq('id', flashcard.id);

    if (error) {
      console.error('Error updating flashcard:', error);
      toast.error('Failed to update flashcard');
    } else {
      toast.success('Flashcard updated successfully');
      router.push(`/edit-deck/${flashcard.deck_id}`);
    }
  };

  if (!flashcard) return <div>Loading...</div>;

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
              <CardTitle className="text-xl font-bold">Edit Flashcard</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-4">
                <Input
                  type="text"
                  placeholder="Front (question)"
                  value={flashcard.front}
                  onChange={(e) => setFlashcard({...flashcard, front: e.target.value})}
                  className="dark:bg-gray-700"
                />
                <Textarea
                  placeholder="Back (answer)"
                  value={flashcard.back}
                  onChange={(e) => setFlashcard({...flashcard, back: e.target.value})}
                  className="dark:bg-gray-700"
                />
                <Textarea
                  placeholder="Additional notes (optional)"
                  value={flashcard.notes}
                  onChange={(e) => setFlashcard({...flashcard, notes: e.target.value})}
                  className="dark:bg-gray-700"
                />
                <Button onClick={updateFlashcard} className="w-full dark:bg-gray-700 dark:text-white">
                  <Save className="mr-2 h-4 w-4" /> Save Changes
                </Button>
              </div>
              <AlertDialog>
  <AlertDialogTrigger asChild>
    <Button variant="destructive" className="w-full mt-4">
      <Trash2 className="mr-2 h-4 w-4" /> Delete Flashcard
    </Button>
  </AlertDialogTrigger>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
      <AlertDialogDescription>
        This action cannot be undone. This will permanently delete your flashcard.
      </AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel>Cancel</AlertDialogCancel>
      <AlertDialogAction onClick={deleteFlashcard}>Delete</AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>

            </CardContent>
          </Card>
        </div>
      </div>
      <Toaster />
    </div>
  );
}