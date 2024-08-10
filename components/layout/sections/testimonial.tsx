"use client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Star } from "lucide-react";

interface ReviewProps {
  image: string;
  name: string;
  userName: string;
  comment: string;
  rating: number;
}

const reviewList: ReviewProps[] = [
  {
    image: "https://github.com/shadcn.png",
    name: "Emily Chen",
    userName: "Medical Student",
    comment:
      "SmartFlash AI has revolutionized my study routine. The AI-powered content generation saves me hours of prep time!",
    rating: 4.0,
  },
  {
    image: "https://github.com/shadcn.png",
    name: "Alex Rodriguez",
    userName: "Software Engineer",
    comment:
      "The adaptive learning algorithms in SmartFlash AI have significantly improved my retention of complex programming concepts.",
    rating: 4.8,
  },
  {
    image: "https://github.com/shadcn.png",
    name: "Sarah Johnson",
    userName: "Language Learner",
    comment:
      "I've tried many language learning apps, but SmartFlash AI's personalized approach has accelerated my progress like never before.",
    rating: 4.9,
  },
  {
    image: "https://github.com/shadcn.png",
    name: "Michael Lee",
    userName: "History Teacher",
    comment:
      "SmartFlash AI has transformed how I prepare my lessons. It's an invaluable tool for both educators and students alike.",
    rating: 5.0,
  },
  {
    image: "https://github.com/shadcn.png",
    name: "Lisa Patel",
    userName: "Business Analyst",
    comment:
      "The spaced repetition in SmartFlash AI helps me stay on top of industry trends and retain crucial information for my work.",
    rating: 5.0,
  },
  {
    image: "https://github.com/shadcn.png",
    name: "David Thompson",
    userName: "Lifelong Learner",
    comment:
      "At 65, I thought my learning days were behind me. SmartFlash AI proved me wrong - it's never too late to learn efficiently!",
    rating: 4.9,
  },
];

export const TestimonialSection = () => {
  return (
    <section id="testimonials" className="container py-24 sm:py-32">
      <div className="text-center mb-8">
        <h2 className="text-lg text-primary text-center mb-2 tracking-wider">
          Testimonials
        </h2>

        <h2 className="text-3xl md:text-4xl text-center font-bold mb-4">
          Hear From Our Satisfied Learners
        </h2>
      </div>

      <Carousel
        opts={{
          align: "start",
        }}
        className="relative w-[80%] sm:w-[90%] lg:max-w-screen-xl mx-auto"
      >
        <CarouselContent>
          {reviewList.map((review) => (
            <CarouselItem
              key={review.name}
              className="md:basis-1/2 lg:basis-1/3"
            >
              <Card className="bg-muted/50 dark:bg-card">
                <CardContent className="pt-6 pb-0">
                  <div className="flex gap-1 pb-6">
                    <Star className="size-4 fill-primary text-primary" />
                    <Star className="size-4 fill-primary text-primary" />
                    <Star className="size-4 fill-primary text-primary" />
                    <Star className="size-4 fill-primary text-primary" />
                    <Star className="size-4 fill-primary text-primary" />
                  </div>
                  {`"${review.comment}"`}
                </CardContent>

                <CardHeader>
                  <div className="flex flex-row items-center gap-4">
                    <Avatar>
                      <AvatarImage
                        src="https://avatars.githubusercontent.com/u/75042455?v=4"
                        alt="radix"
                      />
                      <AvatarFallback>SV</AvatarFallback>
                    </Avatar>

                    <div className="flex flex-col">
                      <CardTitle className="text-lg">{review.name}</CardTitle>
                      <CardDescription>{review.userName}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    </section>
  );
};
