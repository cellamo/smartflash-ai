export async function updateStats(cardsStudied: number, studyTime: number, correctReviews: number, deckId: string) {
  const response = await fetch('/api/update-stats', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ cardsStudied, studyTime, correctReviews, deckId }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to update stats');
  }

  return response.json();
}