// src/lib/database/prospectStore.ts
// Database operations for storing and managing prospects

import { createClient } from '@supabase/supabase-js';
import { ProspectData, ProspectScore } from '../ai/leadAnalyzer';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

export interface StoredProspect extends ProspectData {
  id: string;
  score?: ProspectScore;
  outreachMessage?: string;
  status: 'discovered' | 'analyzed' | 'contacted' | 'responded' | 'qualified' | 'rejected';
  createdAt: string;
  updatedAt: string;
  lastContactedAt?: string;
}

export class ProspectStore {
  async saveProspect(prospect: ProspectData, score?: ProspectScore): Promise<string> {
    const { data, error } = await supabase
      .from('prospects')
      .insert({
        company: prospect.company,
        website: prospect.website,
        industry: prospect.industry,
        size: prospect.size,
        description: prospect.description,
        job_postings: prospect.jobPostings,
        tech_stack: prospect.techStack,
        pain_points: prospect.painPoints,
        decision_makers: prospect.decisionMakers,
        score: score,
        status: score ? 'analyzed' : 'discovered',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Error saving prospect:', error);
      throw error;
    }

    return data.id;
  }

  async getProspectsByScore(minScore: number = 70): Promise<StoredProspect[]> {
    const { data, error } = await supabase
      .from('prospects')
      .select('*')
      .gte('score->overallScore', minScore)
      .eq('status', 'analyzed')
      .order('score->overallScore', { ascending: false });

    if (error) {
      console.error('Error fetching prospects:', error);
      return [];
    }

    return data || [];
  }

  async updateProspectStatus(id: string, status: StoredProspect['status']): Promise<void> {
    const { error } = await supabase
      .from('prospects')
      .update({ 
        status,
        updated_at: new Date().toISOString(),
        ...(status === 'contacted' && { last_contacted_at: new Date().toISOString() })
      })
      .eq('id', id);

    if (error) {
      console.error('Error updating prospect status:', error);
      throw error;
    }
  }

  async saveOutreachMessage(id: string, message: string): Promise<void> {
    const { error } = await supabase
      .from('prospects')
      .update({ 
        outreach_message: message,
        updated_at: new Date().toISOString()
      })
      .eq('id', id);

    if (error) {
      console.error('Error saving outreach message:', error);
      throw error;
    }
  }

  async getRecentProspects(limit: number = 50): Promise<StoredProspect[]> {
    const { data, error } = await supabase
      .from('prospects')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching recent prospects:', error);
      return [];
    }

    return data || [];
  }
}
