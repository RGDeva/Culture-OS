'use client'

import { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { ProjectRole, CompensationType } from '@/types/project'

interface ProjectRolesEditorProps {
  roles: ProjectRole[]
  onChange: (roles: ProjectRole[]) => void
}

export function ProjectRolesEditor({ roles, onChange }: ProjectRolesEditorProps) {
  const addRole = () => {
    const newRole: ProjectRole = {
      id: `role-${Date.now()}`,
      title: '',
      compensationType: 'OPEN',
      createBountyFromRole: false,
    }
    onChange([...roles, newRole])
  }

  const updateRole = (index: number, updates: Partial<ProjectRole>) => {
    const updated = roles.map((role, i) => 
      i === index ? { ...role, ...updates } : role
    )
    onChange(updated)
  }

  const removeRole = (index: number) => {
    onChange(roles.filter((_, i) => i !== index))
  }

  const COMPENSATION_TYPES: { value: CompensationType; label: string }[] = [
    { value: 'FLAT_FEE', label: 'Flat Fee' },
    { value: 'REV_SHARE', label: 'Revenue Share' },
    { value: 'HYBRID', label: 'Hybrid (Fee + Share)' },
    { value: 'OPEN', label: 'Open to Discuss' },
  ]

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold font-mono text-green-400 dark:text-green-400 light:text-gray-900">
          &gt; ROLES_NEEDED
        </h3>
        <button
          type="button"
          onClick={addRole}
          className="flex items-center gap-2 px-3 py-2 border-2 border-green-400/30 dark:border-green-400/30 light:border-gray-300 text-green-400 dark:text-green-400 light:text-green-700 hover:border-green-400 dark:hover:border-green-400 light:hover:border-green-600 hover:bg-green-400/10 dark:hover:bg-green-400/10 light:hover:bg-green-50 transition-all font-mono text-sm"
        >
          <Plus className="h-4 w-4" />
          ADD_ROLE
        </button>
      </div>

      {roles.length === 0 ? (
        <div className="border-2 border-green-400/20 dark:border-green-400/20 light:border-gray-200 p-8 text-center">
          <p className="text-green-400/60 dark:text-green-400/60 light:text-gray-500 font-mono text-sm">
            NO_ROLES_DEFINED // Click ADD_ROLE to start
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {roles.map((role, index) => (
            <div
              key={role.id}
              className="border-2 border-green-400/30 dark:border-green-400/30 light:border-gray-300 p-4 bg-black/20 dark:bg-black/20 light:bg-white"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Role Title */}
                <div className="md:col-span-2">
                  <label className="block text-sm mb-2 text-green-400/70 dark:text-green-400/70 light:text-gray-600 font-mono">
                    ROLE_TITLE
                  </label>
                  <input
                    type="text"
                    value={role.title}
                    onChange={(e) => updateRole(index, { title: e.target.value })}
                    placeholder="e.g., Mix Engineer, Hook Writer, Producer"
                    className="w-full bg-black/50 dark:bg-black/50 light:bg-white border-2 border-green-400/50 dark:border-green-400/50 light:border-gray-300 text-green-400 dark:text-green-400 light:text-gray-900 px-4 py-2 font-mono focus:ring-2 focus:ring-green-500 dark:focus:ring-green-500 light:focus:ring-green-600 focus:outline-none"
                  />
                </div>

                {/* Compensation Type */}
                <div>
                  <label className="block text-sm mb-2 text-green-400/70 dark:text-green-400/70 light:text-gray-600 font-mono">
                    COMPENSATION_TYPE
                  </label>
                  <select
                    value={role.compensationType}
                    onChange={(e) => updateRole(index, { compensationType: e.target.value as CompensationType })}
                    className="w-full bg-black/50 dark:bg-black/50 light:bg-white border-2 border-green-400/50 dark:border-green-400/50 light:border-gray-300 text-green-400 dark:text-green-400 light:text-gray-900 px-4 py-2 font-mono focus:ring-2 focus:ring-green-500 dark:focus:ring-green-500 light:focus:ring-green-600 focus:outline-none"
                  >
                    {COMPENSATION_TYPES.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Budget */}
                <div>
                  <label className="block text-sm mb-2 text-green-400/70 dark:text-green-400/70 light:text-gray-600 font-mono">
                    BUDGET_USD (optional)
                  </label>
                  <input
                    type="number"
                    value={role.budgetUsd || ''}
                    onChange={(e) => updateRole(index, { budgetUsd: e.target.value ? Number(e.target.value) : undefined })}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    className="w-full bg-black/50 dark:bg-black/50 light:bg-white border-2 border-green-400/50 dark:border-green-400/50 light:border-gray-300 text-green-400 dark:text-green-400 light:text-gray-900 px-4 py-2 font-mono focus:ring-2 focus:ring-green-500 dark:focus:ring-green-500 light:focus:ring-green-600 focus:outline-none"
                  />
                </div>

                {/* Notes */}
                <div className="md:col-span-2">
                  <label className="block text-sm mb-2 text-green-400/70 dark:text-green-400/70 light:text-gray-600 font-mono">
                    NOTES (optional)
                  </label>
                  <textarea
                    value={role.notes || ''}
                    onChange={(e) => updateRole(index, { notes: e.target.value })}
                    placeholder="Additional details about this role..."
                    rows={2}
                    className="w-full bg-black/50 dark:bg-black/50 light:bg-white border-2 border-green-400/50 dark:border-green-400/50 light:border-gray-300 text-green-400 dark:text-green-400 light:text-gray-900 px-4 py-2 font-mono focus:ring-2 focus:ring-green-500 dark:focus:ring-green-500 light:focus:ring-green-600 focus:outline-none resize-none"
                  />
                </div>

                {/* Create Bounty Checkbox */}
                <div className="md:col-span-2 flex items-center gap-3">
                  <input
                    type="checkbox"
                    id={`bounty-${role.id}`}
                    checked={role.createBountyFromRole || false}
                    onChange={(e) => updateRole(index, { createBountyFromRole: e.target.checked })}
                    className="h-4 w-4 rounded border-green-400/50 dark:border-green-400/50 light:border-gray-300 text-green-400 dark:text-green-400 light:text-green-600 focus:ring-green-500 dark:focus:ring-green-500 light:focus:ring-green-600"
                  />
                  <label
                    htmlFor={`bounty-${role.id}`}
                    className="text-sm text-green-400/70 dark:text-green-400/70 light:text-gray-600 font-mono cursor-pointer"
                  >
                    CREATE_BOUNTY_FROM_THIS_ROLE
                  </label>
                </div>
              </div>

              {/* Remove Button */}
              <div className="mt-4 flex justify-end">
                <button
                  type="button"
                  onClick={() => removeRole(index)}
                  className="flex items-center gap-2 px-3 py-1 border-2 border-red-400/30 dark:border-red-400/30 light:border-red-300 text-red-400 dark:text-red-400 light:text-red-600 hover:border-red-400 dark:hover:border-red-400 light:hover:border-red-600 hover:bg-red-400/10 dark:hover:bg-red-400/10 light:hover:bg-red-50 transition-all font-mono text-xs"
                >
                  <Trash2 className="h-3 w-3" />
                  REMOVE
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <p className="text-xs text-green-400/50 dark:text-green-400/50 light:text-gray-500 font-mono mt-2">
        // Roles marked for bounty creation will be automatically posted to the Network
      </p>
    </div>
  )
}
