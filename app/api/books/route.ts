import { NextResponse } from 'next/server';

import { fetchBooks } from '../../../lib/queries';

export async function GET() {
  try {
    const data = await fetchBooks();
    return NextResponse.json({ data });
  } catch (error) {
    console.error('[books/get]', error);
    return NextResponse.json(
      { error: 'Failed to load books' },
      { status: 500 }
    );
  }
}
