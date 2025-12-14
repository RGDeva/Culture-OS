'use client'

import { Button } from '@/components/ui/button'
import { FolderPlus, Target, Package, Users } from 'lucide-react'
import Link from 'next/link'

export function QuickActions() {
  return (
    <div className="bg-black/50 border-2 border-green-400/30 rounded-lg p-6">
      <h2 className="text-xl font-bold font-mono text-green-400 mb-6">QUICK_ACTIONS</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link href="/vault/new">
          <Button 
            variant="outline" 
            className="w-full h-auto flex-col gap-3 p-4 border-green-400/50 text-green-400 hover:bg-green-400/10 font-mono"
          >
            <FolderPlus className="h-6 w-6" />
            <span className="text-sm">&gt; CREATE_PROJECT</span>
          </Button>
        </Link>

        <Link href="/bounties/new">
          <Button 
            variant="outline" 
            className="w-full h-auto flex-col gap-3 p-4 border-green-400/50 text-green-400 hover:bg-green-400/10 font-mono"
          >
            <Target className="h-6 w-6" />
            <span className="text-sm">&gt; POST_BOUNTY</span>
          </Button>
        </Link>

        <Link href="/marketplace?mode=create">
          <Button 
            variant="outline" 
            className="w-full h-auto flex-col gap-3 p-4 border-green-400/50 text-green-400 hover:bg-green-400/10 font-mono"
          >
            <Package className="h-6 w-6" />
            <span className="text-sm">&gt; LIST_SERVICE_OR_PACK</span>
          </Button>
        </Link>

        <Link href="/network?tab=bounties">
          <Button 
            variant="outline" 
            className="w-full h-auto flex-col gap-3 p-4 border-green-400/50 text-green-400 hover:bg-green-400/10 font-mono"
          >
            <Users className="h-6 w-6" />
            <span className="text-sm">&gt; FIND_COLLABS</span>
          </Button>
        </Link>
      </div>
    </div>
  )
}
