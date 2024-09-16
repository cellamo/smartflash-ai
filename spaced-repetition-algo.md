# Spaced Repetition Algorithm for SmartFlash AI

Algorithm Overview:

We'll implement a hybrid approach, combining elements of SM-2 and FSRS.
The algorithm will use four answer buttons: Again, Hard, Good, and Easy.
We'll incorporate the concepts of Retrievability (R), Stability (S), and Difficulty (D) from FSRS.
Database Changes: Add the following columns to the flashcards table:

ease_factor: FLOAT DEFAULT 2.5
interval: INTEGER DEFAULT 0
due_date: DATE
retrievability: FLOAT DEFAULT 1.0
stability: FLOAT DEFAULT 0.0
difficulty: FLOAT DEFAULT 0.3
Implementation Steps:

Step 1: Initial Learning

When a new card is introduced, set initial values:
ease_factor = 2.5
interval = 0
due_date = current_date
retrievability = 1.0
stability = 0.0
difficulty = 0.3
Step 2: Review Process

When a card is reviewed, calculate the next interval and update the memory state based on the user's response:
a) Again:

Reset interval to 1 day
Decrease ease_factor by 20%
Significantly decrease stability
Significantly increase difficulty
b) Hard:

Multiply current interval by 1.2
Decrease ease_factor by 15%
Slightly increase stability
Moderately increase difficulty
c) Good:

Multiply current interval by current ease_factor
Keep ease_factor unchanged
Moderately increase stability
Slightly adjust difficulty (increase or decrease)
d) Easy:

Multiply current interval by (current ease_factor * 1.3)
Increase ease_factor by 15%
Significantly increase stability
Moderately decrease difficulty
Step 3: Updating Memory State

After each review, update the card's memory state:
Calculate new retrievability based on time elapsed since last review and current stability
Update stability based on the review outcome
Adjust difficulty based on the review outcome
Set new due_date based on the calculated interval
Step 4: Scheduling

When scheduling reviews, prioritize cards with lower retrievability
Implement a "fuzz factor" to add slight randomness to intervals
Respect daily review limits set by the user
Step 5: Performance Optimization

Implement batch updates for memory states to reduce database writes
Use caching mechanisms to store frequently accessed card data
Code Implementation:
import { supabase } from './supabaseClient';

interface MemoryState {
  ease_factor: number;
  interval: number;
  retrievability: number;
  stability: number;
  difficulty: number;
}

async function updateCardState(cardId: string, response: 'again' | 'hard' | 'good' | 'easy'): Promise<void> {
  const { data: card, error } = await supabase
    .from('flashcards')
    .select('*')
    .eq('id', cardId)
    .single();

  if (error || !card) {
    console.error('Error fetching card:', error);
    return;
  }

  const newState = calculateNewState(card, response);
  const newDueDate = calculateDueDate(newState.interval);

  const { error: updateError } = await supabase
    .from('flashcards')
    .update({
      ease_factor: newState.ease_factor,
      interval: newState.interval,
      due_date: newDueDate,
      retrievability: newState.retrievability,
      stability: newState.stability,
      difficulty: newState.difficulty,
    })
    .eq('id', cardId);

  if (updateError) {
    console.error('Error updating card:', updateError);
  }
}

function calculateNewState(card: any, response: 'again' | 'hard' | 'good' | 'easy'): MemoryState {
  // Implement the logic for calculating the new memory state based on the response
  // This should include adjusting ease_factor, interval, retrievability, stability, and difficulty
  // Return the new state
}

function calculateDueDate(interval: number): Date {
  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + interval);
  return dueDate;
}

export { updateCardState };

Copy

Apply

spaced-repetition.ts
Integration:
Integrate this algorithm into the review process of SmartFlash AI
Update the UI to display the four answer buttons
Implement the scheduling logic in the study session creation process
Monitoring and Adjustment:
Implement logging and analytics to track the effectiveness of the algorithm
Periodically review and adjust the algorithm parameters based on user performance data
This implementation provides a solid foundation for a spaced repetition system in SmartFlash AI, combining elements from both SM-2 and FSRS. It allows for future refinements and optimizations based on user data and performance metrics.
