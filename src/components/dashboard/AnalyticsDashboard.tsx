// src/components/dashboard/AnalyticsDashboard.tsx
// Analytics and performance metrics

interface AnalyticsDashboardProps {
  analytics: {
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
  };
}

export function AnalyticsDashboard({ analytics }: AnalyticsDashboardProps) {
  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="text-2xl font-bold text-gray-900">{analytics.overview.totalProspects}</div>
          <div className="text-sm text-gray-500">Total Prospects</div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="text-2xl font-bold text-green-600">{analytics.overview.highScoreProspects}</div>
          <div className="text-sm text-gray-500">High Score (80+)</div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="text-2xl font-bold text-blue-600">{analytics.overview.responseRate}%</div>
          <div className="text-sm text-gray-500">Response Rate</div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="text-2xl font-bold text-purple-600">{analytics.overview.qualificationRate}%</div>
          <div className="text-sm text-gray-500">Qualification Rate</div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Score Distribution */}
        <div className="bg-white p-6 rounded-lg shadow border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Score Distribution</h3>
          <div className="space-y-3">
            {Object.entries(analytics.scoreDistribution).map(([range, count]) => (
              <div key={range} className="flex items-center justify-between">
                <span className="text-sm text-gray-600">{range}</span>
                <div className="flex items-center space-x-2">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${(count / analytics.overview.totalProspects) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-900">{count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Industry Breakdown */}
        <div className="bg-white p-6 rounded-lg shadow border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Industry Breakdown</h3>
          <div className="space-y-3">
            {Object.entries(analytics.industryBreakdown)
              .sort(([,a], [,b]) => b - a)
              .slice(0, 5)
              .map(([industry, count]) => (
              <div key={industry} className="flex items-center justify-between">
                <span className="text-sm text-gray-600">{industry}</span>
                <div className="flex items-center space-x-2">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full" 
                      style={{ width: `${(count / analytics.overview.totalProspects) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-900">{count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
