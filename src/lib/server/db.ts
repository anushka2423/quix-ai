import postgres from "postgres";

// ── Types ──────────────────────────────────────────────────────────────────────

type Row = Record<string, unknown>;
interface Cond { sql: string; vals: unknown[] }

/* eslint-disable @typescript-eslint/no-explicit-any */
type SBError = { message: string; code?: string };
// Array result (when QB is awaited directly)
type SBMulti = { data: any[] | null; error: SBError | null; count?: number | null };
// Single-row result (.single() / .maybeSingle())
type SBSingle = { data: any; error: SBError | null };
/* eslint-enable @typescript-eslint/no-explicit-any */

// ── Query builder ─────────────────────────────────────────────────────────────
// Implements the subset of the Supabase query builder used across this codebase.
// All other files require zero changes — the return shapes match Supabase exactly.

class QB {
  private _sql: postgres.Sql;
  private _table: string;
  private _selectCols = "*";
  private _isCount = false;
  private _conds: Cond[] = [];
  private _orders: string[] = [];
  private _limitVal: number | null = null;
  private _op: "select" | "insert" | "update" | "delete" | "upsert" = "select";
  private _writeData: Row | Row[] | null = null;
  private _returning: string | null = null;
  private _onConflict: string | null = null;

  constructor(sql: postgres.Sql, table: string) {
    this._sql = sql;
    this._table = table;
  }

  select(cols = "*", opts?: { count?: string; head?: boolean }) {
    // Called after insert/update/upsert → sets RETURNING clause
    if (this._op === "insert" || this._op === "update" || this._op === "upsert") {
      this._returning = cols;
      return this;
    }
    this._selectCols = cols;
    if (opts?.count === "exact") this._isCount = true;
    return this;
  }

  insert(data: Row | Row[]) { this._op = "insert"; this._writeData = data; return this; }
  update(data: Row) { this._op = "update"; this._writeData = data; return this; }
  delete() { this._op = "delete"; return this; }

  upsert(data: Row | Row[], opts?: { onConflict?: string }) {
    this._op = "upsert";
    this._writeData = data;
    this._onConflict = opts?.onConflict ?? null;
    return this;
  }

  // ── Condition methods ───────────────────────────────────────────────────────

  eq(col: string, val: unknown)  { this._conds.push({ sql: `"${col}" = ?`, vals: [val] }); return this; }
  lt(col: string, val: unknown)  { this._conds.push({ sql: `"${col}" < ?`, vals: [val] }); return this; }
  gte(col: string, val: unknown) { this._conds.push({ sql: `"${col}" >= ?`, vals: [val] }); return this; }

  ilike(col: string, pat: string) {
    this._conds.push({ sql: `"${col}" ILIKE ?`, vals: [pat] });
    return this;
  }

  in(col: string, vals: unknown[]) {
    if (!vals.length) { this._conds.push({ sql: "FALSE", vals: [] }); return this; }
    this._conds.push({ sql: `"${col}" IN (${vals.map(() => "?").join(", ")})`, vals });
    return this;
  }

  /** .not('col', 'is', null)  →  IS NOT NULL */
  not(col: string, op: string, val: unknown) {
    if (op === "is" && val === null) this._conds.push({ sql: `"${col}" IS NOT NULL`, vals: [] });
    return this;
  }

  /** .is('col', null)  →  IS NULL */
  is(col: string, val: unknown) {
    if (val === null) this._conds.push({ sql: `"${col}" IS NULL`, vals: [] });
    else this._conds.push({ sql: `"${col}" = ?`, vals: [val] });
    return this;
  }

  /** Supports multiple chained .order() calls */
  order(col: string, opts?: { ascending?: boolean; nullsFirst?: boolean }) {
    const dir   = opts?.ascending  === false ? "DESC"        : "ASC";
    const nulls = opts?.nullsFirst === true  ? "NULLS FIRST" : "NULLS LAST";
    this._orders.push(`"${col}" ${dir} ${nulls}`);
    return this;
  }

  limit(n: number) { this._limitVal = n; return this; }

  // ── Terminators ─────────────────────────────────────────────────────────────

  async single(): Promise<SBSingle> {
    try {
      const rows = await this._run();
      if (!rows.length) return { data: null, error: { message: "Row not found" } };
      return { data: rows[0], error: null };
    } catch (e) {
      const err = e as Error & { code?: string };
      return { data: null, error: { message: err.message, code: err.code } };
    }
  }

  async maybeSingle(): Promise<SBSingle> {
    try {
      const rows = await this._run();
      return { data: rows[0] ?? null, error: null };
    } catch (e) {
      const err = e as Error & { code?: string };
      return { data: null, error: { message: err.message, code: err.code } };
    }
  }

  /** Makes QB directly awaitable: `const { data, error } = await c.from(...).select(...)` */
  then<R1 = SBMulti, R2 = never>(
    res?: ((v: SBMulti) => R1 | PromiseLike<R1>) | null,
    rej?: ((e: unknown) => R2 | PromiseLike<R2>) | null
  ): Promise<R1 | R2> {
    return this._runResult().then(res as never, rej as never) as Promise<R1 | R2>;
  }

  // ── Internal ─────────────────────────────────────────────────────────────────

