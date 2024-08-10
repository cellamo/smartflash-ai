import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { icons } from "lucide-react";

interface FeaturesProps {
  icon: string;
  title: string;
  description: string;
}

const featureList: FeaturesProps[] = [
  {
    icon: "Brain",
    title: "AI-Powered Learning",
    description:
      "Leverage advanced AI algorithms to optimize your learning experience and adapt to your individual needs.",
  },
  {
    icon: "Clock",
    title: "Smart Spaced Repetition",
    description:
      "Enhance retention with our intelligent spaced repetition system that schedules reviews at optimal intervals.",
  },
  {
    icon: "Sparkles",
    title: "Adaptive Difficulty",
    description:
      "Experience dynamic difficulty adjustments that keep you challenged and engaged throughout your learning journey.",
  },
  {
    icon: "Lightbulb",
    title: "AI Content Generation",
    description:
      "Generate high-quality flashcards and quizzes automatically using our advanced AI content creation tools.",
  },
  {
    icon: "BarChart2",
    title: "Progress Analytics",
    description:
      "Track your learning progress with detailed analytics and insights to optimize your study strategy.",
  },
  {
    icon: "Smartphone",
    title: "Cross-Platform Sync",
    description:
      "Seamlessly continue your learning across all your devices with our robust synchronization feature.",
  },
];

export const FeaturesSection = () => {
  return (
    <section id="features" className="container py-24 sm:py-32">
      <h2 className="text-lg text-primary text-center mb-2 tracking-wider">
        Features
      </h2>

      <h2 className="text-3xl md:text-4xl text-center font-bold mb-4">
        Elevate Your Learning Experience
      </h2>

      <h3 className="md:w-1/2 mx-auto text-xl text-center text-muted-foreground mb-8">
        SmartFlash AI combines cutting-edge technology with proven learning techniques to provide you with a powerful, personalized study tool.
      </h3>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {featureList.map(({ icon, title, description }) => (
          <div key={title}>
            <Card className="h-full bg-background border-0 shadow-none">
              <CardHeader className="flex justify-center items-center">
                <div className="bg-primary/20 p-2 rounded-full ring-8 ring-primary/10 mb-4">
                  <Icon
                    name={icon as keyof typeof icons}
                    size={24}
                    color="hsl(var(--primary))"
                    className="text-primary"
                  />
                </div>

                <CardTitle>{title}</CardTitle>
              </CardHeader>

              <CardContent className="text-muted-foreground text-center">
                {description}
              </CardContent>
            </Card>
          </div>
        ))}
      </div>
    </section>
  );
};
