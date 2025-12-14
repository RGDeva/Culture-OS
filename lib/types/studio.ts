export interface Studio {
  id: string;
  name: string;
  city?: string;
  state?: string;
  country?: string;
  description?: string;
  services?: string[]; // recording, mixing, mastering, etc.
  websiteUrl?: string;
  bookingUrl?: string;
  socialUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface StudioCreateInput {
  name: string;
  city?: string;
  state?: string;
  country?: string;
  description?: string;
  services?: string[];
  websiteUrl?: string;
  bookingUrl?: string;
  socialUrl?: string;
}

export interface StudioUpdateInput extends Partial<StudioCreateInput> {}
