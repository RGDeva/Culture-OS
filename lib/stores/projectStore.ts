import { Project, ProjectCreateInput, ProjectUpdateInput } from '../types/vault';

// In-memory store for projects
const projects = new Map<string, Project>();
let nextId = 1;

export function getProject(id: string): Project | null {
  return projects.get(id) || null;
}

export function getProjectsByOwner(ownerId: string): Project[] {
  return Array.from(projects.values()).filter(p => p.ownerId === ownerId);
}

export function getOpenCollabProjects(): Project[] {
  return Array.from(projects.values()).filter(p => p.visibility === 'OPEN_FOR_COLLAB');
}

export function getAllProjects(): Project[] {
  return Array.from(projects.values());
}

export function createProject(ownerId: string, input: ProjectCreateInput): Project {
  const id = `project_${nextId++}`;
  const project: Project = {
    id,
    ownerId,
    title: input.title,
    description: input.description,
    status: input.status || 'IDEA',
    genres: input.genres || [],
    tags: input.tags || [],
    visibility: input.visibility || 'PRIVATE',
    rolesNeeded: input.rolesNeeded || [],
    fileUrls: input.fileUrls || [],
    invitedUserIds: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  
  projects.set(id, project);
  return project;
}

export function updateProject(id: string, input: ProjectUpdateInput): Project | null {
  const existing = projects.get(id);
  if (!existing) return null;
  
  const updated: Project = {
    ...existing,
    ...input,
    updatedAt: new Date().toISOString(),
  };
  
  projects.set(id, updated);
  return updated;
}

export function deleteProject(id: string): boolean {
  return projects.delete(id);
}

export function inviteUserToProject(projectId: string, userId: string): Project | null {
  const existing = projects.get(projectId);
  if (!existing) return null;
  
  const invitedUserIds = existing.invitedUserIds || [];
  if (invitedUserIds.includes(userId)) return existing;
  
  const updated: Project = {
    ...existing,
    invitedUserIds: [...invitedUserIds, userId],
    updatedAt: new Date().toISOString(),
  };
  
  projects.set(projectId, updated);
  return updated;
}
