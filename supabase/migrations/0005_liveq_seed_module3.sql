-- Seed: Module 3 Quiz — Claude Code, MCP & Integration (15 questions)
-- Run AFTER 0002_liveq.sql

DO $$
DECLARE
  v_quiz_id    uuid;
  v_version_id uuid;
  v_module1_id uuid;
  v_module2_id uuid;
  v_module3_id uuid;
  v_public_snap  jsonb;
  v_private_snap jsonb;
BEGIN

-- 1. Insert quiz
INSERT INTO lq_quizzes (title, description, instructions, status, config, published_at)
VALUES (
  'Module 3 Quiz — Claude Code, MCP & Integration',
  'Tests understanding of Claude Code permission modes, hooks, CLAUDE.md, MCP primitives, OAuth, and secure integration patterns.',
  'Choose the single best answer for each question. You have 60 seconds per question.',
  'published',
  '{
    "timer_secs": 60,
    "points_correct": 100,
    "points_incorrect": 0,
    "points_unanswered": 0,
    "allow_late_join": false,
    "show_leaderboard_live": true,
    "results_released_by_admin": false,
    "allow_pause": true,
    "allow_early_end": true
  }',
  now()
)
RETURNING id INTO v_quiz_id;

-- 2. Insert 3 modules (5 + 5 + 5)
INSERT INTO lq_modules (quiz_id, title, description, order_index)
VALUES (v_quiz_id, 'Permission Modes & Safety', 'Plan mode, acceptEdits, bypassPermissions, allow/deny rules, and review gates', 1)
RETURNING id INTO v_module1_id;

INSERT INTO lq_modules (quiz_id, title, description, order_index)
VALUES (v_quiz_id, 'CLAUDE.md, Hooks & Subagents', 'CLAUDE.md hygiene, hooks, subagent rules, skills, and plugin paths', 2)
RETURNING id INTO v_module2_id;

INSERT INTO lq_modules (quiz_id, title, description, order_index)
VALUES (v_quiz_id, 'MCP: Primitives, Transport & Security', 'MCP transport, scope, primitives, secret handling, and OAuth', 3)
RETURNING id INTO v_module3_id;

-- ──────────────────────────────────────────────────────────────────────────────
-- Module 1: Permission Modes & Safety (Q1–Q5)
-- ──────────────────────────────────────────────────────────────────────────────

INSERT INTO lq_questions (quiz_id, module_id, type, question, options, correct_answer, concept, points, timer_secs, order_index)
VALUES
(v_quiz_id, v_module1_id, 'single',
  'What does plan permission mode do?',
  '[{"label":"A","text":"Auto-approves all edits and commands after showing a plan"},{"label":"B","text":"Denies every tool call that is not on an allow list"},{"label":"C","text":"Skips the explore phase and goes straight to coding"},{"label":"D","text":"Holds Claude Code in read-only exploration: no edits or shell commands until you approve a plan"}]',
  'D', 'Permission Modes', 100, 60, 1),

(v_quiz_id, v_module1_id, 'single',
  'What does acceptEdits auto-approve?',
  '[{"label":"A","text":"Everything, with a classifier reviewing each action"},{"label":"B","text":"Reads, file edits and common filesystem commands inside the working directory; other shell commands and protected paths still prompt"},{"label":"C","text":"Only reads"},{"label":"D","text":"All tool calls, with no safety checks"}]',
  'B', 'Permission Modes', 100, 60, 2),

(v_quiz_id, v_module1_id, 'single',
  'A developer wants fewer prompts and switches to bypassPermissions on a workstation. What is the correct assessment?',
  '[{"label":"A","text":"Only appropriate in an isolated, disposable container or VM; it removes every prompt including the protected-path guard, so use deny rules first, or auto for fewer prompts with a safety net"},{"label":"B","text":"Fine, as long as the task feels routine"},{"label":"C","text":"Acceptable on any machine if the repo is backed up"},{"label":"D","text":"It still prompts for all shell scripts"}]',
  'A', 'Permission Modes', 100, 60, 3),

(v_quiz_id, v_module1_id, 'single',
  'An allow rule at project level and a deny rule at enterprise level conflict. What happens?',
  '[{"label":"A","text":"The project allow wins because it is more specific"},{"label":"B","text":"The deny wins; a deny rule always beats an allow rule, and enterprise managed settings can''t be overridden by users or projects"},{"label":"C","text":"The most recently edited file wins"},{"label":"D","text":"Claude asks the user to choose"}]',
  'B', 'Allow & Deny Rules', 100, 60, 4),

(v_quiz_id, v_module1_id, 'single',
  'How do you decide where a human review gate belongs?',
  '[{"label":"A","text":"Ask what the worst outcome is if this action runs unchecked: let reversible low-cost actions through, gate hard-to-undo or sensitive-path actions, and never let the agent be the only gate on code your team marked sensitive"},{"label":"B","text":"Gate every action equally"},{"label":"C","text":"Gate only actions that take a long time"},{"label":"D","text":"Gate only shell commands"}]',
  'A', 'Human-in-the-Loop', 100, 60, 5);

