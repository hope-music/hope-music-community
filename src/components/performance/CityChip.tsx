'use client';

import { useEffect, useRef, useState } from 'react';

const MAJOR_CITIES = [
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

interface CityChipProps {
  city: string | null;
  onChange: (c: string | null) => void;
  scope: 'United States' | 'International';
}

function chipClass() {
  return 'inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors max-w-[200px]';
}

function itemClass(active: boolean) {
  return `w-full text-left px-3 py-2 text-sm hover:bg-gray-50 transition-colors ${
    active ? 'text-orange-600 font-semibold bg-orange-50' : 'text-gray-700'
  }`;
}

export function CityChip({ city, onChange, scope }: CityChipProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setQuery('');
      }
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const filtered = city ? [city, ...MAJOR_CITIES.filter((c) => c !== city)] : MAJOR_CITIES;
  const matched = query
    ? filtered.filter((c) => c.toLowerCase().includes(query.toLowerCase())).slice(0, 50)
    : filtered.slice(0, 50);

  const label = city || 'All cities';

  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen((v) => !v)} className={chipClass()}>
        <svg className="w-4 h-4 text-gray-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <span className="truncate">{label}</span>
        <svg className={`w-3 h-3 text-gray-400 transition-transform flex-shrink-0 ${open ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute z-50 mt-2 w-64 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden">
          <div className="sticky top-0 bg-white border-b border-gray-100 px-3 py-2">
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={scope === 'United States' ? 'Search US city...' : 'Search city...'}
              className="w-full px-2 py-1.5 text-sm outline-none border border-gray-200 rounded"
            />
          </div>
          <div className="max-h-72 overflow-y-auto py-1">
            <button
              className={itemClass(!city)}
              onClick={() => { onChange(null); setOpen(false); setQuery(''); }}
            >
              All Cities
            </button>
            {matched.map((c) => (
              <button
                key={c}
                className={itemClass(city === c)}
                onClick={() => { onChange(c); setOpen(false); setQuery(''); }}
              >
                {c}
              </button>
            ))}
            {matched.length === 0 && (
              <div className="px-3 py-3 text-xs text-gray-400 text-center">No matches</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}