// Initialize Vault system with default data

import { initializeDefaultTemplates } from './vaultStoreV2'

let initialized = false

export function initializeVaultSystem() {
  if (initialized) return
  
  console.log('[VAULT_INIT] Initializing Vault system...')
  
  // Initialize default license templates
  initializeDefaultTemplates()
  
  initialized = true
  console.log('[VAULT_INIT] Vault system initialized successfully')
}

// Auto-initialize on import
if (typeof window !== 'undefined') {
  initializeVaultSystem()
}
