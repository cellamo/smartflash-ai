import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Clock, Sparkles } from "lucide-react";
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

interface Deck {
  id: string;
  name: string;
  last_studied: string | null;
  created_at: string;
  card_count: number;
  is_ai_generated?: boolean;
}

export function RecentX() {
  const [recentlyCreatedDecks, setRecentlyCreatedDecks] = useState<Deck[]>([]);
  const [recentlyStudiedDecks, setRecentlyStudiedDecks] = useState<Deck[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClientComponentClient();

  useEffect(() => {
    async function fetchRecentDecks() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await Promise.all([
          fetchRecentlyCreatedDecks(user.id),
          fetchRecentlyStudiedDecks(user.id)
        ]);
      }
      setLoading(false);
    }

    fetchRecentDecks();
  }, []);

  async function fetchRecentlyCreatedDecks(userId: string) {
    const { data, error } = await supabase
      .from('decks')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(5);

    if (error) {
      console.error('Error fetching recently created decks:', error);
    } else {
      setRecentlyCreatedDecks(data);
    }
  }

  async function fetchRecentlyStudiedDecks(userId: string) {
    const { data, error } = await supabase
      .from('decks')
      .select('*')
      .eq('user_id', userId)
      .not('last_studied', 'is', null)
      .order('last_studied', { ascending: false })
      .limit(5);

    if (error) {
      console.error('Error fetching recently studied decks:', error);
    } else {
      setRecentlyStudiedDecks(data);
    }
  }

  function formatDate(dateString: string | null): string {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffMinutes = Math.floor(diffTime / (1000 * 60));
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffMinutes < 60) return `${diffMinutes} minutes ago`;
    if (diffHours < 13) return `${diffHours} hours ago`;
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays <= 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  }
  if (loading) {
    return <div>Loading recent decks...</div>;
  }

  const recentlyCreated = [...recentlyCreatedDecks].sort((a, b) => 
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  ).slice(0, 5);

  const recentlyStudied = [...recentlyStudiedDecks]
    .filter(deck => deck.last_studied)
    .sort((a, b) => 
      new Date(b.last_studied!).getTime() - new Date(a.last_studied!).getTime()
    ).slice(0, 5);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Decks</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="created">
          <TabsList className="grid w-full grid-cols-2 bg-slate-200 dark:bg-slate-700">
            <TabsTrigger value="created">Recently Created</TabsTrigger>
            <TabsTrigger value="studied">Recently Studied</TabsTrigger>
          </TabsList>
          <TabsContent value="created" className="mt-4">
            {renderDeckList(recentlyCreatedDecks, 'created_at')}
          </TabsContent>
          <TabsContent value="studied" className="mt-4">
            {renderDeckList(recentlyStudiedDecks, 'last_studied')}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );

  function renderDeckList(decks: Deck[], dateField: 'created_at' | 'last_studied') {
    return (
      <div className="grid gap-4">
        {decks.map((deck) => (
          <div key={deck.id} className="flex items-center gap-4">
            <div className="grid gap-1 flex-1">
              <p className="text-sm font-medium leading-none">{deck.name}</p>
              <p className="text-xs text-muted-foreground flex items-center">
                <Clock className="mr-1 h-3 w-3" /> {formatDate(deck[dateField])}
              </p>
            </div>
            <div className="text-sm font-medium">{deck.card_count} cards</div>
            {deck.is_ai_generated && (
              <Sparkles className="h-4 w-4 text-primary" aria-label="AI-Generated" />
            )}
          </div>
        ))}
      </div>
    );
  }
}
