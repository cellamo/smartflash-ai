"use client";

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { MobileDock } from '@/components/MobileDock';
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import { User } from "lucide-react";

interface UserSettings {
  id: string;
  full_name: string;
  email: string;
  bio: string;
  avatar_url: string;
  daily_review_limit: number;
  notifications_enabled: boolean;
  default_study_duration: number;
  preferred_study_mode: 'standard' | 'spaced_repetition';
  sound_enabled: boolean;
  role: 'free' | 'premium';
}
export default function SettingsPage() {
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClientComponentClient();
  const router = useRouter();
  const [localDailyLimit, setLocalDailyLimit] = useState(settings?.daily_review_limit || 50);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error fetching settings:', error);
        toast.error('Failed to load settings');
      } else {
        setSettings(data as UserSettings);
        setLocalDailyLimit(data.daily_review_limit);
      }
    }
    setIsLoading(false);
  };

  const updateSettings = async (key: keyof UserSettings, value: any) => {
    if (!settings) return;
    setSettings({ ...settings, [key]: value });
  };

  const saveAllSettings = async () => {
    if (!settings) return;

    const { error } = await supabase
      .from('profiles')
      .update(settings)
      .eq('id', settings.id);

    if (error) {
      console.error('Error updating settings:', error);
      toast.error('Failed to update settings');
    } else {
      toast.success('Settings updated successfully');
      router.back();
    }
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (!settings) {
    return <div className="flex justify-center items-center h-screen">No settings found</div>;
  }

  return (
    <div className="flex flex-col min-h-screen bg-slate-200 dark:bg-slate-900">
      <main className="flex-1 overflow-y-auto p-4 pb-20">
        <Card className="max-w-2xl mx-auto mb-8">
          <CardHeader>
            <CardTitle className="text-2xl font-bold flex items-center">
              <User className="mr-2" />
              Settings
            </CardTitle>
            <CardDescription>Manage your account settings and preferences</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="profile">
              <TabsList className="grid w-full grid-cols-2 bg-slate-200 dark:bg-slate-700">
                <TabsTrigger value="profile">Profile</TabsTrigger>
                <TabsTrigger value="app">App Settings</TabsTrigger>
              </TabsList>
              <TabsContent value="profile">
                <div className="space-y-4 mt-4">
                  <div>
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input
                      id="fullName"
                      value={settings.full_name}
                      onChange={(e) => updateSettings('full_name', e.target.value)}
                      className='bg-slate-200 dark:bg-slate-700'
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" value={settings.email} disabled className='bg-slate-200 dark:bg-slate-700' />
                  </div>
                  <div>
                    <Label htmlFor="bio">Biography</Label>
                    <Input
                      id="bio"
                      value={settings.bio || ''}
                      onChange={(e) => updateSettings('bio', e.target.value)}
                      className="bg-slate-200 dark:bg-slate-700"
                    />
                  </div>
                  <div>
                    <Label htmlFor="avatar">Avatar URL</Label>
                    <Input
                      id="avatar"
                      value={settings.avatar_url || ''}
                      onChange={(e) => updateSettings('avatar_url', e.target.value)}
                      className="bg-slate-200 dark:bg-slate-700"
                    />
                  </div>
                  <Separator />
                  <div>
                    <Label>Subscription</Label>
                    <p className="text-sm text-muted-foreground mb-2">
                      {settings.role === 'premium' ? 'Premium Account' : 'Free Account'}
                    </p>
                    <Button onClick={() => router.push('/subscription')} className='dark:bg-gray-700 dark:text-white'>
                      {settings.role === 'premium' ? 'Manage Subscription' : 'Upgrade to Premium'}
                    </Button>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="app">
                <div className="space-y-4 mt-4">
                  <div>
                    <Label htmlFor="dailyLimit">Daily Flashcard Review Limit</Label>
                    <div className="flex items-center space-x-2">
                      <Slider
                        id="dailyLimit"
                        min={10}
                        max={200}
                        step={10}
                        value={[localDailyLimit]}
                        onValueChange={(value: number[]) => setLocalDailyLimit(value[0])}
                        onValueCommit={(value: number[]) => updateSettings('daily_review_limit', value[0])}
                      />
                      <span>{localDailyLimit}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="notifications">Enable Notifications</Label>
                    <Switch
                      id="notifications"
                      checked={settings.notifications_enabled}
                      onCheckedChange={(checked: boolean) => updateSettings('notifications_enabled', checked)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="studyDuration">Default Study Duration (minutes)</Label>
                    <Input
                      id="studyDuration"
                      type="number"
                      value={settings.default_study_duration}
                      onChange={(e) => updateSettings('default_study_duration', parseInt(e.target.value))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="studyMode">Preferred Study Mode</Label>
                    <Select
                      value={settings.preferred_study_mode}
                      onValueChange={(value: 'standard' | 'spaced_repetition') => updateSettings('preferred_study_mode', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select study mode" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="standard">Standard</SelectItem>
                        <SelectItem value="spaced_repetition">Spaced Repetition</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="sound">Enable Sound</Label>
                    <Switch
                      id="sound"
                      checked={settings.sound_enabled}
                      onCheckedChange={(checked: boolean) => updateSettings('sound_enabled', checked)}
                    />
                  </div>
                </div>
              </TabsContent>
            </Tabs>
            <div className="mt-6">
              <Button onClick={saveAllSettings} className='dark:bg-gray-700 dark:text-white'>Save and Return</Button>
            </div>
          </CardContent>
        </Card>
      </main>
      <MobileDock />
      <Toaster />
    </div>
  );
}