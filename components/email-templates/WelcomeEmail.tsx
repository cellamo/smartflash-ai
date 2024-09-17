import * as React from 'react';
import { BaseTemplate } from './BaseTemplate';

interface WelcomeEmailProps {
  username: string;
}

export const WelcomeEmail: React.FC<WelcomeEmailProps> = ({ username }) => (
  <BaseTemplate previewText="Welcome to SmartFlash AI!">
    <h1 style={{ color: '#4f46e5', marginBottom: '24px' }}>Welcome to SmartFlash AI, {username}!</h1>
    <p>We&apos;re thrilled to have you on board. Get ready to supercharge your learning with AI-powered flashcards!</p>
    <ul style={{ paddingLeft: '20px', marginBottom: '24px' }}>
      <li>Create custom decks</li>
      <li>Study with AI assistance</li>
      <li>Track your progress</li>
    </ul>
    <a href="https://smartflash-ai.com/get-started" style={{
      backgroundColor: '#4f46e5',
      color: '#ffffff',
      padding: '12px 24px',
      borderRadius: '4px',
      textDecoration: 'none',
      display: 'inline-block',
    }}>
      Get Started
    </a>
  </BaseTemplate>
);
