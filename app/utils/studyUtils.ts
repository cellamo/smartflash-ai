export const updateStats = async (cardsStudied: number, studyTime: number) => {
  const response = await fetch('/api/update-stats', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ cardsStudied, studyTime }),
  });

  if (!response.ok) {
    console.error('Failed to update stats');
    throw new Error('Failed to update stats');
  }

  return response.json();
};