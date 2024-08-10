import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { icons } from "lucide-react";

interface BenefitsProps {
  icon: string;
  title: string;
  description: string;
}

const benefitList: BenefitsProps[] = [
  {
    icon: "Brain",
    title: "AI-Powered Learning",
    description:
      "Leverage advanced AI algorithms to optimize your learning experience and improve retention rates.",
  },
  {
    icon: "LineChart",
    title: "Adaptive Difficulty",
    description:
      "Experience a personalized learning journey with our smart difficulty adjustment based on your performance.",
  },
  {
    icon: "Sparkles",
    title: "Content Generation",
    description:
      "Automatically generate high-quality flashcards and quizzes using our AI-powered content creation tools.",
  },
  {
    icon: "BarChart2",
    title: "Detailed Analytics",
    description:
      "Track your progress with comprehensive analytics and insights to optimize your study strategy.",
  },
];

export const BenefitsSection = () => {
  return (
    <section id="benefits" className="container py-24 sm:py-32">
      <div className="grid lg:grid-cols-2 place-items-center lg:gap-24">
        <div>
          <h2 className="text-lg text-primary mb-2 tracking-wider">Benefits</h2>

          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Supercharge Your Learning
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            SmartFlash AI combines cutting-edge technology with proven learning
            techniques to provide an unparalleled educational experience.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-4 w-full">
          {benefitList.map(({ icon, title, description }, index) => (
            <Card
              key={title}
              className="bg-muted/50 dark:bg-card hover:bg-background transition-all delay-75 group/number"
            >
              <CardHeader>
                <div className="flex justify-between">
                  <Icon
                    name={icon as keyof typeof icons}
                    size={32}
                    color="hsl(var(--primary))"
                    className="mb-6 text-primary"
                  />
                  <span className="text-5xl text-muted-foreground/15 font-medium transition-all delay-75 group-hover/number:text-muted-foreground/30">
                    0{index + 1}
                  </span>
                </div>

                <CardTitle>{title}</CardTitle>
              </CardHeader>

              <CardContent className="text-muted-foreground">
                {description}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
