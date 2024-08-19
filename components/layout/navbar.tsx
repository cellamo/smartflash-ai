"use client";
import { ChevronsDown, Github, Menu, Zap, LogIn, Rocket } from "lucide-react";
import React, { useEffect, useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../ui/sheet";
import { Separator } from "../ui/separator";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "../ui/navigation-menu";
import { Button } from "../ui/button";
import Link from "next/link";
import Image from "next/image";
import { ToggleTheme } from "./toogle-theme";
import { ModeToggle } from "../ui/mode-toggle";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { User } from '@supabase/supabase-js';

interface RouteProps {
  href: string;
  label: string;
}

interface FeatureProps {
  title: string;
  description: string;
}

const routeList: RouteProps[] = [
  {
    href: "#testimonials",
    label: "Testimonials",
  },
  {
    href: "#pricing",
    label: "Pricing",
  },
  {
    href: "#faq",
    label: "FAQ",
  },
];

const featureList: FeatureProps[] = [
  {
    title: "AI-Powered Learning",
    description: "Leverage advanced AI for automatic flashcard creation and personalized study recommendations.",
  },
  {
    title: "Adaptive Algorithms",
    description: "Optimize your learning with performance analysis and difficulty adjustment based on your progress.",
  },
  {
    title: "Cross-Platform Sync",
    description: "Seamlessly synchronize your study materials across web, mobile, and desktop platforms.",
  },
];

export const Navbar = () => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [isLoggedIn, setIsLoggedIn] = React.useState(true);
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const supabase = createClientComponentClient();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    checkUser();
  }, [supabase.auth]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    router.push('/');
  };

  const handleLaunchApp = () => {
    router.push("/app");
  };

  const handleFeaturesClick = () => {
    const featuresSection = document.getElementById('features');
    if (featuresSection) {
      featuresSection.scrollIntoView({ behavior: 'smooth' });
    }
    setIsOpen(false);
  };

  const handleAuth = () => {
    router.push("/auth");
  };

  return (
<header className={`shadow-inner w-[90%] md:w-[70%] lg:w-[75%] lg:max-w-screen-xl top-5 mx-auto sticky border border-secondary z-40 rounded-2xl flex justify-between items-center p-2 bg-background/80 backdrop-blur-sm webkit-backdrop-blur-sm transition-colors duration-300`}>
<Link href="/" className="font-bold text-lg flex items-center">
        <Zap />
        SmartFlash AI
      </Link>
      {/* <!-- Mobile --> */}
      <div className="flex items-center lg:hidden">
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Menu
              onClick={() => setIsOpen(!isOpen)}
              className="cursor-pointer lg:hidden"
            />
          </SheetTrigger>

          <SheetContent
            side="top"
            className="flex flex-col justify-between rounded-b-2xl bg-card border-secondary h-[50vh]"
            >
            <div>
              <SheetHeader className="mb-4 ml-4">
                <SheetTitle className="flex items-center">
                  <Link href="/" className="flex items-center">
                    <Zap />
                    SmartFlash AI
                  </Link>
                </SheetTitle>
              </SheetHeader>

              <div className="flex flex-col gap-2">
                <Button
                  onClick={handleFeaturesClick}
                  variant="ghost"
                  className="justify-start text-base"
                >
                  Features
                </Button>
                {routeList.map(({ href, label }) => (
                  <Button
                    key={href}
                    onClick={() => setIsOpen(false)}
                    asChild
                    variant="ghost"
                    className="justify-start text-base"
                  >
                    <Link href={href}>{label}</Link>
                  </Button>
                ))}
              </div>
            </div>

            <SheetFooter className="flex-col sm:flex-col justify-start items-start">
  <Separator className="mb-2" />
  <ModeToggle />
  {!isLoggedIn ? (
    <Button variant="outline" size="sm" className="mt-2 w-full flex items-center justify-center">
      <LogIn className="mr-2 h-4 w-4" />
      Login / Signup
    </Button>
  ) : (
    <Button
      size="sm"
      onClick={handleLaunchApp}
      className="mt-2 w-full bg-gradient-to-r from-slate-400 to-slate-600 text-white hover:from-slate-500 hover:to-slate-700 flex items-center justify-center"
    >
      <Rocket className="mr-2 h-4 w-4" />
      Launch App
    </Button>
  )}
</SheetFooter>
          </SheetContent>
        </Sheet>
      </div>

      {/* <!-- Desktop --> */}
      {/* <!-- Desktop --> */}
      <NavigationMenu className="hidden lg:block mx-auto">
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuTrigger 
              className="bg-card text-base"
              onClick={handleFeaturesClick}
            >
              Features
            </NavigationMenuTrigger>
            <NavigationMenuContent>
              <div className="grid w-[600px] grid-cols-2 gap-5 p-4">
                <Image
                  src="https://avatars.githubusercontent.com/u/75042455?v=4"
                  alt="RadixLogo"
                  className="h-full w-full rounded-md object-cover"
                  width={600}
                  height={600}
                />
                <ul className="flex flex-col gap-2">
                  {featureList.map(({ title, description }) => (
                    <li
                      key={title}
                      className="rounded-md p-3 text-sm hover:bg-muted"
                    >
                      <p className="mb-1 font-semibold leading-none text-foreground">
                        {title}
                      </p>
                      <p className="line-clamp-2 text-muted-foreground">
                        {description}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
            </NavigationMenuContent>
          </NavigationMenuItem>

          <NavigationMenuItem>
            {routeList.map(({ href, label }) => (
              <NavigationMenuLink key={href} asChild>
                <Link href={href} className="text-base px-2">
                  {label}
                </Link>
              </NavigationMenuLink>
            ))}
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>

      <div className="hidden lg:flex items-center space-x-2">
        {user ? (
          <>
            <Button
              size="sm"
              onClick={handleLaunchApp}
              className="bg-gradient-to-r from-slate-400 to-slate-600 text-white hover:from-slate-500 hover:to-slate-700 flex items-center"
            >
              <Rocket className="mr-2 h-4 w-4" />
              Launch App
            </Button>
            <Button
              size="sm"
              onClick={handleLogout}
              variant="outline"
            >
              Logout
            </Button>
          </>
        ) : (
          <Button
            size="sm"
            onClick={handleAuth}
            className="bg-gradient-to-r from-slate-400 to-slate-600 text-white hover:from-slate-500 hover:to-slate-700 flex items-center"
          >
            <LogIn className="mr-2 h-4 w-4" />
            Login / Signup
          </Button>
        )}
        <ModeToggle />
      </div>
    </header>
  );
};