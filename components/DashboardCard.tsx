// components/DashboardCard.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface DashboardCardProps {
  title: string;
  value: string;
  description: string;
  icon: LucideIcon;
}

export function DashboardCard({ title, value, description, icon: Icon }: DashboardCardProps) {
  return (
    <Card className="sm:p-4">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
        <CardTitle className="text-xs font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 ml-1 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}