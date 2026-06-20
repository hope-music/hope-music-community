const fs = require('fs');
const path = require('path');

const API_KEY = 'G0AVxK4c8bvtFMp0pJapkWEYlyu8DtIE';
const BASE_URL = 'https://app.ticketmaster.com/discovery/v2';

// Fetch from two Ticketmaster sub-classifications
const CLASSIFICATIONS = [
  { parent: 'Arts & Theatre', name: 'Classical' },
  { parent: 'Concerts', name: 'Classical' },
];

const OUTPUT_DIR = path.join(__dirname, 'public', 'data', 'ticketmaster', 'Classical');
const OUTPUT_FILE = path.join(OUTPUT_DIR, 'data.json');

const PAGE_SIZE = 200;
const MAX_PAGE = 4;

async function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function fetchPage(classificationName, page = 0) {
  const url = `${BASE_URL}/events.json?classificationName=${encodeURIComponent(classificationName)}&size=${PAGE_SIZE}&page=${page}&sort=date,asc&countryCode=US&apikey=${API_KEY}`;

  for (let attempt = 0; attempt < 3; attempt++) {
    const res = await fetch(url);
    if (res.status === 429 || res.status >= 500) {
      const wait = (attempt + 1) * 2000;
      console.log(`  [!] ${res.status} — retrying in ${wait}ms...`);
      await sleep(wait);
      continue;
    }
    if (!res.ok) {
      const body = await res.text();
      throw new Error(`HTTP ${res.status}: ${body.slice(0, 300)}`);
    }
    return res.json();
  }
  throw new Error(`Failed after 3 attempts`);
}

async function fetchAllForClassification(classificationName) {
  const events = [];
  for (let page = 0; page <= MAX_PAGE; page++) {
    const data = await fetchPage(classificationName, page);
    const pageData = data._embedded?.events || [];
    events.push(...pageData);
    console.log(`  [${classificationName}] page ${page}: +${pageData.length} events`);
    if (pageData.length === 0) break;
    await sleep(300);
  }
  return events;
}

async function main() {
  let allEvents = [];

  for (const cls of CLASSIFICATIONS) {
    console.log(`\nFetching [${cls.parent}] → ${cls.name}...`);
    const events = await fetchAllForClassification(cls.name);
    console.log(`  -> got ${events.length} events`);
    allEvents = allEvents.concat(events);
    await sleep(1000);
  }

  const seen = new Set();
  const unique = allEvents.filter((e) => {
    if (seen.has(e.id)) return false;
    seen.add(e.id);
    return true;
  });

  console.log(`\nTotal raw: ${allEvents.length}, after dedup: ${unique.length}`);

  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(unique, null, 2), 'utf-8');
  console.log(`Saved to ${OUTPUT_FILE}`);
}

main().catch((err) => {
  console.error('Failed:', err.message);
  process.exit(1);
});
