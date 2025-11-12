#!/usr/bin/env node
import { strict as assert } from 'assert';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE in environment.');
  console.error('Set SUPABASE_URL and SUPABASE_SERVICE_ROLE (service role key) and re-run.');
  process.exit(2);
}

const expectTours = process.env.EXPECT_TOURNAMENTS ? parseInt(process.env.EXPECT_TOURNAMENTS, 10) : 1;
const expectQues = process.env.EXPECT_QUESTIONS ? parseInt(process.env.EXPECT_QUESTIONS, 10) : 1;
// support either EXPECT_MAPPINGS or EXPECT_TOURNAMENT_QUESTIONS (historic names)
const expectMaps = process.env.EXPECT_MAPPINGS
  ? parseInt(process.env.EXPECT_MAPPINGS, 10)
  : process.env.EXPECT_TOURNAMENT_QUESTIONS
  ? parseInt(process.env.EXPECT_TOURNAMENT_QUESTIONS, 10)
  : 1;

async function fetchCount(table) {
  const url = new URL(`/rest/v1/${table}`, SUPABASE_URL);
  url.searchParams.set('select', 'id');
  const res = await fetch(url.toString(), {
    headers: {
      apikey: SUPABASE_SERVICE_ROLE,
      Authorization: `Bearer ${SUPABASE_SERVICE_ROLE}`,
      Accept: 'application/json',
    },
  });
  if (!res.ok) {
      const txt = await res.text();
      throw new Error(`Failed to fetch ${table}: ${res.status} ${txt}`);
  }
  const data = await res.json();
  return Array.isArray(data) ? data.length : 0;
}

  async function fetchSample(table, limit = 5) {
    const url = new URL(`/rest/v1/${table}`, SUPABASE_URL);
    url.searchParams.set('select', '*');
    url.searchParams.set('limit', String(limit));
    const res = await fetch(url.toString(), {
      headers: {
        apikey: SUPABASE_SERVICE_ROLE,
        Authorization: `Bearer ${SUPABASE_SERVICE_ROLE}`,
        Accept: 'application/json',
      },
    });
    if (!res.ok) {
      const txt = await res.text();
      throw new Error(`Failed to fetch sample ${table}: ${res.status} ${txt}`);
    }
    return res.json();
  }

async function main() {
  try {
    console.log('Verifying seeded rows on Supabase...');
    const tours = await fetchCount('tournaments');
    const ques = await fetchCount('questions');
    const maps = await fetchCount('tournament_questions');

    console.log(`counts: tournaments=${tours} questions=${ques} mappings=${maps}`);

    if (tours < expectTours) {
      console.error(`tournaments count ${tours} < expected ${expectTours}`);
      const sample = await fetchSample('tournaments');
      console.error('tournaments sample:', JSON.stringify(sample, null, 2));
      throw new Error(`tournaments count ${tours} < expected ${expectTours}`);
    }
    if (ques < expectQues) {
      console.error(`questions count ${ques} < expected ${expectQues}`);
      const sample = await fetchSample('questions');
      console.error('questions sample:', JSON.stringify(sample, null, 2));
      throw new Error(`questions count ${ques} < expected ${expectQues}`);
    }
    if (maps < expectMaps) {
      console.error(`mappings count ${maps} < expected ${expectMaps}`);
      const sample = await fetchSample('tournament_questions');
      console.error('tournament_questions sample:', JSON.stringify(sample, null, 2));
      throw new Error(`mappings count ${maps} < expected ${expectMaps}`);
    }

    console.log('Seed verification passed.');
    process.exit(0);
  } catch (err) {
    console.error('Seed verification failed:', err instanceof Error ? err.message : err);
    process.exit(3);
  }
}

main();
