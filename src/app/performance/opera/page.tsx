'use client';

import { useEffect, useState } from 'react';

interface TicketmasterEvent {
  id: string;
  name: string;
  url: string;
  dates?: {
    start?: {
      localDate?: string;
      localTime?: string;
    };
  };
  _embedded?: {
    venues?: Array<{
      name?: string;
      city?: { name?: string };
    }>;
  };
  images?: Array<{ url: string }>;
}

export default function OperaPerformancePage() {
  const [events, setEvents] = useState<TicketmasterEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 降维打击：不请求API，不经过云数据库，只读我们刚刚抓好的干净的本地 JSON 文件
    fetch('/data/ticketmaster/Opera/data.json')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load local opera data');
        return res.json();
      })
      .then((data) => {
        setEvents(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error loading opera events:', err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-lg font-semibold text-gray-600">Loading Opera Events...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-gray-900 border-b pb-4">Opera Events</h1>
      
      {events.length === 0 ? (
        <p className="text-gray-500 text-center py-12">No opera events found at the moment.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => {
            const venue = event._embedded?.venues?.[0];
            const eventImage = event.images?.[0]?.url;

            return (
              <div key={event.id} className="border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow bg-white flex flex-col h-full">
                {eventImage && (
                  <div className="relative h-48 w-full bg-gray-100">
                    <img 
                      src={eventImage} 
                      alt={event.name} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                
                <div className="p-5 flex flex-col flex-grow">
                  <h3 className="text-xl font-bold text-gray-900 line-clamp-2 mb-2 min-h-[3.5rem]">
                    {event.name}
                  </h3>
                  
                  <div className="text-sm text-gray-600 space-y-1 mb-6 flex-grow">
                    <p className="flex items-center">
                      <span className="font-semibold mr-1">Date:</span> 
                      {event.dates?.start?.localDate || 'TBA'} {event.dates?.start?.localTime || ''}
                    </p>
                    <p className="flex items-center">
                      <span className="font-semibold mr-1">Venue:</span> 
                      {venue?.name || 'TBA'}{venue?.city?.name ? `, ${venue.city.name}` : ''}
                    </p>
                  </div>

                  <a 
                    href={event.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="block w-full text-center bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-4 rounded-lg transition-colors mt-auto"
                  >
                    Buy Tickets
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}