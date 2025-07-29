// src/lib/ai/leadAnalyzer.ts
// Core AI engine for analyzing and scoring prospects

import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface ProspectData {
  company: string;
  website?: string;
  industry: string;
  size: string;
  description: string;
  jobPostings?: string[];
  techStack?: string[];
  painPoints?: string[];
  decisionMakers?: string[];
}

export interface ProspectScore {
  urgency: number;        // 0-100: Need for AI solution urgency
  budget: number;         // 0-100: Estimated budget capacity  
  fitScore: number;       // 0-100: How well they fit your services
  contactability: number; // 0-100: How easy to reach decision makers
  overallScore: number;   // Weighted average
  reasoning: string;      // AI explanation of scoring
}

export class LeadAnalyzer {
  async analyzeProspect(prospect: ProspectData): Promise<ProspectScore> {
    const prompt = `
Analyze this company for AI implementation readiness and score them as a potential client for AI automation services.

Company: ${prospect.company}
Industry: ${prospect.industry}
Size: ${prospect.size}
Description: ${prospect.description}
${prospect.jobPostings ? `Recent Job Postings: ${prospect.jobPostings.join(', ')}` : ''}
${prospect.techStack ? `Tech Stack: ${prospect.techStack.join(', ')}` : ''}

Score from 0-100 on these criteria:

1. URGENCY - How urgently do they need AI solutions?
   - Look for: "urgent", "ASAP", "immediately", "scaling challenges", "overwhelmed"
   - High urgency: 80-100
   - Medium urgency: 40-79  
   - Low urgency: 0-39

2. BUDGET - What's their estimated budget capacity?
   - Company size, funding, industry revenue indicators
   - High budget (enterprise): 80-100
   - Medium budget (growth stage): 40-79
   - Low budget (startup/small): 0-39

3. FIT_SCORE - How well do they match AI automation services?
   - Customer service, support, repetitive processes
   - Tech-forward industry, existing automation
   - High fit: 80-100
   - Medium fit: 40-79
   - Poor fit: 0-39

4. CONTACTABILITY - How easy to reach decision makers?
   - LinkedIn presence, contact info availability
   - Company size (smaller = easier to reach)
   - High contactability: 80-100
   - Medium: 40-79
   - Low: 0-39

Respond with JSON only:
{
  "urgency": number,
  "budget": number,
  "fitScore": number,
  "contactability": number,
  "overallScore": number,
  "reasoning": "Brief explanation of scoring rationale"
}
`;

    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are an expert B2B sales analyst specializing in AI implementation opportunities. Respond only with valid JSON."
          },
          {
            role: "user", 
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 500
      });

      const content = response.choices[0].message.content;
      if (!content) throw new Error('No response from OpenAI');

      // Parse JSON response
      const scoreData = JSON.parse(content);
      
      // Calculate weighted overall score if not provided
      if (!scoreData.overallScore) {
        scoreData.overallScore = Math.round(
          (scoreData.urgency * 0.3) +
          (scoreData.budget * 0.3) +
          (scoreData.fitScore * 0.25) +
          (scoreData.contactability * 0.15)
        );
      }

      return scoreData as ProspectScore;

    } catch (error) {
      console.error('Error analyzing prospect:', error);
      // Return default low scores on error
      return {
        urgency: 20,
        budget: 20,
        fitScore: 20,
        contactability: 20,
        overallScore: 20,
        reasoning: 'Error analyzing prospect - manual review needed'
      };
    }
  }

  async generateOutreachMessage(prospect: ProspectData, score: ProspectScore): Promise<string> {
    const prompt = `
Generate a personalized LinkedIn outreach message for this prospect:

Company: ${prospect.company}
Industry: ${prospect.industry}  
Pain Points: ${prospect.painPoints?.join(', ') || 'Unknown'}
Urgency Score: ${score.urgency}/100
Fit Score: ${score.fitScore}/100

Message requirements:
- Maximum 150 words
- Professional but conversational tone
- Reference their specific industry/challenges
- Mention AI automation benefits relevant to them
- Include soft call-to-action for brief call
- Don't be salesy or pushy
- Demonstrate understanding of their business

Focus on value, not features. Lead with insight, not pitch.
`;

    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are an expert B2B outreach specialist. Write messages that get responses by focusing on value and insight."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 200
      });

      return response.choices[0].message.content || 'Error generating message';

    } catch (error) {
      console.error('Error generating outreach message:', error);
      return 'Error generating personalized message';
    }
  }

  async identifyPainPoints(companyDescription: string, industry: string): Promise<string[]> {
    const prompt = `
Based on this company description and industry, identify likely AI automation pain points:

Industry: ${industry}
Description: ${companyDescription}

Common pain points to look for:
- Customer service overwhelm
- Manual data entry
- Repetitive tasks
- Scaling challenges  
- Response time issues
- Lead qualification bottlenecks
- Documentation management
- Report generation
- Scheduling coordination

Return 3-5 most likely pain points as JSON array of strings.
Example: ["Manual customer service responses", "Lead qualification bottlenecks", "Report generation overhead"]
`;

    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system", 
            content: "You are a business process analyst. Identify automation opportunities."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.5,
        max_tokens: 150
      });

      const content = response.choices[0].message.content;
      if (!content) return [];

      // Parse JSON array
      const painPoints = JSON.parse(content);
      return Array.isArray(painPoints) ? painPoints : [];

    } catch (error) {
      console.error('Error identifying pain points:', error);
      return ['Customer service automation', 'Process optimization', 'Data management'];
    }
  }
}

