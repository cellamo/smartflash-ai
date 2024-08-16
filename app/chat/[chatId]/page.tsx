"use client";

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageSquare, Send, Bot, User, ArrowLeft, BookOpen } from "lucide-react";
import { MobileDock } from '@/components/MobileDock';
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import Link from 'next/link';
import { useParams } from 'next/navigation';

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'ai';
}

const mockMessages: Message[] = [
  { id: 1, text: "Hello! I'd like to learn about programming concepts.", sender: 'user' },
  { id: 2, text: "Great! I'd be happy to help you with programming concepts. What specific topic would you like to start with?", sender: 'ai' },
  { id: 3, text: "Can you explain what object-oriented programming is?", sender: 'user' },
  { id: 4, text: "Certainly! Object-Oriented Programming (OOP) is a programming paradigm based on the concept of 'objects', which can contain data and code. The data is in the form of fields (often known as attributes or properties), and the code is in the form of procedures (often known as methods).\n\nKey concepts in OOP include:\n\n1. Classes: Blueprints for creating objects.\n2. Objects: Instances of classes.\n3. Encapsulation: Bundling data and methods that operate on that data within a single unit.\n4. Inheritance: A mechanism where a new class is derived from an existing class.\n5. Polymorphism: The ability of different classes to be treated as instances of the same class through inheritance.\n\nWould you like me to elaborate on any of these concepts?", sender: 'ai' },
  { id: 5, text: "That's helpful, thanks! Can you give an example of inheritance?", sender: 'user' },
];

export default function ChatSessionPage() {
  const params = useParams();
  const chatId = params.chatId as string;
  const [messages, setMessages] = useState<Message[]>(mockMessages);
  const [inputMessage, setInputMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = () => {
    if (inputMessage.trim()) {
      const newMessage: Message = {
        id: Date.now(),
        text: inputMessage.trim(),
        sender: 'user',
      };
      setMessages([...messages, newMessage]);
      setInputMessage("");
      simulateAIResponse();
    } else {
      toast.error("Please enter a message.");
    }
  };

  const simulateAIResponse = () => {
    setTimeout(() => {
      const aiMessage: Message = {
        id: Date.now(),
        text: "This is a simulated AI response. In a real application, this would be generated based on the selected deck and user input.",
        sender: 'ai',
      };
      setMessages(prevMessages => [...prevMessages, aiMessage]);
    }, 1000);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] bg-slate-200">
      <div className="flex-grow overflow-hidden px-2 py-4 pb-2">
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
          </Card>

          <Card className="flex-grow flex flex-col overflow-hidden">
            <CardContent className="flex-grow overflow-y-auto p-4">
              {messages.map((message) => (
                <div key={message.id} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'} mb-4`}>
                  <div className={`max-w-[70%] p-3 rounded-lg ${message.sender === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-black'}`}>
                    <div className="flex items-center mb-1">
                      {message.sender === 'user' ? <User className="h-4 w-4 mr-2" /> : <Bot className="h-4 w-4 mr-2" />}
                      <span className="font-bold">{message.sender === 'user' ? 'You' : 'AI Tutor'}</span>
                    </div>
                    {message.text}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </CardContent>
            <CardContent className="p-4 border-t">
              <div className="flex gap-2">
                <Input
                  type="text"
                  placeholder="Type your message..."
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                />
                <Button onClick={handleSendMessage}>
                  <Send className="h-4 w-4 mr-2" /> Send
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <MobileDock />
      <Toaster />
    </div>
  );
}