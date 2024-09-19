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
	•	id: UUID, primary key.
	•	user_id: UUID, references auth.users.id.
	•	name: Text, name of the deck.
	•	description: Text, description of the deck.
	•	created_at: Timestamp with time zone, creation date of the deck.
	•	last_studied: Timestamp with time zone, last study date of the deck.
	•	review_limit: Integer, max number of reviews allowed per session.
	•	card_count: Integer, number of cards in the deck.
	•	new_cards_per_day: Integer, number of new cards to introduce per day.
	•	review_order: Character varying, order in which cards are reviewed.
	•	min_ease_factor: Integer, minimum ease factor for spaced repetition.
	•	max_ease_factor: Integer, maximum ease factor for spaced repetition.
	•	enable_ai_hints: Boolean, whether AI hints are enabled for this deck.

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
	•	id: UUID, primary key, references auth.users.id.
	•	full_name: Text, user's full name.
	•	username: Text, user's chosen username.
	•	bio: Text, user's biography.
	•	avatar_url: Text, URL to user's avatar image.
	•	total_cards_studied: Integer, total number of cards studied.
	•	total_study_time: Integer, total study time in minutes.
	•	longest_streak: Integer, longest study streak in days.
	•	email: Text, user's email address.
	•	role: Text, user's role in the system.
	•	theme: VARCHAR, user's preferred UI theme.
	•	daily_review_limit: Integer, maximum number of daily reviews.
	•	default_study_duration: Integer, default study session duration in minutes.
	•	preferred_study_mode: VARCHAR, user's preferred study mode.
	•	notifications_enabled: Boolean, whether notifications are enabled for the user.
	•	is_admin: Boolean, whether the user has admin privileges (default: false).

6. study_sessions

	•	Logs details of each study session.
	•	Columns:
	•	id: uuid, Primary key.
	•	user_id: uuid, References auth.users.id.
	•	deck_id: uuid, References decks.id.
	•	start_time: timestamp with time zone.
	•	end_time: timestamp with time zone.
	•	cards_reviewed: integer.
	•	correct_reviews: integer.
	•	card_count: integer, Number of cards selected for the session.
	•	is_scrambled: boolean, Indicates if the cards were scrambled for this session.

7. chat_sessions
	• Logs details of chat sessions.
	• Columns:
	• id: uuid, Primary key.
	• user_id: uuid, References auth.users.id.
	• deck_id: uuid, References decks.id.
	• created_at: timestamp with time zone, Timestamp when the chat session was created.
	• last_message: text, Text of the last message in the chat session.
	• last_updated: timestamp with time zone, Timestamp when the chat session was last updated.
	• messages: jsonb, JSONB column containing the messages in the chat session.
	• token_count: integer, Number of tokens used in the chat session.
	• model: text, The AI model used for the chat session.

8. weekly_stats

	• Stores weekly statistics for users.
	• Columns:
	• id: uuid, Primary key.
	• user_id: uuid, References auth.users.id.
	• week_start_date: date, Start date of the week for these statistics.
	• total_cards_studied: integer, Total number of cards studied in the week.
	• total_new_words: integer, Total number of new words learned in the week.
	• average_accuracy: double precision, Average accuracy of reviews in the week.
	• total_study_time_minutes: integer, Total study time in minutes for the week.
	• longest_streak: integer, Longest streak of consecutive days studied in the week.

9. feedbacks

	• Stores user feedback and bug reports.
	• Columns:
	• id: uuid, Primary key, Default generated using gen_random_uuid().
	• user_id: uuid, References auth.users.id, ON DELETE CASCADE.
	• created_at: timestamp with time zone, NOT NULL, Default set to current timestamp.
	• feedback_type: text, NOT NULL, e.g., "bug", "feature_request", "general".
	• message: text, NOT NULL, The actual feedback or bug report message.
	• screenshot_url: text, Optional URL to a screenshot.
	• metadata: jsonb, Optional additional data.

	• Indexes:
	• feedbacks_user_id_idx: Index on user_id for faster queries.

Note: This table is created by the migration file: supabase/migrations/add_feedbacks_table.sql

10. admins

	• Stores admin users.
	• Columns:
	• user_id: uuid, Primary key, References auth.users(id), ON DELETE CASCADE.