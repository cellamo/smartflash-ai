import { OpenAI } from 'openai';
import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from 'next/headers';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

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
        {
          role: "system", 
          content: "You are an AI assistant that creates flashcard decks based on provided notes. The deck must include a name, description, and flashcards. Each flashcard should have a front (question), back (answer), and optional notes. If the user does not specify how many flashcards to create, generate at least 5 flashcards, with a default range of 5-10 flashcards. If the user requests, you may generate up to a maximum of 20 flashcards based on the context and detail of the provided notes."
      },
      {
          role: "user", 
          content: `Create a flashcard deck from these notes: ${notes}.`
      }      
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "flashcard_deck",
          strict: true,
          schema: {
            type: "object",
            properties: {
              name: { type: "string" },
              description: { type: "string" },
              flashcards: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    front: { type: "string" },
                    back: { type: "string" },
                    notes: { type: "string" }
                  },
                  required: ["front", "back", "notes"],
                  additionalProperties: false
                }
              }
            },
            required: ["name", "description", "flashcards"],
            additionalProperties: false
          }
        }
      }    });

    const content = completion.choices[0].message.content;

    if (!content) {
      throw new Error('No content in OpenAI response');
    }

    const deck = JSON.parse(content);    return NextResponse.json(deck);
  } catch (error) {
    console.error('OpenAI API error:', error);
    return NextResponse.json({ error: 'Failed to generate flashcards' }, { status: 500 });
  }
}