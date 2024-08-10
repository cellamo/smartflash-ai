import { Navbar } from "@/components/layout/navbar";
import { BenefitsSection } from "@/components/layout/sections/benefits";
import { FAQSection } from "@/components/layout/sections/faq";
import { FeaturesSection } from "@/components/layout/sections/features";
import { FooterSection } from "@/components/layout/sections/footer";
import { HeroSection } from "@/components/layout/sections/hero";
import { PricingSection } from "@/components/layout/sections/pricing";
import { ServicesSection } from "@/components/layout/sections/services";
import { SponsorsSection } from "@/components/layout/sections/sponsors";
import { TeamSection } from "@/components/layout/sections/team";
import { TestimonialSection } from "@/components/layout/sections/testimonial";
import { Separator } from "@/components/ui/separator";

export default function Home() {
  return (
    <>
      <Navbar />
      <HeroSection />
      <Separator />
      <SponsorsSection />
      <Separator />
      <BenefitsSection />
      <Separator />
      <FeaturesSection />
      <Separator />
      {/* <ServicesSection /> */}

      <TestimonialSection />
      <Separator />
      {/* <TeamSection /> */}
      <PricingSection />
      <Separator />
      <FAQSection />
      <FooterSection />
    </>
  );
}
