// components/RecentX.tsx
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain, Clock, Sparkles } from "lucide-react";

const RECENT_DECKS = [
  { name: "JavaScript Basics", lastStudied: "2 hours ago", cardCount: 50, isAIGenerated: true },
  { name: "React Hooks", lastStudied: "Yesterday", cardCount: 30, isAIGenerated: false },
  { name: "Data Structures", lastStudied: "3 days ago", cardCount: 75, isAIGenerated: true },
  { name: "Spanish Vocabulary", lastStudied: "1 week ago", cardCount: 100, isAIGenerated: false },
  { name: "Machine Learning Concepts", lastStudied: "2 weeks ago", cardCount: 60, isAIGenerated: true },
];

export function RecentX() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Decks</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4">
        {RECENT_DECKS.map((deck, index) => (
          <div key={index} className="flex items-center gap-4">
            <Avatar className="h-9 w-9">
              <AvatarImage src={`/deck-icons/${index + 1}.png`} alt="Deck Icon" />
              <AvatarFallback>{deck.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
            </Avatar>
            <div className="grid gap-1 flex-1">
              <p className="text-sm font-medium leading-none">{deck.name}</p>
              <p className="text-xs text-muted-foreground flex items-center">
                <Clock className="mr-1 h-3 w-3" /> {deck.lastStudied}
              </p>
            </div>
            <div className="text-sm font-medium">{deck.cardCount} cards</div>
            {deck.isAIGenerated && (
              <Sparkles className="h-4 w-4 text-primary" aria-label="AI-Generated" />
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