-- ──────────────────────────────────────────────────────────────────────────────
-- Module 2: CLAUDE.md, Hooks & Subagents (Q6–Q10)
-- ──────────────────────────────────────────────────────────────────────────────

INSERT INTO lq_questions (quiz_id, module_id, type, question, options, correct_answer, concept, points, timer_secs, order_index)
VALUES
(v_quiz_id, v_module2_id, 'single',
  'How should you treat an AI code reviewer''s findings?',
  '[{"label":"A","text":"As a verdict to apply directly"},{"label":"B","text":"Trust claims about runtime behavior and other systems, but verify missing null checks"},{"label":"C","text":"Trust what is provable from the diff (and confirm it on the cited lines); treat claims about runtime behavior or other systems as hypotheses to test; keep a human gate where a finding becomes an irreversible action"},{"label":"D","text":"Ignore all of it"}]',
  'C', 'AI Code Review', 100, 60, 1),

(v_quiz_id, v_module2_id, 'single',
  'Your CLAUDE.md has grown to 800+ lines and the agent edited a directory it was told not to touch. What is the best fix?',
  '[{"label":"A","text":"Add the rule again, in capital letters"},{"label":"B","text":"Increase the context window"},{"label":"C","text":"Move everything into a subagent"},{"label":"D","text":"Trim CLAUDE.md to the rules that change behavior, move path-specific guidance to scoped rules files (paths: frontmatter), move reference material elsewhere, and enforce the can''t-fail rule with a hook"}]',
  'D', 'CLAUDE.md', 100, 60, 2),

(v_quiz_id, v_module2_id, 'single',
  'Which statement about hooks is correct?',
  '[{"label":"A","text":"A PostToolUse hook can block the tool call that just ran"},{"label":"B","text":"A PreToolUse hook can block a call by exiting with code 2 and writing the reason to stderr; this enforces a guardrail regardless of permission mode, unlike an instruction in CLAUDE.md"},{"label":"C","text":"Hooks add their full source to the context window on every turn"},{"label":"D","text":"Hooks only run in bypassPermissions mode"}]',
  'B', 'Hooks', 100, 60, 3),

(v_quiz_id, v_module2_id, 'single',
  'You delegate a task to the built-in Explore subagent and your project''s CLAUDE.md rules are not followed. Why?',
  '[{"label":"A","text":"Subagents are never able to read files"},{"label":"B","text":"CLAUDE.md only loads in plan mode"},{"label":"C","text":"Explore and Plan skip CLAUDE.md and git status for speed; use the general-purpose subagent or a custom subagent when project rules must apply (and list any skills it needs in its frontmatter)"},{"label":"D","text":"The subagent inherited an outdated CLAUDE.md"}]',
  'C', 'Subagents', 100, 60, 4),

(v_quiz_id, v_module2_id, 'single',
  'A skill worked in Claude Code but does nothing in a headless Agent SDK job. What is the most likely cause?',
  '[{"label":"A","text":"settingSources was never set, so filesystem settings and skills never loaded; set it explicitly"},{"label":"B","text":"Skills only run in the terminal"},{"label":"C","text":"The SDK doesn''t support Markdown"},{"label":"D","text":"The skill needs the Messages API beta headers"}]',
  'A', 'Skills', 100, 60, 5);

-- ──────────────────────────────────────────────────────────────────────────────
-- Module 3: MCP: Primitives, Transport & Security (Q11–Q15)
-- ──────────────────────────────────────────────────────────────────────────────

INSERT INTO lq_questions (quiz_id, module_id, type, question, options, correct_answer, concept, points, timer_secs, order_index)
VALUES
(v_quiz_id, v_module3_id, 'single',
  'A plugin installs successfully for every teammate but its skill fails for all of them except the author. The skill calls /Users/alex/projects/deploy-utils/validate.sh. What is the fix?',
  '[{"label":"A","text":"Switch to a home shortcut such as ~/projects/deploy-utils/validate.sh"},{"label":"B","text":"Put the script on a shared network drive and use that absolute path"},{"label":"C","text":"Reference scripts with $CLAUDE_PROJECT_DIR (project) or ${CLAUDE_PLUGIN_ROOT} (bundled in the plugin), bundle or share every dependency, and test on a clean machine"},{"label":"D","text":"Remove the validation step"}]',
  'C', 'Plugins & Paths', 100, 60, 1),

(v_quiz_id, v_module3_id, 'single',
  'A code-search service hosted on your company''s infrastructure must be available to the whole engineering team through the repo. Which transport and scope fit?',
  '[{"label":"A","text":"stdio + local scope"},{"label":"B","text":"SSE + user scope"},{"label":"C","text":"stdio + project scope, because stdio is the most secure"},{"label":"D","text":"HTTP (streamable) + project scope (.mcp.json committed to the repo)"}]',
  'D', 'MCP Transport & Scope', 100, 60, 2),

