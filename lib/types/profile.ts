export type CreativeRole =
  | 'ARTIST'
  | 'PRODUCER'
  | 'ENGINEER'
  | 'STUDIO'
  | 'MANAGER'
  | 'MODEL'
  | 'INFLUENCER'
  | 'OTHER';

export interface Profile {
  id: string;           // userId from auth
  name: string;
  roles: CreativeRole[];
  locationCity?: string;
  locationState?: string;
  locationCountry?: string;
  genres?: string[];
  spotifyUrl?: string;
  appleMusicUrl?: string;
  soundcloudUrl?: string;
  mainSocialUrl?: string;
  studioId?: string;    // associated Studio
  bio?: string;
  lookingFor?: string;
  showOnMap?: boolean;  // approximate location pin
  xp: number;
  tags?: string[];      // e.g. ["NoCulture Network", "Referred"]
  createdAt: string;
  updatedAt: string;
}

export interface ProfileCreateInput {
  name: string;
  roles: CreativeRole[];
  locationCity?: string;
  locationState?: string;
  locationCountry?: string;
  genres?: string[];
  spotifyUrl?: string;
  appleMusicUrl?: string;
  soundcloudUrl?: string;
  mainSocialUrl?: string;
  studioId?: string;
  bio?: string;
  lookingFor?: string;
  showOnMap?: boolean;
}

export interface ProfileUpdateInput extends Partial<ProfileCreateInput> {}
