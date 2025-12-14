export type ProjectStatus = 'IDEA' | 'IN_PROGRESS' | 'DONE';
export type ProjectVisibility = 'PRIVATE' | 'INVITE_ONLY' | 'OPEN_FOR_COLLAB';

export interface Project {
  id: string;
  ownerId: string;
  title: string;
  description?: string;
  status: ProjectStatus;
  genres?: string[];
  tags?: string[];
  visibility: ProjectVisibility;
  rolesNeeded?: string[];   // e.g. ["Vocals", "Drums", "Mix Engineer"]
  fileUrls?: string[];      // demos, stems, references (URLs only for now)
  invitedUserIds?: string[]; // users invited to collaborate
  createdAt: string;
  updatedAt: string;
}

export interface ProjectCreateInput {
  title: string;
  description?: string;
  status?: ProjectStatus;
  genres?: string[];
  tags?: string[];
  visibility?: ProjectVisibility;
  rolesNeeded?: string[];
  fileUrls?: string[];
}

export interface ProjectUpdateInput extends Partial<ProjectCreateInput> {
  invitedUserIds?: string[];
}
