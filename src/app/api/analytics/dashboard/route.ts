// src/app/api/analytics/dashboard/route.ts
// API endpoint for dashboard analytics

import { NextRequest, NextResponse } from 'next/server';
import { ProspectStore } from '@/lib/database/prospectStore';

export async function GET(request: NextRequest) {
  try {
    const store = new ProspectStore();
    const prospects = await store.getRecentProspects(1000);

    // Calculate analytics
    const totalProspects = prospects.length;
    const highScoreProspects = prospects.filter(p => p.score && p.score.overallScore >= 80).length;
    const contacted = prospects.filter(p => p.status === 'contacted').length;
    const responded = prospects.filter(p => p.status === 'responded').length;
    const qualified = prospects.filter(p => p.status === 'qualified').length;

    // Score distribution
    const scoreRanges = {
      '80-100': prospects.filter(p => p.score && p.score.overallScore >= 80).length,
      '60-79': prospects.filter(p => p.score && p.score.overallScore >= 60 && p.score.overallScore < 80).length,
      '40-59': prospects.filter(p => p.score && p.score.overallScore >= 40 && p.score.overallScore < 60).length,
      '0-39': prospects.filter(p => p.score && p.score.overallScore < 40).length,
    };

    // Industry breakdown
    const industries = prospects.reduce((acc, p) => {
      acc[p.industry] = (acc[p.industry] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Response rate calculation
    const responseRate = contacted > 0 ? Math.round((responded / contacted) * 100) : 0;
    const qualificationRate = responded > 0 ? Math.round((qualified / responded) * 100) : 0;

    return NextResponse.json({
      overview: {
        totalProspects,
        highScoreProspects,
        contacted,
        responded,
        qualified,
        responseRate,
        qualificationRate
      },
      scoreDistribution: scoreRanges,
      industryBreakdown: industries,
      recentProspects: prospects.slice(0, 10).map(p => ({
        id: p.id,
        company: p.company,
        industry: p.industry,
        score: p.score?.overallScore || 0,
        status: p.status,
        createdAt: p.createdAt
      }))
    });

  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}