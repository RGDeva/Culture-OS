import { NextRequest, NextResponse } from 'next/server'

// In-memory storage for comments (replace with DB later)
const productComments = new Map<string, Comment[]>()

interface Comment {
  id: string
  productId: string
  userId: string
  userName: string
  userAvatar?: string
  content: string
  rating?: number // 1-5 stars
  createdAt: string
  updatedAt?: string
  replies?: Comment[]
}

/**
 * GET /api/marketplace/products/[id]/comments
 * Get all comments for a product
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const comments = productComments.get(id) || []
    
    return NextResponse.json({
      comments,
      total: comments.length,
    })
  } catch (error: any) {
    console.error('[MARKETPLACE_COMMENTS] GET error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to get comments' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/marketplace/products/[id]/comments
 * Add a comment to a product
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    
    const { userId, userName, content, rating, userAvatar } = body
    
    if (!userId || !userName || !content) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }
    
    const comment: Comment = {
      id: `comment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      productId: id,
      userId,
      userName,
      userAvatar,
      content,
      rating,
      createdAt: new Date().toISOString(),
      replies: [],
    }
    
    const comments = productComments.get(id) || []
    comments.push(comment)
    productComments.set(id, comments)
    
    console.log('[MARKETPLACE_COMMENTS] Added comment:', comment.id, 'to product:', id)
    
    return NextResponse.json({
      success: true,
      comment,
    })
  } catch (error: any) {
    console.error('[MARKETPLACE_COMMENTS] POST error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to add comment' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/marketplace/products/[id]/comments
 * Delete a comment (pass commentId in body)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { commentId, userId } = body
    
    if (!commentId || !userId) {
      return NextResponse.json(
        { error: 'Missing commentId or userId' },
        { status: 400 }
      )
    }
    
    const comments = productComments.get(id) || []
    const commentIndex = comments.findIndex(c => c.id === commentId)
    
    if (commentIndex === -1) {
      return NextResponse.json(
        { error: 'Comment not found' },
        { status: 404 }
      )
    }
    
    // Check if user owns the comment
    if (comments[commentIndex].userId !== userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }
    
    comments.splice(commentIndex, 1)
    productComments.set(id, comments)
    
    console.log('[MARKETPLACE_COMMENTS] Deleted comment:', commentId)
    
    return NextResponse.json({
      success: true,
    })
  } catch (error: any) {
    console.error('[MARKETPLACE_COMMENTS] DELETE error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to delete comment' },
      { status: 500 }
    )
  }
}
