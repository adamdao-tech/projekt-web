var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// api/worker.js
var json = /* @__PURE__ */ __name((d, s = 200, h = {}) => new Response(JSON.stringify(d), { status: s, headers: { "content-type": "application/json; charset=utf-8", ...h } }), "json");
var ready = null;
var schema = /* @__PURE__ */ __name((env) => ready ||= env.DB.batch([
  env.DB.prepare("CREATE TABLE IF NOT EXISTS rolls (id INTEGER PRIMARY KEY AUTOINCREMENT, pool TEXT NOT NULL, slot TEXT, bonus TEXT NOT NULL, ti INTEGER NOT NULL, tn INTEGER NOT NULL, day TEXT NOT NULL, ih TEXT NOT NULL)"),
  env.DB.prepare("CREATE INDEX IF NOT EXISTS rolls_pool ON rolls(pool)"),
  env.DB.prepare("CREATE INDEX IF NOT EXISTS rolls_ih ON rolls(ih, day)")
]).catch((e) => {
  ready = null;
  throw e;
}), "schema");
async function ipHash(req, day) {
  const ip = req.headers.get("cf-connecting-ip") || "x";
  const d = await crypto.subtle.digest("SHA-256", new TextEncoder().encode("mmr:" + day + ":" + ip));
  return [...new Uint8Array(d)].slice(0, 12).map((b) => b.toString(16).padStart(2, "0")).join("");
}
__name(ipHash, "ipHash");
var str = /* @__PURE__ */ __name((v, max) => typeof v === "string" && v.length > 0 && v.length <= max, "str");
var worker_default = {
  async fetch(req, env) {
    const url = new URL(req.url);
    if (!url.pathname.startsWith("/api/")) return env.ASSETS.fetch(req);
    try {
      await schema(env);
      if (url.pathname === "/api/stats" && req.method === "GET") {
        const pool = url.searchParams.get("pool") || "";
        if (!str(pool, 60)) return json({ error: "pool" }, 400);
        const { results } = await env.DB.prepare("SELECT bonus, ti, tn, count(*) AS c FROM rolls WHERE pool=? GROUP BY bonus, tn, ti").bind(pool).all();
        const out = {};
        for (const r of results) {
          const o = out[r.bonus] ||= { tn: r.tn, n: 0, c: [] };
          if (r.tn !== o.tn) continue;
          o.c[r.ti] = (o.c[r.ti] || 0) + r.c;
          o.n += r.c;
        }
        for (const k in out) out[k].c = Array.from({ length: out[k].tn }, (_, i) => out[k].c[i] || 0);
        return json(out, 200, { "cache-control": "public, max-age=60" });
      }
      if (url.pathname === "/api/roll" && req.method === "POST") {
        const b = await req.json().catch(() => null);
        if (!b || !str(b.pool, 60) || b.slot != null && !str(b.slot, 60) || !Array.isArray(b.rows) || !b.rows.length || b.rows.length > 10)
          return json({ error: "Neplatn\xE1 data" }, 400);
        const rows = b.rows.filter((r) => str(r.b, 80) && Number.isInteger(r.tn) && r.tn >= 1 && r.tn <= 20 && Number.isInteger(r.ti) && r.ti >= 0 && r.ti < r.tn);
        if (!rows.length) return json({ error: "Neplatn\xE9 \u0159\xE1dky" }, 400);
        const day = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10), ih = await ipHash(req, day);
        const used = await env.DB.prepare("SELECT count(*) AS c FROM rolls WHERE ih=? AND day=?").bind(ih, day).first();
        if ((used?.c || 0) + rows.length > 300) return json({ error: "Dne\u0161n\xED limit vy\u010Derp\xE1n, d\xEDky! Zkus to z\xEDtra." }, 429);
        await env.DB.batch(rows.map((r) => env.DB.prepare("INSERT INTO rolls (pool,slot,bonus,ti,tn,day,ih) VALUES (?,?,?,?,?,?,?)").bind(b.pool, b.slot || null, r.b, r.ti, r.tn, day, ih)));
        return json({ ok: true, saved: rows.length });
      }
      return json({ error: "not found" }, 404);
    } catch (e) {
      return json({ error: String(e && e.message || e) }, 500);
    }
  }
};

// ../kaja-uceni/node_modules/wrangler/templates/middleware/middleware-ensure-req-body-drained.ts
var drainBody = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } finally {
    try {
      if (request.body !== null && !request.bodyUsed) {
        const reader = request.body.getReader();
        while (!(await reader.read()).done) {
        }
      }
    } catch (e) {
      console.error("Failed to drain the unused request body.", e);
    }
  }
}, "drainBody");
var middleware_ensure_req_body_drained_default = drainBody;

