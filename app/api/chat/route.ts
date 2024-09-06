import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from 'next/headers';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { OpenAI } from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

if (!process.env.GEMINI_API_KEY) {
  throw new Error('GEMINI_API_KEY is not defined in the environment variables');
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function POST(request: Request) {
  const { messages, flashcards, model } = await request.json();
  const supabase = createRouteHandlerClient({ cookies });

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  try {
    let stream;
    let tokenCount = 0;

    if (model === 'gpt4o-mini') {
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

      stream = new ReadableStream({
        async start(controller) {
          let fullResponse = '';
          for await (const chunk of completion) {
            const content = chunk.choices[0]?.delta?.content || '';
            fullResponse += content;
            controller.enqueue(content);
            // console.log('OpenAI chunk:', chunk); // Add this line

            if (chunk.usage && chunk.usage.total_tokens) {
              tokenCount = chunk.usage.total_tokens;
            }
          }
          // console.log('Full response:', fullResponse);
          controller.enqueue(`\n[TOKEN_COUNT:${tokenCount}]`);
          controller.close();
          
          // console.log(`Total tokens used: ${tokenCount}`);
        },
      });
    } else if (model === 'gemini-1.5-flash' || model === 'gemini-1.5-pro') {
      const geminiModel = genAI.getGenerativeModel({ model: model === 'gemini-1.5-flash' ? 'gemini-1.5-pro-latest' : 'gemini-1.5-pro-latest' });
      
      const prompt = `You are an AI tutor helping students with their flashcards and study sessions. ALWAYS RESPOND IN THE USER'S LANGUAGE. Consider the following flashcards while responding: ${JSON.stringify(flashcards)}

Previous messages:
${messages.slice(0, -1).map((msg: { role: any; content: any; }) => `${msg.role}: ${msg.content}`).join('\n')}

User's message: ${messages[messages.length - 1].content}`;

      const result = await geminiModel.generateContentStream(prompt);
      
      stream = new ReadableStream({
        async start(controller) {
          let totalTokenCount = 0;
          for await (const chunk of result.stream) {
            const content = chunk.text();
            controller.enqueue(content);
            // console.log('Gemini chunk:', chunk);
            
            if (chunk.usageMetadata) {
              totalTokenCount = chunk.usageMetadata.totalTokenCount;
            }
          }
          controller.enqueue(`\n[TOKEN_COUNT:${totalTokenCount}]`);
          controller.close();
          
          // console.log(`Total tokens used: ${totalTokenCount}`);
        },
      });    } else {
      throw new Error('Invalid model specified');
    }

    return new NextResponse(stream, {
      headers: {
        'Content-Type': 'text/plain',
        'Transfer-Encoding': 'chunked',
      },
    });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Failed to generate response' }, { status: 500 });
  }
}
