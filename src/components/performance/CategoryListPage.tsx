'use client';

import {
  EventCard,
  Pagination,
} from '@/components/performance/PerformanceListParts';
import { DateRangeDropdown } from '@/components/performance/DateRangeDropdown';
import { ThisWeekendChip } from '@/components/performance/ThisWeekendChip';
import { CityChip } from '@/components/performance/CityChip';
import { useStageProductionsEvents, type DateRange } from '@/lib/useSupabase';
import { useState } from 'react';

interface CategoryListPageProps {
  category: string;
  title: string;
}

export function CategoryListPage({ category, title }: CategoryListPageProps) {
  const {
    events,
    loading,
    totalCount,
    totalPages,
    page,
    updatePage,
    countryScope,
    updateCountryScope,
    city,
    updateCity,
    dateRange,
    customStart,
    customEnd,
    updateDateRange,
  } = useStageProductionsEvents(category);

  const safeCountry = (countryScope ?? 'United States') as 'United States' | 'International';

  function handleDateChange(range: DateRange) {
    if (range === 'custom') {
      updateDateRange('custom', customStart, customEnd);
    } else {
      updateDateRange(range);
    }
  }

  function handleClearAll() {
    updateCity(null);
    updateCountryScope('United States');
    updateDateRange('all');
  }

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

  const leftCol = events.slice(0, 5);
  const rightCol = events.slice(5, 10);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Page title - centered, bold */}
      <div className="text-center mb-4">
        <h1 className="text-2xl font-bold text-gray-900 uppercase tracking-wide">{title}</h1>
      </div>

      {/* Filter card - orange border rounded with chips */}
      <div className="mb-6 border-2 border-orange-400 rounded-2xl px-4 py-3 bg-orange-50/50">
        <div className="flex flex-wrap items-center gap-2">
          <CityChip city={city} onChange={updateCity} scope={safeCountry} />
          <DateRangeDropdown dateRange={dateRange} onChange={handleDateChange} />
          <ThisWeekendChip
            active={dateRange === 'this_weekend'}
            onClick={() => handleDateChange('this_weekend')}
          />
          {/* Spacer pushes clear all to the right */}
          <div className="flex-1" />
          <button
            onClick={handleClearAll}
            className="text-xs text-orange-600 hover:text-orange-700 underline"
          >
            Clear all
          </button>
        </div>
      </div>

      {totalCount === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <p className="text-4xl mb-3">🎭</p>
          <p className="text-sm">
            No upcoming events found
            {city ? ` in ${city}` : ` in ${safeCountry}`}
            {dateRange !== 'all' ? ' for the selected date range' : ''}.
          </p>
          {(dateRange !== 'all' || city) && (
            <p className="text-xs mt-2">Try changing the date or clearing the city filter.</p>
          )}
        </div>
      ) : (
        <div className="flex gap-6">
          <div className="flex-1 space-y-2">
            {leftCol.map((ev) => (
              <EventCard key={ev.id} event={ev} tag="upcoming" />
            ))}
          </div>

          <div className="flex-shrink-0 w-px bg-gray-200" />

          <div className="flex-1 space-y-2">
            {rightCol.map((ev) => (
              <EventCard key={ev.id} event={ev} tag="upcoming" />
            ))}
          </div>
        </div>
      )}

      <Pagination current={page} total={totalPages} onChange={updatePage} />
    </div>
  );
}
