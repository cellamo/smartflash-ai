import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Brain, Target, Zap, BarChart2 } from "lucide-react";
import { Button } from './ui/button';
import Link from 'next/link';

const StudyProgressOverview: React.FC = () => {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-2xl">Study Progress Overview</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-6">
        <div>
          <div className="flex justify-between mb-2">
            <span className="text-sm font-medium">Daily Goal</span>
            <span className="text-sm font-medium">80%</span>
          </div>
          <Progress value={80} className="h-2" />
          <div className="flex items-center mt-2 text-sm text-muted-foreground">
            <Target className="mr-2 h-4 w-4" />
            <span>40/50 cards reviewed</span>
          </div>
        </div>

        <div>
          <div className="flex justify-between mb-2">
            <span className="text-sm font-medium">Weekly Progress</span>
            <span className="text-sm font-medium">65%</span>
          </div>
          <Progress value={65} className="h-2" />
          <div className="flex items-center mt-2 text-sm text-muted-foreground">
            <Brain className="mr-2 h-4 w-4" />
            <span>195/300 cards mastered this week</span>
          </div>
        </div>

        <div>
          <div className="flex justify-between mb-2">
            <span className="text-sm font-medium">Retention Rate</span>
            <span className="text-sm font-medium">92%</span>
          </div>
          <Progress value={92} className="h-2" />
          <div className="flex items-center mt-2 text-sm text-muted-foreground">
            <Zap className="mr-2 h-4 w-4" />
            <span>High retention on recent reviews</span>
          </div>
        </div>
      </CardContent>
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="flex flex-col items-center justify-center pb-2">
          <Button asChild size="sm">
            <Link href="/progress" className="flex items-center">
              <BarChart2 className="h-4 w-4 mr-2" />
              View Progress
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          <CardDescription className="text-center">
            Track your learning journey and see your improvements over time.
          </CardDescription>
        </CardContent>
      </Card>
    </Card>
  );
};

export default StudyProgressOverview;
