// app/progress/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { MobileDock } from '@/components/MobileDock';
import { Toaster } from "@/components/ui/sonner"
import { BarChart, Calendar, Brain, Zap, Sparkles } from "lucide-react";

interface ProgressData {
  cardsReviewed: number;
  retentionRate: number;
  streak: number;
  aiGeneratedCards: number;
  knowledgeGaps: string[];
}

const mockProgressData: ProgressData = {
  cardsReviewed: 350,
  retentionRate: 85,
  streak: 15,
  aiGeneratedCards: 50,
  knowledgeGaps: ["React Hooks", "SQL Joins", "Machine Learning Algorithms"],
};

export default function ProgressPage() {
  const [progressData, setProgressData] = useState<ProgressData>(mockProgressData);

  return (
    <div className="min-h-screen w-full pb-2 px-2 py-6 bg-slate-200">
      <MobileDock />
      <div className="max-w-4xl mx-auto">
        <Card className="w-full max-w-md mx-auto mb-8">
          <CardHeader className="flex flex-row items-center justify-center space-y-0 pb-2">
            <BarChart className="h-6 w-6 text-primary mr-2" />
            <CardTitle className="text-xl font-bold">Learning Analytics</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription className="text-center">
              AI-powered insights to optimize your learning journey
            </CardDescription>
          </CardContent>
        </Card>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Cards Reviewed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl font-bold">{progressData.cardsReviewed}</span>
              </div>
              <CardDescription>
                Keep up the momentum! Consistent review leads to better retention.
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Retention Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-2">
                <Brain className="h-8 w-8 text-primary" />
                <span className="text-2xl font-bold">{progressData.retentionRate}%</span>
              </div>
              <CardDescription>
                Great job! This is the percentage of cards you&apos;re remembering well.
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Current Streak</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-2">
                <Calendar className="h-8 w-8 text-primary" />
                <span className="text-2xl font-bold">{progressData.streak} days</span>
              </div>
              <CardDescription>
                Your consistency is key to long-term learning success!
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">AI-Generated Cards</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-2">
                <Sparkles className="h-8 w-8 text-primary" />
                <span className="text-2xl font-bold">{progressData.aiGeneratedCards}</span>
              </div>
              <CardDescription>
                Our AI has created these cards to enhance your learning experience.
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="text-lg">AI-Identified Knowledge Gaps</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc pl-5">
              {progressData.knowledgeGaps.map((gap, index) => (
                <li key={index} className="mb-2">{gap}</li>
              ))}
            </ul>
            <CardDescription className="mt-4">
              Our AI has identified these areas for improvement. Focus on these topics to boost your overall performance.
            </CardDescription>
          </CardContent>
        </Card>

        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="text-lg">AI-Powered Study Recommendations</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc pl-5">
              <li className="mb-2">Review &quot;React Hooks&quot; cards more frequently to improve retention</li>
              <li className="mb-2">Create additional cards for &quot;SQL Joins&quot; to reinforce understanding</li>
              <li className="mb-2">Consider using our AI-generated explanations for &quot;Machine Learning Algorithms&quot;</li>
            </ul>
            <CardDescription className="mt-4">
              These personalized recommendations are based on your learning patterns and performance data.
            </CardDescription>
          </CardContent>
        </Card>
      </div>
      <Toaster />
    </div>
  );
}
