import { NextRequest, NextResponse } from 'next/server'

/**
 * DELETE /api/vault/folders?folderId=xxx
 * Delete a folder
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const folderId = searchParams.get('folderId')

    if (!folderId) {
      return NextResponse.json(
        { error: 'Folder ID is required' },
        { status: 400 }
      )
    }

    console.log('[FOLDERS] Deleting folder:', folderId)

    // TODO: In production, delete from database
    // For now, just return success
    // The frontend will remove it from state

    return NextResponse.json({
      success: true,
      message: 'Folder deleted successfully',
    })
  } catch (error: any) {
    console.error('[FOLDERS] Delete error:', error)
    return NextResponse.json(
      {
        error: 'Failed to delete folder',
        message: error.message,
      },
      { status: 500 }
    )
  }
}
