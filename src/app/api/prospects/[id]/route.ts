// src/app/api/prospects/[id]/status/route.ts
// API endpoint to update prospect status

import { NextRequest, NextResponse } from 'next/server';
import { ProspectStore } from '@/lib/database/prospectStore';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { status } = await request.json();
    
    const validStatuses = ['discovered', 'analyzed', 'contacted', 'responded', 'qualified', 'rejected'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      );
    }

    const store = new ProspectStore();
    await store.updateProspectStatus(params.id, status);

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Error updating prospect status:', error);
    return NextResponse.json(
      { error: 'Failed to update status' },
      { status: 500 }
    );
  }
}
