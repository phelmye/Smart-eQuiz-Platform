#!/usr/bin/env node
import { spawnSync } from 'child_process';

function run(cmd, args, opts = {}) {
  console.log('> ' + [cmd].concat(args).join(' '));
  const r = spawnSync(cmd, args, { stdio: 'inherit', encoding: 'utf8', ...opts });
  return r.status === 0;
}

// Start compose with CI override to be conservative
if (!run('docker', ['compose', '-f', 'dev/docker-compose.yml', '-f', 'dev/docker-compose.ci.yml', 'up', '-d', 'postgres', 'redis', 'adminer'])) process.exit(2);

// wait for postgres
const MAX = 60;
let ok = false;
for (let i = 0; i < MAX; i++) {
  const r = spawnSync('docker', ['compose', '-f', 'dev/docker-compose.yml', '-f', 'dev/docker-compose.ci.yml', 'exec', '-T', 'postgres', 'pg_isready', '-U', 'postgres', '-d', 'postgres'], { encoding: 'utf8' });
  if (r.status === 0) { ok = true; break; }
  console.log('Waiting for postgres... ' + i);
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 2000);
}
if (!ok) { console.error('Postgres did not become ready'); process.exit(2); }

// Apply base schema and migrations (mimic CI script)
if (!run('docker', ['compose', '-f', 'dev/docker-compose.yml', '-f', 'dev/docker-compose.ci.yml', 'ps', '-q', 'postgres'])) process.exit(2);
const container = spawnSync('docker', ['compose', '-f', 'dev/docker-compose.yml', '-f', 'dev/docker-compose.ci.yml', 'ps', '-q', 'postgres'], { encoding: 'utf8' }).stdout.trim();
if (!container) { console.error('Could not find postgres container'); process.exit(2); }

// copy schema
if (!run('docker', ['cp', 'db/supabase_schema.sql', container + ':/tmp/supabase_schema.sql'])) process.exit(2);
if (!run('docker', ['exec', '-i', container, 'psql', '-U', 'postgres', '-d', 'smart_equiz_dev', '-f', '/tmp/supabase_schema.sql'])) process.exit(2);

// apply migrations
import fs from 'fs';
const files = fs.readdirSync('db/migrations').filter(f => f.endsWith('.sql')).sort();
for (const f of files) {
  if (f.includes('rls')) { console.log('Skipping RLS migration', f); continue; }
  if (!run('docker', ['cp', `db/migrations/${f}`, container + `:/tmp/${f}`])) process.exit(2);
  if (!run('docker', ['exec', '-i', container, 'psql', '-U', 'postgres', '-d', 'smart_equiz_dev', '-f', `/tmp/${f}`])) process.exit(2);
}

// run seeder in fresh mode
if (!run('node', ['scripts/run-seed.mjs', '--local', '--fresh'])) process.exit(2);

// verify counts
const r = spawnSync('docker', ['exec', '-i', container, 'psql', '-U', 'postgres', '-d', 'smart_equiz_dev', '-t', '-A', '-c', "SELECT count(*) FROM tournaments;" ], { encoding: 'utf8' });
const tourn = (r.stdout || '').trim();
const rq = spawnSync('docker', ['exec', '-i', container, 'psql', '-U', 'postgres', '-d', 'smart_equiz_dev', '-t', '-A', '-c', "SELECT count(*) FROM questions;" ], { encoding: 'utf8' });
const ques = (rq.stdout || '').trim();
const rm = spawnSync('docker', ['exec', '-i', container, 'psql', '-U', 'postgres', '-d', 'smart_equiz_dev', '-t', '-A', '-c', "SELECT count(*) FROM tournament_questions;" ], { encoding: 'utf8' });
const maps = (rm.stdout || '').trim();
console.log('counts:', { tourn, ques, maps });

// expected minimal counts
if (parseInt(tourn || '0', 10) !== 1) { console.error('Unexpected tournaments count', tourn); process.exit(2); }
if (parseInt(ques || '0', 10) !== 2) { console.error('Unexpected questions count', ques); process.exit(2); }
if (parseInt(maps || '0', 10) !== 2) { console.error('Unexpected tournament_questions count', maps); process.exit(2); }

console.log('Migration+seed smoke test passed');
process.exit(0);
