import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface FAQProps {
  question: string;
  answer: string;
  value: string;
}

const FAQList: FAQProps[] = [
  {
    question: "What is SmartFlash AI?",
    answer: "SmartFlash AI is an advanced spaced repetition learning app that uses artificial intelligence to enhance your learning experience. It builds upon traditional flashcard methods while introducing adaptive learning algorithms and AI-powered content generation.",
    value: "item-1",
  },
  {
    question: "How does SmartFlash AI differ from traditional flashcard apps?",
    answer: "SmartFlash AI leverages AI to personalize your learning experience, generate content, and optimize review schedules. It also features a modern design and more engaging learning interactions compared to traditional apps.",
    value: "item-2",
  },
  {
    question: "Can SmartFlash AI generate flashcards for me?",
    answer: "Yes, SmartFlash AI can generate flashcards based on the content you provide or topics you want to study. The AI assists in creating comprehensive and effective learning materials.",
    value: "item-3",
  },
  {
    question: "Is SmartFlash AI suitable for all types of learners?",
    answer: "Absolutely! SmartFlash AI is designed for students, professionals, and lifelong learners across various subjects and skill levels. Its adaptive algorithms cater to individual learning needs.",
    value: "item-4",
  },
  {
    question: "How does the AI-powered spaced repetition work?",
    answer: "SmartFlash AI uses machine learning algorithms to analyze your performance and optimize the timing of card reviews. This ensures you review information at the most effective intervals for long-term retention.",
    value: "item-5",
  },
];

export const FAQSection = () => {
  return (
    <section id="faq" className="container md:w-[700px] py-24 sm:py-32">
      <div className="text-center mb-8">
        <h2 className="text-lg text-primary text-center mb-2 tracking-wider">
          FAQs
        </h2>

        <h2 className="text-3xl md:text-4xl text-center font-bold">
          Frequently Asked Questions
        </h2>
      </div>

      <Accordion type="single" collapsible className="AccordionRoot">
        {FAQList.map(({ question, answer, value }) => (
          <AccordionItem key={value} value={value}>
            <AccordionTrigger className="text-left">
              {question}
            </AccordionTrigger>

            <AccordionContent>{answer}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
};