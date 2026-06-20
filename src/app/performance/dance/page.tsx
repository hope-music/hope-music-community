'use client';

import { useEffect, useState, useMemo, useRef } from 'react';

const PAGE_SIZE = 10;
const TWO_WEEKS_MS = 14 * 24 * 60 * 60 * 1000;

const MAJOR_CITIES = [
  'All Cities',
  'New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia',
  'San Antonio', 'San Diego', 'Dallas', 'San Jose', 'Austin', 'Jacksonville',
  'San Francisco', 'Seattle', 'Denver', 'Boston', 'Nashville', 'Baltimore',
  'Las Vegas', 'Miami', 'Atlanta', 'Orlando', 'Minneapolis', 'Detroit',
  'London', 'Paris', 'Berlin', 'Madrid', 'Rome', 'Amsterdam', 'Barcelona',
  'Vienna', 'Prague', 'Munich', 'Milan', 'Zurich', 'Dublin', 'Edinburgh',
  'Tokyo', 'Shanghai', 'Beijing', 'Hong Kong', 'Singapore', 'Seoul',
  'Sydney', 'Melbourne', 'Auckland', 'Toronto', 'Vancouver', 'Montreal',
  'Mexico City', 'São Paulo', 'Buenos Aires', 'Rio de Janeiro',
  'Dubai', 'Tel Aviv', 'Istanbul', 'Cairo', 'Cape Town',
];

type Tab = 'upcoming' | 'past';

interface TicketmasterEvent {
  id: string;
  name: string;
  url: string;
  dates?: {
    start?: { localDate?: string; localTime?: string };
    status?: string;
  };
  _embedded?: {
    venues?: Array<{ name?: string; city?: { name?: string }; state?: { name?: string }; country?: { name?: string } }>;
  };
  images?: Array<{ url: string }>;
  info?: string;
}

function toDate(date?: string, time?: string): Date | null {
  if (!date) return null;
  const str = time ? `${date}T${time}` : `${date}T00:00:00`;
  return new Date(str);
}

function formatDate(date?: string, time?: string) {
  if (!date) return 'TBA';
  const d = new Date(date);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) +
    (time ? ` ${time}` : '');
}

function cityMatch(event: TicketmasterEvent, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  const venue = event._embedded?.venues?.[0];
  const city = (venue?.city?.name || '').toLowerCase();
  const state = (venue?.state?.name || '').toLowerCase();
  const country = (venue?.country?.name || '').toLowerCase();
  const venueName = (venue?.name || '').toLowerCase();
  return city.includes(q) || state.includes(q) || country.includes(q) || venueName.includes(q);
}

type EventTag = 'upcoming' | 'recent';

interface EventCardProps {
  event: TicketmasterEvent;
  tag?: EventTag;
}

