"use client";

import { useState } from 'react';
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { User } from '@supabase/supabase-js';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import { MobileDock } from '@/components/MobileDock';
import { Settings as SettingsIcon, User as UserIcon, Book, Bell, ChevronLeft, Sun, Moon, Lock, Trash2, ChevronDown } from "lucide-react";
import { useRouter } from 'next/navigation';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface SettingsProps {
  user: User;
  profile: any;
}

export default function Settings({ user, profile }: SettingsProps) {
  const supabase = createClientComponentClient();
  const router = useRouter();
  const [theme, setTheme] = useState(profile.theme || 'light');
  const [dailyReviewLimit, setDailyReviewLimit] = useState(profile.daily_review_limit || 50);
  const [fullName, setFullName] = useState(profile.full_name || '');
  const [bio, setBio] = useState(profile.bio || '');
  const [defaultStudyDuration, setDefaultStudyDuration] = useState(profile.default_study_duration || 20);
  const [preferredStudyMode, setPreferredStudyMode] = useState(profile.preferred_study_mode || 'flashcards');
  const [notificationsEnabled, setNotificationsEnabled] = useState(profile.notifications_enabled || false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const updateSettings = async () => {
    const { error } = await supabase
      .from('profiles')
      .update({
        theme,
        daily_review_limit: dailyReviewLimit,
        full_name: fullName,
        bio,
        default_study_duration: defaultStudyDuration,
        preferred_study_mode: preferredStudyMode,
        notifications_enabled: notificationsEnabled,
      })
      .eq('id', user.id);

    if (error) {
      console.error('Error updating settings:', error);
      toast.error('Failed to update settings');
    } else {
      toast.success('Settings updated successfully!');
    }
  };

  const changePassword = async () => {
    if (newPassword !== confirmNewPassword) {
      toast.error('New passwords do not match');
      return;
    }

    const { error } = await supabase.auth.updateUser({
      password: newPassword
    });

    if (error) {
      console.error('Error changing password:', error);
      toast.error('Failed to change password');
    } else {
      toast.success('Password changed successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
      setIsChangePasswordOpen(false);
    }
  };

  const deleteAccount = async () => {
    const { error } = await supabase.rpc('delete_user');
    if (error) {
      console.error('Error deleting account:', error);
      toast.error('Failed to delete account');
    } else {
      toast.success('Account deleted successfully');
      router.push('/');
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-200">
      <main className="flex-1 overflow-y-auto p-4 pb-16">
        <Card className="w-full max-w-2xl mx-auto mb-8">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <Button
              variant="outline"
              size="icon"
              className="border-slate-300"
              onClick={() => router.back()}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center">
              <SettingsIcon className="h-6 w-6 text-primary mr-2" />
              <CardTitle className="text-xl font-bold">Settings</CardTitle>
            </div>
            <div className="w-8"></div>
          </CardHeader>
          <CardContent>
            <CardDescription className="text-center mb-6">
              Customize your SmartFlash AI experience
            </CardDescription>

            <div className="space-y-6">
              <div className="flex items-center justify-center space-x-4">
                <div className="flex items-center">
                  <Sun className="h-5 w-5 mr-2" />
                  <span>Light</span>
                </div>
                <Switch
                  id="theme"
                  checked={theme === 'dark'}
                  onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
                  className="mx-2"
                />
                <div className="flex items-center">
                  <span>Dark</span>
                  <Moon className="h-5 w-5 ml-2" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="dailyReviewLimit">Daily Review Limit</Label>
                <Input
                  id="dailyReviewLimit"
                  type="number"
                  value={dailyReviewLimit}
                  onChange={(e) => setDailyReviewLimit(parseInt(e.target.value))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="defaultStudyDuration">Default Study Duration (minutes)</Label>
                <Input
                  id="defaultStudyDuration"
                  type="number"
                  value={defaultStudyDuration}
                  onChange={(e) => setDefaultStudyDuration(parseInt(e.target.value))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="preferredStudyMode">Preferred Study Mode</Label>
                <Select value={preferredStudyMode} onValueChange={setPreferredStudyMode}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select study mode" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="flashcards">Flashcards</SelectItem>
                    <SelectItem value="quiz">Quiz</SelectItem>
                    <SelectItem value="ai-assisted">AI-Assisted</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="notifications"
                  checked={notificationsEnabled}
                  onCheckedChange={setNotificationsEnabled}
                />
                <Label htmlFor="notifications">Enable Notifications</Label>
              </div>

              <Button onClick={updateSettings} className="w-full">
                Save Settings
              </Button>
            </div>

            <div className="space-y-6 mt-8">
              <Button
                onClick={() => setIsChangePasswordOpen(!isChangePasswordOpen)}
                className="w-full flex justify-between items-center"
                variant="outline"
              >
                <span className="flex items-center">
                  <Lock className="h-4 w-4 mr-2" />
                  Change Password
                </span>
                <ChevronDown className={`h-4 w-4 transition-transform ${isChangePasswordOpen ? 'rotate-180' : ''}`} />
              </Button>
              
              {isChangePasswordOpen && (
                <div className="space-y-4 mt-4 animate-slideDown">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">Current Password</Label>
                    <Input
                      id="currentPassword"
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">New Password</Label>
                    <Input
                      id="newPassword"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmNewPassword">Confirm New Password</Label>
                    <Input
                      id="confirmNewPassword"
                      type="password"
                      value={confirmNewPassword}
                      onChange={(e) => setConfirmNewPassword(e.target.value)}
                    />
                  </div>
                  <Button onClick={changePassword} className="w-full">
                    Update Password
                  </Button>
                </div>
              )}
            </div>

            <div className="mt-8">
              <h3 className="text-lg font-semibold text-red-600">Danger Zone</h3>
              <p className="text-sm text-gray-500 mt-1 mb-4">
                Once you delete your account, there is no going back. Please be certain.
              </p>
              <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" className="w-full">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Account
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete your account
                      and remove your data from our servers.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={deleteAccount}>Delete Account</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </CardContent>
        </Card>
      </main>
      <MobileDock />
      <Toaster />
    </div>
  );
}