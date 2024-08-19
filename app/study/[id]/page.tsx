"use client";

import { useState, useEffect } from "react";
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Flag, Eye, Pause, Play, Timer, X } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useRouter } from "next/navigation";
import { updateStats } from '@/app/utils/studyUtils';
import { toast } from "sonner";

interface Flashcard {
  id: string;
  front: string;
  back: string;
}

export default function StudyPage({ params }: { params: { id: string } }) {
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [flaggedItems, setFlaggedItems] = useState<string[]>([]);
  const [cardsStudied, setCardsStudied] = useState(0);
  const [studyTime, setStudyTime] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [time, setTime] = useState(0);
  const [loading, setLoading] = useState(true);
  const [deckName, setDeckName] = useState("");

  const router = useRouter();
  const supabase = createClientComponentClient();

  useEffect(() => {
    fetchFlashcards();
  }, []);

  const fetchFlashcards = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: deckData, error: deckError } = await supabase
        .from('decks')
        .select('name')
        .eq('id', params.id)
        .single();

      if (deckError) {
        console.error('Error fetching deck:', deckError);
        toast.error('Failed to load deck');
        return;
      }

      setDeckName(deckData.name);

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
    }
    setLoading(false);
  };

  const currentCard = flashcards[currentCardIndex];

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handlePause = () => {
    setIsPaused((prev) => !prev);
  };

  const toggleAnswer = () => {
    if (!showAnswer) {
      setShowAnswer(true);
    }
  };

  const handleNextCard = () => {
    setCurrentCardIndex((prevIndex) => (prevIndex + 1) % flashcards.length);
    setShowAnswer(false);
    setCardsStudied((prev) => prev + 1);
  };

  const toggleFlag = () => {
    setFlaggedItems((prev) =>
      prev.includes(currentCard.id)
        ? prev.filter((id) => id !== currentCard.id)
        : [...prev, currentCard.id]
    );
  };

  const handleDifficulty = (difficulty: string) => {
    console.log(`Card marked as ${difficulty}`);
    handleNextCard();
  };

  const handleFinishStudy = async () => {
    try {
      await updateStats(cardsStudied, studyTime);
      toast.success("Study session stats updated successfully!");
      // Additional logic for finishing the study session
      router.push('/study?sessionEnded=true');
    } catch (error) {
      toast.error("Failed to update study stats");
      console.error(error);
    }
  };

  if (loading) {
    return <div>Loading flashcards...</div>;
  }

  if (flashcards.length === 0) {
    return (
      <div className="container mx-auto p-4 bg-slate-200 min-h-screen pb-16">
        <Card className="mb-4">
          <CardContent className="text-center p-4">
            <h1 className="text-2xl font-bold">No Flashcards Yet</h1>
            <p>This deck doesn&apos;t have any flashcards. Add some to start studying!</p>
            <Button onClick={() => router.push(`/edit-deck/${params.id}`)} className="mt-4">
              Add Flashcards
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 bg-slate-200 min-h-screen pb-16">
      <Card className="mb-4">
        <CardContent className="text-center p-4">
          <h1 className="text-2xl font-bold">Studying: {deckName}</h1>
        </CardContent>
      </Card>{" "}
      <Progress
        value={(currentCardIndex / flashcards.length) * 100}
        className="mb-4"
      />
      <Card className="mb-4">
        <CardContent className="text-center text-2xl p-8">
          {showAnswer ? currentCard.back : currentCard.front}
        </CardContent>
      </Card>
      <div className="flex flex-col items-center mb-4">
        {!showAnswer ? (
          <Button onClick={toggleAnswer} variant="outline" className="mx-auto">
            <Eye className="mr-2 h-4 w-4" />
            Show Answer
          </Button>
        ) : (
          <div className="flex justify-between w-full">
            <Button onClick={() => handleDifficulty("Easy")} variant="outline">
              Easy
            </Button>
            <Button onClick={() => handleDifficulty("Good")} variant="outline">
              Good
            </Button>
            <Button onClick={() => handleDifficulty("Hard")} variant="outline">
              Hard
            </Button>
            <div className="flex justify-end">
              <Button onClick={toggleFlag} variant="outline">
                <Flag className="mr-2" />
                {flaggedItems.includes(currentCard.id) ? "Unmark" : "Mark"}
              </Button>
            </div>
          </div>
        )}
      </div>
      <div className="mt-8">
        <h2 className="text-xl font-bold mb-2">Marked Items</h2>
        <ul>
          {flaggedItems.map((id) => (
            <li key={id}>Item {id}</li>
          ))}
        </ul>
      </div>
      <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border p-4">
  <div className="flex justify-between items-center max-w-screen-xl mx-auto">
    <Button variant="ghost" size="icon" onClick={() => setIsPaused(!isPaused)}>
      {isPaused ? <Play className="h-6 w-6" /> : <Pause className="h-6 w-6" />}
    </Button>
    <div className="flex items-center">
      <Timer className="h-6 w-6 mr-2" />
      {formatTime(time)}
    </div>
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <X className="h-6 w-6" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="p-6">
  <AlertDialogHeader>
    <AlertDialogTitle>End this study session?</AlertDialogTitle>
    <AlertDialogDescription>
      Your progress will be saved, but you&apos;ll exit the current session.
    </AlertDialogDescription>
  </AlertDialogHeader>
  <AlertDialogFooter className="flex justify-between">
    <AlertDialogCancel>Cancel</AlertDialogCancel>
    <AlertDialogAction
      onClick={handleFinishStudy}
    >
      End Session
    </AlertDialogAction>
  </AlertDialogFooter>
</AlertDialogContent>

    </AlertDialog>
  </div>
</div>
    </div>
  );
}