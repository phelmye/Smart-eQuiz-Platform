#!/usr/bin/env node
import { spawnSync } from 'child_process';

const args = process.argv.slice(2);
const isLocal = args.includes('--local');
const isFresh = args.includes('--fresh');

if (isLocal) {
  // Use docker exec + psql to seed local Postgres (no extra Node deps)
  console.log('Seeding locally via docker/psql...');

  if (isFresh) {
    console.log('Fresh mode enabled: truncating tables before seeding');
    const truncateCmd = `TRUNCATE TABLE tournament_questions, questions, tournaments RESTART IDENTITY CASCADE;`;
    const resT = spawnSync('docker', ['compose', '-f', 'dev/docker-compose.yml', 'exec', '-T', 'postgres', 'psql', '-U', 'postgres', '-d', 'smart_equiz_dev', '-c', truncateCmd], { encoding: 'utf8' });
    if (resT.status !== 0) {
      console.error('Failed to truncate tables:', resT.stderr || resT.stdout);
      // Continue — sometimes tables might not exist yet; don't abort
    } else {
      console.log('Truncated existing tables.');
    }
  }

  const insertTourn = `INSERT INTO tournaments (title, description) VALUES ('Demo Tournament', 'Seeded sample tournament') RETURNING id;`;
  const res1 = spawnSync('docker', ['compose', '-f', 'dev/docker-compose.yml', 'exec', '-T', 'postgres', 'psql', '-U', 'postgres', '-d', 'smart_equiz_dev', '-t', '-A', '-c', insertTourn], { encoding: 'utf8' });
  if (res1.status !== 0) {
    console.error('Failed to insert tournament:', res1.stderr || res1.stdout);
    process.exit(2);
  }
  const tournamentRaw = (res1.stdout || '').trim();
  const uuidRe = /[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}/;
  const tournamentMatch = tournamentRaw.match(uuidRe);
  const tournamentId = tournamentMatch ? tournamentMatch[0] : null;
  console.log('Inserted tournament id:', tournamentId);

  const insertQuestions = `INSERT INTO questions (prompt, choices) VALUES
('What is 2 + 2?', '[{"id":1,"text":"3"},{"id":2,"text":"4","correct":true}]'::jsonb),
('What color is the sky?', '[{"id":1,"text":"Green"},{"id":2,"text":"Blue","correct":true}]'::jsonb)
RETURNING id;`;

  const res2 = spawnSync('docker', ['compose', '-f', 'dev/docker-compose.yml', 'exec', '-T', 'postgres', 'psql', '-U', 'postgres', '-d', 'smart_equiz_dev', '-t', '-A', '-c', insertQuestions], { encoding: 'utf8' });
  if (res2.status !== 0) {
    console.error('Failed to insert questions:', res2.stderr || res2.stdout);
    process.exit(2);
  }
  const rawIds = (res2.stdout || '').trim().split(/\r?\n/).map(s => s.trim()).filter(Boolean);
  // Extract only UUID-like strings
  const questionIds = rawIds.map(r => { const m = r.match(uuidRe); return m ? m[0] : null }).filter(Boolean);
  console.log('Inserted question ids:', questionIds.join(', '));

  if (tournamentId && questionIds.length) {
  const mappings = questionIds.map(qid => `('${tournamentId}','${qid}')`).join(',');
    const insertMap = `INSERT INTO tournament_questions (tournament_id, question_id) VALUES ${mappings};`;
    const res3 = spawnSync('docker', ['compose', '-f', 'dev/docker-compose.yml', 'exec', '-T', 'postgres', 'psql', '-U', 'postgres', '-d', 'smart_equiz_dev', '-c', insertMap], { encoding: 'utf8' });
    if (res3.status !== 0) {
      console.error('Failed to insert tournament_questions mapping:', res3.stderr || res3.stdout);
      process.exit(2);
    }
    console.log('Inserted tournament -> questions mapping.');
  }

  // Post-seed validation: print counts for key tables to make verification easy
  try {
    const resCounts = spawnSync('docker', ['compose', '-f', 'dev/docker-compose.yml', 'exec', '-T', 'postgres', 'psql', '-U', 'postgres', '-d', 'smart_equiz_dev', '-t', '-A', '-c', "SELECT count(*) FROM tournaments; SELECT count(*) FROM questions; SELECT count(*) FROM tournament_questions;"], { encoding: 'utf8' });
    if (resCounts.status === 0) {
      const lines = (resCounts.stdout || '').trim().split(/\r?\n/).map(s => s.trim()).filter(Boolean);
      const [tournCount, quesCount, mapCount] = lines;
      console.log('Post-seed counts:');
      console.log('  tournaments:', tournCount ?? 'N/A');
      console.log('  questions:', quesCount ?? 'N/A');
      console.log('  tournament_questions:', mapCount ?? 'N/A');
    } else {
      console.warn('Could not fetch post-seed counts:', resCounts.stderr || resCounts.stdout);
    }
  } catch (e) {
    console.warn('Post-seed validation failed:', e && e.message ? e.message : e);
  }

  console.log('Local seed completed.');
  process.exit(0);
}

// Default behavior: use Supabase client (requires SUPABASE_URL & SUPABASE_SERVICE_ROLE)
async function main() {
  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE;

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE) {
    console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE in environment.');
    console.error('To run locally without Supabase, use: node scripts/run-seed.mjs --local');
    console.error('Or set SUPABASE_URL and SUPABASE_SERVICE_ROLE and re-run:');
    console.error('$env:SUPABASE_URL = "https://..."; $env:SUPABASE_SERVICE_ROLE = "service-role-key"; node .\\scripts\\run-seed.mjs');
    process.exit(1);
  }

  const { createClient } = await import('@supabase/supabase-js');
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE);
  try {
    console.log('Seeding tournaments via Supabase client...');
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
