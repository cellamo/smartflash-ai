
# SmartFlash AI

SmartFlash AI is an intelligent flashcard application that leverages AI to enhance your learning experience. It combines spaced repetition algorithms with advanced AI features to help you study more effectively and efficiently.

## Features

- Create and manage flashcard decks
- AI-powered chat assistance for study sessions
- Spaced repetition algorithm for optimized learning
- Customizable study sessions
- Progress tracking and analytics
- User profiles with personalized settings
- Mobile-friendly design

## Tech Stack

- Next.js 14 with App Router
- TypeScript
- Supabase (PostgreSQL database)
- Tailwind CSS
- Shadcn UI components
- OpenAI GPT-4 and Google Gemini AI integration

## Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables on `.env.local` (see `.env.example`)
4. Run the development server: `npm run dev`

## Project Structure

- `/app`: Next.js app router pages and API routes
- `/components`: Reusable React components
- `/utils`: Utility functions and helpers

## API Routes

- `/api/chat`: Handles AI chat interactions
- `/api/update-stats`: Updates user study statistics

## Database Schema

The application uses Supabase with the following main tables:

- `auth.users`: User authentication
- `profiles`: User profiles and preferences
- `decks`: Flashcard decks
- `flashcards`: Individual flashcards
- `study_sessions`: Logs of study sessions
- `chat_sessions`: AI chat session logs
- `weekly_stats`: User's weekly study statistics

## Contributing

Contributions are welcome!

## License

[MIT License](LICENSE)
