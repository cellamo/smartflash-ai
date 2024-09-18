Implementing a Spaced Repetition algorithm in your SmartFlash AI application will significantly enhance the learning experience by optimizing the review schedules of flashcards based on user performance. Below is a comprehensive implementation guide tailored to your existing codebase and technologies, including TypeScript, Next.js App Router, Supabase, and Tailwind CSS.

Table of Contents
Understanding Spaced Repetition
Choosing the Right Algorithm
Database Schema Enhancements
Backend Implementation
4.1. Scheduling Next Review
4.2. Fetching Due Flashcards
4.3. Recording User Responses
Frontend Integration
5.1. Displaying Due Flashcards
5.2. Handling User Feedback
Optimizing Performance
Testing and Validation
Additional Features
1. Understanding Spaced Repetition
Spaced Repetition is a learning technique that schedules reviews of information at increasing intervals to exploit the psychological spacing effect. This method helps in transferring knowledge from short-term to long-term memory efficiently.

2. Choosing the Right Algorithm
Several algorithms implement spaced repetition. The most widely used is the SM-2 Algorithm, developed for the SuperMemo application. It updates the review interval based on user performance (quality of recall).

SM-2 Algorithm Overview
Quality of Response (Q): Rate your recall quality on a scale from 0 to 5.

5: Perfect response
4: Correct response after a hesitation
3: Correct response with difficulty
2: Incorrect response; correct one remembered
1: Incorrect response; correct one not remembered
0: Complete blackout
Parameters:

EF (Ease Factor): Determines how easy the item is. Initialized at 2.5.
Interval (I): Time until the next review.
Repetitions (n): Number of consecutive correct responses.
Scheduling Logic:

If Q < 3: Reset repetitions, set interval to 1.
If Q ≥ 3:
If n == 1: I = 1
If n == 2: I = 6
If n > 2: I = I * EF
Update EF: EF' = EF + (0.1 - (5 - Q) * (0.08 + (5 - Q) * 0.02))
Ensure EF is at least 1.3.
3. Database Schema Enhancements
Based on the supabase-info.md, your flashcards table already contains fields pertinent to the SM-2 algorithm:

ease_factor: Number (Initialized to 2.5)
interval: Number (Days until next review)
due_date: Date (Next review date)
review_count: Number (Track number of times reviewed)
Additional Considerations:
repetitions: Number (Track consecutive successes)
Updated Flashcards Table Schema
5. flashcards

    • Stores the flashcards within each deck.
    • Columns:
    • id: Primary key.
    • deck_id: References decks.id.
    • front, back, notes: Content of the flashcard.
    • created_at, last_reviewed, review_count: Metadata about the flashcard.
    • ease_factor, interval, due_date: Spaced repetition algorithm parameters.
    • repetitions: Integer, number of consecutive correct responses.

Copy

Apply

Note: If repetitions is not present, consider adding it.

4. Backend Implementation
4.1. Scheduling Next Review
Implement the SM-2 algorithm logic to calculate the next review date (due_date) and update ease_factor and interval.

Create a Utility Function:

// app/utils/spacedRepetition.ts

export interface Flashcard {
  id: string;
  ease_factor: number;
  interval: number;
  due_date: string; // ISO Date string
  review_count: number;
  repetitions: number;
}

export function calculateNextReview(flashcard: Flashcard, quality: number): Partial<Flashcard> {
  let { ease_factor, interval, repetitions } = flashcard;

  // Update ease factor
  ease_factor = ease_factor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  if (ease_factor < 1.3) ease_factor = 1.3;

  let newInterval: number;

  if (quality < 3) {
    repetitions = 0;
    newInterval = 1;
  } else {
    repetitions += 1;
    if (repetitions === 1) {
      newInterval = 1;
    } else if (repetitions === 2) {
      newInterval = 6;
    } else {
      newInterval = Math.round(interval * ease_factor);
    }
  }

  const due_date = new Date();
  due_date.setDate(due_date.getDate() + newInterval);

  return {
    ease_factor,
    interval: newInterval,
    due_date: due_date.toISOString(),
    review_count: flashcard.review_count + 1,
    repetitions,
  };
}

Copy

Apply

4.2. Fetching Due Flashcards
Create a server-side API route to fetch flashcards that are due for review.

// app/api/get-due-flashcards.ts

