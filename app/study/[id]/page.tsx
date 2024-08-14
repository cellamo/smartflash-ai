"use client";


import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Flag, Eye } from "lucide-react";
import { Pause, Play, Timer, X } from "lucide-react";
import React, { useState, useEffect } from "react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useRouter } from "next/navigation";

interface Flashcard {
  id: number;
  question: string;
  answer: string;
}

const mockFlashcards: Flashcard[] = [
  { id: 1, question: "What is the capital of France?", answer: "Paris" },
  {
    id: 2,
    question: "Who painted the Mona Lisa?",
    answer: "Leonardo da Vinci",
  },
  {
    id: 3,
    question: "What is the largest planet in our solar system?",
    answer: "Jupiter",
  },
];

export default function StudyPage() {
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [flaggedItems, setFlaggedItems] = useState<number[]>([]);

  const router = useRouter();

  const currentCard = mockFlashcards[currentCardIndex];
  const deckName = "World Geography"; // This could be dynamically fetched based on the deck ID

  const [isPaused, setIsPaused] = useState(false);
const [time, setTime] = useState(0);

useEffect(() => {
    let interval: NodeJS.Timeout;
    if (!isPaused) {
      interval = setInterval(() => {
        setTime((prevTime) => prevTime + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPaused]);
  
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
    setCurrentCardIndex((prevIndex) => (prevIndex + 1) % mockFlashcards.length);
    setShowAnswer(false);
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

  return (
    <div className="container mx-auto p-4 bg-slate-200 min-h-screen">
      <Card className="mb-4">
        <CardContent className="text-center p-4">
          <h1 className="text-2xl font-bold">Studying: {deckName}</h1>
        </CardContent>
      </Card>{" "}
      <Progress
        value={(currentCardIndex / mockFlashcards.length) * 100}
        className="mb-4"
      />
      <Card className="mb-4">
        <CardContent className="text-center text-2xl p-8">
          {showAnswer ? currentCard.answer : currentCard.question}
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
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>End this study session?</AlertDialogTitle>
          <AlertDialogDescription>
            Your progress will be saved, but you&apos;ll exit the current session.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={() => {
  // Save the session data
  const sessionData = {
    deckId: deckName,
    duration: time,
    cardsStudied: currentCardIndex + 1,
    // Add any other relevant data
  };

  // Here you would typically send this data to your backend
  // For now, we'll just log it
  console.log('Saving session data:', sessionData);

  // Navigate back to the study page
  router.push('/study?sessionEnded=true');
}}>
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