  private async _runResult(): Promise<SBMulti> {
    try {
      if (this._isCount) {
        const { where, vals } = this._buildWhere(0);
        const rows = await this._sql.unsafe(
          `SELECT COUNT(*)::int AS count FROM "${this._table}" ${where}`.trim(),
          vals as never[]
        );
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return { data: null, error: null, count: ((rows[0] as any).count as number) ?? 0 };
      }
      return { data: await this._run(), error: null };
    } catch (e) {
      const err = e as Error & { code?: string };
      return { data: null, error: { message: err.message, code: err.code } };
    }
  }

  /** Build WHERE string and param array, offsetting indices by `offset`. */
  private _buildWhere(offset: number): { where: string; vals: unknown[] } {
    let idx = offset;
    const vals: unknown[] = [];
    const parts = this._conds.map(c => {
      let s = c.sql;
      for (const v of c.vals) { vals.push(v); s = s.replace("?", `$${++idx}`); }
      return s;
    });
    return { where: parts.length ? `WHERE ${parts.join(" AND ")}` : "", vals };
  }

  private async _run(): Promise<unknown[]> {
    const orderClause = this._orders.length ? `ORDER BY ${this._orders.join(", ")}` : "";
    const limitClause = this._limitVal !== null ? `LIMIT ${this._limitVal}` : "";

    // ── SELECT ──────────────────────────────────────────────────────────────
    if (this._op === "select") {
      const { where, vals } = this._buildWhere(0);
      const q = `SELECT ${this._selectCols} FROM "${this._table}" ${where} ${orderClause} ${limitClause}`
        .trim().replace(/\s+/g, " ");
      return await this._sql.unsafe(q, vals as never[]);
    }

    // ── DELETE ──────────────────────────────────────────────────────────────
    if (this._op === "delete") {
      const { where, vals } = this._buildWhere(0);
      await this._sql.unsafe(`DELETE FROM "${this._table}" ${where}`.trim(), vals as never[]);
      return [];
    }

    // ── INSERT / UPSERT ─────────────────────────────────────────────────────
    if (this._op === "insert" || this._op === "upsert") {
      const arr = Array.isArray(this._writeData) ? this._writeData : [this._writeData!];
      if (!arr.length) return [];
      const cols = Object.keys(arr[0]);
      const colDefs = cols.map(c => `"${c}"`).join(", ");
      let idx = 0;
      const valueSets = arr.map(row =>
        `(${cols.map(c => {
          const v = (row as Row)[c];
          return `$${++idx}${v !== null && typeof v === "object" ? "::jsonb" : ""}`;
        }).join(", ")})`
      ).join(", ");
      const allVals = arr.flatMap(row =>
        cols.map(c => {
          const v = (row as Row)[c];
          return v !== null && typeof v === "object" ? JSON.stringify(v) : v;
        })
      );

      let conflictClause = "";
      if (this._op === "upsert" && this._onConflict) {
        const conflictCols = this._onConflict.split(",").map(c => `"${c.trim()}"`).join(", ");
        const skipCols = new Set(this._onConflict.split(",").map(s => s.trim()));
        const updateSet = cols.filter(c => !skipCols.has(c)).map(c => `"${c}" = EXCLUDED."${c}"`).join(", ");
        conflictClause = ` ON CONFLICT (${conflictCols}) DO UPDATE SET ${updateSet}`;
      }

      const ret = this._returning != null ? ` RETURNING ${this._returning}` : "";
      return await this._sql.unsafe(
        `INSERT INTO "${this._table}" (${colDefs}) VALUES ${valueSets}${conflictClause}${ret}`,
        allVals as never[]
      );
    }

    // ── UPDATE ──────────────────────────────────────────────────────────────
    if (this._op === "update") {
      const data = this._writeData as Row;
      const cols = Object.keys(data);
      const setVals = cols.map(c => {
        const v = data[c];
        return v !== null && typeof v === "object" ? JSON.stringify(v) : v;
      });
      const setClauses = cols.map((c, i) => {
        const v = data[c];
        return `"${c}" = $${i + 1}${v !== null && typeof v === "object" ? "::jsonb" : ""}`;
      }).join(", ");
      const { where, vals: wVals } = this._buildWhere(cols.length);
      const ret = this._returning != null ? ` RETURNING ${this._returning}` : "";
      const q = `UPDATE "${this._table}" SET ${setClauses} ${where}${ret}`.trim().replace(/\s+/g, " ");
      return await this._sql.unsafe(q, [...setVals, ...wVals] as never[]);
    }

    return [];
  }
}

// ── Database client ───────────────────────────────────────────────────────────

class DBClient {
  constructor(private _pg: postgres.Sql) {}
  from(table: string) { return new QB(this._pg, table); }
}

let _client: DBClient | null | undefined;

export function db(): DBClient | null {
  if (_client !== undefined) return _client;
  const url = process.env.DATABASE_URL;
  if (!url) { _client = null; return null; }
  _client = new DBClient(
    postgres(url, { ssl: "require", max: 10, idle_timeout: 20, connect_timeout: 10 })
  );
  return _client;
}

export async function safeInsert(table: string, row: Record<string, unknown>): Promise<boolean> {
  const c = db();
  if (!c) return false;
  const { error } = await c.from(table).insert(row);
  if (error) { console.warn(`[db] insert into ${table} failed: ${error.message}`); return false; }
  return true;
}