import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const supabase = createRouteHandlerClient({ cookies: request.headers.get('cookie') });

  const { data: user, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

  const { data: flashcards, error } = await supabase
    .from('flashcards')
    .select('*')
    .eq('user_id', user.id) // Assuming flashcards have a user_id field. If not, derive from deck's user_id.
    .lte('due_date', today);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ flashcards });
}

Copy

Apply

File Path in Code Block:

4.3. Recording User Responses
After the user reviews a flashcard, record their response and update the flashcard's scheduling parameters.

Create an API Route to Update Flashcard:

// app/api/update-flashcard.ts

import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import { calculateNextReview, Flashcard } from '@/app/utils/spacedRepetition';

export async function POST(request: Request) {
  const supabase = createRouteHandlerClient({ cookies: request.headers.get('cookie') });
  
  const { flashcardId, quality }: { flashcardId: string; quality: number } = await request.json();
  
  const { data: user, error: userError } = await supabase.auth.getUser();
  
  if (userError || !user) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }
  
  // Fetch current flashcard state
  const { data: flashcard, error: fetchError } = await supabase
    .from('flashcards')
    .select('*')
    .eq('id', flashcardId)
    .single();
  
  if (fetchError || !flashcard) {
    return NextResponse.json({ error: 'Flashcard not found' }, { status: 404 });
  }
  
  // Calculate next review parameters
  const updatedFields = calculateNextReview(flashcard, quality);
  
  // Update flashcard in the database
  const { error: updateError } = await supabase
    .from('flashcards')
    .update(updatedFields)
    .eq('id', flashcardId);
  
  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }
  
  return NextResponse.json({ message: 'Flashcard updated successfully', updatedFields });
}

Copy

Apply

File Path in Code Block:

5. Frontend Integration
5.1. Displaying Due Flashcards
Modify your study pages to fetch and display only the due flashcards. Here's how you can integrate the API routes into your app/study/[id]/page.tsx.

Updated app/study/[id]/page.tsx:

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
import styles from '@/app/styles/markdown.module.css';
import { calculateNextReview } from '@/app/utils/spacedRepetition';

interface Flashcard {
  id: string;
  front: string;
  back: string;
  notes: string;
  ease_factor: number;
  interval: number;
  due_date: string;
  review_count: number;
  repetitions: number;
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
  const [correctReviews, setCorrectReviews] = useState(0);
  const [isSessionComplete, setIsSessionComplete] = useState(false);

  const router = useRouter();
  const supabase = createClientComponentClient();

  useEffect(() => {
    fetchDeckAndFlashcards();
  }, [params.id]);

