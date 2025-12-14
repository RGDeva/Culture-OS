import { Profile, ProfileCreateInput, ProfileUpdateInput } from '../types/profile';

// In-memory store for profiles
const profiles = new Map<string, Profile>();

export function getProfile(userId: string): Profile | null {
  return profiles.get(userId) || null;
}

export function getAllProfiles(): Profile[] {
  return Array.from(profiles.values());
}

export function createProfile(userId: string, input: ProfileCreateInput): Profile {
  const profile: Profile = {
    id: userId,
    ...input,
    xp: 0,
    tags: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  
  profiles.set(userId, profile);
  return profile;
}

export function updateProfile(userId: string, input: ProfileUpdateInput): Profile | null {
  const existing = profiles.get(userId);
  if (!existing) return null;
  
  const updated: Profile = {
    ...existing,
    ...input,
    updatedAt: new Date().toISOString(),
  };
  
  profiles.set(userId, updated);
  return updated;
}

export function addXp(userId: string, amount: number): Profile | null {
  const existing = profiles.get(userId);
  if (!existing) return null;
  
  const updated: Profile = {
    ...existing,
    xp: existing.xp + amount,
    updatedAt: new Date().toISOString(),
  };
  
  profiles.set(userId, updated);
  return updated;
}

export function addTag(userId: string, tag: string): Profile | null {
  const existing = profiles.get(userId);
  if (!existing) return null;
  
  const tags = existing.tags || [];
  if (tags.includes(tag)) return existing;
  
  const updated: Profile = {
    ...existing,
    tags: [...tags, tag],
    updatedAt: new Date().toISOString(),
  };
  
  profiles.set(userId, updated);
  return updated;
}

export function removeTag(userId: string, tag: string): Profile | null {
  const existing = profiles.get(userId);
  if (!existing) return null;
  
  const updated: Profile = {
    ...existing,
    tags: (existing.tags || []).filter(t => t !== tag),
    updatedAt: new Date().toISOString(),
  };
  
  profiles.set(userId, updated);
  return updated;
}
