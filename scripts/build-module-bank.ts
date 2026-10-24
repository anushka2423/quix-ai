/**
 * Builds src/lib/bank/module-bank.json from the module question files (1.md .. 5.md at the repo root).
 * Those files are the source of truth for the By Module exams: run `npm run bank:modules` after editing one.
 *
 * Shared context ("For Questions 7 to 10, ..." prefaces) is copied into each question it covers, because the
 * exam draws questions in random order. Two questions that pointed at a neighbour are made self-contained below.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const ROOT = resolve(__dirname, "..");
const FILES = [1, 2, 3, 4, 5];

/** Questions that referred to another question: rewritten so they stand alone (the expected old text guards against drift). */
const REWRITES: Record<string, { expect: string; text: string }> = {
  "3:6": {
    expect: "What is the correct fix for the defect in Question 5?",
    text: "A `SKILL.md` runs a validation script through a hard-coded absolute path from the author's machine (`/Users/alexmorgan/projects/deploy-utils/validate.sh`), so it fails when a teammate clones the project. What is the correct fix?",
  },
  "5:5": {
    expect: "From the same scenario, which of the following is a valid infrastructure requirement?",
    text: "A regulated EU bank wants an agent that summarizes customer call transcripts for its support team, with summaries reviewed before they are stored in the EU. Which of the following is a valid infrastructure requirement?",
  },
};

interface Q {
  n: number;
  difficulty: "Easy" | "Medium" | "Hard";
  question: string;
  options: { label: string; text: string }[];
  answer: string;
  explanation: string;
}

const OPTION = /^- ([A-E])\. (.*)$/;
const HEADER = /^\*\*(\d+)\.\s*(?:\[(Easy|Medium|Hard)\]\s*)?(.*?)\*\*\s*$/;
const PREFACE = /^For Questions? (\d+) to (\d+),\s*(.*)$/;

function parse(file: number) {
  const lines = readFileSync(resolve(ROOT, `${file}.md`), "utf8").split("\n");
  const title = lines[0].match(/^# Module (\d+)(?: Quiz)?\s*[—:-]\s*(.+)$/)?.[2]?.trim();
  if (!title) throw new Error(`${file}.md: no module title`);

  const keyAt = lines.findIndex((l) => /^(<summary><b>)?(## )?Answer key/.test(l) || l.includes("Answer key"));
  const keys = new Map<number, { answer: string; explanation: string }>();
  for (const l of lines.slice(keyAt)) {
    const m = l.match(/^\|\s*(\d+)\s*\|(?:\s*(?:Easy|Medium|Hard)\s*\|)?\s*\*\*([A-E](?:[,\s]*[A-E])*)\*\*\s*\|\s*(.*?)\s*\|\s*$/);
    if (m) keys.set(Number(m[1]), { answer: m[2].replace(/[^A-E]/g, "").split("").join(","), explanation: m[3].replace(/\*\*/g, "") });
  }

  const questions: Q[] = [];
  let preface: { from: number; to: number; lines: string[] } | null = null;
  let cur: { n: number; difficulty: Q["difficulty"]; stem: string; body: string[]; options: Q["options"]; preface: string } | null = null;

  const flush = () => {
    if (!cur) return;
    const key = keys.get(cur.n);
    if (!key) throw new Error(`${file}.md Q${cur.n}: no answer in the key`);
    let stem = cur.stem;
    const rewrite = REWRITES[`${file}:${cur.n}`];
    let body = cur.body;
    if (rewrite) {
      if (stem !== rewrite.expect) throw new Error(`${file}.md Q${cur.n}: text changed, review the rewrite`);
      stem = rewrite.text;
    }
    while (body.length && (!body[body.length - 1].trim() || /^Options:\s*$/.test(body[body.length - 1]))) body = body.slice(0, -1);
    while (body.length && !body[0].trim()) body = body.slice(1);
    const parts = [cur.preface, stem, body.join("\n")].filter((p) => p.trim());
    questions.push({ n: cur.n, difficulty: cur.difficulty, question: parts.join("\n\n"), options: cur.options, answer: key.answer, explanation: key.explanation });
    cur = null;
  };

  for (const line of lines.slice(0, keyAt)) {
    const h = line.match(HEADER);
    const p = line.match(PREFACE);
    if (h || p || /^---\s*$/.test(line)) {
      flush();
      if (h) {
        const n = Number(h[1]);
        const pf = preface && n >= preface.from && n <= preface.to ? preface : null;
        // The preface paragraph without its "For Questions X to Y," lead-in; a repeated option list is dropped
        const text = pf ? pf.lines.filter((l) => !OPTION.test(l)) : [];
        const lead = text.length ? text.join("\n").replace(/^\s+|\s+$/g, "").replace(/^./, (c) => c.toUpperCase()) : "";
        cur = { n, difficulty: (h[2] as Q["difficulty"]) ?? "Medium", stem: h[3].trim(), body: [], options: [], preface: lead };
      } else if (p) {
        preface = { from: Number(p[1]), to: Number(p[2]), lines: [p[3]] };
      }
      continue;
    }
    if (cur) {
      const o = line.match(OPTION);
      if (o) cur.options.push({ label: o[1], text: o[2].trim() });
      else if (!cur.options.length) cur.body.push(line);
    } else if (preface) preface.lines.push(line);
  }
  flush();
  return { module: file, title, level: 1, questions };
}

const modules = FILES.map(parse);
const seen = new Set<string>();
for (const m of modules)
  for (const q of m.questions) {
    const dupe = q.question.toLowerCase();
    if (seen.has(dupe)) throw new Error(`Duplicate question: module ${m.module} Q${q.n}`);
    seen.add(dupe);
    const labels = q.options.map((o) => o.label).join("");
    if (q.options.length < 4 || !"ABCDE".startsWith(labels)) throw new Error(`Module ${m.module} Q${q.n}: bad options ${labels}`);
    if (q.answer.split(",").some((a) => !labels.includes(a))) throw new Error(`Module ${m.module} Q${q.n}: answer ${q.answer} not an option`);
  }

writeFileSync(resolve(ROOT, "src/lib/bank/module-bank.json"), JSON.stringify({ modules }, null, 2) + "\n");
console.log(modules.map((m) => `Module ${m.module} (${m.title}): ${m.questions.length} questions`).join("\n"));
