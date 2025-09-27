import { NextResponse } from 'next/server';

import { fetchBookWords } from '../../../../../lib/queries';

export async function GET(
  _: Request,
  { params }: { params: { bookId: string } }
) {
  try {
    const data = await fetchBookWords(params.bookId);
    return NextResponse.json({ data });
  } catch (error) {
    console.error('[bookWords/get]', error);
    return NextResponse.json(
      { error: 'Failed to load book words' },
      { status: 500 }
    );
  }
}
