"use client";

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Icons } from '@/components/icons';
import { cn } from '@/lib/utils';

// Mock data - replace with actual data fetching
const creatorData = {
  id: 'creator123',
  name: 'Digital Alchemist',
  handle: '@digital_alchemist',
  bio: 'Crafting the future of digital art and music through blockchain technology. Pushing boundaries at the intersection of technology and creativity.',
  avatarUrl: '/placeholder-avatar.jpg',
  coverUrl: '/placeholder-cover.jpg',
  stats: {
    followers: '24.5K',
    following: '1.2K',
    likes: '156.8K',
    items: '47',
  },
  socialLinks: {
    twitter: 'https://twitter.com/creator',
    instagram: 'https://instagram.com/creator',
    website: 'https://creator.xyz',
  },
  tags: ['Digital Art', 'Generative', 'Music', 'AI', '3D'],
  content: {
    featured: [
      { id: '1', title: 'Genesis Collection', type: 'collection', image: '/placeholder-nft.jpg' },
      { id: '2', title: 'AI Dreams', type: 'single', image: '/placeholder-nft2.jpg' },
    ],
    recent: [
      { id: '3', title: 'Neon Dreams #42', type: 'single', image: '/placeholder-nft3.jpg' },
      { id: '4', title: 'Code Poetry', type: 'collection', image: '/placeholder-nft4.jpg' },
      { id: '5', title: 'Digital Echoes', type: 'single', image: '/placeholder-nft5.jpg' },
    ],
    about: {
      joined: 'January 2023',
      location: 'Digital Space',
      worksWith: ['Digital Art', 'Music', 'AI', 'AR/VR'],
    },
  },
};

const StatCard = ({ value, label }: { value: string; label: string }) => (
  <div className="text-center p-4 rounded-lg bg-background/50 border border-border/50 hover:border-green-400/30 transition-colors">
    <p className="text-2xl font-bold text-green-400">{value}</p>
    <p className="text-sm text-muted-foreground">{label}</p>
  </div>
);

const ContentCard = ({ item }: { item: any }) => (
  <div className="group relative overflow-hidden rounded-lg border border-border/50 hover:border-green-400/50 transition-all duration-300 hover:shadow-lg hover:shadow-green-500/10">
    <div className="aspect-square bg-muted relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/80 z-10 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
        <h4 className="text-white font-medium">{item.title}</h4>
      </div>
      <div className="absolute top-2 right-2 z-20">
        <Badge variant="secondary" className="text-xs bg-background/80 backdrop-blur-sm">
          {item.type === 'collection' ? 'Collection' : 'Single'}
        </Badge>
      </div>
    </div>
  </div>
);

