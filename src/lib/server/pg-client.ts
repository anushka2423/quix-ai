import { Pool, types } from "pg";

/**
 * Minimal Supabase-compatible query builder over plain PostgreSQL (e.g. Azure Database for PostgreSQL).
 *
 * It implements only the subset of the supabase-js API this app uses, so existing `db().from(t)...` call sites keep
 * working unchanged: select / insert / update / upsert / delete, eq neq in is not gt gte lt lte ilike like match,
 * order / limit / range, single / maybeSingle, and `{ count, head }`. Results are `{ data, error, count }` and
 * errors carry the Postgres `code` (e.g. 23505), exactly like supabase-js. Values are always bound parameters;
 * table and column names are validated before they are quoted into the SQL text.
 */

// bigint / numeric / dates come back as the JSON shapes PostgREST used to return (numbers and ISO strings)
types.setTypeParser(20, (v) => Number(v)); // int8 (count(*), bigserial)
types.setTypeParser(1700, (v) => Number(v)); // numeric
types.setTypeParser(1184, (v) => v.replace(" ", "T").replace(/([+-]\d\d)$/, "$1:00")); // timestamptz
types.setTypeParser(1114, (v) => v.replace(" ", "T")); // timestamp

export interface PgError { message: string; code?: string; details?: string; hint?: string }
interface Result { data: unknown; error: PgError | null; count: number | null }

type Op = "=" | "<>" | ">" | ">=" | "<" | "<=" | "ilike" | "like";
interface Cond { sql: (push: (v: unknown) => string) => string }

const IDENT = /^[A-Za-z_][A-Za-z0-9_]*$/;
function ident(name: string): string {
  if (!IDENT.test(name)) throw new Error(`Invalid identifier: ${name}`);
  return `"${name}"`;
}
function cols(list: string | undefined): string {
  if (!list || list.trim() === "*") return "*";
  return list.split(",").map((c) => ident(c.trim())).join(", ");
}
/** jsonb columns take objects and arrays: serialise them (node-postgres would turn arrays into PG arrays). */
function bind(v: unknown): unknown {
  if (v === undefined) return null;
  if (v !== null && typeof v === "object" && !(v instanceof Date) && !Buffer.isBuffer(v)) return JSON.stringify(v);
  return v;
}

let pool: Pool | undefined;
function getPool(): Pool {
  const g = globalThis as unknown as { __pgPool?: Pool };
  if (g.__pgPool) return g.__pgPool;
  const raw = process.env.DATABASE_URL as string;
  const url = new URL(raw);
  const mode = url.searchParams.get("sslmode");
  url.searchParams.delete("sslmode");
  const local = ["localhost", "127.0.0.1", "::1"].includes(url.hostname);
  pool = new Pool({
    connectionString: url.toString(),
    max: Number(process.env.DATABASE_POOL_MAX ?? 5),
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 15_000,
    ssl: local || mode === "disable" ? false : { rejectUnauthorized: process.env.DATABASE_SSL_INSECURE !== "1" },
  });
  pool.on("error", (e) => console.warn(`[db] idle client error: ${e.message}`));
  g.__pgPool = pool;
  return pool;
}

class Query implements PromiseLike<Result> {
  private action: "select" | "insert" | "update" | "upsert" | "delete" = "select";
  private selectCols: string | undefined = "*";
  private returning = false;
  private conds: Cond[] = [];
  private orders: string[] = [];
  private lim: number | null = null;
  private off: number | null = null;
  private mode: "many" | "single" | "maybe" = "many";
  private countMode = false;
  private head = false;
  private rows: Record<string, unknown>[] = [];
  private patch: Record<string, unknown> = {};
  private onConflict: string[] = [];
  private ignoreDup = false;

  constructor(private table: string) {}

