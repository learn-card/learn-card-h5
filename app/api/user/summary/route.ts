import { NextRequest, NextResponse } from 'next/server';

import { getUser } from '@/app/db';
import { fetchUserProgress } from '@/lib/queries';

export async function GET(request: NextRequest) {
  const email = request.nextUrl.searchParams.get('email');

  if (!email) {
    return NextResponse.json(
      { error: '请提供 email 参数。' },
      { status: 400 }
    );
  }

  try {
    const rows = await getUser(email);
    if (rows.length === 0) {
      return NextResponse.json(
        { error: '用户不存在。' },
        { status: 404 }
      );
    }

    const userRecord = { id: rows[0].id!, email: rows[0].email! };
    const progress = await fetchUserProgress(userRecord.id);

    return NextResponse.json({
      data: {
        user: userRecord,
        progress,
      },
    });
  } catch (error) {
    console.error('[user/summary]', error);
    return NextResponse.json(
      { error: '获取用户信息失败。' },
      { status: 500 }
    );
  }
}
