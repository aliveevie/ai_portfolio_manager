import { NextRequest, NextResponse } from 'next/server';
import { tools } from '@/ai/tools';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const address = searchParams.get('address');
  if (!address) {
    return NextResponse.json({ error: 'Missing address parameter' }, { status: 400 });
  }
  try {
    const recs = await tools.aiRecommendation.execute({ address });
    return NextResponse.json(recs);
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to get recommendations' }, { status: 500 });
  }
} 