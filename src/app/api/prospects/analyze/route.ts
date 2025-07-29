// src/app/api/prospects/analyze/route.ts
// API endpoint to analyze and score a single prospect

import { NextRequest, NextResponse } from 'next/server';
import { LeadAnalyzer, ProspectData } from '@/lib/ai/leadAnalyzer';
import { ProspectStore } from '@/lib/database/prospectStore';

export async function POST(request: NextRequest) {
  try {
    const prospectData: ProspectData = await request.json();
    
    // Validate required fields
    if (!prospectData.company || !prospectData.industry || !prospectData.description) {
      return NextResponse.json(
        { error: 'Missing required fields: company, industry, description' },
        { status: 400 }
      );
    }

    const analyzer = new LeadAnalyzer();
    const store = new ProspectStore();

    // Analyze the prospect with AI
    const score = await analyzer.analyzeProspect(prospectData);
    
    // Generate outreach message if score is good enough
    let outreachMessage = '';
    if (score.overallScore >= 60) {
      outreachMessage = await analyzer.generateOutreachMessage(prospectData, score);
    }

    // Save to database
    const prospectId = await store.saveProspect(prospectData, score);
    
    if (outreachMessage) {
      await store.saveOutreachMessage(prospectId, outreachMessage);
    }

    return NextResponse.json({
      id: prospectId,
      score,
      outreachMessage: outreachMessage || null,
      status: 'analyzed'
    });

  } catch (error) {
    console.error('Error analyzing prospect:', error);
    return NextResponse.json(
      { error: 'Failed to analyze prospect' },
      { status: 500 }
    );
  }
}
