import { NextRequest, NextResponse } from 'next/server';
import { runScheduledArchive } from '@/lib/handlers/items';

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret) {
    const expected = `Bearer ${cronSecret}`;
    if (authHeader !== expected) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  try {
    const result = await runScheduledArchive();
    return NextResponse.json({
      success: true,
      message: 'Archive job completed',
      ...result,
    });
  } catch (error) {
    console.error('Archive cron error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Archive failed' },
      { status: 500 }
    );
  }
}
