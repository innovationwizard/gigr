// src/components/dashboard/ProspectCard.tsx
// Individual prospect card component

interface ProspectCardProps {
  prospect: {
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
  };
  onStatusUpdate: (id: string, status: string) => void;
  onGenerateOutreach: (id: string) => void;
}

export function ProspectCard({ prospect, onStatusUpdate, onGenerateOutreach }: ProspectCardProps) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getStatusColor = (status: string) => {
    const colors = {
      discovered: 'bg-gray-100 text-gray-800',
      analyzed: 'bg-blue-100 text-blue-800',
      contacted: 'bg-yellow-100 text-yellow-800',
      responded: 'bg-green-100 text-green-800',
      qualified: 'bg-purple-100 text-purple-800',
      rejected: 'bg-red-100 text-red-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{prospect.company}</h3>
          <p className="text-sm text-gray-500">{prospect.industry} • {prospect.size}</p>
        </div>
        
        {prospect.score && (
          <div className={`px-2 py-1 rounded-full text-xs font-medium ${getScoreColor(prospect.score.overallScore)}`}>
            {prospect.score.overallScore}/100
          </div>
        )}
      </div>

      {/* Description */}
      <p className="text-sm text-gray-600 mb-4 line-clamp-3">{prospect.description}</p>

      {/* Pain Points */}
      {prospect.painPoints && prospect.painPoints.length > 0 && (
        <div className="mb-4">
          <h4 className="text-xs font-medium text-gray-700 mb-2">Pain Points:</h4>
          <div className="flex flex-wrap gap-1">
            {prospect.painPoints.slice(0, 3).map((pain, index) => (
              <span key={index} className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                {pain}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Score Breakdown */}
      {prospect.score && (
        <div className="mb-4">
          <h4 className="text-xs font-medium text-gray-700 mb-2">AI Analysis:</h4>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>Urgency: {prospect.score.urgency}/100</div>
            <div>Budget: {prospect.score.budget}/100</div>
            <div>Fit: {prospect.score.fitScore}/100</div>
            <div>Contact: {prospect.score.contactability}/100</div>
          </div>
        </div>
      )}

      {/* Outreach Message */}
      {prospect.outreachMessage && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded">
          <h4 className="text-xs font-medium text-blue-800 mb-1">Generated Outreach:</h4>
          <p className="text-xs text-blue-700 line-clamp-4">{prospect.outreachMessage}</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between">
        <select
          value={prospect.status}
          onChange={(e) => onStatusUpdate(prospect.id, e.target.value)}
          className={`px-2 py-1 rounded text-xs font-medium border-0 ${getStatusColor(prospect.status)}`}
        >
          <option value="discovered">Discovered</option>
          <option value="analyzed">Analyzed</option>
          <option value="contacted">Contacted</option>
          <option value="responded">Responded</option>
          <option value="qualified">Qualified</option>
          <option value="rejected">Rejected</option>
        </select>

        {!prospect.outreachMessage && prospect.score && prospect.score.overallScore >= 60 && (
          <button
            onClick={() => onGenerateOutreach(prospect.id)}
            className="bg-green-600 text-white px-3 py-1 rounded text-xs font-medium hover:bg-green-700"
          >
            Generate Outreach
          </button>
        )}
      </div>
    </div>
  );
}

