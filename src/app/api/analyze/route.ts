import { NextRequest, NextResponse } from 'next/server';
import { baseGuardianService } from '~/lib/baseGuardian';

export async function POST(request: NextRequest) {
  try {
    const { target, type } = await request.json();

    if (!target || !type) {
      return NextResponse.json(
        { error: 'Missing required parameters: target and type' },
        { status: 400 }
      );
    }

    if (type !== 'transaction' && type !== 'contract') {
      return NextResponse.json(
        { error: 'Invalid type. Must be "transaction" or "contract"' },
        { status: 400 }
      );
    }

    const analysis = await baseGuardianService.performComprehensiveAnalysis(target, type);

    return NextResponse.json(analysis);
  } catch (error) {
    console.error('Analysis API error:', error);
    return NextResponse.json(
      { error: 'Analysis failed' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const threatFeed = await baseGuardianService.getLiveThreatFeed();
    return NextResponse.json({ threats: threatFeed });
  } catch (error) {
    console.error('Threat feed API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch threat feed' },
      { status: 500 }
    );
  }
}