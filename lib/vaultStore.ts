// In-memory Vault project store
// This is a simple mock store - replace with actual database in production

export type VaultProject = {
  id: string
  userId: string
  title: string
  tags?: string[]
  previewUrl?: string
  stemsUrl?: string
  openRoles: {
    label: string
    compensationType: 'flat fee' | 'points' | 'both'
  }[]
  createdAt: string
  updatedAt: string
}

const vaultProjects: Map<string, VaultProject> = new Map()

// Get all projects
export function getVaultProjects(): VaultProject[] {
  return Array.from(vaultProjects.values()).sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )
}

// Get projects by user ID
export function getVaultProjectsByUser(userId: string): VaultProject[] {
  return getVaultProjects().filter(p => p.userId === userId)
}

// Get a project by ID
export function getVaultProject(id: string): VaultProject | undefined {
  return vaultProjects.get(id)
}

// Create a new project
export function createVaultProject(data: Omit<VaultProject, 'id' | 'createdAt' | 'updatedAt'>): VaultProject {
  const id = `vault_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  const now = new Date().toISOString()
  
  const project: VaultProject = {
    ...data,
    id,
    createdAt: now,
    updatedAt: now
  }
  
  vaultProjects.set(id, project)
  console.log(`[VAULT_STORE] Created project: ${id}`)
  
  return project
}

// Update a project
export function updateVaultProject(id: string, updates: Partial<Omit<VaultProject, 'id' | 'createdAt'>>): VaultProject | null {
  const existing = vaultProjects.get(id)
  if (!existing) return null
  
  const updated: VaultProject = {
    ...existing,
    ...updates,
    updatedAt: new Date().toISOString()
  }
  
  vaultProjects.set(id, updated)
  console.log(`[VAULT_STORE] Updated project: ${id}`)
  
  return updated
}

// Delete a project
export function deleteVaultProject(id: string): boolean {
  const deleted = vaultProjects.delete(id)
  if (deleted) {
    console.log(`[VAULT_STORE] Deleted project: ${id}`)
  }
  return deleted
}

// Get projects with open roles (for Open Collabs)
export function getOpenCollabProjects(): VaultProject[] {
  return getVaultProjects().filter(p => p.openRoles && p.openRoles.length > 0)
}