  select(columns?: string, opts?: { count?: "exact" | "planned" | "estimated"; head?: boolean }) {
    if (this.action === "select") this.selectCols = columns ?? "*";
    else { this.returning = true; this.selectCols = columns ?? "*"; }
    if (opts?.count) this.countMode = true;
    if (opts?.head) this.head = true;
    return this;
  }
  insert(values: Record<string, unknown> | Record<string, unknown>[]) {
    this.action = "insert"; this.rows = Array.isArray(values) ? values : [values]; return this;
  }
  upsert(values: Record<string, unknown> | Record<string, unknown>[], opts?: { onConflict?: string; ignoreDuplicates?: boolean }) {
    this.action = "upsert"; this.rows = Array.isArray(values) ? values : [values];
    this.onConflict = (opts?.onConflict ?? "").split(",").map((s) => s.trim()).filter(Boolean);
    this.ignoreDup = !!opts?.ignoreDuplicates; return this;
  }
  update(values: Record<string, unknown>) { this.action = "update"; this.patch = values; return this; }
  delete() { this.action = "delete"; return this; }

  private cmp(col: string, op: Op, val: unknown) {
    const c = ident(col);
    this.conds.push({ sql: (push) => `${c} ${op} ${push(val)}` });
    return this;
  }
  eq(col: string, val: unknown) { return val === null ? this.is(col, null) : this.cmp(col, "=", val); }
  neq(col: string, val: unknown) { return this.cmp(col, "<>", val); }
  gt(col: string, val: unknown) { return this.cmp(col, ">", val); }
  gte(col: string, val: unknown) { return this.cmp(col, ">=", val); }
  lt(col: string, val: unknown) { return this.cmp(col, "<", val); }
  lte(col: string, val: unknown) { return this.cmp(col, "<=", val); }
  like(col: string, val: string) { return this.cmp(col, "like", val); }
  ilike(col: string, val: string) { return this.cmp(col, "ilike", val); }
  is(col: string, val: null | boolean) {
    const c = ident(col);
    this.conds.push({ sql: () => (val === null ? `${c} is null` : `${c} is ${val ? "true" : "false"}`) });
    return this;
  }
  in(col: string, vals: unknown[]) {
    const c = ident(col);
    this.conds.push({ sql: (push) => (vals.length ? `${c} = any(${push(vals)})` : "false") });
    return this;
  }
  not(col: string, op: string, val: unknown) {
    const c = ident(col);
    this.conds.push({
      sql: (push) => {
        if (op === "is") return val === null ? `${c} is not null` : `${c} is not ${val ? "true" : "false"}`;
        if (op === "in") return `not (${c} = any(${push(Array.isArray(val) ? val : [val])}))`;
        const map: Record<string, string> = { eq: "<>", neq: "=", gt: "<=", gte: "<", lt: ">=", lte: ">", like: "not like", ilike: "not ilike" };
        if (!map[op]) throw new Error(`Unsupported not() operator: ${op}`);
        return `${c} ${map[op]} ${push(val)}`;
      },
    });
    return this;
  }
  match(obj: Record<string, unknown>) { for (const [k, v] of Object.entries(obj)) this.eq(k, v); return this; }
  order(col: string, opts?: { ascending?: boolean; nullsFirst?: boolean }) {
    const asc = opts?.ascending !== false;
    const nulls = opts?.nullsFirst === undefined ? "" : opts.nullsFirst ? " nulls first" : " nulls last";
    this.orders.push(`${ident(col)} ${asc ? "asc" : "desc"}${nulls}`);
    return this;
  }
  limit(n: number) { this.lim = n; return this; }
  range(from: number, to: number) { this.off = from; this.lim = to - from + 1; return this; }
  single() { this.mode = "single"; return this; }
  maybeSingle() { this.mode = "maybe"; return this; }

  private where(push: (v: unknown) => string): string {
    return this.conds.length ? ` where ${this.conds.map((c) => c.sql(push)).join(" and ")}` : "";
  }

