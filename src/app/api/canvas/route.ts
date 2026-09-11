import { NextResponse } from 'next/server';

let inMemoryStore: Record<string, unknown> = {};

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const roomId = searchParams.get('roomId') || 'synk_cloud_8H72KD';
  const data = inMemoryStore[roomId] || null;
  return NextResponse.json({ success: true, roomId, data });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { roomId, snapshot } = body;
    const key = roomId || 'synk_cloud_8H72KD';
    inMemoryStore[key] = snapshot;
    return NextResponse.json({ success: true, roomId: key, timestamp: Date.now() });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to save snapshot' }, { status: 500 });
  }
}
