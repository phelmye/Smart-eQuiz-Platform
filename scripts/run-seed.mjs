#!/usr/bin/env node
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE in environment.');
  console.error('Set them and re-run:');
  console.error('$env:SUPABASE_URL = "https://..."; $env:SUPABASE_SERVICE_ROLE = "service-role-key"; node .\\scripts\\run-seed.mjs');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE);

async function main() {
  try {
    console.log('Seeding tournaments...');
    const { data: tournament, error: tErr } = await supabase
      .from('tournaments')
      .insert([{ title: 'Demo Tournament', description: 'Seeded sample tournament' }])
      .select('*')
      .limit(1)
      .single();

    if (tErr) throw tErr;

    console.log('Seeding questions...');
    const questions = [
      { prompt: 'What is 2 + 2?', choices: [{ id: 1, text: '3' }, { id: 2, text: '4', correct: true }] },
      { prompt: 'What color is the sky?', choices: [{ id: 1, text: 'Green' }, { id: 2, text: 'Blue', correct: true }] },
    ];

    const { data: qData, error: qErr } = await supabase.from('questions').insert(questions).select('*');
    if (qErr) throw qErr;

    if (qData && tournament) {
      const mappings = qData.map((q) => ({ tournament_id: tournament.id, question_id: q.id }));
      await supabase.from('tournament_questions').insert(mappings);
    }

    console.log('Seed completed.');
    console.log(JSON.stringify({ ok: true, tournament, questions: qData }, null, 2));
    process.exit(0);
  } catch (err) {
    console.error('Seed failed:', err instanceof Error ? err.message : err);
    process.exit(2);
  }
}

main();
