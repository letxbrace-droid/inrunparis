/**
 * I&N RUN Hub Proxy — Cloudflare Worker
 *
 * Holds all GitHub credentials server-side so the browser never touches them.
 *
 * Secrets (set with: wrangler secret put SECRET_NAME)
 *   GITHUB_TOKEN   — fine-grained PAT: Contents (R/W) + Actions (W) on letxbrace-droid/inrunparis
 *   GIST_ID        — Gist ID for push subscribers
 *   HUB_SECRET     — simple password the hub sends in Authorization: Bearer <secret>
 *
 * KV namespace (optional, for stats)
 *   STATS_KV       — bound in wrangler.toml
 *
 * Endpoints
 *   GET  /health         ping
 *   GET  /promos         read promo-config.json from GitHub
 *   PUT  /promos         write promo-config.json to GitHub
 *   GET  /subs           read push subscribers from Gist
 *   PUT  /subs           write push subscribers to Gist
 *   POST /dispatch       trigger GitHub Actions workflow (send-push)
 *   POST /beacon         increment promo-use counter in KV
 *   GET  /stats          read promo stats from KV
 */

const REPO  = 'letxbrace-droid/inrunparis'
const FILE  = 'public/promo-config.json'
const ALLOW = 'https://letxbrace-droid.github.io'

// ── helpers ──────────────────────────────────────────────────────────────────

const CORS = {
  'Access-Control-Allow-Origin':  ALLOW,
  'Access-Control-Allow-Methods': 'GET, PUT, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Authorization, Content-Type',
  'Access-Control-Max-Age':       '86400',
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...CORS },
  })
}

function err(msg, status = 400) {
  return json({ error: msg }, status)
}

function ghHeaders(env) {
  return {
    Authorization:  `Bearer ${env.GITHUB_TOKEN}`,
    Accept:         'application/vnd.github+json',
    'Content-Type': 'application/json',
    'User-Agent':   'inrun-hub-worker/1.0',
  }
}

function checkAuth(req, env) {
  const auth   = req.headers.get('Authorization') || ''
  const secret = auth.replace(/^Bearer\s+/i, '').trim()
  return secret === env.HUB_SECRET
}

// ── main handler ─────────────────────────────────────────────────────────────

export default {
  async fetch(req, env) {
    const url  = new URL(req.url)
    const path = url.pathname

    // CORS preflight
    if (req.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: CORS })
    }

    // Public health check
    if (path === '/health') {
      return json({ ok: true, ts: Date.now() })
    }

    // All other endpoints require auth
    if (!checkAuth(req, env)) {
      return err('Unauthorized', 401)
    }

    try {
      // ── GET /promos ───────────────────────────────────────────────────────
      if (path === '/promos' && req.method === 'GET') {
        const r = await fetch(
          `https://api.github.com/repos/${REPO}/contents/${FILE}`,
          { headers: ghHeaders(env) }
        )
        if (!r.ok) return err(`GitHub ${r.status}`, 502)
        const data    = await r.json()
        const content = JSON.parse(atob(data.content.replace(/\n/g, '')))
        return json({ content, sha: data.sha })
      }

      // ── PUT /promos ───────────────────────────────────────────────────────
      if (path === '/promos' && req.method === 'PUT') {
        const { content, sha } = await req.json()
        const encoded = btoa(
          String.fromCharCode(...new TextEncoder().encode(JSON.stringify(content, null, 2)))
        )
        const r = await fetch(
          `https://api.github.com/repos/${REPO}/contents/${FILE}`,
          {
            method:  'PUT',
            headers: ghHeaders(env),
            body:    JSON.stringify({
              message: 'chore: update promo codes [hub]',
              content: encoded,
              sha,
              branch:  'main',
            }),
          }
        )
        if (!r.ok) {
          const detail = await r.json().catch(() => ({}))
          return err(detail.message || `GitHub ${r.status}`, 502)
        }
        const data = await r.json()
        return json({ ok: true, sha: data.content?.sha })
      }

      // ── GET /subs ─────────────────────────────────────────────────────────
      if (path === '/subs' && req.method === 'GET') {
        const r = await fetch(
          `https://api.github.com/gists/${env.GIST_ID}`,
          { headers: ghHeaders(env) }
        )
        if (!r.ok) return err(`Gist ${r.status}`, 502)
        const data = await r.json()
        const raw  = data.files?.['subscribers.json']?.content || '[]'
        return json(JSON.parse(raw))
      }

      // ── PUT /subs ─────────────────────────────────────────────────────────
      if (path === '/subs' && req.method === 'PUT') {
        const subs = await req.json()
        const r = await fetch(
          `https://api.github.com/gists/${env.GIST_ID}`,
          {
            method:  'PATCH',
            headers: ghHeaders(env),
            body:    JSON.stringify({
              files: {
                'subscribers.json': {
                  content: JSON.stringify(subs, null, 2),
                },
              },
            }),
          }
        )
        return json({ ok: r.ok })
      }

      // ── POST /dispatch ────────────────────────────────────────────────────
      if (path === '/dispatch' && req.method === 'POST') {
        const { event_type, client_payload } = await req.json()
        const r = await fetch(
          `https://api.github.com/repos/${REPO}/dispatches`,
          {
            method:  'POST',
            headers: ghHeaders(env),
            body:    JSON.stringify({ event_type, client_payload }),
          }
        )
        return json({ ok: r.ok, status: r.status })
      }

      // ── POST /beacon ──────────────────────────────────────────────────────
      if (path === '/beacon' && req.method === 'POST') {
        if (env.STATS_KV) {
          const { code } = await req.json()
          if (code) {
            const day = new Date().toISOString().slice(0, 10)
            const key = `promo:${code.toUpperCase()}:${day}`
            const cur = parseInt((await env.STATS_KV.get(key)) || '0')
            await env.STATS_KV.put(key, String(cur + 1), { expirationTtl: 90 * 86400 })
          }
        }
        return json({ ok: true })
      }

      // ── GET /stats ────────────────────────────────────────────────────────
      if (path === '/stats' && req.method === 'GET') {
        if (!env.STATS_KV) return json({})
        const list  = await env.STATS_KV.list({ prefix: 'promo:' })
        const stats = {}
        await Promise.all(
          list.keys.map(async ({ name }) => {
            const parts = name.split(':') // promo:CODE:DATE
            const code  = parts[1]
            const date  = parts[2]
            const val   = parseInt((await env.STATS_KV.get(name)) || '0')
            if (!stats[code]) stats[code] = { total: 0, days: {} }
            stats[code].total    += val
            stats[code].days[date] = val
          })
        )
        return json(stats)
      }

      return err('Not found', 404)

    } catch (e) {
      return err(e.message || 'Internal error', 500)
    }
  },
}
