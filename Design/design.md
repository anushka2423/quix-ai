  ## 1. Tokens

  **Font:** Inter (Google Fonts, `opsz 14..32`, 400/500/600/700), `font-optical-sizing:auto`, `letter-spacing:-0.01em`.

  | Color | Hex | Use |
  |---|---|---|
  | Navy | `#002862` | Brand, primary buttons, selected |
  | Navy 700 / 500 | `#0a3578` / `#1a4a92` | Gradient stops |
  | White | `#ffffff` | Cards, CTA on navy |
  | Ink | `#0f1b33` | Text |
  | Ink 2 | `#2e3856` | Secondary text |
  | Muted | `#586380` | Labels |
  | Faint | `#939bb4` | Hints |
  | Disabled | `#c3c8d8` | Disabled |
  | Canvas | `#f4f6fa` | Page bg |
  | Wash | `#eef2f9` | Selected / badges |
  | Border | `#e3e7ef` | Hairlines (hover `#b9c5dc`) |
  | On-navy | `#d6def0` / `#a9bcdf` | Text on navy |
  | Correct | `#1f7a52` on `#e6f5ed` | |
  | Incorrect | `#c23b3b` on `#fbeaea` | |

  **Gradient** (hero, unlock banner, feedback card, quiz top band):
  ```css
  radial-gradient(120% 140% at 100% 0%, rgba(255,255,255,.14), transparent 50%),
  linear-gradient(135deg, #002862, #0a3578 55%, #1a4a92);
  ```

  **Type:** Display 56/60 · H1 36/42 · Question 28/36 · H2 24/32 · Card 20/28 · Body 16/24 · Small 14/20 · Caption 12. Headings 600, tight tracking (−0.02 to −0.03em).

  **Radius:** pills 200 · feature 24 · quiz card 20 · cards 16 · options 12 · inputs 4.

  **Shadow:** card `0 1px 2px / 0 10px 28px rgba(0,40,98,.05/.07)` · feature `0 12px 32px rgba(0,40,98,.28)`.

  **Layout:** max-width 1200, quiz column 860, 8px grid, flex/grid + gap. All pills `white-space:nowrap`.

  ---

  ## 2. Screens

  ### Header (all)
  64px, white, bottom hairline. Wordmark left · module title center (quiz) · outline pill "Book 1-on-1 feedback" right.

  ### Home
  - **Hero** (gradient): chip → H1 → paragraph → white pill "Start assessment" + "N of 3 tracks completed".
  - **Tracks grid**: white cards (number badge, title, description, "9 questions · ~14 min", "Start →"). Completed = green "Scored NN%" pill. Hover lifts 2px.
  - **Unlock banner** (gradient) with white "Book a call".
  - **Locked cards**: dashed border, "Book a call to unlock →".
  - Loading = 3 skeleton cards. Error = red strip + Retry.

  ### Quiz
  - Navy band (300px) at top with: "← All tracks", "N correct" chip, "N of 9 answered", segmented progress.
  - White card (radius 20) with: number badge `01` + "Question 1 of 9 · Topic · Difficulty", question, options, explanation, actions.
  - Below card: keyboard hint + "Submit quiz" link.
  - **One question visible at a time.**

  ### Results
  - **Score card**: ring (r52, stroke 10), %, level label.
  - **Feedback card** (gradient, the hero): headline, body, focus-area chips (missed topics), white CTA "Book my free 1-on-1".
  - **Question review**: filter All / Incorrect, expandable rows.
  - **Sticky bar** bottom: "N focus areas identified" + CTA.

  ### Booking modal
  Day (next 5 weekdays) → time pill → work email (validated) → optional note → Confirm → success view.

  ---

  ## 3. States

  **Option**
  | State | Border | Fill | Mark |
  |---|---|---|---|
  | Default | border | white | letter |
  | Selected | navy | wash | navy, white letter |
  | Correct | green | green tint | ✓ + tag |
  | Wrong (picked) | red | red tint | ✕ + "Your answer" |

  **Progress segment:** default `rgba(255,255,255,.18)` · current 8px tall `rgba(255,255,255,.6)` · answered white · correct `#7cc4a0` · wrong `#e7a3a3`.

  **Primary button:** Check answer (disabled until selected) → Next question → See results.

  **Score level:** ≥80 "AI-ready" (green) · 50–79 "Building momentum" (`#b86e00`) · <50 "Keep practicing" (red).

  ---

  ## 4. Interactions
  - **Feedback mode** prop: `instant` (check each answer) or `end` (reveal on results).
  - **Keys:** 1–4 select · Enter = primary (one step per press, `preventDefault`) · ← → navigate.
  - **Submit with gaps:** first click warns, second submits; unanswered = "Skipped".
  - **Motion:** fade-up 0.25s on explanation/modal, hover lift, ring 0.8s. Don't re-mount the question block.
  - **Scores** persist in `localStorage["aipm_scores"]`.

  ---

  ## 5. Backend

  Questions are fetched, not hard-coded. Base URL is the `apiBase` prop (default `./api`, static JSON in this prototype).

  ### `GET {apiBase}/modules.json`
  ```json
  {
    "modules": [
      { "id": "m1", "num": "01", "title": "Agentic AI Product Foundations",
        "desc": "…", "questionCount": 9, "minutes": 14, "locked": false }
    ]
  }
  ```
  `locked: true` modules render as locked cards.

  ### `GET {apiBase}/modules/{id}.json`
  ```json
  {
    "moduleId": "m1",
    "questions": [
      { "id": "m1-q1", "text": "…", "topic": "Opportunity assessment",
        "difficulty": "Easy", "options": ["…","…","…","…"],
        "correct": 1, "explanation": "…" }
    ]
  }
  ```
  - Fetched on "Start", cached per module.
  - `topic` drives the focus-area chips on results.

  **Production note:** don't ship `correct`/`explanation` to the client. Swap for `POST /modules/{id}/check {questionId, answer}` → `{correct, correctIndex, explanation}`, and `POST /modules/{id}/submit` → score.

  ---

  ## 6. Rules
  - Navy is the only brand color; white is the CTA on navy. No orange/violet.
  - Status = tint + colored glyph, never solid discs.
  - One question at a time, content aligned to top (no vertical centering).
  - Headings max weight 600.