import express from 'express';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { spawnSync } from 'child_process';

dotenv.config();

const app = express();
app.use(helmet());
app.use(express.json());

const ADMIN_TOKEN = process.env.ADMIN_TOKEN || 'change-me-please';
const CHECK_MIGRATE = process.env.CHECK_MIGRATE === 'true';
const RUN_MIGRATE_CMD = process.env.RUN_MIGRATE_CMD || '';
const RUN_SEED_CMD = process.env.RUN_SEED_CMD || '';

function requireAdmin(req, res, next) {
  const token = req.headers['x-admin-token'] || req.body?.token;
  if (!token || token !== ADMIN_TOKEN) {
    return res.status(401).json({ error: 'unauthorized' });
  }
  next();
}

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', env: process.env.NODE_ENV || 'development' });
});

app.post('/admin/migrate', requireAdmin, (req, res) => {
  if (!CHECK_MIGRATE) {
    return res.status(403).json({ error: 'migrations disabled in this environment (CHECK_MIGRATE=false)' });
  }

  if (!RUN_MIGRATE_CMD) {
    return res.status(200).json({ status: 'migration-not-run', info: 'Set RUN_MIGRATE_CMD in env to run migrations from this endpoint' });
  }

  try {
    const result = spawnSync(RUN_MIGRATE_CMD, { shell: true, encoding: 'utf8', stdio: 'pipe' });
    return res.status(result.status === 0 ? 200 : 500).json({
      status: result.status === 0 ? 'ok' : 'failed',
      exitCode: result.status,
      stdout: result.stdout?.slice?.(0, 20_000),
      stderr: result.stderr?.slice?.(0, 20_000),
    });
  } catch (err) {
    return res.status(500).json({ error: String(err) });
  }
});

app.post('/admin/seed', requireAdmin, (req, res) => {
  if (!RUN_SEED_CMD) {
    return res.status(200).json({ status: 'seed-not-run', info: 'Set RUN_SEED_CMD in env to run seeder from this endpoint' });
  }

  try {
    const result = spawnSync(RUN_SEED_CMD, { shell: true, encoding: 'utf8', stdio: 'pipe' });
    return res.status(result.status === 0 ? 200 : 500).json({
      status: result.status === 0 ? 'ok' : 'failed',
      exitCode: result.status,
      stdout: result.stdout?.slice?.(0, 20_000),
      stderr: result.stderr?.slice?.(0, 20_000),
    });
  } catch (err) {
    return res.status(500).json({ error: String(err) });
  }
});

const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`admin-backend listening on ${port}`));
