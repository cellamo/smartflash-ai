'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Brain, Lightbulb, RotateCcw, Home } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Flashcard {
  question: string;
  answer: string;
}


const flashcards = [
    {
      question: "What is the capital city of France?",
      answer: 'Paris',
    },
    {
      question: "Which planet is known as the Red Planet?",
      answer: 'Mars',
    },
    {
      question: "Who painted the Mona Lisa?",
      answer: 'Leonardo da Vinci',
    },
    {
      question: "What is the largest ocean on Earth?",
      answer: 'Pacific Ocean',
    },
    {
      question: "In which year did Christopher Columbus first reach the Americas?",
      answer: '1492',
    },
    {
      question: "What is the chemical symbol for gold?",
      answer: 'Au',
    },
    {
      question: "Who wrote 'To Kill a Mockingbird'?",
      answer: 'Harper Lee',
    },
    {
      question: "What is the largest mammal on Earth?",
      answer: 'Blue Whale',
    },
    {
      question: "In which country is the Great Barrier Reef located?",
      answer: 'Australia',
    },
    {
      question: "What is the smallest prime number?",
      answer: '2',
    },
  ];


const NotFound: React.FC = () => {
  const [flashcard, setFlashcard] = useState<Flashcard>({ question: '', answer: '' });
  const [showAnswer, setShowAnswer] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * flashcards.length);
    setFlashcard(flashcards[randomIndex]);
  }, []);

  const flipCard = () => {
    setShowAnswer(!showAnswer);
  };

  const regenerateCard = () => {
    setShowAnswer(false);
    // In a real scenario, you'd fetch a new flashcard from your API
    const randomIndex = Math.floor(Math.random() * flashcards.length);
    setFlashcard(flashcards[randomIndex]);
  };

  return (
    <>
      <main className="flex min-h-screen flex-col items-center justify-center bg-slate-100 p-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-slate-800 mb-2">Oops! Page Not Found</h1>
          <p className="text-slate-600">Let&apos;s turn this 404 into a learning opportunity!</p>
        </div>
        
        <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md mb-8">
          <div className="text-center mb-4">
            <Brain className="inline-block w-12 h-12 text-slate-700 mb-2" />
            <h2 className="text-2xl font-semibold text-slate-800">Learn While You&apos;re Lost</h2>
          </div>
          <div 
            className="bg-slate-100 rounded-lg p-4 min-h-[150px] flex items-center justify-center cursor-pointer"
            onClick={flipCard}
          >
            <p className="text-xl font-medium text-center text-slate-700">
              {showAnswer ? flashcard.answer : flashcard.question}
            </p>
          </div>
          <div className="mt-4 flex justify-between items-center">
            <button onClick={flipCard} className="flex items-center text-slate-600 hover:text-slate-800">
              <Lightbulb className="mr-2 w-5 h-5" /> {showAnswer ? 'Hide Answer' : 'Show Answer'}
            </button>
            <button onClick={regenerateCard} className="flex items-center text-slate-600 hover:text-slate-800">
              <RotateCcw className="mr-2 w-5 h-5" /> New Card
            </button>
          </div>
        </div>
        
        <button 
        onClick={() => router.back()} 
        className="bg-slate-700 text-white hover:bg-slate-600 font-semibold py-2 px-4 rounded-full transition duration-300 flex items-center"
      >
        <RotateCcw className="mr-2 w-5 h-5" /> Go Back
      </button>
      </main>
    </>
  );
}

export default NotFound;
