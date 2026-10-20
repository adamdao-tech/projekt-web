// ============================================================
//  Metin Max Rolls – API pro komunitní statistiky rollů
//  POST /api/roll   { pool, slot, rows:[{b, ti, tn}] }
//  GET  /api/stats?pool=Divine  -> { bonus: { tn, n, c:[počty po tierech] } }
//  Vše ostatní = statické soubory.
// ============================================================
const json = (d, s = 200, h = {}) => new Response(JSON.stringify(d), { status: s, headers: { 'content-type': 'application/json; charset=utf-8', ...h } });
let ready = null;
const schema = env => ready ||= env.DB.batch([
  env.DB.prepare('CREATE TABLE IF NOT EXISTS rolls (id INTEGER PRIMARY KEY AUTOINCREMENT, pool TEXT NOT NULL, slot TEXT, bonus TEXT NOT NULL, ti INTEGER NOT NULL, tn INTEGER NOT NULL, day TEXT NOT NULL, ih TEXT NOT NULL)'),
  env.DB.prepare('CREATE INDEX IF NOT EXISTS rolls_pool ON rolls(pool)'),
  env.DB.prepare('CREATE INDEX IF NOT EXISTS rolls_ih ON rolls(ih, day)'),
]).catch(e => { ready = null; throw e; });

async function ipHash(req, day) {
  const ip = req.headers.get('cf-connecting-ip') || 'x';
  const d = await crypto.subtle.digest('SHA-256', new TextEncoder().encode('mmr:' + day + ':' + ip));
  return [...new Uint8Array(d)].slice(0, 12).map(b => b.toString(16).padStart(2, '0')).join('');
}
const str = (v, max) => typeof v === 'string' && v.length > 0 && v.length <= max;

export default {
  async fetch(req, env) {
    const url = new URL(req.url);
    if (!url.pathname.startsWith('/api/')) return env.ASSETS.fetch(req);
    try {
      await schema(env);
      if (url.pathname === '/api/stats' && req.method === 'GET') {
        const pool = url.searchParams.get('pool') || '';
        if (!str(pool, 60)) return json({ error: 'pool' }, 400);
        const { results } = await env.DB.prepare('SELECT bonus, ti, tn, count(*) AS c FROM rolls WHERE pool=? GROUP BY bonus, tn, ti').bind(pool).all();
        const out = {};
        for (const r of results) {
          const o = out[r.bonus] ||= { tn: r.tn, n: 0, c: [] };
          if (r.tn !== o.tn) continue;                 // jiný počet tierů = stará data, ignorovat
          o.c[r.ti] = (o.c[r.ti] || 0) + r.c; o.n += r.c;
        }
        for (const k in out) out[k].c = Array.from({ length: out[k].tn }, (_, i) => out[k].c[i] || 0);
        return json(out, 200, { 'cache-control': 'public, max-age=60' });
      }
      if (url.pathname === '/api/roll' && req.method === 'POST') {
        const b = await req.json().catch(() => null);
        if (!b || !str(b.pool, 60) || (b.slot != null && !str(b.slot, 60)) || !Array.isArray(b.rows) || !b.rows.length || b.rows.length > 10)
          return json({ error: 'Neplatná data' }, 400);
        const rows = b.rows.filter(r => str(r.b, 80) && Number.isInteger(r.tn) && r.tn >= 1 && r.tn <= 20 && Number.isInteger(r.ti) && r.ti >= 0 && r.ti < r.tn);
        if (!rows.length) return json({ error: 'Neplatné řádky' }, 400);
        const day = new Date().toISOString().slice(0, 10), ih = await ipHash(req, day);
        const used = await env.DB.prepare('SELECT count(*) AS c FROM rolls WHERE ih=? AND day=?').bind(ih, day).first();
        if ((used?.c || 0) + rows.length > 300) return json({ error: 'Dnešní limit vyčerpán, díky! Zkus to zítra.' }, 429);
        await env.DB.batch(rows.map(r => env.DB.prepare('INSERT INTO rolls (pool,slot,bonus,ti,tn,day,ih) VALUES (?,?,?,?,?,?,?)').bind(b.pool, b.slot || null, r.b, r.ti, r.tn, day, ih)));
        return json({ ok: true, saved: rows.length });
      }
      return json({ error: 'not found' }, 404);
    } catch (e) {
      return json({ error: String(e && e.message || e) }, 500);
    }
  },
};
