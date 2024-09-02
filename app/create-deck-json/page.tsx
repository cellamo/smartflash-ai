'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Copy, Lightbulb } from 'lucide-react';
import { toast } from 'sonner';
import { MobileDock } from '@/components/MobileDock';

export default function CreateDeckJson() {
  const [jsonInput, setJsonInput] = useState('');
  const [message, setMessage] = useState('');
  const supabase = createClientComponentClient();
  const [isPromptVisible, setIsPromptVisible] = useState(false);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const deck = JSON.parse(jsonInput);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setMessage('User not authenticated');
        return;
      }

      // Insert deck
      const { data: deckData, error: deckError } = await supabase
        .from('decks')
        .insert({ user_id: user.id, name: deck.name, description: deck.description })
        .select();

      if (deckError) throw deckError;

      // Insert flashcards
      const flashcards = deck.flashcards.map((card: any) => ({
        ...card,
        deck_id: deckData[0].id,
        created_at: new Date().toISOString(),
      }));

      const { error: cardsError } = await supabase
        .from('flashcards')
        .insert(flashcards);

      if (cardsError) throw cardsError;

      setMessage('Deck created successfully!');
    } catch (error) {
      setMessage('Error creating deck: ' + (error as Error).message);
    }
  };

  const handleCopy = () => {
    const jsonExample = `{
  "name": "JavaScript Basics",
  "description": "A deck covering fundamental JavaScript concepts",
  "flashcards": [
    {
      "front": "What is a variable?",
      "back": "A container for storing data values",
      "notes": "Variables can be declared using var, let, or const"
    },
    {
      "front": "What is a function?",
      "back": "A reusable block of code designed to perform a particular task",
      "notes": "Functions can take parameters and return values"
    }
  ]
}`;
    navigator.clipboard.writeText(jsonExample);
    toast.success('JSON example copied to clipboard!');
  };

  const handleCopyPrompt = () => {
    const promptExample = `Create a flashcard deck about [TOPIC] or from the [NOTES]. The deck should have a name, description, and at least 10 flashcards. Each flashcard should have a front (question), back (answer), and optional notes. Please format the output as a JSON object following this structure:

{
  "name": "Deck Name",
  "description": "Brief description of the deck",
  "flashcards": [
    {
      "front": "Question",
      "back": "Answer",
      "notes": "Additional information (optional)"
    }
  ]
}

Topic: [TOPIC]
Notes: [NOTES]`;
    navigator.clipboard.writeText(promptExample);
    toast.success('Prompt example copied to clipboard!');
  };

  return (
    <div className="container mx-auto p-4">
      <MobileDock />
      <Card className="mb-4">
        <CardHeader className="flex flex-row items-center gap-2">
          <Lightbulb className="h-5 w-5 text-yellow-500" />
          <CardTitle>Pro Tip</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600">
            Copy the example JSON below and paste it into ChatGPT or Claude along with your notes. 
            They can help you create a customized deck based on your input!
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Create Deck from JSON</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <Textarea
              value={jsonInput}
              onChange={(e) => setJsonInput(e.target.value)}
              placeholder="Paste your JSON here"
              className="mb-4"
              rows={10}
            />
            <Button type="submit">Create Deck</Button>
          </form>
          {message && <p className="mt-4">{message}</p>}
        </CardContent>
      </Card>
      <Card className="mt-4">
        <CardHeader className="flex justify-between items-center">
          <CardTitle>JSON Structure Example</CardTitle>
          <Button onClick={handleCopy} variant="outline" size="sm">
            <Copy className="mr-2 h-4 w-4" /> Copy JSON
          </Button>
        </CardHeader>
        <CardContent>
          <pre className="text-xs sm:text-sm md:text-base overflow-x-auto">
            {`{
  "name": "JavaScript Basics",
  "description": "A deck covering fundamental JavaScript concepts",
  "flashcards": [
    {
      "front": "What is a variable?",
      "back": "A container for storing data values",
      "notes": "Variables can be declared using var, let, or const"
    },
    {
      "front": "What is a function?",
      "back": "A reusable block of code designed to perform a particular task",
      "notes": "Functions can take parameters and return values"
    }
  ]
}`}
          </pre>
        </CardContent>
      </Card>
      <Card className="mb-16">
        <CardHeader className="flex justify-between items-center">
          <Button
            onClick={() => setIsPromptVisible(!isPromptVisible)}
            variant="outline"
            size="sm"
          >
            {isPromptVisible ? 'Hide' : 'Show'} Example Prompt
          </Button>
          
        </CardHeader>
        {isPromptVisible && (
          <CardContent>
            <Button onClick={handleCopyPrompt} variant="outline" size="sm" className='mb-4'>
            <Copy className="mr-2 h-4 w-4" /> Copy Prompt
          </Button>
            <pre className="text-xs sm:text-sm md:text-base overflow-x-auto whitespace-pre-wrap">
              {`Create a flashcard deck about [TOPIC] or from the [NOTES]. The deck should have a name, description, and at least 10 flashcards. Each flashcard should have a front (question), back (answer), and optional notes. Please format the output as a JSON object following this structure:

{
  "name": "Deck Name",
  "description": "Brief description of the deck",
  "flashcards": [
    {
      "front": "Question",
      "back": "Answer",
      "notes": "Additional information (optional)"
    }
  ]
}

Topic: [TOPIC]
Notes: [NOTES]`}
            </pre>
          </CardContent>
        )}
      </Card>
    </div>
  );
}
