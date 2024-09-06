import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const { cardsStudied, studyTime, correctReviews, deckId } = await request.json();
  const supabase = createRouteHandlerClient({ cookies });

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  // Start a transaction
  const { data, error } = await supabase.rpc('update_study_stats', {
    p_user_id: user.id,
    p_cards_studied: cardsStudied,
    p_study_time: studyTime,
    p_correct_reviews: correctReviews,
    p_deck_id: deckId
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}