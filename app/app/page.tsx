// app/page.tsx
"use client";
import Link from "next/link";
import { Brain, Lightbulb, Flame, Sparkles ,ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { NavBarDock } from "@/components/NavBarDock";
import { DashboardCard } from "@/components/DashboardCard";
import { RecentX } from "@/components/RecentX";

export default function App() {
  return (
    <div className="flex min-h-screen w-full flex-col">
      <NavBarDock />
      <main className="flex flex-1 flex-col gap-4 p-4 bg-slate-800 md:gap-8 md:p-8 md:pt-4">
      <div className="grid grid-cols-2 gap-4">
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



        <div className="grid gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-3">
          <Card className="xl:col-span-2">
            <CardHeader className="flex flex-row items-center">
              <div className="grid gap-2">
                <CardTitle>Transactions</CardTitle>
                <CardDescription>
                  Recent transactions from your store.
                </CardDescription>
              </div>
              <Button asChild size="sm" className="ml-auto gap-1">
                <Link href="#">
                  View All
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>{/* Add transaction content here */}</CardContent>
          </Card>
          <RecentX />
        </div>
      </main>
    </div>
  );
}