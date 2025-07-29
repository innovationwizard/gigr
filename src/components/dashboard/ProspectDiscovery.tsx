// src/components/dashboard/ProspectDiscovery.tsx
// New prospect discovery interface

interface ProspectDiscoveryProps {
  onProspectsDiscovered: () => void;
}

export function ProspectDiscovery({ onProspectsDiscovered }: ProspectDiscoveryProps) {
  const [searchTerms, setSearchTerms] = useState<string[]>(['AI automation', 'customer service AI', 'business automation']);
  const [maxResults, setMaxResults] = useState(10);
  const [discovering, setDiscovering] = useState(false);
  const [lastResults, setLastResults] = useState<any>(null);

  const addSearchTerm = () => {
    setSearchTerms([...searchTerms, '']);
  };

  const updateSearchTerm = (index: number, value: string) => {
    const newTerms = [...searchTerms];
    newTerms[index] = value;
    setSearchTerms(newTerms);
  };

  const removeSearchTerm = (index: number) => {
    setSearchTerms(searchTerms.filter((_, i) => i !== index));
  };

  const discoverProspects = async () => {
    setDiscovering(true);
    try {
      const response = await fetch('/api/prospects/discover', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          searchTerms: searchTerms.filter(term => term.trim()),
          maxResults
        })
      });

      const results = await response.json();
      setLastResults(results);
      onProspectsDiscovered();
    } catch (error) {
      console.error('Error discovering prospects:', error);
    } finally {
      setDiscovering(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow border p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Discover New Prospects</h2>

      {/* Search Terms */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Search Terms (What problems are you looking for?)
        </label>
        <div className="space-y-2">
          {searchTerms.map((term, index) => (
            <div key={index} className="flex items-center space-x-2">
              <input
                type="text"
                value={term}
                onChange={(e) => updateSearchTerm(index, e.target.value)}
                placeholder="e.g., AI automation, customer service AI"
                className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm"
              />
              {searchTerms.length > 1 && (
                <button
                  onClick={() => removeSearchTerm(index)}
                  className="text-red-600 hover:text-red-800 text-sm"
                >
                  Remove
                </button>
              )}
            </div>
          ))}
        </div>
        <button
          onClick={addSearchTerm}
          className="mt-2 text-blue-600 hover:text-blue-800 text-sm"
        >
          + Add Search Term
        </button>
      </div>

      {/* Max Results */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Maximum Results
        </label>
        <select
          value={maxResults}
          onChange={(e) => setMaxResults(parseInt(e.target.value))}
          className="border border-gray-300 rounded-md px-3 py-2 text-sm"
        >
          <option value={5}>5 prospects</option>
          <option value={10}>10 prospects</option>
          <option value={20}>20 prospects</option>
          <option value={50}>50 prospects</option>
        </select>
      </div>

      {/* Discovery Button */}
      <button
        onClick={discoverProspects}
        disabled={discovering}
        className="bg-green-600 text-white px-6 py-3 rounded-md font-medium hover:bg-green-700 disabled:opacity-50"
      >
        {discovering ? 'Discovering Prospects...' : 'Start Discovery'}
      </button>

      {/* Last Results */}
      {lastResults && (
        <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-md">
          <h3 className="text-sm font-medium text-green-800 mb-2">Discovery Complete!</h3>
          <p className="text-sm text-green-700">
            Found {lastResults.discovered} prospects, {lastResults.prospects?.length || 0} qualified for outreach.
          </p>
        </div>
      )}
    </div>
  );
}