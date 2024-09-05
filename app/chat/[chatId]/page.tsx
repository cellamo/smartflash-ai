"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Head from "next/head";
import { Input } from "@/components/ui/input";
import { Send, Bot, User, ArrowLeft, BookOpen, Loader2 } from "lucide-react";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import Link from "next/link";
import { useParams } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/navigation";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function ChatSessionPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [tokenCount, setTokenCount] = useState(1);
  const [deckName, setDeckName] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const supabase = createClientComponentClient();
  const { chatId } = useParams();
  const router = useRouter();

  const [isDisabled, setIsDisabled] = useState(false);

  const [flashcards, setFlashcards] = useState<string | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    checkUserRole();
    fetchDeckInfo();
  }, [chatId]);

  useEffect(() => {
    if (tokenCount > 8000) {
      setIsDisabled(true);
      toast.error("Token limit reached. Please start a new chat.");
    }
  }, [tokenCount]);

  const checkUserRole = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      const { data, error } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (error) {
        console.error("Error fetching profile:", error);
        toast.error("Failed to fetch profile");
      } else if (data.role === "free") {
        toast.error(
          "Chat feature is currently available only for premium users."
        );
        router.push("/dashboard");
      }
    }
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() === "" || isDisabled) return;

    const newMessage: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, newMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, newMessage],
          flashcards: JSON.parse(flashcards || "[]"),
        }),
      });

      if (!response.ok) throw new Error(response.statusText);

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (reader) {
        let accumulatedResponse = "";
        let newTokenCount = tokenCount;
        setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value);

          if (chunk.includes("[TOKEN_COUNT:")) {
            newTokenCount = parseInt(
              chunk.match(/\[TOKEN_COUNT:(\d+)\]/)?.[1] || "0"
            );
            setTokenCount(newTokenCount);
            break;
          } else {
            accumulatedResponse += chunk;
            setMessages((prev) => {
              const updatedMessages = [...prev];
              updatedMessages[updatedMessages.length - 1].content =
                accumulatedResponse;
              return updatedMessages;
            });
          }
        }

        // Update the chat session with new messages and token count
        updateChatSession(
          [
            ...messages,
            newMessage,
            { role: "assistant", content: accumulatedResponse },
          ],
          newTokenCount
        );

        if (newTokenCount > 8000) {
          setIsDisabled(true);
          toast.error("Token limit reached. Please start a new chat.");
        } else if (newTokenCount > 7500) {
          toast.warning(
            "You are approaching the token limit. Please start a new chat soon."
          );
        }
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to send message");
    } finally {
      setIsLoading(false);
    }
  };
  const fetchDeckInfo = async () => {
    try {
      const { data: chatSession, error: chatError } = await supabase
        .from("chat_sessions")
        .select("deck_id, messages, token_count")
        .eq("id", chatId)
        .single();

      if (chatError) throw chatError;

      const { data: deck, error: deckError } = await supabase
        .from("decks")
        .select("name, flashcards(front, back, notes)")
        .eq("id", chatSession.deck_id)
        .single();

      if (deckError) throw deckError;

      setDeckName(deck.name);
      if (chatSession.messages) {
        setMessages(JSON.parse(chatSession.messages));
      }

      setTokenCount(chatSession.token_count || 1);

      const optimizedFlashcards = deck.flashcards.map(({ front, back }) => [
        front,
        back,
      ]);
      setFlashcards(JSON.stringify(optimizedFlashcards));
    } catch (error) {
      console.error("Error fetching deck info:", error);
      toast.error("Failed to load deck information");
    }
  };

  const updateChatSession = async (
    messages: Message[],
    newTokenCount: number
  ) => {
    const { error } = await supabase
      .from("chat_sessions")
      .update({
        messages: JSON.stringify(messages),
        token_count: newTokenCount,
      })
      .eq("id", chatId);

    if (error) {
      console.error("Error updating chat session:", error);
      toast.error("Failed to save chat history");
    }
  };

  return (
    <>
      <Head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no"
        />
      </Head>
      <div className="flex flex-col h-screen bg-slate-200 dark:bg-slate-900">
        <div className="flex-grow overflow-scroll px-2 py-4">
          <div className="h-full max-w-2xl mx-auto flex flex-col">
            <Card className="mb-4">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <Link href="/chat">
                  <Button variant="ghost" className="flex items-center">
                    <ArrowLeft className="h-4 w-4 mr-2" /> Back to Chats
                  </Button>
                </Link>
                <CardTitle className="text-xl font-bold flex items-center ml-4">
                  <Bot className="h-5 w-5 mr-2" />
                  AI Tutor Chat
                </CardTitle>
              </CardHeader>
              {deckName && (
                <CardContent className="pt-2">
                  <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                    <BookOpen className="h-4 w-4 mr-2" />
                    Current Deck: {deckName}
                  </div>
                </CardContent>
              )}
            </Card>

            <Card className="flex-grow flex flex-col overflow-hidden ">
              <CardContent className="flex-grow overflow-y-auto p-4">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex ${
                      message.role === "user" ? "justify-end" : "justify-start"
                    } mb-4 `}
                  >
                    <div
                      className={`max-w-[70%] p-3 rounded-lg ${
                        message.role === "user"
                          ? "bg-blue-500 text-white dark:bg-blue-600"
                          : "bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                      } shadow-md`}
                    >
                      <div className="flex items-center mb-1">
                        {message.role === "user" ? (
                          <User className="h-4 w-4 mr-2" />
                        ) : (
                          <Bot className="h-4 w-4 mr-2" />
                        )}
                        <span className="font-bold">
                          {message.role === "user" ? "You" : "AI Tutor"}
                        </span>
                      </div>
                      {message.content}
                    </div>
                  </div>
                ))}

                <div ref={messagesEndRef} />
              </CardContent>
              <CardContent className="p-4 border-t">
                <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                  Token count: {tokenCount}
                </div>
                <form onSubmit={handleSubmit} className="flex gap-2">
                  <Input
                    type="text"
                    placeholder={
                      isDisabled
                        ? "Token limit reached. Start a new chat."
                        : "Type your message..."
                    }
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    disabled={isLoading || isDisabled}
                  />
                  <Button type="submit" disabled={isLoading || isDisabled} className="dark:bg-gray-700 dark:text-white">
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
        <Toaster />
      </div>
    </>
  );
}
