let fetch;
try {
  fetch = require('node-fetch');
} catch (e) {
  // in newer Node versions fetch is global
  fetch = global.fetch;
}
const http = require('http');

async function login() {
  const res = await fetch('http://localhost:3000/api/auth/login', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ email: 'admin@demo.local', password: 'password123' }) });
  const json = await res.json();
  // try to read the refresh cookie from Set-Cookie header if server sets it (cookie-parser enabled)
  const setCookie = res.headers.get('set-cookie') || '';
  let refreshFromCookie;
  if (setCookie) {
    const match = setCookie.match(/refresh_token=([^;]+);?/);
    if (match) refreshFromCookie = decodeURIComponent(match[1]);
  }
  // attach refresh_token from cookie if present to support non-RETURN_REFRESH_IN_BODY flows
  if (!json.refresh_token && refreshFromCookie) json.refresh_token = refreshFromCookie;
  return json;
}

async function refresh(rt) {
  const res = await fetch('http://localhost:3000/api/auth/refresh', { method: 'POST', headers: { 'content-type': 'text/plain', 'cookie': `refresh_token=${rt}` }, body: '' });
  return await res.json();
}

async function me(token) {
  const res = await fetch('http://localhost:3000/api/users/me', { method: 'GET', headers: { 'authorization': `Bearer ${token}` } });
  return await res.json();
}

async function run() {
  console.log('login...');
  const l = await login();
  console.log('login result:', Object.keys(l));
  if (!l.refresh_token) throw new Error('no refresh token');
  console.log('refresh...');
  const r = await refresh(l.refresh_token);
  console.log('refresh result keys:', Object.keys(r));
  console.log('call me...');
  const m = await me(r.access_token);
  console.log('me:', m);
  console.log('done');
}

run().catch(e => { console.error('E2E failed:', e); process.exitCode = 2 });