(v_quiz_id, v_module3_id, 'single',
  'An API key was committed inline in .mcp.json. The developer replaces it with ${WAREHOUSE_MCP_TOKEN} in a new commit. Is the problem solved?',
  '[{"label":"A","text":"No; the key is still in git history and must be treated as compromised and rotated. Configs should only ever hold variable references (back the convention with a PreToolUse hook)"},{"label":"B","text":"Yes, the file no longer contains the key"},{"label":"C","text":"Yes, as long as the repository is private"},{"label":"D","text":"No, but rotating is unnecessary if you force-push"}]',
  'A', 'MCP Security', 100, 60, 3),

(v_quiz_id, v_module3_id, 'single',
  'Which MCP primitive is read-only data the client fetches by URI and places directly into context, rather than the model calling an action?',
  '[{"label":"A","text":"Tool"},{"label":"B","text":"Resource"},{"label":"C","text":"Prompt"},{"label":"D","text":"Transport"}]',
  'B', 'MCP Primitives', 100, 60, 4),

(v_quiz_id, v_module3_id, 'single',
  'An OAuth-authenticated MCP integration works in staging but every production sign-in fails with a redirect URI mismatch. What is the cause and the fix?',
  '[{"label":"A","text":"A code defect in the MCP server; rewrite the sign-in flow"},{"label":"B","text":"The token expired; refresh it"},{"label":"C","text":"Redirect URIs are registered per host (and often per environment); register the production host''s redirect URI, and check whether separate OAuth app registrations per environment are required"},{"label":"D","text":"OAuth can''t be used in production; switch to a hard-coded API key"}]',
  'C', 'MCP OAuth', 100, 60, 5);

-- ──────────────────────────────────────────────────────────────────────────────
-- 3. Build and store the quiz version snapshot
-- ──────────────────────────────────────────────────────────────────────────────

SELECT jsonb_build_object(
  'quiz_id',      v_quiz_id,
  'title',        'Module 3 Quiz — Claude Code, MCP & Integration',
  'description',  'Tests understanding of Claude Code permission modes, hooks, CLAUDE.md, MCP primitives, OAuth, and secure integration patterns.',
  'instructions', 'Choose the single best answer for each question. You have 60 seconds per question.',
  'config', '{
    "timer_secs": 60,
    "points_correct": 100,
    "points_incorrect": 0,
    "points_unanswered": 0,
    "allow_late_join": false,
    "show_leaderboard_live": true,
    "results_released_by_admin": false,
    "allow_pause": true,
    "allow_early_end": true
  }'::jsonb,
  'modules', (
    SELECT jsonb_agg(
      jsonb_build_object(
        'id',          m.id,
        'title',       m.title,
        'description', m.description,
        'order_index', m.order_index,
        'questions', (
          SELECT jsonb_agg(
            jsonb_build_object(
              'id',          q.id,
              'module_id',   q.module_id,
              'type',        q.type,
              'question',    q.question,
              'options',     q.options,
              'concept',     q.concept,
              'points',      q.points,
              'timer_secs',  q.timer_secs,
              'order_index', q.order_index
            ) ORDER BY q.order_index
          )
          FROM lq_questions q WHERE q.module_id = m.id
        )
      ) ORDER BY m.order_index
    )
    FROM lq_modules m WHERE m.quiz_id = v_quiz_id
  )
) INTO v_public_snap;

SELECT jsonb_build_object(
  'quiz_id',      v_quiz_id,
  'title',        'Module 3 Quiz — Claude Code, MCP & Integration',
  'description',  'Tests understanding of Claude Code permission modes, hooks, CLAUDE.md, MCP primitives, OAuth, and secure integration patterns.',
  'instructions', 'Choose the single best answer for each question. You have 60 seconds per question.',
  'config', '{
    "timer_secs": 60,
    "points_correct": 100,
    "points_incorrect": 0,
    "points_unanswered": 0,
    "allow_late_join": false,
    "show_leaderboard_live": true,
    "results_released_by_admin": false,
    "allow_pause": true,
    "allow_early_end": true
  }'::jsonb,
  'modules', (
    SELECT jsonb_agg(
      jsonb_build_object(
        'id',          m.id,
        'title',       m.title,
        'description', m.description,
        'order_index', m.order_index,
        'questions', (
          SELECT jsonb_agg(
            jsonb_build_object(
              'id',             q.id,
              'module_id',      q.module_id,
              'type',           q.type,
              'question',       q.question,
              'options',        q.options,
              'correct_answer', q.correct_answer,
              'concept',        q.concept,
              'points',         q.points,
              'timer_secs',     q.timer_secs,
              'order_index',    q.order_index,
              'explanation',    q.explanation
            ) ORDER BY q.order_index
          )
          FROM lq_questions q WHERE q.module_id = m.id
        )
      ) ORDER BY m.order_index
    )
    FROM lq_modules m WHERE m.quiz_id = v_quiz_id
  )
) INTO v_private_snap;

INSERT INTO lq_quiz_versions (quiz_id, snapshot, snapshot_with_keys)
VALUES (v_quiz_id, v_public_snap, v_private_snap)
RETURNING id INTO v_version_id;

RAISE NOTICE 'Quiz created: % | Version: %', v_quiz_id, v_version_id;

END $$;