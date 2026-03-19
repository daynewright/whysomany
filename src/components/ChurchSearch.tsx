import React, { useState, Component } from 'react';
import { SearchIcon, MapPinIcon, ExternalLinkIcon } from 'lucide-react';
const churches = [
{
  name: 'Grace Chapel Spring Hill',
  denomination: 'Non-Denominational',
  address: '3279 Southall Rd, Franklin, TN'
},
{
  name: 'Spring Hill Church of Christ',
  denomination: 'Church of Christ',
  address: '102 Municipal Dr, Spring Hill, TN'
},
{
  name: 'Calvary Chapel Spring Hill',
  denomination: 'Calvary Chapel',
  address: '1095 Campbell Station Pkwy, Spring Hill, TN'
},
{
  name: 'Connection Point Church',
  denomination: 'Non-Denominational',
  address: '1097 Crossings Blvd, Spring Hill, TN'
},
{
  name: 'First Baptist Church Spring Hill',
  denomination: 'Baptist',
  address: '3013 Main St, Spring Hill, TN'
},
{
  name: 'Spring Hill United Methodist Church',
  denomination: 'Methodist',
  address: '3200 Port Royal Rd, Spring Hill, TN'
},
{
  name: 'Redemption City Church',
  denomination: 'Non-Denominational',
  address: '1200 Town Center Pkwy, Spring Hill, TN'
},
{
  name: 'St. Michael Catholic Church',
  denomination: 'Catholic',
  address: '404 McCutcheon Creek Rd, Spring Hill, TN'
},
{
  name: 'Crosspoint Community Church',
  denomination: 'Non-Denominational',
  address: '1000 Spring Hill Pkwy, Spring Hill, TN'
},
{
  name: 'Heritage Baptist Church',
  denomination: 'Baptist',
  address: '3480 Port Royal Rd, Spring Hill, TN'
},
{
  name: 'The Church at Spring Hill',
  denomination: 'Non-Denominational',
  address: '5001 Main St, Spring Hill, TN'
},
{
  name: 'New Hope Church of the Nazarene',
  denomination: 'Nazarene',
  address: '3060 Duplex Rd, Spring Hill, TN'
},
{
  name: 'Spring Hill Presbyterian Church',
  denomination: 'Presbyterian',
  address: '1001 Campbell Station Pkwy, Spring Hill, TN'
},
{
  name: 'Lifepoint Church Spring Hill',
  denomination: 'Non-Denominational',
  address: '1501 Jim Warren Rd, Spring Hill, TN'
},
{
  name: 'Fellowship Bible Church',
  denomination: 'Non-Denominational',
  address: '2120 Beechcroft Rd, Spring Hill, TN'
},
{
  name: 'Bethesda Church of Christ',
  denomination: 'Church of Christ',
  address: "4919 Bethesda Rd, Thompson's Station, TN"
},
{
  name: 'Revolution Church',
  denomination: 'Non-Denominational',
  address: '3020 Reserve Blvd, Spring Hill, TN'
},
{
  name: 'Spring Hill Seventh-Day Adventist',
  denomination: 'Seventh-Day Adventist',
  address: '3032 Duplex Rd, Spring Hill, TN'
},
{
  name: 'Harvest View Church',
  denomination: 'Non-Denominational',
  address: '4763 Port Royal Rd, Spring Hill, TN'
},
{
  name: 'Mt. Pleasant Baptist Church',
  denomination: 'Baptist',
  address: '2824 Duplex Rd, Spring Hill, TN'
},
{
  name: 'Christ Community Church',
  denomination: 'Non-Denominational',
  address: '1200 Saturn Pkwy, Spring Hill, TN'
},
{
  name: 'Epic Life Church',
  denomination: 'Non-Denominational',
  address: '5000 Main St, Spring Hill, TN'
},
{
  name: 'Maury Hills Church',
  denomination: 'Church of Christ',
  address: '1124 Hatcher Ln, Columbia, TN'
},
{
  name: 'Neapolis Church of Christ',
  denomination: 'Church of Christ',
  address: '4450 Kedron Rd, Spring Hill, TN'
},
{
  name: "Thompson's Station Church",
  denomination: 'Non-Denominational',
  address: "3016 Columbia Pike, Thompson's Station, TN"
},
{
  name: 'Longview Baptist Church',
  denomination: 'Baptist',
  address: '4904 Kedron Rd, Spring Hill, TN'
},
{
  name: 'Spring Hill Assembly of God',
  denomination: 'Assembly of God',
  address: '3100 Duplex Rd, Spring Hill, TN'
},
{
  name: 'The Belonging Co Spring Hill',
  denomination: 'Non-Denominational',
  address: 'Spring Hill, TN'
},
{
  name: 'Refuge Church',
  denomination: 'Non-Denominational',
  address: '2001 Campbell Station Pkwy, Spring Hill, TN'
},
{
  name: 'Restoration Church',
  denomination: 'Non-Denominational',
  address: '1060 Jim Warren Rd, Spring Hill, TN'
}];

export function ChurchSearch() {
  const [searchQuery, setSearchQuery] = useState('');
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
          Explore churches in your community
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