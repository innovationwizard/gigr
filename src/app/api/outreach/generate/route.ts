// src/app/api/outreach/generate/route.ts
// API endpoint to generate outreach messages for existing prospects

import { NextRequest, NextResponse } from 'next/server';
import { LeadAnalyzer } from '@/lib/ai/leadAnalyzer';
import { ProspectStore } from '@/lib/database/prospectStore';

export async function POST(request: NextRequest) {
  try {
    const { prospectId, customContext } = await request.json();
    
    if (!prospectId) {
      return NextResponse.json(
        { error: 'prospectId is required' },
        { status: 400 }
      );
    }

    const store = new ProspectStore();
    const analyzer = new LeadAnalyzer();

    // Get prospect data
    const prospects = await store.getRecentProspects(1000); // TODO: Add getById method
    const prospect = prospects.find(p => p.id === prospectId);
    
    if (!prospect) {
      return NextResponse.json(
        { error: 'Prospect not found' },
        { status: 404 }
      );
    }

    // Generate new outreach message
    const outreachMessage = await analyzer.generateOutreachMessage(
      prospect, 
      prospect.score!
    );

    // Save the new message
    await store.saveOutreachMessage(prospectId, outreachMessage);

    return NextResponse.json({
      prospectId,
      outreachMessage,
      generatedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error generating outreach:', error);
    return NextResponse.json(
      { error: 'Failed to generate outreach message' },
      { status: 500 }
    );
  }
}
