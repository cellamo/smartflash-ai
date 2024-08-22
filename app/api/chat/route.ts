import { OpenAI } from 'openai';
import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from 'next/headers';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  const { messages, flashcards } = await request.json();
  const supabase = createRouteHandlerClient({ cookies });

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  try {
    const openaiMessages = [
      { role: "system", content: "You are an AI tutor helping students with their flashcards and study sessions. ALWAYS RESPOND IN THE USER'S LANGUAGE." },
      ...messages,
      { role: "system", content: `Consider the following flashcards while responding: ${JSON.stringify(flashcards)}` }
    ];


    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: openaiMessages,
      stream: true,
      stream_options: {"include_usage": true}
    });

    let tokenCount = 0;

    const stream = new ReadableStream({
      async start(controller) {
        for await (const chunk of completion) {
          const content = chunk.choices[0]?.delta?.content || '';
          controller.enqueue(content);
          
          // Update token count if available
          if (chunk.usage && chunk.usage.total_tokens) {
            tokenCount = chunk.usage.total_tokens;
          }
        }
        controller.enqueue(`\n[TOKEN_COUNT:${tokenCount}]`);
        controller.close();
        
        // Print the final token count
        console.log(`Total tokens used: ${tokenCount}`);
      },
    });
    return new NextResponse(stream, {
      headers: {
        'Content-Type': 'text/plain',
        'Transfer-Encoding': 'chunked',
      },
    });
  } catch (error) {
    console.error('OpenAI API error:', error);
    return NextResponse.json({ error: 'Failed to generate response' }, { status: 500 });
  }
}