function EventCard({ event, tag }: EventCardProps) {
  const venue = event._embedded?.venues?.[0];
  const image = event.images?.[0]?.url;
  const isPast = tag === 'recent';

  return (
    <div className="flex gap-3 p-3 rounded-lg border border-gray-200 bg-white hover:shadow-md transition-shadow relative overflow-hidden">
      {isPast && (
        <div
          className="absolute top-4 left-[-22px] z-10 w-[120px] bg-red-600 text-white text-[10px] font-bold tracking-wider text-center py-0.5 rotate-[-45deg] shadow-md pointer-events-none select-none"
        >
          PAST — DO NOT BUY
        </div>
      )}
      {image && (
        <div className="flex-shrink-0 w-20 h-20 rounded-md overflow-hidden bg-gray-100 mt-1">
          <img src={image} alt={event.name} className="w-full h-full object-cover" />
        </div>
      )}
      <div className="flex flex-col justify-between min-w-0 flex-grow pr-14">
        <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 leading-snug">{event.name}</h3>
        <div className="flex items-center justify-between mt-1">
          <p className="text-xs text-gray-500 truncate max-w-[60%]">
            {venue?.name || 'TBA'}{venue?.city?.name ? `, ${venue.city.name}` : ''}
          </p>
          <p className="text-xs text-gray-400 flex-shrink-0 ml-2">
            {formatDate(event.dates?.start?.localDate, event.dates?.start?.localTime)}
          </p>
        </div>
        {isPast ? (
          <span className="inline-flex items-center justify-center bg-gray-200 text-gray-500 text-xs font-medium py-1 px-3 rounded mt-1 w-fit cursor-not-allowed">
            Ended
          </span>
        ) : (
          <a
            href={event.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center bg-orange-500 hover:bg-orange-600 text-white text-xs font-medium py-1 px-3 rounded transition-colors mt-1 w-fit"
          >
            Buy Tickets
          </a>
        )}
      </div>
    </div>
  );
}

function PageDots({ total, current }: { total: number; current: number }) {
  if (total <= 1) return null;
  return (
    <div className="flex items-center justify-center mb-5 gap-1.5">
      {Array.from({ length: total }, (_, i) => i + 1).map((n) => (
        <div
          key={n}
          className={`rounded-full transition-all duration-200 ${
            n === current ? 'bg-orange-500 scale-125 shadow-sm w-3 h-3' : 'bg-gray-300 hover:bg-gray-400 w-2.5 h-2.5'
          }`}
        />
      ))}
    </div>
  );
}

function Pagination({ current, total, onChange }: { current: number; total: number; onChange: (p: number) => void }) {
  if (total <= 1) return null;
  function pages(): (number | '...')[] {
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
    if (current <= 4) {
      const r: (number | '...')[] = [];
      for (let i = 1; i <= 5; i++) r.push(i);
      r.push('...'); r.push(total);
      return r;
    }
    if (current >= total - 3) {
      const r: (number | '...')[] = [1, '...'];
      for (let i = total - 4; i <= total; i++) r.push(i);
      return r;
    }
    return [1, '...', current - 1, current, current + 1, '...', total];
  }
  return (
    <div className="mt-8 flex items-center justify-center gap-1">
      <button onClick={() => onChange(1)} disabled={current === 1} className="w-9 h-9 rounded text-sm text-gray-500 hover:bg-gray-100 disabled:opacity-25 disabled:cursor-not-allowed">&laquo;</button>
      <button onClick={() => onChange(current - 1)} disabled={current === 1} className="w-9 h-9 rounded text-sm text-gray-500 hover:bg-gray-100 disabled:opacity-25 disabled:cursor-not-allowed">&lsaquo;</button>
      {pages().map((p, i) =>
        p === '...'
          ? <span key={`e${i}`} className="w-9 h-9 flex items-center justify-center text-sm text-gray-400">&hellip;</span>
          : <button key={p} onClick={() => onChange(p as number)} className={`w-9 h-9 rounded text-sm font-medium transition-colors ${p === current ? 'bg-orange-500 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>{p}</button>
      )}
      <button onClick={() => onChange(current + 1)} disabled={current === total} className="w-9 h-9 rounded text-sm text-gray-500 hover:bg-gray-100 disabled:opacity-25 disabled:cursor-not-allowed">&rsaquo;</button>
      <button onClick={() => onChange(total)} disabled={current === total} className="w-9 h-9 rounded text-sm text-gray-500 hover:bg-gray-100 disabled:opacity-25 disabled:cursor-not-allowed">&raquo;</button>
    </div>
  );
}

export default function DancePage() {
  const [allEvents, setAllEvents] = useState<TicketmasterEvent[]>([]);
  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState<Tab>('upcoming');
  const [selectedCity, setSelectedCity] = useState('All Cities');
  const [customCity, setCustomCity] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch('/data/ticketmaster/Dance/data.json')
      .then((r) => { if (!r.ok) throw new Error(); return r.json(); })
      .then((data) => { setAllEvents(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const now = Date.now();

  const filteredEvents = useMemo(() => {
    const cityQ = selectedCity === 'All Cities' ? customCity : selectedCity;
    return allEvents.filter((ev) => {
      if (!cityMatch(ev, cityQ)) return false;
      const d = toDate(ev.dates?.start?.localDate, ev.dates?.start?.localTime);
      if (!d) return false;
      if (activeTab === 'upcoming') {
        return d.getTime() >= now;
      } else {
        return now - d.getTime() > 0 && now - d.getTime() <= TWO_WEEKS_MS;
      }
    });
  }, [allEvents, activeTab, selectedCity, customCity, now]);

  const archivedCount = useMemo(() =>
    allEvents.filter((ev) => {
      const d = toDate(ev.dates?.start?.localDate, ev.dates?.start?.localTime);
      if (!d) return false;
      return d.getTime() < now && now - d.getTime() > TWO_WEEKS_MS;
    }).length
  , [allEvents, now]);

  const pages = useMemo(() => {
    const p: TicketmasterEvent[][] = [];
    for (let i = 0; i < filteredEvents.length; i += PAGE_SIZE) p.push(filteredEvents.slice(i, i + PAGE_SIZE));
    return p;
  }, [filteredEvents]);

  const totalPages = pages.length;
  const currentItems = pages[currentPage - 1] || [];
  const leftCol = currentItems.slice(0, 5);
  const rightCol = currentItems.slice(5, 10);

  const upcomingCount = allEvents.filter((ev) => {
    const d = toDate(ev.dates?.start?.localDate, ev.dates?.start?.localTime);
    return d && d.getTime() >= now;
  }).length;

  const pastRecentCount = allEvents.filter((ev) => {
    const d = toDate(ev.dates?.start?.localDate, ev.dates?.start?.localTime);
    if (!d) return false;
    const age = now - d.getTime();
    return age > 0 && age <= TWO_WEEKS_MS;
  }).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex items-center gap-3 text-gray-500">
          <div className="w-5 h-5 border-2 border-gray-300 border-t-orange-500 rounded-full animate-spin" />
          <span className="text-sm">Loading events...</span>
        </div>
      </div>
    );
  }

  const displayCity = selectedCity === 'All Cities' ? customCity : selectedCity;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6 pb-4 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-gray-900">Dance</h1>
        <p className="text-sm text-gray-500 mt-1">{allEvents.length} events in database</p>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
        {/* Tab switcher */}
        <div className="flex bg-gray-100 rounded-lg p-1 flex-shrink-0">
          {(['upcoming', 'past'] as Tab[]).map((tab) => {
            const count = tab === 'upcoming' ? upcomingCount : pastRecentCount;
            return (
              <button
                key={tab}
                onClick={() => { setActiveTab(tab); setCurrentPage(1); }}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  activeTab === tab
                    ? 'bg-white text-orange-600 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab === 'upcoming' ? 'Upcoming' : 'Past'}
                {count > 0 && (
                  <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                    activeTab === tab ? 'bg-orange-100 text-orange-600' : 'bg-gray-200 text-gray-500'
                  }`}>
                    {count}
                  </span>
                )}
                {tab === 'past' && archivedCount > 0 && (
                  <span className="text-[10px] text-gray-400 hidden sm:inline">({archivedCount} archived)</span>
                )}
              </button>
            );
          })}
        </div>

        {/* City filter */}
        <div className="relative flex-1 max-w-sm" ref={dropdownRef}>
          <label className="block text-xs text-gray-500 mb-1">Filter by city</label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <button
                onClick={() => setShowDropdown((v) => !v)}
                className="w-full flex items-center justify-between px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white hover:border-orange-400 transition-colors text-left"
              >
                <span className={selectedCity === 'All Cities' ? 'text-gray-400' : 'text-gray-800'}>{selectedCity}</span>
                <svg className={`w-4 h-4 text-gray-400 transition-transform ${showDropdown ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {showDropdown && (
                <div className="absolute z-50 mt-1 w-full max-h-60 overflow-y-auto bg-white border border-gray-200 rounded-lg shadow-lg">
                  <div className="sticky top-0 bg-white border-b">
                    <input
                      autoFocus
                      placeholder="Search city..."
                      className="w-full px-3 py-2 text-sm outline-none"
                      onChange={(e) => {
                        const v = e.target.value;
                        if (v === '') setSelectedCity('All Cities');
                        else {
                          const match = MAJOR_CITIES.find((c) => c.toLowerCase().includes(v.toLowerCase()));
                          if (match) setSelectedCity(match);
                        }
                      }}
                    />
                  </div>
                  <div className="py-1">
                    <button
                      className={`w-full text-left px-3 py-1.5 text-sm hover:bg-gray-50 ${selectedCity === 'All Cities' ? 'text-orange-600 font-medium bg-orange-50' : 'text-gray-700'}`}
                      onClick={() => { setSelectedCity('All Cities'); setShowDropdown(false); setCurrentPage(1); }}
                    >
                      All Cities
                    </button>
                    {MAJOR_CITIES.filter((c) => c !== 'All Cities').map((city) => (
                      <button
                        key={city}
                        className={`w-full text-left px-3 py-1.5 text-sm hover:bg-gray-50 ${selectedCity === city ? 'text-orange-600 font-medium bg-orange-50' : 'text-gray-700'}`}
                        onClick={() => { setSelectedCity(city); setShowDropdown(false); setCurrentPage(1); }}
                      >
                        {city}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <input
              type="text"
              placeholder="Custom city..."
              value={customCity}
              onChange={(e) => { setCustomCity(e.target.value); setCurrentPage(1); }}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-orange-400 transition-colors"
            />
          </div>
        </div>

        {/* Result count */}
        <div className="flex-shrink-0 pt-5">
          <span className="text-sm text-gray-500">
            {filteredEvents.length === 0 ? 'No results' :
              `Showing ${filteredEvents.length} event${filteredEvents.length !== 1 ? 's' : ''}`}
            {displayCity && displayCity !== 'All Cities' ? ` in ${displayCity}` : ''}
          </span>
        </div>
      </div>

      {/* Page dots */}
      <PageDots total={totalPages} current={currentPage} />

      {/* Two-column list */}
      {filteredEvents.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <p className="text-4xl mb-3">🎭</p>
          <p className="text-sm">
            No {activeTab === 'upcoming' ? 'upcoming' : 'recent past'} events found
            {activeTab === 'past' ? ' (within the last 2 weeks)' : ''}.
          </p>
          {displayCity && displayCity !== 'All Cities' && (
            <p className="text-xs mt-2">Try a different city or clear the filter.</p>
          )}
        </div>
      ) : (
        <div className="relative">
          <div className="flex gap-6">
            <div className="flex-1 space-y-2">
              {leftCol.map((ev) => (
                <EventCard key={ev.id} event={ev} tag={activeTab === 'past' ? 'recent' : 'upcoming'} />
              ))}
            </div>
            <div className="relative flex-shrink-0 w-px bg-gray-200">
              <div className="absolute inset-x-0 flex flex-col items-center">
                <div className="absolute top-0 bottom-0 w-px bg-gray-300" />
                <div className="relative z-10 mt-20 w-8 h-8 rounded-full bg-orange-500 text-white text-xs font-bold flex items-center justify-center shadow-md">
                  {currentPage}
                </div>
              </div>
            </div>
            <div className="flex-1 space-y-2">
              {rightCol.map((ev) => (
                <EventCard key={ev.id} event={ev} tag={activeTab === 'past' ? 'recent' : 'upcoming'} />
              ))}
            </div>
          </div>
        </div>
      )}

      <Pagination current={currentPage} total={totalPages} onChange={(p) => setCurrentPage(p)} />
    </div>
  );
}
