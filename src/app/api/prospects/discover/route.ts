// src/app/api/prospects/discover/route.ts
// API endpoint to discover new prospects from various sources

import { NextRequest, NextResponse } from 'next/server';
import { ProspectScraper } from '@/lib/scraping/prospectScraper';
import { LeadAnalyzer } from '@/lib/ai/leadAnalyzer';
import { ProspectStore } from '@/lib/database/prospectStore';

export async function POST(request: NextRequest) {
  try {
    const { searchTerms, maxResults = 10 } = await request.json();
    
    if (!searchTerms || !Array.isArray(searchTerms)) {
      return NextResponse.json(
        { error: 'searchTerms array is required' },
        { status: 400 }
      );
    }

    const scraper = new ProspectScraper();
    const analyzer = new LeadAnalyzer();
    const store = new ProspectStore();

    // Discover prospects from multiple sources
    const prospects = await scraper.searchAngelListStartups(searchTerms);
    
    const analyzedProspects = [];

    // Process each prospect (limit to maxResults)
    for (const prospect of prospects.slice(0, maxResults)) {
      try {
        // Identify pain points
        const painPoints = await analyzer.identifyPainPoints(
          prospect.description, 
          prospect.industry
        );
        
        const enrichedProspect = { ...prospect, painPoints };

        // Analyze and score
        const score = await analyzer.analyzeProspect(enrichedProspect);
        
        // Generate outreach if high enough score
        let outreachMessage = '';
        if (score.overallScore >= 70) {
          outreachMessage = await analyzer.generateOutreachMessage(enrichedProspect, score);
        }

        // Save to database
        const prospectId = await store.saveProspect(enrichedProspect, score);
        
        if (outreachMessage) {
          await store.saveOutreachMessage(prospectId, outreachMessage);
        }

        analyzedProspects.push({
          id: prospectId,
          ...enrichedProspect,
          score,
          outreachMessage: outreachMessage || null
        });

      } catch (error) {
        console.error(`Error processing prospect ${prospect.company}:`, error);
        // Continue with next prospect
      }
    }

    await scraper.close();

    return NextResponse.json({
      discovered: analyzedProspects.length,
      prospects: analyzedProspects.filter(p => p.score.overallScore >= 60)
    });

  } catch (error) {
    console.error('Error discovering prospects:', error);
    return NextResponse.json(
      { error: 'Failed to discover prospects' },
      { status: 500 }
    );
  }
}
