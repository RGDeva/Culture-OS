'use client';

import { usePrivy } from '@privy-io/react-auth';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2, User as UserIcon, LogOut, ArrowLeft, Mail, Edit2, Save, X, Upload } from 'lucide-react';
import { PageLoading } from '@/components/LoadingSpinner';
import { useUserProfile } from '@/hooks/useUserProfile';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { useToast } from '@/components/ui/use-toast';
import { MatrixBackground } from '@/components/matrix-background';
// Import toast with proper typing
import { toast } from '@/components/ui/use-toast';

function ProfileContent() {
  const { logout, user } = usePrivy();
  const router = useRouter();
  const { toast } = useToast();
  const {
    profile,
    isLoading,
    isSaving,
    error,
    updateProfile,
    refresh: refreshProfile
  } = useUserProfile();
  
  const [name, setName] = useState(profile?.displayName || '');
  const [bio, setBio] = useState(profile?.bio || '');
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>(profile?.image);
  const [isEditing, setIsEditing] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  // Initialize form with profile data when it loads
  useEffect(() => {
    if (profile) {
      // Only update if values are different to prevent unnecessary re-renders
      if (name !== (profile.displayName || '')) {
        setName(profile.displayName || '');
      }
      if (bio !== (profile.bio || '')) {
        setBio(profile.bio || '');
      }
      if (avatarUrl !== (profile.image || '')) {
        setAvatarUrl(profile.image || '');
      }
    }
  }, [profile, name, bio, avatarUrl]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');
    
    // Basic validation
    if (!name.trim()) {
      setLocalError('Display name is required');
      return;
    }
    
    try {
      // Show loading state
      const loadingToast = toast({
        title: 'Updating profile...',
        description: 'Please wait while we save your changes.',
        duration: 0, // Don't auto-dismiss
      });
      
      try {
        // Prepare the update data
        const updateData: any = {
          displayName: name.trim(),
        };

        // Only include bio and image if they exist
        if (bio.trim()) {
          updateData.bio = bio.trim();
        }
        if (avatarUrl?.trim()) {
          updateData.image = avatarUrl.trim();
        }

        // Update the user's profile
        await updateProfile(updateData);

        // Update success message
        toast({
          title: 'Profile updated',
          description: 'Your profile has been updated successfully.',
          variant: 'default',
        });

        // Refresh profile data
        await refreshProfile();
        setIsEditing(false);
      } catch (error) {
        console.error('Profile update error:', error);
        toast({
          title: 'Error updating profile',
          description: error instanceof Error ? error.message : 'There was an error updating your profile',
          variant: 'destructive',
        });
        throw error; // Re-throw to be caught by outer catch
      }
    } catch (err) {
      console.error('Failed to update profile:', err);
      setLocalError('Failed to update profile. Please try again.');
      toast({
        title: 'Error',
        description: 'Failed to update profile',
        variant: 'destructive',
      });
    }
  };

  const handleCancel = () => {
    if (profile) {
      setName(profile.name || '');
      setBio(profile.bio || '');
      setAvatarUrl(profile.image || '');
    }
    setLocalError(null);
    setIsEditing(false);
  };

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/login');
    } catch (err) {
      console.error('Logout failed:', err);
      toast({
        title: 'Error',
        description: 'Failed to log out. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Invalid file type',
        description: 'Please upload an image file (JPEG, PNG, etc.)',
        variant: 'destructive',
      });
      return;
    }

    // Validate file size (2MB max)
    const MAX_SIZE = 2 * 1024 * 1024; // 2MB
    if (file.size > MAX_SIZE) {
      toast({
        title: 'File too large',
        description: 'Please upload an image smaller than 2MB',
        variant: 'destructive',
      });
      return;
    }

    // Create preview URL
    const previewUrl = URL.createObjectURL(file);
    setAvatarUrl(previewUrl);
    
    // In a real app, you would upload the file to a storage service here
    // and then update the user's profile with the new image URL
  };

  if (isLoading || !profile) {
    return <PageLoading />;
  }
  
  const userEmail = user?.email?.address || 'No email';
  const userInitial = (profile.displayName || userEmail).charAt(0).toUpperCase();

  return (
    <div className="min-h-screen bg-black text-green-400 relative">
      <MatrixBackground className="fixed inset-0 z-0" />
      
      <div className="relative z-10 container mx-auto px-4 py-8">
        <div className="flex items-center mb-8">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => window.history.back()}
            className="mr-4 text-green-400 hover:bg-green-400/10"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">Profile</h1>
          <div className="ml-auto flex space-x-2">
            {isEditing ? (
              <>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleCancel}
                  disabled={isSaving}
                  className="text-green-400 border-green-400 hover:bg-green-400/10"
                >
                  <X className="mr-2 h-4 w-4" />
                  Cancel
                </Button>
                <Button
                  type="button"
                  variant="default"
                  size="sm"
                  onClick={handleSave}
                  disabled={isSaving || !name.trim()}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  {isSaving ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="mr-2 h-4 w-4" />
                  )}
                  Save Changes
                </Button>
              </>
            ) : (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(true)}
                className="text-green-400 border-green-400 hover:bg-green-400/10"
              >
                <Edit2 className="mr-2 h-4 w-4" />
                Edit Profile
              </Button>
            )}
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {/* Profile Card */}
          <Card>
            <CardHeader>
              <CardTitle>Profile</CardTitle>
              <CardDescription>
                Update your profile information and avatar.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col items-center space-y-4">
                <div className="relative">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={avatarUrl} alt={name} />
                    <AvatarFallback className="bg-green-900/50 text-green-400 text-2xl">
                      {userInitial}
                    </AvatarFallback>
                  </Avatar>
                  
                  {isEditing && (
                    <div className="absolute -bottom-2 -right-2">
                      <div className="flex items-center space-x-2">
                        <label
                          htmlFor="avatar-upload"
                          className={`cursor-pointer inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors
                            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2
                            disabled:opacity-50 disabled:pointer-events-none
                            bg-primary text-primary-foreground hover:bg-primary/90
                            h-9 px-4 py-2
                            ${isSaving ? 'opacity-50 pointer-events-none' : ''}`}
                        >
                          <Upload className="mr-2 h-4 w-4" />
                          Change
                        </label>
                        <input
                          type="file"
                          id="avatar-upload"
                          accept="image/*"
                          className="hidden"
                          disabled={!isEditing || isSaving}
                          onChange={handleFileChange}
                        />
                        {avatarUrl && isEditing && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => setAvatarUrl('')}
                            disabled={isSaving}
                            className="text-red-500 hover:bg-red-500/10"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="text-center">
                  <h2 className="text-xl font-semibold">
                    {isEditing ? (
                      <Input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Your name"
                        className="text-center text-xl font-semibold"
                        disabled={isSaving}
                      />
                    ) : (
                      name || 'Anonymous User'
                    )}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {userEmail}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                {isEditing ? (
                  <div className="relative">
                    <textarea
                      id="bio"
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      className="flex min-h-[100px] w-full rounded-md border border-green-400/30 bg-black/50 px-3 py-2 text-sm text-green-100 placeholder:text-green-400/50 focus:border-green-400 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-green-400/50 disabled:cursor-not-allowed disabled:opacity-50"
                      placeholder="Tell us about yourself..."
                      rows={4}
                    />
                    <div className="text-xs text-muted-foreground text-right mt-1">
                      {bio?.length || 0}/500 characters
                    </div>
                  </div>
                ) : (
                  <div className="rounded-md border border-input bg-muted/50 px-3 py-2 min-h-[120px]">
                    {bio || 'No bio provided'}
                  </div>
                )}
              </div>

              {/* Email (read-only) */}
              <div className="space-y-2">
                <Label>Email</Label>
                <div className="flex items-center space-x-2 rounded-md border border-input bg-muted/50 px-3 py-2 text-sm text-muted-foreground">
                  <Mail className="h-4 w-4 flex-shrink-0" />
                  <span className="truncate">{userEmail || 'No email associated with this account'}</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Contact support to change your email address.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Account Information */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Account Information</CardTitle>
                <CardDescription>
                  Manage your account settings and preferences.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Account Created</Label>
                  <div className="text-sm text-muted-foreground">
                    {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : 'N/A'}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Last Updated</Label>
                  <div className="text-sm text-muted-foreground">
                    {profile?.updatedAt ? new Date(profile.updatedAt).toLocaleString() : 'N/A'}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>User ID</Label>
                  <div className="flex items-center space-x-2">
                    <code className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-xs text-muted-foreground break-all">
                      {user?.id || 'N/A'}
                    </code>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-8 px-2"
                      onClick={() => {
                        navigator.clipboard.writeText(user?.id || '');
                        toast({
                          title: 'Copied to clipboard',
                          description: 'User ID has been copied to your clipboard.',
                        });
                      }}
                    >
                      Copy
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Danger Zone */}
            <Card className="border-destructive/30">
              <CardHeader>
                <CardTitle className="text-destructive">Danger Zone</CardTitle>
                <CardDescription>
                  These actions are irreversible. Please be certain.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <h4 className="font-medium text-sm">Delete Account</h4>
                    <p className="text-sm text-muted-foreground">
                      Permanently delete your account and all associated data.
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    disabled={isSaving}
                    onClick={() => {
                      if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
                        // Handle account deletion
                        toast({
                          title: 'Account deletion requested',
                          description: 'Please contact support to complete account deletion.',
                          variant: 'destructive',
                        });
                      }
                    }}
                  >
                    Delete Account
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      
      {/* Account Details Section */}
      <div className="container mx-auto px-4">
        <div className="mt-8 p-6 border-t border-green-400/10">
          <h3 className="font-mono text-lg font-medium mb-6">ACCOUNT_DETAILS</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <p className="text-sm text-green-400/70">Account Created</p>
              <p className="font-mono">
                {new Date(profile.createdAt || new Date()).toLocaleDateString()}
              </p>
            </div>
            
            <div className="space-y-1">
              <p className="text-sm text-green-400/70">Last Updated</p>
              <p className="font-mono">
                {new Date(profile.updatedAt || new Date()).toLocaleString()}
              </p>
            </div>
            
            <div className="space-y-1">
              <p className="text-sm text-green-400/70">User ID</p>
              <p className="font-mono text-sm break-all">
                {profile.id || 'N/A'}
              </p>
            </div>
            
            <div className="space-y-1">
              <p className="text-sm text-green-400/70">Account Type</p>
              <p className="font-mono">
                {profile.artistAccountId ? 'Artist' : 'User'}
              </p>
            </div>
          </div>
        </div>
        
        {/* Danger Zone */}
        <div className="mt-8 p-6 border-t border-red-400/20">
          <h3 className="font-mono text-lg font-medium text-red-400 mb-6">DANGER_ZONE</h3>
          
          <div className="p-6 rounded-lg bg-red-400/5 border border-red-400/20">
            <h4 className="font-medium text-red-400 mb-3">Delete Account</h4>
            <p className="text-sm text-red-400/80 mb-6">
              This will permanently delete your account and all associated data. This action cannot be undone.
            </p>
            <Button 
              variant="outline" 
              className="text-red-400 border-red-400/50 hover:bg-red-400/10 hover:text-red-400"
              onClick={() => {
                if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
                  // Handle account deletion
                  toast({
                    title: 'Account deletion requested',
                    description: 'Please contact support to complete account deletion.',
                    variant: 'destructive',
                  });
                }
              }}
            >
              Delete My Account
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const { ready, authenticated } = usePrivy();
  const router = useRouter();

  // Redirect to login if not authenticated
  if (ready && !authenticated) {
    router.push('/login?redirect=/profile');
    return null;
  }

  return (
    <ErrorBoundary>
      <ProfileContent />
    </ErrorBoundary>
  );
}