const CreatorProfilePage = () => {
  const params = useParams();
  const { id } = params;
  const [isFollowing, setIsFollowing] = useState(false);
  const [activeTab, setActiveTab] = useState('featured');
  const [creator, setCreator] = useState(creatorData);

  // In a real app, you would fetch creator data here
  useEffect(() => {
    // Fetch creator data based on ID
    // const fetchCreatorData = async () => {
    //   const response = await fetch(`/api/creators/${id}`);
    //   const data = await response.json();
    //   setCreator(data);
    // };
    // fetchCreatorData();
  }, [id]);

  if (!creator) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse text-center">
          <div className="h-8 w-48 bg-muted rounded mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading creator profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Cover Image */}
      <div className="relative h-48 md:h-64 bg-gradient-to-r from-green-900/30 to-emerald-900/30">
        <div className="absolute inset-0 bg-[url('/placeholder-cover.jpg')] bg-cover bg-center opacity-20"></div>
        <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-background to-transparent"></div>
      </div>

      {/* Profile Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 relative z-10">
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6">
          <div className="flex flex-col md:flex-row items-start md:items-end gap-6">
            <div className="relative group">
              <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-background bg-background overflow-hidden shadow-lg">
                <Avatar className="w-full h-full">
                  <AvatarImage src={creator.avatarUrl} alt={creator.name} />
                  <AvatarFallback className="bg-gradient-to-br from-green-500 to-emerald-600 text-3xl font-bold text-background">
                    {creator.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
              </div>
              <div className="absolute -inset-2 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 opacity-0 group-hover:opacity-100 -z-10 blur-md transition-opacity duration-300"></div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl md:text-3xl font-bold">{creator.name}</h1>
                <Badge variant="outline" className="border-green-400/30 text-green-400">
                  Verified
                </Badge>
              </div>
              <p className="text-muted-foreground">{creator.handle}</p>
              
              <div className="flex flex-wrap gap-2 mt-2">
                {creator.tags.map((tag) => (
                  <Badge 
                    key={tag} 
                    variant="secondary" 
                    className="px-2 py-0.5 text-xs bg-background/50 backdrop-blur-sm border border-border/50 hover:bg-green-500/10 hover:text-green-400 transition-colors"
                  >
                    {tag}
                  </Badge>
                ))}
              </div>

              <p className="text-sm text-muted-foreground max-w-2xl pt-2">
                {creator.bio}
              </p>

              <div className="flex items-center gap-4 pt-2">
                <a 
                  href={creator.socialLinks.website} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-green-400 transition-colors"
                >
                  <Icons.globe className="h-5 w-5" />
                </a>
                <a 
                  href={creator.socialLinks.twitter} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-green-400 transition-colors"
                >
                  <Icons.twitter className="h-5 w-5" />
                </a>
                <a 
                  href={creator.socialLinks.instagram} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-green-400 transition-colors"
                >
                  <Icons.instagram className="h-5 w-5" />
                </a>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto mt-4 md:mt-0">
            <Button 
              variant="outline" 
              className="flex-1 md:flex-none border-border/50 hover:border-green-400/50 hover:bg-green-500/10 hover:text-green-400 transition-colors"
            >
              <Icons.share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
            <Button 
              variant={isFollowing ? "outline" : "default"}
              className={cn(
                "flex-1 md:flex-none transition-all duration-200",
                isFollowing 
                  ? "border-green-400/30 text-green-400 hover:bg-red-500/10 hover:border-red-400/30 hover:text-red-400"
                  : "bg-gradient-to-r from-green-500 to-emerald-500 text-background hover:from-green-400 hover:to-emerald-400"
              )}
              onClick={() => setIsFollowing(!isFollowing)}
            >
              {isFollowing ? (
                <>
                  <Icons.userMinus className="h-4 w-4 mr-2" />
                  Unfollow
                </>
              ) : (
                <>
                  <Icons.userPlus className="h-4 w-4 mr-2" />
                  Follow
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
          <StatCard value={creator.stats.followers} label="Followers" />
          <StatCard value={creator.stats.following} label="Following" />
          <StatCard value={creator.stats.likes} label="Likes" />
          <StatCard value={creator.stats.items} label="Items" />
        </div>

        {/* Content Tabs */}
        <Tabs 
          defaultValue="featured" 
          className="mt-12"
          onValueChange={setActiveTab}
        >
          <TabsList className="bg-background/50 backdrop-blur-sm border border-border/50 p-1 h-auto">
            <TabsTrigger 
              value="featured" 
              className="px-4 py-2 rounded-md data-[state=active]:bg-green-500/10 data-[state=active]:text-green-400 data-[state=active]:shadow-sm"
            >
              Featured
            </TabsTrigger>
            <TabsTrigger 
              value="recent" 
              className="px-4 py-2 rounded-md data-[state=active]:bg-green-500/10 data-[state=active]:text-green-400 data-[state=active]:shadow-sm"
            >
              Recent Work
            </TabsTrigger>
            <TabsTrigger 
              value="about" 
              className="px-4 py-2 rounded-md data-[state=active]:bg-green-500/10 data-[state=active]:text-green-400 data-[state=active]:shadow-sm"
            >
              About
            </TabsTrigger>
          </TabsList>

          <div className="mt-8">
            <TabsContent value="featured" className="mt-0">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {creator.content.featured.map((item) => (
                  <ContentCard key={item.id} item={item} />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="recent" className="mt-0">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {creator.content.recent.map((item) => (
                  <ContentCard key={item.id} item={item} />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="about" className="mt-0">
              <Card className="bg-background/50 backdrop-blur-sm border-border/50 overflow-hidden">
                <CardHeader>
                  <CardTitle>About {creator.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Bio</h3>
                      <p className="mt-1">{creator.bio}</p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground mb-2">Details</h3>
                        <div className="space-y-2">
                          <div className="flex items-center">
                            <Icons.calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                            <span>Joined {creator.content.about.joined}</span>
                          </div>
                          <div className="flex items-center">
                            <Icons.mapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                            <span>{creator.content.about.location}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground mb-2">Works With</h3>
                        <div className="flex flex-wrap gap-2">
                          {creator.content.about.worksWith.map((item) => (
                            <Badge 
                              key={item} 
                              variant="outline" 
                              className="text-xs bg-background/50 border-border/50"
                            >
                              {item}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
};

export default CreatorProfilePage;
