#!/usr/bin/env node
import { spawnSync } from 'child_process';

// Orchestrator: run non-local seeder (Supabase) then verify via REST verifier
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE in environment. Aborting.');
  process.exit(2);
}

console.log('Running Supabase seeder (non-local)...');
const seed = spawnSync('node', ['scripts/run-seed.mjs'], { stdio: 'inherit', encoding: 'utf8' });
if (seed.status !== 0) {
  console.error('Supabase seeder failed with exit code', seed.status);
  process.exit(seed.status || 3);
}

console.log('Seeder exited OK — running verification...');
const verify = spawnSync('node', ['scripts/verify-seed.mjs'], { stdio: 'inherit', encoding: 'utf8' });
if (verify.status !== 0) {
  console.error('Seed verification failed with exit code', verify.status);
  process.exit(verify.status || 4);
}

console.log('Seed + verify completed successfully.');
process.exit(0);
