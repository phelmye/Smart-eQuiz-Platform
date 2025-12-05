// Workspace-level seeder for Vercel (ensures function deployed when project root is the workspace)
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

// This serverless endpoint seeds initial data into Supabase.
// IMPORTANT: store SUPABASE_SERVICE_ROLE in Vercel/Netlify server envs and do NOT expose it to the browser.

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE) {
    return res.status(500).json({ error: 'Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE' });
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE);

  try {
    // Example: insert a sample tournament and a couple of questions
    const { data: tournament, error: tErr } = await supabase
      .from('tournaments')
      .insert([{ title: 'Demo Tournament', description: 'Seeded sample tournament' }])
      .select('*')
      .limit(1)
      .single();

    if (tErr) throw tErr;

    const questions = [
      { prompt: 'What is 2 + 2?', choices: JSON.stringify([{ id: 1, text: '3' }, { id: 2, text: '4', correct: true }]) },
      { prompt: 'What color is the sky?', choices: JSON.stringify([{ id: 1, text: 'Green' }, { id: 2, text: 'Blue', correct: true }]) },
    ];

    const { data: qData, error: qErr } = await supabase.from('questions').insert(questions).select('*');
    if (qErr) throw qErr;

    // map questions to tournament
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
