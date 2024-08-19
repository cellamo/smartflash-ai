The backend is powered by Supabase, using PostgreSQL as the database.

Schemas and Tables

Auth Schema: auth.users

	•	Purpose: Manages user authentication.
	•	Key Columns:
	•	id: UUID, primary key for the user.
	•	email: User’s email address.
	•	Other fields related to authentication.

Public Schema

This schema contains the main application data.

1. daily_progress

	•	Tracks users’ daily study progress.
	•	Columns:
	•	id: Primary key.
	•	user_id: References auth.users.id.
	•	date: The date of the progress.
	•	cards_studied, new_words_learned, review_accuracy, study_time_minutes: Metrics of the user’s daily study activity.

2. decks

	•	Stores the flashcard decks created by users.
	•	Columns:
	•	id: Primary key.
	•	user_id: References auth.users.id.
	•	name, description: Metadata about the deck.
	•	created_at, last_studied: Timestamps.
	•	review_limit: Max number of reviews allowed per session.

3. flashcard_reviews

	•	Logs each review of a flashcard.
	•	Columns:
	•	id: Primary key.
	•	flashcard_id: References flashcards.id.
	•	user_id: References auth.users.id.
	•	session_id: References study_sessions.id.
	•	review_time, performance_rating, review_type: Metrics for the review.

4. flashcards

	•	Stores the flashcards within each deck.
	•	Columns:
	•	id: Primary key.
	•	deck_id: References decks.id.
	•	front, back, notes: Content of the flashcard.
	•	created_at, last_reviewed, review_count: Metadata about the flashcard.
	•	ease_factor, interval, due_date: Spaced repetition algorithm parameters.

5. profiles

	•	Stores additional user profile information.
	•	Columns:
	•	id: Primary key, references auth.users.id.
	•	full name, username, bio, avatar_url: User’s profile data.
	•	total_cards_studied, total_study_time, longest_streak: Stats related to the user’s activity.
	•	email, role: User’s email and role.

6. study_sessions

	•	Logs details of each study session.
	•	Columns:
	•	id: Primary key.
	•	user_id: References auth.users.id.
	•	deck_id: References decks.id.
	•	start_time, end_time: Timestamps.
	•	cards_reviewed, correct_reviews: 