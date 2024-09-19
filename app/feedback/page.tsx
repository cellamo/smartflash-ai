"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Database } from "@/types/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { MobileDock } from "@/components/MobileDock";
import { Toaster } from "@/components/ui/sonner";
import { MessageSquare } from "lucide-react";

type FeedbackType = "bug" | "feature_request" | "general";

interface FeedbackForm {
  feedback_type: FeedbackType;
  message: string;
}

export default function FeedbackPage() {
  const [formState, setFormState] = useState<FeedbackForm>({
    feedback_type: "general",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const supabase = createClientComponentClient<Database>();
  const router = useRouter();

  function handleInputChange(key: keyof FeedbackForm, value: any) {
    setFormState({ ...formState, [key]: value });
  }

  async function handleSubmit() {
    setIsSubmitting(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      toast.error("You must be logged in to submit feedback");
      setIsSubmitting(false);
      return;
    }

    const { error } = await supabase.from("feedbacks").insert({
      user_id: user.id,
      feedback_type: formState.feedback_type,
      message: formState.message,
    });

    if (error) {
      console.error("Error submitting feedback:", error);
      toast.error("Failed to submit feedback");
    } else {
      toast.success("Thank you for your feedback!");
      router.back();
    }
    setIsSubmitting(false);
  }

  return (
    <div className="flex flex-col min-h-screen bg-slate-200 dark:bg-slate-900">
      <main className="flex-1 overflow-y-auto p-4 pb-20">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl font-bold flex items-center">
              <MessageSquare className="mr-2" />
              Submit Feedback
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="feedbackType">Feedback Type</Label>
                <Select
                  value={formState.feedback_type}
                  onValueChange={(value: FeedbackType) => handleInputChange("feedback_type", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select feedback type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bug">Bug Report</SelectItem>
                    <SelectItem value="feature_request">Feature Request</SelectItem>
                    <SelectItem value="general">General Feedback</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="message">Your Message</Label>
                <Textarea
                  id="message"
                  value={formState.message}
                  onChange={(e) => handleInputChange("message", e.target.value)}
                  placeholder="Describe your issue or feedback here..."
                  className="bg-slate-200 dark:bg-slate-700"
                />
              </div>
              <div className="mt-6">
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting || formState.message.trim() === ""}
                  className="dark:bg-gray-700 dark:text-white"
                >
                  {isSubmitting ? "Submitting..." : "Submit Feedback"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
      <MobileDock />
      <Toaster />
    </div>
  );
}
