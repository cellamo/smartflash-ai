"use client";

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import { User, BookOpen, Award, Clock, Zap } from "lucide-react";
import { MobileDock } from '@/components/MobileDock';
import { Badge } from "@/components/ui/badge";

interface Profile {
  id: string;
  full_name: string;
  email: string;
  bio: string;
  avatar_url: string;
  total_cards_studied: number;
  total_study_time: number;
  longest_streak: number;
  role: string;
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState<Partial<Profile>>({});
  const supabase = createClientComponentClient();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    fetchProfile();
  }, [searchParams]);

  const fetchProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      console.log('User info:', user);
      console.log('User metadata:', user.user_metadata);
      console.log('User role:', user.user_metadata?.role);

      // print the user profile details
      console.log('User profile:', profile);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
  
      if (error) {
        if (error.code === 'PGRST116') {
          // Profile doesn't exist, create a new one
          const newProfile = {
            id: user.id,
            full_name: user.user_metadata?.full_name || '',
            email: user.email || '',
            bio: 'You can edit your bio here',
            avatar_url: user.user_metadata?.avatar_url || '',
            total_cards_studied: 0,
            total_study_time: 0,
            longest_streak: 0,
            role: 'free',
          };
          const { data: createdProfile, error: createError } = await supabase
            .from('profiles')
            .insert(newProfile)
            .single();
  
          if (createError) {
            console.error('Error creating profile:', createError);
            toast.error('Failed to create profile');
          } else {
            setProfile(createdProfile);
          }
        } else {
          console.error('Error fetching profile:', error);
          toast.error('Failed to fetch profile');
        }
      } else {
        setProfile(data);
      }
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    setEditedProfile({ ...profile });
  };

  const handleSave = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .update(editedProfile)
      .eq('id', profile?.id);

    if (error) {
      toast.error('Failed to update profile');
    } else {
      setProfile({ ...profile, ...editedProfile } as Profile);
      setIsEditing(false);
      toast.success('Profile updated successfully');
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedProfile({});
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setEditedProfile({ ...editedProfile, [e.target.name]: e.target.value });
  };

  if (!profile) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex flex-col min-h-screen bg-slate-200 dark:bg-slate-900">
      <main className="flex-1 overflow-y-auto p-4 pb-16">
        <Card className="max-w-2xl mx-auto mb-16">
          <CardHeader>
            <CardTitle className="text-2xl font-bold flex items-center">
              <User className="mr-2" />
              My Profile
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center mb-6">
              <Avatar className="w-24 h-24 mb-4">
                <AvatarImage src={profile.avatar_url} alt={profile.full_name} />
                <AvatarFallback>
                  <User className="w-12 h-12" />
                </AvatarFallback>
              </Avatar>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="full_name" className="font-semibold text-lg text-primary ">Full Name</Label>
                {isEditing ? (
                  <Input
                    id="full_name"
                    name="full_name"
                    value={editedProfile.full_name || ''}
                    onChange={handleChange}
                    className="dark:bg-gray-700 dark:text-white"
                  />
                ) : (
                  <p className="text-gray-500 dark:text-gray-300">{profile.full_name}</p>
                )}
              </div>
              
              <div>
                <Label htmlFor="email" className="font-semibold text-lg text-primary">Email</Label>
                <p className="text-gray-500 dark:text-gray-300">{profile.email}</p>
              </div>
              
              <div>
                <Label htmlFor="role" className="font-semibold text-lg text-primary">Account Type</Label>
                <div className="flex items-center space-x-2">
                  <Badge variant={profile.role === 'premium' ? 'default' : 'secondary'}>
                    {profile.role === 'premium' ? 'Premium' : 'Free'}
                  </Badge>
                </div>
                {profile && profile.role === "premium" && (
                <CardDescription className="text-center mb-4 text-green-600 flex items-center justify-center">
                  <Zap className="h-4 w-4 mr-2 text-green-600" />
                  Premium features unlocked: Unlimited chats, priority support,
                  and advanced AI models!
                </CardDescription>
              )}
              </div>
              
              <div>
                <Label htmlFor="bio" className="font-semibold text-lg text-primary">Bio</Label>
                {isEditing ? (
                  <Textarea
                    id="bio"
                    name="bio"
                    value={editedProfile.bio || ''}
                    onChange={handleChange}
                    className="dark:bg-gray-700 dark:text-white"
                  />
                ) : (
                  <p className="text-gray-500 dark:text-gray-300">{profile.bio}</p>
                )}
              </div>
              
              <div className="grid grid-cols-3 gap-4 mt-6">
                <Card>
                  <CardContent className="flex flex-col items-center justify-center p-4">
                    <BookOpen className="mb-2" />
                    <p className="text-lg font-bold">{profile.total_cards_studied}</p>
                    <p className="text-sm text-muted-foreground">Cards Studied</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="flex flex-col items-center justify-center p-4">
                    <Clock className="mb-2" />
                    <p className="text-lg font-bold">{profile.total_study_time} hrs</p>
                    <p className="text-sm text-muted-foreground">Study Time</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="flex flex-col items-center justify-center p-4">
                    <Award className="mb-2" />
                    <p className="text-lg font-bold">{profile.longest_streak} days</p>
                    <p className="text-sm text-muted-foreground">Longest Streak</p>
                  </CardContent>
                </Card>
              </div>
            </div>
            
            <div className="mt-6 flex justify-end space-x-2">
              {isEditing ? (
                <>
                  <Button onClick={handleSave} className="dark:bg-gray-700 dark:text-white">Save</Button>
                  <Button variant="outline" onClick={handleCancel} className="dark:bg-gray-700 dark:text-white">Cancel</Button>
                </>
              ) : (
                <Button onClick={handleEdit} className="dark:bg-gray-700 dark:text-white">Edit Profile</Button>
              )}
            </div>
          </CardContent>
        </Card>
      </main>
      <MobileDock />
      <Toaster />
    </div>
  );
}