  useEffect(() => {
    if (!isPaused) {
      const timer = setInterval(() => {
        setTime(prev => prev + 1);
        setStudyTime(prev => prev + 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [isPaused]);

  const fetchDeckAndFlashcards = async () => {
    setLoading(true);
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (user) {
      // Fetch deck name
      const { data: deckData, error: deckError } = await supabase
        .from('decks')
        .select('name')
        .eq('id', params.id)
        .single();

      if (deckError) {
        console.error('Error fetching deck:', deckError);
        toast.error('Failed to load deck');
      } else {
        setDeckName(deckData.name);
      }

      // Fetch due flashcards
      const response = await fetch('/api/get-due-flashcards', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const { flashcards, error } = await response.json();

      if (error) {
        console.error('Error fetching due flashcards:', error);
        toast.error('Failed to load flashcards');
      } else {
        // Filter flashcards belonging to the current deck
        const deckFlashcards = flashcards.filter((fc: Flashcard) => fc.deck_id === params.id);
        setFlashcards(deckFlashcards);
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
    setIsPaused(prev => !prev);
  };

  const toggleAnswer = () => {
    if (!showAnswer) {
      setShowAnswer(true);
    }
  };

  const handleNextCard = async () => {
    const difficulty = "default"; // Replace with actual difficulty based on user input
    const quality = mapDifficultyToQuality(difficulty);

    // Update flashcard in the backend
    await updateFlashcardReview(currentCard.id, quality);

    const nextIndex = (currentCardIndex + 1) % flashcards.length;
    setCurrentCardIndex(nextIndex);
    setShowAnswer(false);
    setCardsStudied(prev => prev + 1);

    if (nextIndex === 0) {
      setIsSessionComplete(true);
    }
  };

  const mapDifficultyToQuality = (difficulty: string): number => {
    switch (difficulty) {
      case "Easy":
        return 5;
      case "Good":
        return 4;
      case "Hard":
        return 3;
      case "Again":
        return 2;
      default:
        return 3;
    }
  };

  const updateFlashcardReview = async (flashcardId: string, quality: number) => {
    const response = await fetch('/api/update-flashcard', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ flashcardId, quality }),
    });

    const { error, updatedFields } = await response.json();

    if (error) {
      console.error('Error updating flashcard:', error);
      toast.error('Failed to update flashcard');
    } else {
      setFlashcards(prev =>
        prev.map(fc => fc.id === flashcardId ? { ...fc, ...updatedFields } : fc)
      );
    }
  };

  const toggleFlag = () => {
    setFlaggedItems(prev =>
      prev.includes(currentCard.id)
        ? prev.filter((id) => id !== currentCard.id)
        : [...prev, currentCard.id]
    );
  };

  const handleFinishStudy = async () => {
    try {
      await updateStats(cardsStudied, studyTime, correctReviews, params.id);
      toast.success("Study session stats updated successfully!");
      router.push('/study?sessionEnded=true');
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("An unknown error occurred");
      }
      console.error(error);
    }
  };

  if (loading) {
    return <div>Loading flashcards...</div>;
  }

  if (flashcards.length === 0) {
    return (
      <div className="container mx-auto p-4 bg-slate-200 dark:bg-slate-900 min-h-screen pb-16">
        <Card className="mb-4">
          <CardContent className="text-center p-4">
            <h1 className="text-2xl font-bold">No Flashcards Due</h1>
            <p>Great job! You have no flashcards to review today. Come back tomorrow to continue learning.</p>
            <Button onClick={() => router.push('/study')} className="mt-4 dark:bg-gray-700 dark:text-white">
              Or, go back to your decks
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isSessionComplete) {
    return (
      <div className="container mx-auto p-4 bg-slate-200 dark:bg-slate-900 min-h-screen pb-16">
        <Card className="mb-4">
          <CardContent className="text-center p-4">
            <h1 className="text-2xl font-bold mb-4">Study Session Complete!</h1>
            <p className="mb-4">You&apos;ve reviewed all the due cards in this deck.</p>
            <Button onClick={handleFinishStudy} className="mt-4 dark:bg-gray-700 dark:text-white">
              End Session
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 bg-slate-200 dark:bg-slate-900 min-h-screen pb-16">
      <Card className="mb-4">
        <CardContent className="text-center p-4">
          <h1 className="text-2xl font-bold">Studying: {deckName}</h1>
        </CardContent>
      </Card>
      <Progress
        value={(currentCardIndex / flashcards.length) * 100}
        className="mb-4 dark:bg-gray-700"
      />
      <Card className="mb-4">
        <CardContent className="text-center p-8">
          {showAnswer ? (
            <div>
              <pre className={`text-left whitespace-pre-wrap break-words ${styles.flashcardContent}`}>
                {currentCard.back}
              </pre>
              {currentCard.notes && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-4 italic">{currentCard.notes}</p>
              )}
              <Button onClick={() => setShowAnswer(false)} variant="outline" className="mt-4 dark:bg-gray-700 dark:text-white">
                <Eye className="mr-2 h-4 w-4" />
                Hide Answer
              </Button>
            </div>
          ) : (
            <pre className={`text-left whitespace-pre-wrap break-words ${styles.flashcardContent}`}>
              {currentCard.front}
            </pre>
          )}
        </CardContent>
      </Card>
      <div className="flex flex-col items-center mb-4">
        {!showAnswer ? (
          <Button onClick={toggleAnswer} variant="outline" className="mx-auto">
            <Eye className="mr-2 h-4 w-4" />
            Show Answer
          </Button>
        ) : (
          <div className="w-full">
            <div className="flex justify-between mb-4">
              <div className="flex flex-col items-center">
                <Button onClick={() => handleNextCard()} variant="outline">
                  Easy
                </Button>
                <span className="text-xs mt-1 text-gray-500">4 days</span>
              </div>
              <div className="flex flex-col items-center">
                <Button onClick={() => handleNextCard()} variant="outline">
                  Good
                </Button>
                <span className="text-xs mt-1 text-gray-500">1 day</span>
              </div>
              <div className="flex flex-col items-center">
                <Button onClick={() => handleNextCard()} variant="outline">
                  Hard
                </Button>
                <span className="text-xs mt-1 text-gray-500">10 min</span>
              </div>
              <div className="flex flex-col items-center">
                <Button onClick={() => handleNextCard()} variant="outline">
                  Again
                </Button>
                <span className="text-xs mt-1 text-gray-500">1 day</span>
              </div>
            </div>
            <div className="flex justify-end">
              <Button onClick={toggleFlag} variant="outline">
                <Flag className="mr-2" />
                {flaggedItems.includes(currentCard.id) ? "Unmark" : "Mark"}
              </Button>
            </div>
          </div>
        )}
      </div>
      <div className="mt-8 mb-12">
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
                <AlertDialogCancel className="dark:bg-gray-700 dark:text-white">Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleFinishStudy}
                  className="dark:bg-red-900 bg-red-500 text-white"
                >
                  End Session
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
      <Toaster />
    </div>
  );
}

Copy

Apply

page.tsx
Key Changes:

Fetching Due Flashcards: Integrate the /api/get-due-flashcards endpoint to fetch only flashcards that are due for review.
Updating Flashcards: Use the /api/update-flashcard endpoint to update flashcard parameters based on user feedback.
User Feedback Mapping: Map user-selected difficulty to the quality score used in the SM-2 algorithm.
5.2. Handling User Feedback
When the user selects a difficulty level (e.g., Easy, Good, Hard, Again), map these choices to a quality score and update the flashcard accordingly.

Example Mapping Function:

const mapDifficultyToQuality = (difficulty: string): number => {
  switch (difficulty) {
    case "Easy":
      return 5;
    case "Good":
      return 4;
    case "Hard":
      return 3;
    case "Again":
      return 2;
    default:
      return 3;
  }
};

Copy

Apply

Triggering the Update:

Modify the handleNextCard function to accept the selected difficulty and update the flashcard.

const handleNextCard = async (difficulty: string) => {
  const quality = mapDifficultyToQuality(difficulty);

  // Update flashcard in the backend
  await updateFlashcardReview(currentCard.id, quality);

  const nextIndex = (currentCardIndex + 1) % flashcards.length;
  setCurrentCardIndex(nextIndex);
  setShowAnswer(false);
  setCardsStudied(prev => prev + 1);

  if (nextIndex === 0) {
    setIsSessionComplete(true);
  }

  // Optionally update correctReviews based on quality
  if (quality >= 3) {
    setCorrectReviews(prev => prev + 1);
  }
};

Copy

Apply

Update Buttons to Pass Difficulty:

<Button onClick={() => handleNextCard("Easy")} variant="outline">
  Easy
</Button>
<Button onClick={() => handleNextCard("Good")} variant="outline">
  Good
</Button>
<Button onClick={() => handleNextCard("Hard")} variant="outline">
  Hard
</Button>
<Button onClick={() => handleNextCard("Again")} variant="outline">
  Again
</Button>

Copy

Apply

6. Optimizing Performance
To ensure the integration is smooth and performant:

Minimize Client-Side State: Utilize server-side rendering where possible. For example, fetching due flashcards server-side can reduce client load.
Caching: Implement caching strategies for frequently accessed data like decks.
API Rate Limiting: Ensure API routes handle rate limiting to prevent abuse.
Lazy Loading: Load components and data only when necessary using React's Suspense and dynamic imports.
7. Testing and Validation
Thoroughly test the spaced repetition implementation to ensure accuracy and reliability.

Testing Steps:
Unit Tests:

Test calculateNextReview with various quality inputs to ensure accurate scheduling.
Validate edge cases, such as extremely low or high quality scores.
Integration Tests:

Simulate user interactions through the study flow and verify database updates.
Test API routes (/api/get-due-flashcards and /api/update-flashcard) for correct functionality.
User Acceptance Testing:

Have beta users use the study feature and gather feedback on the scheduling accuracy.
Monitor engagement metrics like retention rates and study consistency.
Performance Testing:

Ensure the app remains responsive under high load, especially during peak study times.
8. Additional Features
Enhance the spaced repetition system with additional features:

Customizable Algorithms: Allow users to choose different spaced repetition algorithms (e.g., SM-5, Leitner system).
Notifications: Implement reminders for upcoming reviews.
Analytics Dashboard: Provide insights into user progress and study patterns.
Adaptive Learning: Adjust flashcard difficulty dynamically based on performance trends.
Backup and Syncing: Ensure user progress is backed up and synced across devices.
Conclusion
By following this implementation guide, you can effectively integrate a robust spaced repetition system into your SmartFlash AI application. This will not only enhance user engagement but also significantly improve learning outcomes by tailoring the review process to individual user performance.

Feel free to reach out for further assistance or clarifications during your implementation process! Happy coding and happy learning! 🚀