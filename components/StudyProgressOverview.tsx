import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Brain, Target, Zap } from "lucide-react";

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
    </Card>
  );
};

export default StudyProgressOverview;
