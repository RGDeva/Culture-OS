import { Studio, StudioCreateInput, StudioUpdateInput } from '../types/studio';

// In-memory store for studios
const studios = new Map<string, Studio>();
let nextId = 1;

export function getStudio(id: string): Studio | null {
  return studios.get(id) || null;
}

export function getAllStudios(): Studio[] {
  return Array.from(studios.values());
}

export function createStudio(input: StudioCreateInput): Studio {
  const id = `studio_${nextId++}`;
  const studio: Studio = {
    id,
    ...input,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  
  studios.set(id, studio);
  return studio;
}

export function updateStudio(id: string, input: StudioUpdateInput): Studio | null {
  const existing = studios.get(id);
  if (!existing) return null;
  
  const updated: Studio = {
    ...existing,
    ...input,
    updatedAt: new Date().toISOString(),
  };
  
  studios.set(id, updated);
  return updated;
}

export function deleteStudio(id: string): boolean {
  return studios.delete(id);
}