  private async run(): Promise<Result> {
    const params: unknown[] = [];
    const push = (v: unknown) => { params.push(bind(v)); return `$${params.length}`; };
    const pushRaw = (v: unknown) => { params.push(v); return `$${params.length}`; }; // arrays for = any()
    const t = ident(this.table);
    let sql = "";
    let wantsRows = true;

    switch (this.action) {
      case "select": {
        // `in` binds a real array, everything else binds via bind(); rebuild conds with the raw pusher for arrays
        const w = this.where((v) => (Array.isArray(v) ? pushRaw(v) : push(v)));
        sql = `select ${cols(this.selectCols)} from ${t}${w}`;
        if (this.orders.length) sql += ` order by ${this.orders.join(", ")}`;
        if (this.lim !== null) sql += ` limit ${Math.max(0, Math.floor(this.lim))}`;
        if (this.off !== null) sql += ` offset ${Math.max(0, Math.floor(this.off))}`;
        break;
      }
      case "insert":
      case "upsert": {
        if (!this.rows.length) return { data: this.returning ? [] : null, error: null, count: null };
        const keys = [...new Set(this.rows.flatMap((r) => Object.keys(r)))];
        const colList = keys.map(ident).join(", ");
        const valueRows = this.rows.map((r) => `(${keys.map((k) => (k in r ? push(r[k]) : "default")).join(", ")})`).join(", ");
        sql = `insert into ${t} (${colList}) values ${valueRows}`;
        if (this.action === "upsert") {
          const target = this.onConflict.length ? `(${this.onConflict.map(ident).join(", ")})` : "";
          if (this.ignoreDup || !target) sql += ` on conflict ${target} do nothing`;
          else {
            const upd = keys.filter((k) => !this.onConflict.includes(k));
            sql += upd.length
              ? ` on conflict ${target} do update set ${upd.map((k) => `${ident(k)} = excluded.${ident(k)}`).join(", ")}`
              : ` on conflict ${target} do nothing`;
          }
        }
        if (this.returning) sql += ` returning ${cols(this.selectCols)}`; else wantsRows = false;
        break;
      }
      case "update": {
        const keys = Object.keys(this.patch);
        if (!keys.length) return { data: this.returning ? [] : null, error: null, count: null };
        const set = keys.map((k) => `${ident(k)} = ${push(this.patch[k])}`).join(", ");
        const w = this.where((v) => (Array.isArray(v) ? pushRaw(v) : push(v)));
        sql = `update ${t} set ${set}${w}`;
        if (this.returning) sql += ` returning ${cols(this.selectCols)}`; else wantsRows = false;
        break;
      }
      case "delete": {
        const w = this.where((v) => (Array.isArray(v) ? pushRaw(v) : push(v)));
        sql = `delete from ${t}${w}`;
        if (this.returning) sql += ` returning ${cols(this.selectCols)}`; else wantsRows = false;
        break;
      }
    }

    try {
      const p = getPool();
      let count: number | null = null;
      if (this.countMode && this.action === "select") {
        const cp: unknown[] = [];
        const cpush = (v: unknown) => { cp.push(Array.isArray(v) ? v : bind(v)); return `$${cp.length}`; };
        const cr = await p.query(`select count(*) as n from ${t}${this.where(cpush)}`, cp);
        count = Number(cr.rows[0].n);
        if (this.head) return { data: null, error: null, count };
      }
      const res = await p.query(sql, params);
      if (!wantsRows) return { data: null, error: null, count };
      const rows = res.rows as Record<string, unknown>[];
      if (this.mode === "many") return { data: rows, error: null, count };
      if (rows.length === 1) return { data: rows[0], error: null, count };
      if (rows.length === 0 && this.mode === "maybe") return { data: null, error: null, count };
      return {
        data: null, count,
        error: { code: "PGRST116", message: "JSON object requested, multiple (or no) rows returned", details: `The result contains ${rows.length} rows` },
      };
    } catch (e) {
      const err = e as { message?: string; code?: string; detail?: string; hint?: string };
      return { data: null, count: null, error: { message: err.message ?? String(e), code: err.code, details: err.detail, hint: err.hint } };
    }
  }

  then<A = Result, B = never>(onfulfilled?: ((v: Result) => A | PromiseLike<A>) | null, onrejected?: ((r: unknown) => B | PromiseLike<B>) | null): PromiseLike<A | B> {
    return this.run().then(onfulfilled, onrejected);
  }
}

export function createPgClient() {
  return { from: (table: string) => new Query(table) };
}
