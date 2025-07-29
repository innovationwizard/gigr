// src/app/page.tsx
// Main Gigr dashboard interface

'use client';

import { useState, useEffect } from 'react';
import { ProspectCard } from '@/components/dashboard/ProspectCard';
import { AnalyticsDashboard } from '@/components/dashboard/AnalyticsDashboard';
import { ProspectDiscovery } from '@/components/dashboard/ProspectDiscovery';

interface Prospect {
  id: string;
  company: string;
  industry: string;
  size: string;
  description: string;
  painPoints?: string[];
  score?: {
    urgency: number;
    budget: number;
    fitScore: number;
    contactability: number;
    overallScore: number;
    reasoning: string;
  };
  outreachMessage?: string;
  status: string;
  createdAt: string;
}

interface Analytics {
  overview: {
    totalProspects: number;
    highScoreProspects: number;
    contacted: number;
    responded: number;
    qualified: number;
    responseRate: number;
    qualificationRate: number;
  };
  scoreDistribution: Record<string, number>;
  industryBreakdown: Record<string, number>;
  recentProspects: Prospect[];
}

export default function GigrDashboard() {
  const [prospects, setProspects] = useState<Prospect[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [activeTab, setActiveTab] = useState<'prospects' | 'analytics' | 'discovery'>('prospects');
  const [loading, setLoading] = useState(true);
  const [minScore, setMinScore] = useState(70);

  useEffect(() => {
    loadProspects();
    loadAnalytics();
  }, [minScore]);

  const loadProspects = async () => {
    try {
      const response = await fetch(`/api/prospects/list?minScore=${minScore}`);
      const data = await response.json();
      setProspects(data.prospects || []);
    } catch (error) {
      console.error('Error loading prospects:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadAnalytics = async () => {
    try {
      const response = await fetch('/api/analytics/dashboard');
      const data = await response.json();
      setAnalytics(data);
    } catch (error) {
      console.error('Error loading analytics:', error);
    }
  };

  const updateProspectStatus = async (id: string, status: string) => {
    try {
      await fetch(`/api/prospects/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      
      // Update local state
      setProspects(prospects.map(p => 
        p.id === id ? { ...p, status } : p
      ));
      
      // Reload analytics
      loadAnalytics();
    } catch (error) {
      console.error('Error updating prospect status:', error);
    }
  };

  const generateOutreach = async (prospectId: string) => {
    try {
      const response = await fetch('/api/outreach/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prospectId })
      });
      
      const data = await response.json();
      
      // Update prospect with new outreach message
      setProspects(prospects.map(p => 
        p.id === prospectId ? { ...p, outreachMessage: data.outreachMessage } : p
      ));
    } catch (error) {
      console.error('Error generating outreach:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900">Gigr</h1>
              <span className="text-sm text-gray-500">AI Gig Generation Agent</span>
            </div>
            
            <div className="flex items-center space-x-4">
              {analytics && (
                <div className="hidden md:flex items-center space-x-6 text-sm">
                  <div className="text-center">
                    <div className="font-semibold text-gray-900">{analytics.overview.totalProspects}</div>
                    <div className="text-gray-500">Total Prospects</div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold text-green-600">{analytics.overview.highScoreProspects}</div>
                    <div className="text-gray-500">High Score</div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold text-blue-600">{analytics.overview.responseRate}%</div>
                    <div className="text-gray-500">Response Rate</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'prospects', label: 'Prospects', count: prospects.length },
              { id: 'analytics', label: 'Analytics', count: null },
              { id: 'discovery', label: 'Discovery', count: null }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
                {tab.count !== null && (
                  <span className="ml-2 bg-gray-100 text-gray-900 py-0.5 px-2 rounded-full text-xs">
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'prospects' && (
          <div>
            {/* Filters */}
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <label className="text-sm font-medium text-gray-700">
                  Minimum Score:
                </label>
                <select
                  value={minScore}
                  onChange={(e) => setMinScore(parseInt(e.target.value))}
                  className="border border-gray-300 rounded-md px-3 py-1 text-sm"
                >
                  <option value={0}>All Prospects</option>
                  <option value={60}>60+ (Good)</option>
                  <option value={70}>70+ (High Priority)</option>
                  <option value={80}>80+ (Excellent)</option>
                </select>
              </div>
              
              <button
                onClick={loadProspects}
                className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700"
              >
                Refresh
              </button>
            </div>

            {/* Prospects Grid */}
            {loading ? (
              <div className="text-center py-12">
                <div className="text-gray-500">Loading prospects...</div>
              </div>
            ) : prospects.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-500 mb-4">No prospects found</div>
                <button
                  onClick={() => setActiveTab('discovery')}
                  className="bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-700"
                >
                  Discover New Prospects
                </button>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {prospects.map((prospect) => (
                  <ProspectCard
                    key={prospect.id}
                    prospect={prospect}
                    onStatusUpdate={updateProspectStatus}
                    onGenerateOutreach={generateOutreach}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'analytics' && analytics && (
          <AnalyticsDashboard analytics={analytics} />
        )}

        {activeTab === 'discovery' && (
          <ProspectDiscovery onProspectsDiscovered={loadProspects} />
        )}
      </main>
    </div>
  );
}
