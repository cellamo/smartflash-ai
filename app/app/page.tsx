// app/page.tsx
"use client";
import Link from "next/link";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import {
  Brain,
  Lightbulb,
  Flame,
  Sparkles,
  ArrowUpRight,
  AlertCircle,
  TrendingUp,
  Zap,
  ArrowLeft,
  BarChart2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { NavBarDock } from "@/components/NavBarDock";
import { DashboardCard } from "@/components/DashboardCard";
import { RecentX } from "@/components/RecentX";
import { useEffect, useState } from "react";
import { MobileDock } from "@/components/MobileDock";
import StudyProgressOverview from "@/components/StudyProgressOverview";

export default function App() {
  const [isMobile, setIsMobile] = useState(false);
  const [userName, setUserName] = useState("");
  const supabase = createClientComponentClient();

  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth <= 768); // Adjust the breakpoint as needed
    };

    const fetchUserName = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user && user.user_metadata && user.user_metadata.full_name) {
        let name = user.user_metadata.full_name;
        if (name.includes(" ")) {
          name = name.split(" ")[0];
        }
        setUserName(name);
      } else {
        setUserName("User"); // Fallback if first name is not available
      }
    };

    fetchUserName();
    checkIfMobile();
    window.addEventListener("resize", checkIfMobile);

    return () => {
      window.removeEventListener("resize", checkIfMobile);
    };
  }, [supabase]);

  if (!isMobile) {
    return (
      <div className="flex min-h-screen w-full flex-col items-center justify-center bg-slate-200 dark:bg-slate-900 p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">
              We&apos;re Working on It!
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center text-muted-foreground mb-4">
              The desktop version of our app is currently under development. For
              the best experience, please use a mobile device to access
              SmartFlash AI.
            </p>
            <p className="text-center text-sm text-muted-foreground mb-6">
              We appreciate your patience and look forward to bringing you a
              fully responsive experience soon!
            </p>
            <div className="flex justify-center">
              <Button asChild className="dark:bg-gray-700 dark:text-white">
                <Link href="/">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Home Page
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isMobile) {
    return (
      <div className="flex min-h-screen w-full flex-col pb-16">
        <MobileDock />
        <main className="flex flex-1 flex-col gap-4 p-2 bg-slate-200 dark:bg-slate-900 md:gap-8 md:p-8 md:pt-4 w-full">
          <Card className="w-full max-w-md mx-auto mt-auto">
            <CardHeader className="flex flex-row items-center justify-center space-y-0 pb-2">
              <Zap className="h-6 w-6 text-primary mr-2" />
              <CardTitle className="text-xl font-bold">
                Welcome, {userName}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center">
                Great to see you! <br></br> Ready for a productive session?
              </CardDescription>
            </CardContent>
          </Card>
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:hidden gap-2 max-w-4xl mx-auto">
            <DashboardCard
              title="Flashcards Reviewed"
              value="1,234"
              description="+15% from last week"
              icon={Brain}
            />
            <DashboardCard
              title="New Words Learned"
              value="78"
              description="+23% from last week"
              icon={Lightbulb}
            />
            <DashboardCard
              title="Streak"
              value="12 days"
              description="Keep it up!"
              icon={Flame}
            />
            <DashboardCard
              title="AI-Generated Cards"
              value="56"
              description="+10 since yesterday"
              icon={Sparkles}
            />
          </div>

          <div className="grid gap-4 md:hidden lg:grid-cols-2 xl:hidden">
            <StudyProgressOverview />
            <Card className="xl:hidden">
              <CardHeader className="flex flex-row items-center">
                <div className="grid gap-4 md:gap-8">
                  <CardTitle>AI Study Recommendations</CardTitle>
                  <CardDescription>
                    Personalized suggestions to optimize your learning
                  </CardDescription>
                </div>
                <Button asChild size="sm" className="ml-2 gap-1 dark:bg-gray-700 dark:text-white">
                  <Link href="/study-plan">
                    View Plan
                    <ArrowUpRight className="h-4 w-4" />
                  </Link>
                </Button>
              </CardHeader>
              <CardContent>
                <ul className="space-y-4">
                  <li className="flex items-center gap-3">
                    <Brain className="h-5 w-5 text-primary" />
                    <span>
                      Review &quot;JavaScript Promises&quot; deck - Due for
                      spaced repetition
                    </span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Sparkles className="h-5 w-5 text-primary" />
                    <span>
                      New AI-generated deck available: &quot;Advanced React
                      Hooks&quot;
                    </span>
                  </li>
                  <li className="flex items-center gap-3">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    <span>
                      Your retention rate for &quot;Data Structures&quot; is
                      improving - Keep it up!
                    </span>
                  </li>
                  <li className="flex items-center gap-3">
                    <AlertCircle className="h-5 w-5 text-primary" />
                    <span>
                      Struggling with &quot;Machine Learning Basics&quot;? Try
                      our new AI-assisted explanations
                    </span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <RecentX />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full flex-col">
      {!isMobile && <NavBarDock />}
      <main className="flex flex-1 flex-col gap-4 p-2 bg-slate-800 dark:bg-slate-900 md:gap-8 md:p-8 md:pt-4 w-full">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:hidden gap-2 max-w-4xl mx-auto">
          <DashboardCard
            title="Flashcards Reviewed"
            value="1,234"
            description="+15% from last week"
            icon={Brain}
          />
          <DashboardCard
            title="New Words Learned"
            value="78"
            description="+23% from last week"
            icon={Lightbulb}
          />
          <DashboardCard
            title="Streak"
            value="12 days"
            description="Keep it up!"
            icon={Flame}
          />
          <DashboardCard
            title="AI-Generated Cards"
            value="56"
            description="+10 since yesterday"
            icon={Sparkles}
          />
        </div>

        <div className="grid gap-4 md:gap-8 lg:hidden xl:grid-cols-3">
          <StudyProgressOverview />
          <Card className="xl:col-span-2">
            <CardHeader className="flex flex-row items-center">
              <div className="grid gap-4 md:gap-8">
                <CardTitle>AI Study Recommendations</CardTitle>
                <CardDescription>
                  Personalized suggestions to optimize your learning
                </CardDescription>
              </div>
              <Button asChild size="sm" className="ml-2 gap-1 dark:bg-gray-700 dark:text-white">
                <Link href="/study-plan">
                  View Plan
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              <ul className="space-y-4">
                <li className="flex items-center gap-3">
                  <Brain className="h-5 w-5 text-primary" />
                  <span>
                    Review &quot;JavaScript Promises&quot; deck - Due for spaced
                    repetition
                  </span>
                </li>
                <li className="flex items-center gap-3">
                  <Sparkles className="h-5 w-5 text-primary" />
                  <span>
                    New AI-generated deck available: &quot;Advanced React
                    Hooks&quot;
                  </span>
                </li>
                <li className="flex items-center gap-3">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  <span>
                    Your retention rate for &quot;Data Structures&quot; is
                    improving - Keep it up!
                  </span>
                </li>
                <li className="flex items-center gap-3">
                  <AlertCircle className="h-5 w-5 text-primary" />
                  <span>
                    Struggling with &quot;Machine Learning Basics&quot;? Try our
                    new AI-assisted explanations
                  </span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <RecentX />
        </div>
      </main>
    </div>
  );
}
