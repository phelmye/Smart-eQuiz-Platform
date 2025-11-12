import { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

// Repo-root serverless seeder for Vercel — placed at /api/seed-supabase
// IMPORTANT: SUPABASE_SERVICE_ROLE must be set as a secret in Vercel Project Settings

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE) {
    return res.status(500).json({ error: 'Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE' });
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE);

  try {
    // Insert a demo tournament
    const { data: tournament, error: tErr } = await supabase
      .from('tournaments')
      .insert([{ title: 'Demo Tournament', description: 'Seeded sample tournament' }])
      .select('*')
      .limit(1)
      .single();

    if (tErr) throw tErr;

    const questions = [
      { prompt: 'What is 2 + 2?', choices: [{ id: 1, text: '3' }, { id: 2, text: '4', correct: true }] },
      { prompt: 'What color is the sky?', choices: [{ id: 1, text: 'Green' }, { id: 2, text: 'Blue', correct: true }] },
    ];

    const { data: qData, error: qErr } = await supabase.from('questions').insert(questions).select('*');
    if (qErr) throw qErr;

    if (qData && tournament) {
      const mappings = qData.map((q: any) => ({ tournament_id: tournament.id, question_id: q.id }));
      await supabase.from('tournament_questions').insert(mappings);
    }

    res.status(200).json({ ok: true, tournament, questions: qData });
  } catch (err: any) {
    console.error('seed error', err);
    res.status(500).json({ error: err.message || String(err) });
  }
}
