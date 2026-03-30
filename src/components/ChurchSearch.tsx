import { useCallback, useEffect, useState } from 'react';
import { SearchIcon, MapPinIcon, ExternalLinkIcon } from 'lucide-react';
import { defaultChurches, type Church } from '../data/defaultChurches';
import {
  CHURCH_CACHE_KEY,
  readCachedChurches,
  writeCachedChurches,
} from '../lib/churchCache';

export function ChurchSearch() {
  const [searchQuery, setSearchQuery] = useState('');
  const [churches, setChurches] = useState<Church[]>(defaultChurches);

  const loadChurches = useCallback(async (skipCache: boolean) => {
    if (!skipCache) {
      const cachedChurches = readCachedChurches();
      if (cachedChurches && cachedChurches.length > 0) {
        setChurches(cachedChurches);
        return;
      }
    }

    try {
      const response = await fetch('/api/churches');
      if (!response.ok) return;
      const data = await response.json();
      if (Array.isArray(data?.churches) && data.churches.length > 0) {
        setChurches(data.churches);
        writeCachedChurches(data.churches);
      }
    } catch {
      // Local vite dev or missing API route: keep default church list.
    }
  }, []);

  useEffect(() => {
    void loadChurches(false);
  }, [loadChurches]);

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === CHURCH_CACHE_KEY && e.newValue === null) {
        void loadChurches(true);
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [loadChurches]);

  const filteredChurches = churches.filter((church) => {
    const query = searchQuery.toLowerCase();
    return (
      church.name.toLowerCase().includes(query) ||
      church.denomination.toLowerCase().includes(query));

  });
  return (
    <div className="w-full flex flex-col items-center">
      {/* Header */}
      <div className="text-center mb-8 space-y-3">
        <span className="inline-block text-sm font-semibold text-[#2E7D32] tracking-wider uppercase bg-[#2E7D32]/10 px-3 py-1 rounded-full">
          Find a Church
        </span>
        <h2 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight">
          Churches in Spring Hill, TN
        </h2>
        <p className="text-muted-foreground text-lg">
          Explore churches in our community
        </p>
      </div>

      {/* Search Input */}
      <div className="w-full max-w-2xl relative mb-10">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <SearchIcon
            className="h-5 w-5 text-muted-foreground"
            aria-hidden="true" />
          
        </div>
        <input
          type="text"
          className="block w-full pl-12 pr-4 py-4 bg-muted border border-border rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#2E7D32] focus:border-transparent transition-shadow text-lg"
          placeholder="Search by name or denomination..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          aria-label="Search churches" />
        
      </div>

      {/* Results Grid */}
      {filteredChurches.length > 0 ?
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
          {filteredChurches.map((church, index) => {
          const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${church.name} ${church.address}`)}`;
          return (
            <div
              key={index}
              className="bg-card border border-border rounded-xl p-6 hover:shadow-lg hover:border-[#2E7D32]/30 transition-all duration-300 flex flex-col h-full group">
              
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-3 gap-2">
                    <h3 className="font-semibold text-foreground text-xl leading-tight group-hover:text-[#2E7D32] transition-colors">
                      {church.name}
                    </h3>
                  </div>
                  <span className="inline-block bg-[#2E7D32]/10 text-[#2E7D32] px-2.5 py-1 rounded-full text-xs font-medium mb-4">
                    {church.denomination}
                  </span>
                  <div className="flex items-start text-muted-foreground text-sm mb-6">
                    <MapPinIcon className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                    <span className="leading-snug">{church.address}</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-border/50 mt-auto">
                  <a
                  href={mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-sm font-medium text-[#2E7D32] hover:text-[#1B5E20] hover:underline transition-colors">
                  
                    Get Directions
                    <ExternalLinkIcon className="ml-1.5 h-3.5 w-3.5" />
                  </a>
                </div>
              </div>);

        })}
        </div> /* Empty State */ :

      <div className="w-full py-16 flex flex-col items-center justify-center text-center bg-muted/50 rounded-2xl border border-dashed border-border">
          <div className="bg-background p-4 rounded-full shadow-sm mb-4">
            <SearchIcon className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium text-foreground mb-1">
            No churches found
          </h3>
          <p className="text-muted-foreground">
            We couldn't find any churches matching "{searchQuery}".
          </p>
          <button
          onClick={() => setSearchQuery('')}
          className="mt-4 text-sm font-medium text-[#2E7D32] hover:underline">
          
            Clear search
          </button>
        </div>
      }
    </div>);

}
