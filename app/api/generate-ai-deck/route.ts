import { OpenAI } from 'openai';
import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from 'next/headers';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface Flashcard {
  front: string;
  back: string;
  notes: string;
}

function parseFlashcards(content: string): Flashcard[] {
  const flashcards: Flashcard[] = [];
  const flashcardRegex = /### Flashcard \d+\s+\*\*Front:\*\* (.*?)\s+\*\*Back:\*\* (.*?)\s+\*\*Notes:\*\* (.*?)(?=\s+### Flashcard|\s*$)/g;

  let match;
  while ((match = flashcardRegex.exec(content)) !== null) {
    flashcards.push({
      front: match[1].trim(),
      back: match[2].trim(),
      notes: match[3].trim()
    });
  }

  return flashcards;
}
export async function POST(request: Request) {
  const { notes } = await request.json();
  const supabase = createRouteHandlerClient({ cookies });

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are an AI assistant that creates flashcards based on provided notes. Create a set of flashcards with front, back, and notes fields." },
        { role: "user", content: `Create flashcards from these notes: ${notes}` }
      ],
    });

    const content = completion.choices[0].message.content;

    if (!content) {
      throw new Error('No content in OpenAI response');
    }

    const flashcards = parseFlashcards(content);

    return NextResponse.json({ flashcards });
  } catch (error) {
    console.error('OpenAI API error:', error);
    return NextResponse.json({ error: 'Failed to generate flashcards' }, { status: 500 });
  }
}