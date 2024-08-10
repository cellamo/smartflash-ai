import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Check } from "lucide-react";

enum PopularPlan {
  NO = 0,
  YES = 1,
}

interface PlanProps {
  title: string;
  popular: PopularPlan;
  price: number;
  description: string;
  buttonText: string;
  benefitList: string[];
}

const plans: PlanProps[] = [
  {
    title: "Basic",
    popular: 0,
    price: 0,
    description:
      "Perfect for casual learners and students looking to enhance their study habits.",
    buttonText: "Start Free",
    benefitList: [
      "100 AI-generated flashcards per month",
      "Basic spaced repetition algorithm",
      "1 custom deck",
      "Community support",
      "Web access",
    ],
  },
  {
    title: "Pro",
    popular: 1,
    price: 2.99,
    description:
      "Ideal for serious learners, professionals, and educators seeking advanced features.",
    buttonText: "Get Pro",
    benefitList: [
      "Unlimited AI-generated flashcards",
      "Advanced adaptive learning algorithm",
      "Unlimited custom decks",
      "Priority support",
      "Web and mobile app access",
    ],
  },
  {
    title: "Enterprise",
    popular: 0,
    price: 19.99,
    description:
      "Tailored solutions for organizations and institutions with specific learning needs.",
    buttonText: "Contact Us",
    benefitList: [
      "Custom AI model training",
      "Advanced analytics and reporting",
      "Dedicated account manager",
      "API access",
      "Custom integrations",
    ],
  },
];

export const PricingSection = () => {
  return (
    <section id="pricing" className="container py-24 sm:py-32">
      <h2 className="text-lg text-primary text-center mb-2 tracking-wider">
        Pricing Plans
      </h2>

      <h2 className="text-3xl md:text-4xl text-center font-bold mb-4">
        Choose Your Learning Journey
      </h2>

      <h3 className="md:w-1/2 mx-auto text-xl text-center text-muted-foreground pb-14">
        Select the plan that best fits your learning goals and unlock the full potential of SmartFlash AI.
      </h3>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-4">
        {plans.map(
          ({ title, popular, price, description, buttonText, benefitList }) => (
            <Card
              key={title}
              className={
                popular === PopularPlan?.YES
                  ? "drop-shadow-xl shadow-black/10 dark:shadow-white/10 border-[1.5px] border-primary lg:scale-[1.1]"
                  : ""
              }
            >
              <CardHeader>
                <CardTitle className="pb-2">{title}</CardTitle>

                <CardDescription className="pb-4">
                  {description}
                </CardDescription>

                <div>
                  <span className="text-3xl font-bold">${price}</span>
                  <span className="text-muted-foreground"> /month</span>
                </div>
              </CardHeader>

              <CardContent className="flex">
                <div className="space-y-4">
                  {benefitList.map((benefit) => (
                    <span key={benefit} className="flex">
                      <Check className="text-primary mr-2" />
                      <h3>{benefit}</h3>
                    </span>
                  ))}
                </div>
              </CardContent>

              <CardFooter>
                <Button
                  variant={
                    popular === PopularPlan?.YES ? "default" : "secondary"
                  }
                  className="w-full"
                >
                  {buttonText}
                </Button>
              </CardFooter>
            </Card>
          )
        )}
      </div>
    </section>
  );
};
