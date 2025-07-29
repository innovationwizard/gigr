// src/app/api/prospects/list/route.ts
// API endpoint to list and filter stored prospects

import { NextRequest, NextResponse } from 'next/server';
import { ProspectStore } from '@/lib/database/prospectStore';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const minScore = parseInt(searchParams.get('minScore') || '60');
    const limit = parseInt(searchParams.get('limit') || '50');
    const status = searchParams.get('status');

    const store = new ProspectStore();
    
    let prospects;
    if (status) {
      // Filter by status (this would need additional method in ProspectStore)
      prospects = await store.getRecentProspects(limit);
      prospects = prospects.filter(p => p.status === status);
    } else {
      prospects = await store.getProspectsByScore(minScore);
    }

    return NextResponse.json({
      prospects: prospects.slice(0, limit),
      total: prospects.length
    });

  } catch (error) {
    console.error('Error fetching prospects:', error);
    return NextResponse.json(
      { error: 'Failed to fetch prospects' },
      { status: 500 }
    );
  }
}
