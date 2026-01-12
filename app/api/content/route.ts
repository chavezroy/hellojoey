import { NextRequest, NextResponse } from 'next/server';
import { getContent, saveContent, type ContentData } from '@/lib/content';
import { isAuthenticated } from '@/lib/auth';

export async function GET() {
  try {
    const content = getContent();
    return NextResponse.json(content);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to load content' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const authenticated = await isAuthenticated();
    if (!authenticated) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body: ContentData = await request.json();
    saveContent(body);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to save content' },
      { status: 500 }
    );
  }
}

