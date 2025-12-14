/**
 * /api/recoup/tasks
 * Manage Recoupable tasks for campaigns and projects
 */

import { NextResponse } from 'next/server'
import { fetchTasks, createTask } from '@/lib/recoup'
import { getProfile } from '@/lib/profileStore'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User not authenticated' },
        { status: 401 }
      )
    }

    // Get user's artist account ID from profile
    const profile = getProfile(userId)
    const artistAccountId = profile?.recoupArtistAccountId

    const tasks = await fetchTasks(artistAccountId)

    return NextResponse.json({ tasks })
  } catch (error: any) {
    console.error('[API] Fetch tasks error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch tasks' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { userId, title, description, dueDate, songId } = body
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User not authenticated' },
        { status: 401 }
      )
    }

    if (!title) {
      return NextResponse.json(
        { error: 'Task title is required' },
        { status: 400 }
      )
    }

    // Get user's artist account ID from profile
    const profile = getProfile(userId)
    const artistAccountId = profile?.recoupArtistAccountId

    const task = await createTask(
      {
        title,
        description,
        status: 'pending',
        dueDate,
        songId,
      },
      artistAccountId
    )

    if (!task) {
      return NextResponse.json(
        { error: 'Failed to create task' },
        { status: 500 }
      )
    }

    return NextResponse.json({ task })
  } catch (error: any) {
    console.error('[API] Create task error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create task' },
      { status: 500 }
    )
  }
}
