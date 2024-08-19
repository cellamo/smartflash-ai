import { OpenAI } from 'openai';
import { NextResponse } from 'next/server';
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const supabase = createClientComponentClient();

async function getOrCreateAssistant() {
  let { data: assistant, error } = await supabase
    .from('assistants')
    .select('id')
    .single();

  if (error || !assistant) {
    const newAssistant = await openai.beta.assistants.create({
      name: "SmartFlash AI Tutor",
      instructions: "You are an AI tutor helping students with their flashcards and study sessions.",
      tools: [{ type: "code_interpreter" }],
      model: "gpt-4o-mini",
    });

    await supabase.from('assistants').insert({ id: newAssistant.id });
    return newAssistant;
  }

  return await openai.beta.assistants.retrieve(assistant.id);
}

export async function POST(req: Request) {
    const { messages, flashcards, chatId } = await req.json();
  
    const assistant = await getOrCreateAssistant();
  
    let thread;
    if (chatId) {
      const { data } = await supabase
        .from('chat_sessions')
        .select('thread_id')
        .eq('id', chatId)
        .single();
      thread = data?.thread_id ? await openai.beta.threads.retrieve(data.thread_id) : await openai.beta.threads.create();
    } else {
      thread = await openai.beta.threads.create();
      await supabase.from('chat_sessions').insert({
        id: chatId,
        thread_id: thread.id,
        flashcards: flashcards
      });
    }
  
    await openai.beta.threads.messages.create(thread.id, {
      role: "user",
      content: messages[messages.length - 1].content,
    });
  
    const run = await openai.beta.threads.runs.create(thread.id, {
      assistant_id: assistant.id,
      instructions: `Consider the following flashcards while responding: ${JSON.stringify(flashcards)}`,
    });

  let runStatus = await openai.beta.threads.runs.retrieve(thread.id, run.id);

  while (runStatus.status !== "completed") {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    runStatus = await openai.beta.threads.runs.retrieve(thread.id, run.id);
  }

  const responseMessages = await openai.beta.threads.messages.list(thread.id);

  const lastMessage = responseMessages.data
    .filter((message) => message.role === "assistant")
    .pop();

  const content = lastMessage?.content[0];
  const response = content && 'text' in content ? content.text.value : '';

  return NextResponse.json({ response });
}