// ../kaja-uceni/node_modules/wrangler/templates/middleware/middleware-miniflare3-json-error.ts
function reduceError(e) {
  return {
    name: e?.name,
    message: e?.message ?? String(e),
    stack: e?.stack,
    cause: e?.cause === void 0 ? void 0 : reduceError(e.cause)
  };
}
__name(reduceError, "reduceError");
var jsonError = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } catch (e) {
    const error = reduceError(e);
    const body = JSON.stringify(error);
    const headers = {
      "Content-Type": "application/json",
      "MF-Experimental-Error-Stack": "true"
    };
    const encoded = encodeURIComponent(body);
    if (encoded.length <= 8192) {
      headers["MF-Experimental-Error-Stack-Payload"] = encoded;
    }
    return new Response(body, { status: 500, headers });
  }
}, "jsonError");
var middleware_miniflare3_json_error_default = jsonError;

// .wrangler/tmp/bundle-wi29fh/middleware-insertion-facade.js
var __INTERNAL_WRANGLER_MIDDLEWARE__ = [
  middleware_ensure_req_body_drained_default,
  middleware_miniflare3_json_error_default
];
var middleware_insertion_facade_default = worker_default;

// ../kaja-uceni/node_modules/wrangler/templates/middleware/common.ts
var __facade_middleware__ = [];
function __facade_register__(...args) {
  __facade_middleware__.push(...args.flat());
}
__name(__facade_register__, "__facade_register__");
function __facade_invokeChain__(request, env, ctx, dispatch, middlewareChain) {
  const [head, ...tail] = middlewareChain;
  const middlewareCtx = {
    dispatch,
    next(newRequest, newEnv) {
      return __facade_invokeChain__(newRequest, newEnv, ctx, dispatch, tail);
    }
  };
  return head(request, env, ctx, middlewareCtx);
}
__name(__facade_invokeChain__, "__facade_invokeChain__");
function __facade_invoke__(request, env, ctx, dispatch, finalMiddleware) {
  return __facade_invokeChain__(request, env, ctx, dispatch, [
    ...__facade_middleware__,
    finalMiddleware
  ]);
}
__name(__facade_invoke__, "__facade_invoke__");

// .wrangler/tmp/bundle-wi29fh/middleware-loader.entry.ts
var __Facade_ScheduledController__ = class ___Facade_ScheduledController__ {
  constructor(scheduledTime, cron, noRetry) {
    this.scheduledTime = scheduledTime;
    this.cron = cron;
    this.#noRetry = noRetry;
  }
  scheduledTime;
  cron;
  static {
    __name(this, "__Facade_ScheduledController__");
  }
  #noRetry;
  noRetry() {
    if (!(this instanceof ___Facade_ScheduledController__)) {
      throw new TypeError("Illegal invocation");
    }
    this.#noRetry();
  }
};
function wrapExportedHandler(worker) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return worker;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  const fetchDispatcher = /* @__PURE__ */ __name(function(request, env, ctx) {
    if (worker.fetch === void 0) {
      throw new Error("Handler does not export a fetch() function.");
    }
    return worker.fetch(request, env, ctx);
  }, "fetchDispatcher");
  return {
    ...worker,
    fetch(request, env, ctx) {
      const dispatcher = /* @__PURE__ */ __name(function(type, init) {
        if (type === "scheduled" && worker.scheduled !== void 0) {
          const controller = new __Facade_ScheduledController__(
            Date.now(),
            init.cron ?? "",
            () => {
            }
          );
          return worker.scheduled(controller, env, ctx);
        }
      }, "dispatcher");
      return __facade_invoke__(request, env, ctx, dispatcher, fetchDispatcher);
    }
  };
}
__name(wrapExportedHandler, "wrapExportedHandler");
function wrapWorkerEntrypoint(klass) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return klass;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  return class extends klass {
    #fetchDispatcher = /* @__PURE__ */ __name((request, env, ctx) => {
      this.env = env;
      this.ctx = ctx;
      if (super.fetch === void 0) {
        throw new Error("Entrypoint class does not define a fetch() function.");
      }
      return super.fetch(request);
    }, "#fetchDispatcher");
    #dispatcher = /* @__PURE__ */ __name((type, init) => {
      if (type === "scheduled" && super.scheduled !== void 0) {
        const controller = new __Facade_ScheduledController__(
          Date.now(),
          init.cron ?? "",
          () => {
          }
        );
        return super.scheduled(controller);
      }
    }, "#dispatcher");
    fetch(request) {
      return __facade_invoke__(
        request,
        this.env,
        this.ctx,
        this.#dispatcher,
        this.#fetchDispatcher
      );
    }
  };
}
__name(wrapWorkerEntrypoint, "wrapWorkerEntrypoint");
var WRAPPED_ENTRY;
if (typeof middleware_insertion_facade_default === "object") {
  WRAPPED_ENTRY = wrapExportedHandler(middleware_insertion_facade_default);
} else if (typeof middleware_insertion_facade_default === "function") {
  WRAPPED_ENTRY = wrapWorkerEntrypoint(middleware_insertion_facade_default);
}
var middleware_loader_entry_default = WRAPPED_ENTRY;
export {
  __INTERNAL_WRANGLER_MIDDLEWARE__,
  middleware_loader_entry_default as default
};
//# sourceMappingURL=worker.js.map
