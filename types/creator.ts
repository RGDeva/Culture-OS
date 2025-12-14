export type CreatorRole =
  | 'ARTIST'
  | 'PRODUCER'
  | 'ENGINEER'
  | 'STUDIO'
  | 'MANAGER'
  | 'MODEL'
  | 'VISUAL_MEDIA'
  | 'INFLUENCER'
  | 'OTHER';

export type CreatorProfileOnMap = {
  id: string;
  name: string;
  roles: CreatorRole[];
  city?: string;
  state?: string;
  country?: string;
  latitude: number;
  longitude: number;
  mainGenre?: string;
  mainLink?: string; // Spotify or IG
  studioName?: string;
  xp?: number; // used to show tier label
};
