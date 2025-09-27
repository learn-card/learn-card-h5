import { NextResponse } from 'next/server';

import { createUser, getUser } from '@/app/db';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();
    if (!email || !password) {
      return NextResponse.json(
        { error: '邮箱和密码不能为空。' },
        { status: 400 }
      );
    }

    const existing = await getUser(email);
    if (existing.length > 0) {
      return NextResponse.json(
        { error: '该邮箱已注册，请直接登录。' },
        { status: 409 }
      );
    }

    await createUser(email, password);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[auth/register]', error);
    return NextResponse.json(
      { error: '注册失败，请稍后再试。' },
      { status: 500 }
    );
  }
}
