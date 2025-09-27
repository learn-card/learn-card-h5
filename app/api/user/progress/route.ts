import { NextRequest, NextResponse } from 'next/server';

import { fetchUserProgress } from '../../../../lib/queries';

export async function GET(request: NextRequest) {
  const userIdParam = request.nextUrl.searchParams.get('userId');
  if (!userIdParam) {
    return NextResponse.json(
      { error: 'userId is required' },
      { status: 400 }
    );
  }
  const userId = Number(userIdParam);
  if (Number.isNaN(userId)) {
    return NextResponse.json(
      { error: 'userId must be a number' },
      { status: 400 }
    );
  }
  try {
    const data = await fetchUserProgress(userId);
    return NextResponse.json({ data });
  } catch (error) {
    console.error('[userProgress/get]', error);
    return NextResponse.json(
      { error: 'Failed to load user progress' },
      { status: 500 }
    );
  }
}
