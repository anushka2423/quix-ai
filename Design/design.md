---
version: alpha
name: Agentic AI Institute-design-analysis
description: "Agentic AI Institute brands itself with a confident cohort-course signature — a deep navy hero wrapped in a faint wave/mesh gradient, a two-tone headline (white + cobalt-blue gradient word), and a cobalt-blue primary action color carried through every CTA, link and icon chip. A saturated orange lives only in urgency and emphasis moments — the countdown promo strip, the 'SPECIAL OFFER' pricing badge, section eyebrow bullets, and pricing checkmarks. Cards are white on pale sky-tint sections, punctuated by solid-navy stat tiles and a dramatic navy 'featured' pricing card that glows with an orange drop shadow. Coverage is the full single-page site — top promo bar, hero, logo wall, overview stats, outcomes grid, curriculum accordion, before/after comparison, testimonials, community projects, pricing, instructor bio, contact form and footer."

colors:
  primary: "#006FFF"
  primary-deep: "#0057CC"
  on-primary: "#ffffff"
  navy-900: "#04275E"
  navy-800: "#0B1F3A"
  sky-300: "#73B0FF"
  orange-500: "#FF6F00"
  peach-200: "#FFC08C"
  surface-blue-wash: "rgba(10, 102, 194, 0.07)"
  surface-blue: "#F7FAFF"
  surface-blue-soft: "#ECF2FF"
  surface-blue-softer: "#E9F1FF"
  surface-blue-tint: "#F0F6FF"
  canvas: "#ffffff"
  surface: "#FCFCFC"
  surface-deep: "#FAFBFD"
  hairline: "#E6E6E6"
  hairline-soft: "#D9D9D9"
  ink: "#0C111D"
  ink-button: "#000D0E"
  charcoal: "#171717"
  slate: "#666666"
  steel: "#6D7382"
  stone: "#999999"
  on-dark: "#ffffff"
  on-dark-muted: "rgba(255, 255, 255, 0.75)"
  on-navy-strong: "#ffffff"
  link: "#006FFF"

typography:
  hero-display:
    fontFamily: Geist
    fontSize: 52px
    fontWeight: 500
    lineHeight: 1.01
    letterSpacing: -3.328px
  display-lg:
    fontFamily: Golos Text
    fontSize: 40px
    fontWeight: 600
    lineHeight: 1.15
    letterSpacing: -0.6px
  heading-1:
    fontFamily: Golos Text
    fontSize: 32px
    fontWeight: 400
    lineHeight: 1.12
    letterSpacing: -2.176px
  heading-2:
    fontFamily: Golos Text
    fontSize: 28px
    fontWeight: 600
    lineHeight: 1.20
    letterSpacing: -0.3px
  heading-3:
    fontFamily: Golos Text
    fontSize: 22px
    fontWeight: 600
    lineHeight: 1.25
  heading-4:
    fontFamily: Geist
    fontSize: 18px
    fontWeight: 600
    lineHeight: 1.30
  heading-5:
    fontFamily: Geist
    fontSize: 16px
    fontWeight: 600
    lineHeight: 1.35
  subtitle:
    fontFamily: Geist
    fontSize: 18px
    fontWeight: 400
    lineHeight: 1.50
  body-md:
    fontFamily: Geist
    fontSize: 16px
    fontWeight: 400
    lineHeight: 1.50
  body-md-medium:
    fontFamily: Geist
    fontSize: 16px
    fontWeight: 500
    lineHeight: 1.50
  body-sm:
    fontFamily: Geist
    fontSize: 14px
    fontWeight: 400
    lineHeight: 1.45
  body-sm-medium:
    fontFamily: Geist
    fontSize: 14px
    fontWeight: 500
    lineHeight: 1.45
  caption:
    fontFamily: Geist
    fontSize: 13px
    fontWeight: 400
    lineHeight: 1.40
  caption-bold:
    fontFamily: Geist
    fontSize: 13px
    fontWeight: 600
    lineHeight: 1.40
  micro:
    fontFamily: Geist
    fontSize: 12px
    fontWeight: 500
    lineHeight: 1.40
  micro-uppercase:
    fontFamily: Geist
    fontSize: 11px
    fontWeight: 600
    lineHeight: 1.40
    letterSpacing: 0.6px
  button-md:
    fontFamily: Golos Text
    fontSize: 16px
    fontWeight: 500
    lineHeight: 1.20
  stat-display:
    fontFamily: Golos Text
    fontSize: 56px
    fontWeight: 400
    lineHeight: 1.10
    letterSpacing: -1px

rounded:
  xs: 4px
  sm: 6px
  md: 10px
  lg: 12px
  xl: 16px
  xxl: 20px
  full: 9999px

spacing:
  xxs: 4px
  xs: 8px
  sm: 12px
  md: 16px
  lg: 20px
  xl: 24px
  xxl: 32px
  xxxl: 40px
  section-sm: 48px
  section: 64px
  section-lg: 96px
  hero: 120px

components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    typography: "{typography.button-md}"
    rounded: "{rounded.md}"
    padding: "14px 24px"
  button-primary-pressed:
    backgroundColor: "{colors.primary-deep}"
    textColor: "{colors.on-primary}"
  button-white:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink-button}"
    typography: "{typography.button-md}"
    rounded: "{rounded.md}"
    padding: "12px 8px 12px 20px"
    iconChipColor: "{colors.primary}"
  button-white-on-navy:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink-button}"
    typography: "{typography.button-md}"
    rounded: "{rounded.md}"
    padding: "12px 8px 12px 20px"
    iconChipColor: "{colors.primary}"
  button-pill-outline:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    typography: "{typography.body-sm-medium}"
    rounded: "{rounded.full}"
    padding: "14px 28px"
    border: "1px solid {colors.hairline}"
  button-dark-navy:
    backgroundColor: "{colors.navy-900}"
    textColor: "{colors.on-dark}"
    typography: "{typography.button-md}"
    rounded: "{rounded.md}"
    padding: "14px 24px"
  card-base:
    backgroundColor: "{colors.canvas}"
    rounded: "{rounded.lg}"
    padding: "{spacing.xl}"
    border: "1px solid {colors.hairline}"
  card-outcome:
    backgroundColor: "{colors.canvas}"
    rounded: "{rounded.lg}"
    padding: "{spacing.xl}"
    border: "0"
  card-stat-navy:
    backgroundColor: "{colors.navy-900}"
    textColor: "{colors.on-dark}"
    rounded: "{rounded.xs}"
    padding: "{spacing.lg}"
  card-testimonial:
    backgroundColor: "{colors.canvas}"
    rounded: "{rounded.lg}"
    padding: "{spacing.xl}"
    shadow: "rgba(0, 0, 0, 0.06) 0px 2px 12px 0px"
  card-before-after:
    backgroundColor: "{colors.surface-blue-soft}"
    textColor: "{colors.ink}"
    rounded: "{rounded.lg}"
    padding: "{spacing.lg}"
  card-comparison-navy:
    backgroundColor: "{colors.navy-900}"
    textColor: "{colors.on-dark}"
    rounded: "{rounded.lg}"
    padding: "{spacing.xxl}"
  card-comparison-light:
    backgroundColor: "{colors.surface-blue-soft}"
    textColor: "{colors.ink}"
    rounded: "{rounded.lg}"
    padding: "{spacing.xxl}"
  pricing-card:
    backgroundColor: "{colors.canvas}"
    rounded: "{rounded.lg}"
    padding: "{spacing.xxl}"
    border: "1px solid {colors.hairline}"
  pricing-card-featured:
    backgroundColor: "{colors.navy-900}"
    textColor: "{colors.on-dark}"
    rounded: "{rounded.lg}"
    padding: "{spacing.xxl}"
    shadow: "rgba(255, 111, 0, 0.18) 0px 20px 60px 0px, rgba(0, 0, 0, 0.25) 0px 8px 24px 0px"
  badge-orange:
    backgroundColor: "{colors.orange-500}"
    textColor: "{colors.on-primary}"
    typography: "{typography.caption-bold}"
    rounded: "{rounded.sm}"
    padding: "6px 12px"
  badge-neutral:
    backgroundColor: "{colors.surface-blue-soft}"
    textColor: "{colors.ink}"
    typography: "{typography.caption-bold}"
    rounded: "{rounded.sm}"
    padding: "6px 12px"
  tag-peach:
    backgroundColor: "{colors.peach-200}"
    textColor: "{colors.ink}"
    typography: "{typography.caption-bold}"
    rounded: "{rounded.sm}"
    padding: "4px 10px"
  tag-muted:
    backgroundColor: "{colors.surface-blue}"
    textColor: "{colors.steel}"
    typography: "{typography.caption-bold}"
    rounded: "{rounded.sm}"
    padding: "4px 10px"
  text-input:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    typography: "{typography.body-md}"
    rounded: "{rounded.md}"
    padding: "{spacing.sm} {spacing.md}"
    border: "1px solid {colors.hairline}"
    height: 44px
  text-input-focused:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    border: "2px solid {colors.primary}"
  text-area:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    typography: "{typography.body-md}"
    rounded: "{rounded.md}"
    padding: "{spacing.md}"
    border: "1px solid {colors.hairline}"
  contact-form-panel:
    backgroundColor: "{colors.canvas}"
    rounded: "{rounded.xl}"
    padding: "{spacing.xxl}"
    shadow: "rgba(0, 0, 0, 0.06) 0px 2px 12px 0px"
  promo-banner-urgency:
    backgroundColor: "{colors.peach-200}"
    textColor: "{colors.ink}"
    typography: "{typography.body-sm-medium}"
    padding: "{spacing.sm} {spacing.md}"
  eyebrow-label:
    backgroundColor: "transparent"
    textColor: "{colors.steel}"
    typography: "{typography.body-sm-medium}"
    bulletColor: "{colors.orange-500}"
  hero-band-navy:
    backgroundColor: "{colors.navy-900}"
    textColor: "{colors.on-dark}"
    rounded: "0"
    padding: "{spacing.hero} 0"
  stat-cell-hero:
    backgroundColor: "transparent"
    textColor: "{colors.on-dark}"
    typography: "{typography.stat-display}"
    padding: "{spacing.lg}"
  accordion-item:
    backgroundColor: "{colors.canvas}"
    rounded: "{rounded.md}"
    padding: "{spacing.xl}"
    border: "1px solid {colors.hairline}"
  logo-wall-item:
    backgroundColor: "transparent"
    textColor: "{colors.steel}"
    padding: "{spacing.lg}"
  avatar-circle:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.full}"
    shadow: "rgba(0, 0, 0, 0.05) 0px 0px 1px 0px, rgba(0, 0, 0, 0.04) 0px 1px 1px 0px, rgba(0, 0, 0, 0.03) 0px 3px 2px 0px, rgba(0, 0, 0, 0.01) 0px 4px 2px 0px, rgba(0, 0, 0, 0) 0px 7px 2px 0px"
  footer-region:
    backgroundColor: "{colors.navy-900}"
    textColor: "{colors.on-dark}"
    typography: "{typography.body-sm}"
    padding: "{spacing.section} {spacing.xxl}"
  footer-link:
    backgroundColor: "transparent"
    textColor: "{colors.on-dark-muted}"
    typography: "{typography.body-sm}"
    padding: "{spacing.xxs} 0"
---

## Overview

Agentic AI Institute sells a single, high-consideration product — a paid cohort course — and its visual system is built to make that pitch feel credible and current rather than "bootcamp-cheap." The page opens under a persistent peach countdown strip ("Save $1,400 — ends in 2d 04h...") sitting directly above a deep-navy sticky nav. The hero itself is a full-bleed navy panel washed with a faint wave/grid gradient mesh, carrying a two-tone headline: "Agentic AI" in solid white, "Transformation" in a lighter cobalt-blue (`{colors.sky-300}`) — the same move repeated nowhere else on the page, which makes the hero headline instantly recognizable as the page's signature moment.

Below the hero, the system alternates between pure white sections and very pale sky-blue-tinted sections (`{colors.surface-blue}`, `{colors.surface-blue-soft}`) to separate content blocks without hard borders. Cobalt blue (`{colors.primary}`) is the true "primary" color — it drives every solid CTA background, every inline link, and the small icon-chip that caps every white pill button (an arrow-in-a-box glyph). Saturated orange (`{colors.orange-500}`) is reserved and used sparingly: the small square bullet that opens every section's eyebrow label ("Overview", "Curriculum", "Pricing"...), the pricing page's checkmarks, and the "SPECIAL OFFER" ribbon on the featured pricing tier. Peach (`{colors.peach-200}`) appears only in the top urgency bar and small "AFTER" outcome tags.

Cards are generously rounded (`{rounded.lg}`, 12px) and mostly flat/white, but the system breaks its own flatness twice for emphasis: solid navy stat tiles inside the "Overview" section, and a solid navy "featured" pricing card that lifts off the page with a warm orange-tinted drop shadow — the closest thing this system has to a hero accent shadow.

**Key Characteristics:**
- Deep navy (`{colors.navy-900}`) hero, nav and footer, washed with a faint wave/mesh gradient graphic
- Two-tone gradient hero headline: white primary phrase + cobalt-blue (`{colors.sky-300}`) accent word
- Cobalt blue (`{colors.primary}`) as the one true primary — CTAs, links, and the signature icon-chip on every white button
- Orange (`{colors.orange-500}`) reserved for urgency/emphasis only: section eyebrow bullets, pricing checkmarks, the "SPECIAL OFFER" ribbon
- Pale sky-tint sections (`{colors.surface-blue}` family) alternate with white to separate content without borders
- Solid-navy "featured" pricing card with an orange-glow shadow — the system's one dramatic elevation moment
- Persistent top-of-page countdown/urgency strip in peach (`{colors.peach-200}`)

## Colors

> Source: agenticaiinstitute.ai (single-page site) — promo bar, nav, hero, logo wall, overview/stats, outcomes grid, curriculum accordion, why-choose-us comparison, testimonials, community projects, pricing, instructor bio, contact form, footer. Third-party logo marks (Stripe, LinkedIn, Adobe, Salesforce, Oracle, Amazon, Meta, Netflix, Spotify, Airbnb, Google, AWS, Microsoft) are excluded from the palette below — they are alumni/partner brand marks, not system tokens.

### Brand & Accent
- **Cobalt Blue** (`{colors.primary}`): The system's true primary — solid CTA backgrounds, inline links, focus rings, the icon-chip on white buttons
- **Cobalt Deep** (`{colors.primary-deep}`): Pressed/hover-equivalent depth for primary actions
- **Sky 300** (`{colors.sky-300}`): Gradient accent word in the hero headline only
- **Navy 900** (`{colors.navy-900}`): Brand navy — nav, hero, footer, stat tiles, featured pricing card
- **Navy 800** (`{colors.navy-800}`): Slightly lighter navy used in background gradient transitions
- **Orange 500** (`{colors.orange-500}`): Reserved accent — eyebrow bullets, pricing checkmarks, "SPECIAL OFFER" ribbon
- **Peach 200** (`{colors.peach-200}`): Urgency-strip background and small "AFTER" outcome tags

### Surface / Sky Tints
- **Surface Blue Wash** (`{colors.surface-blue-wash}`): Faint blue wash, 7% opacity, used as a section-level tint over white
- **Surface Blue** (`{colors.surface-blue}`): Palest blue section background
- **Surface Blue Soft** (`{colors.surface-blue-soft}`): Comparison-card and before/after-card background
- **Surface Blue Softer** (`{colors.surface-blue-softer}`): Alternate pale tint for card backgrounds
- **Surface Blue Tint** (`{colors.surface-blue-tint}`): Alternate pale tint for section backgrounds

### Neutral / Canvas
- **Canvas White** (`{colors.canvas}`): Page background and default card surface
- **Surface** (`{colors.surface}`): Near-white card/avatar surface
- **Surface Deep** (`{colors.surface-deep}`): Quietest off-white background
- **Hairline** (`{colors.hairline}`): 1px borders on cards, inputs, accordion dividers
- **Hairline Soft** (`{colors.hairline-soft}`): Lighter divider variant

### Text
- **Ink** (`{colors.ink}`): Primary headline and body text on light surfaces
- **Ink Button** (`{colors.ink-button}`): Near-black label color used specifically inside white buttons
- **Charcoal** (`{colors.charcoal}`): Darkest neutral, used sparingly for high-contrast text/surfaces
- **Slate** (`{colors.slate}`): Secondary body text
- **Steel** (`{colors.steel}`): Tertiary text, muted labels, logo-wall wordmarks
- **Stone** (`{colors.stone}`): Placeholder/disabled text
- **On Dark** (`{colors.on-dark}`): White text on navy surfaces
- **On Dark Muted** (`{colors.on-dark-muted}`): 75%-opacity white for body copy on navy (hero subtitle, footer copy)

### Semantic
- **Link** (`{colors.link}`): Inline link color, matches primary cobalt blue

## Typography

### Font Family
**Geist** (display/UI): Used for the hero headline, body copy, and most UI labels. Fallbacks: ui-sans-serif, system-ui, -apple-system, sans-serif.

**Golos Text** (headings/numerals): A rounder, slightly warmer geometric sans used for sub-headlines, section headlines, button labels, and all large numeral displays (stats, prices). Fallbacks: 'Segoe UI', Roboto, sans-serif.

**Inter / Inter Display**: Appears in isolated UI spots (form labels, a handful of card captions) — treat as a secondary system font rather than a primary voice.

**General Sans**: Rare, isolated use; not a primary system font.

### Hierarchy

| Token | Size | Weight | Line Height | Letter Spacing | Family | Use |
|---|---|---|---|---|---|---|
| `{typography.hero-display}` | 52px | 500 | 1.01 | -3.328px | Geist | Hero ("Agentic AI Transformation") |
| `{typography.display-lg}` | 40px | 600 | 1.15 | -0.6px | Golos Text | Section headlines ("Meet Your Instructor", "What past participants say") |
| `{typography.heading-1}` | 32px | 400 | 1.12 | -2.176px | Golos Text | Subsection headline ("One pass. Everything I teach.") |
| `{typography.stat-display}` | 56px | 400 | 1.10 | -1px | Golos Text | Stat/price callouts ("$3,600", "10,000+", "93") |
| `{typography.heading-2}` | 28px | 600 | 1.20 | -0.3px | Golos Text | Outcome card titles |
| `{typography.heading-3}` | 22px | 600 | 1.25 | 0 | Golos Text | Curriculum phase titles |
| `{typography.heading-4}` | 18px | 600 | 1.30 | 0 | Geist | Testimonial names, minor card titles |
| `{typography.heading-5}` | 16px | 600 | 1.35 | 0 | Geist | Small labels, stat-tile captions |
| `{typography.subtitle}` | 18px | 400 | 1.50 | 0 | Geist | Hero subtitle |
| `{typography.body-md}` | 16px | 400 | 1.50 | 0 | Geist | Primary body text |
| `{typography.body-md-medium}` | 16px | 500 | 1.50 | 0 | Geist | Body emphasis |
| `{typography.body-sm}` | 14px | 400 | 1.45 | 0 | Geist | Secondary body, attributions |
| `{typography.body-sm-medium}` | 14px | 500 | 1.45 | 0 | Geist | Nav links, eyebrow labels |
| `{typography.caption}` | 13px | 400 | 1.40 | 0 | Geist | Helper text, "COHORT 8" labels |
| `{typography.caption-bold}` | 13px | 600 | 1.40 | 0 | Geist | Badge labels ("STANDARD", "SPECIAL OFFER") |
| `{typography.micro}` | 12px | 500 | 1.40 | 0 | Geist | Footer microcopy |
| `{typography.micro-uppercase}` | 11px | 600 | 1.40 | 0.6px | Geist | Rare uppercase micro-labels |
| `{typography.button-md}` | 16px | 500 | 1.20 | 0 | Golos Text | Button labels |
| `{typography.code-md}` | — | — | — | — | — | Not present — this site has no code/IDE surfaces |

### Principles
- **Two-voice pairing** — Geist anchors the hero and body prose; Golos Text carries headlines, buttons and every large numeral. The rounder Golos Text on numerals gives stats and prices a friendly, confident weight.
- **Tight, negative-tracking headlines** — the hero and heading-1 both carry unusually tight negative letter-spacing (-3.328px / -2.176px) for a compact, modern display feel; body and captions relax to 0.
- **Stat-display token** (56px Golos Text) is reused everywhere a big number needs to land — session counts, alumni counts, and the pricing figure itself.
- **Muted-white secondary text** — rather than a separate gray token, text on navy typically uses white at 75% opacity (`{colors.on-dark-muted}`) for de-emphasis.

## Layout

### Spacing System
- **Base unit**: 4px (8px primary increment)
- **Tokens**: `{spacing.xxs}` (4px) · `{spacing.xs}` (8px) · `{spacing.sm}` (12px) · `{spacing.md}` (16px) · `{spacing.lg}` (20px) · `{spacing.xl}` (24px) · `{spacing.xxl}` (32px) · `{spacing.xxxl}` (40px) · `{spacing.section-sm}` (48px) · `{spacing.section}` (64px) · `{spacing.section-lg}` (96px) · `{spacing.hero}` (120px)
- **Section rhythm**: Marketing sections use generous `{spacing.section-lg}`–`{spacing.hero}` vertical rhythm; the hero itself is the deepest section on the page
- **Card internal padding**: `{spacing.xl}` (24px) for compact outcome cards; `{spacing.xxl}` (32px) for pricing cards and comparison panels

### Grid & Container
- Marketing content sits in a centered container, roughly 1200–1280px max-width
- Hero is a single-column, left-aligned stack (eyebrow rating, headline, subtitle, CTA, video) over the full-bleed navy background
- Outcomes section uses a 2-column card grid on desktop
- Overview stats use a 3-column tile row (`6` / `3` / `93`)
- Before/after "Real People" cards scroll horizontally in a dense row
- Pricing uses a 2-column card layout (standard vs. featured) stacked on mobile
- Contact section: centered single-column white panel (~480–520px) floating on the navy CTA band

### Whitespace Philosophy
The hero and CTA/footer bands use the deepest padding (`{spacing.hero}`, 120px) to let the navy gradient breathe. Card grids tighten to `{spacing.xl}`–`{spacing.xxl}` internal padding. The pricing cards are the most generously padded content cards on the page, reinforcing their status as the page's real conversion moment.

## Elevation & Depth

The system is mostly flat, with two deliberate elevation exceptions: profile-photo/avatar stacking and the featured pricing card's glow.

| Level | Treatment | Use |
|---|---|---|
| 0 (flat) | No shadow; `{colors.hairline}` border only | Default cards, inputs, accordion rows |
| 1 (subtle) | `rgba(0, 0, 0, 0.06) 0px 2px 12px 0px` | Testimonial cards, community project rows, contact panel |
| 2 (avatar stack) | Layered: `0px 0px 1px`, `0px 1px 1px`, `0px 3px 2px`, `0px 4px 2px`, `0px 7px 2px` at descending opacity | Profile photos, instructor headshot |
| 3 (inset glow) | `rgba(255, 255, 255, 0.1) 0px 0px 9px 0px inset` | Subtle inner highlight on dark tiles/badges |
| 4 (featured glow) | `rgba(255, 111, 0, 0.18) 0px 20px 60px 0px, rgba(0, 0, 0, 0.25) 0px 8px 24px 0px` | The single featured/highlighted pricing card only |

### Decorative Depth
- The hero and featured pricing card both carry a faint navy-on-navy wave/grid mesh graphic for atmosphere rather than photography
- The featured pricing card's warm orange-tinted shadow is the system's only "glow" moment — reserved entirely for the highest-intent CTA on the page
- Everything else is intentionally flat, relying on the sky-tint/white section alternation for depth instead of shadow

## Shapes

### Border Radius Scale

| Token | Value | Use |
|---|---|---|
| `{rounded.xs}` | 4px | Navy stat tiles |
| `{rounded.sm}` | 6px | Small badges ("STANDARD", "SPECIAL OFFER") |
| `{rounded.md}` | 10px | Buttons, inputs, icon-chip container |
| `{rounded.lg}` | 12px | Cards, pricing cards, comparison panels, accordion rows |
| `{rounded.xl}` | 16px | Contact form panel |
| `{rounded.xxl}` | 20px | Larger section-level wrapper panels |
| `{rounded.full}` | 9999px | Avatars, "AFTER"/"BEFORE" tags, pill CTAs like "See Our Community Projects" |

The radius scale leans soft and approachable — buttons and cards are consistently rounded (10–12px) rather than sharp-cornered, with full pill shapes reserved for tags and a couple of secondary CTAs.

### Iconography & Imagery
- Buttons that lead to an external/booking action ("Book Consultation", "Get the Yearly Pass") carry a small square icon-chip (`{colors.primary}` background, white diagonal arrow) docked to the right edge of the label
- Instructor and testimonial photography is circular (`{rounded.full}`), consistently sized
- Company logos in the "Alumni from Leading Companies" wall render as flat wordmarks/marks at a consistent height, no container

## Components

> Hover states were not reliably observable (Framer-authored site); default/pressed states only are documented below.

### Buttons

**`button-primary`** — Solid cobalt CTA, used for the contact form submit ("Send Your Message").
- Background `{colors.primary}`, text `{colors.on-primary}`, typography `{typography.button-md}`, padding `14px 24px`, rounded `{rounded.md}`. Carries the same white-arrow icon-chip as `button-white`, inverted to sit inside the blue field.

**`button-white`** — The dominant CTA pattern on the page: white pill with a small blue icon-chip on the right ("Book Consultation", "Get the Yearly Pass").
- Background `{colors.canvas}`, text `{colors.ink-button}`, typography `{typography.button-md}`, padding `12px 8px 12px 20px`, rounded `{rounded.md}`. Icon-chip background `{colors.primary}`.

**`button-white-on-navy`** — Same white-pill pattern, used specifically atop navy sections (hero, featured pricing card, contact CTA band) for contrast.

**`button-pill-outline`** — Softer secondary action ("See Our Community Projects").
- Background `{colors.canvas}`, text `{colors.ink}`, typography `{typography.body-sm-medium}`, padding `14px 28px`, rounded `{rounded.full}`, border `1px solid {colors.hairline}`. No icon-chip.

**`button-dark-navy`** — Solid navy button variant for on-light sections needing a dark, non-blue CTA.
- Background `{colors.navy-900}`, text `{colors.on-dark}`, typography `{typography.button-md}`, padding `14px 24px`, rounded `{rounded.md}`.

### Cards & Containers

**`card-base`** — Standard bordered content card.
- Background `{colors.canvas}`, rounded `{rounded.lg}`, padding `{spacing.xl}`, border `1px solid {colors.hairline}`.

**`card-outcome`** — Borderless icon + heading + body card used in the "What your team builds" grid.
- Background `{colors.canvas}`, rounded `{rounded.lg}`, padding `{spacing.xl}`, no border — separation comes from grid gutters alone.

**`card-stat-navy`** — Solid navy numeral tile ("6 / Live Sessions", "3 / Hands-on labs", "93 / Async lessons").
- Background `{colors.navy-900}`, text `{colors.on-dark}`, rounded `{rounded.xs}`, padding `{spacing.lg}`.

**`card-testimonial`** — Quote card in the "What past participants say" grid.
- Background `{colors.canvas}`, rounded `{rounded.lg}`, padding `{spacing.xl}`, shadow level 1. Name in `{typography.heading-4}`, role/company in `{typography.body-sm}` `{colors.steel}`.

**`card-before-after`** — "Real People. Real Career Growth." horizontal cards pairing a BEFORE/AFTER role change.
- Background `{colors.surface-blue-soft}`, text `{colors.ink}`, rounded `{rounded.lg}`, padding `{spacing.lg}`. "AFTER" role rendered with `tag-peach`; "BEFORE" role rendered with `tag-muted`.

**`card-comparison-navy`** — "With Agentic AI Institute" half of the why-choose-us comparison.
- Background `{colors.navy-900}`, text `{colors.on-dark}`, rounded `{rounded.lg}`, padding `{spacing.xxl}`. List items carry a filled cobalt-blue circular checkmark.

**`card-comparison-light`** — "Other Courses" half of the same comparison, deliberately plainer (no checkmarks) to read as the inferior option.
- Background `{colors.surface-blue-soft}`, text `{colors.ink}`, rounded `{rounded.lg}`, padding `{spacing.xxl}`.

**`pricing-card`** — Standard ("STANDARD") pricing tier.
- Background `{colors.canvas}`, rounded `{rounded.lg}`, padding `{spacing.xxl}`, border `1px solid {colors.hairline}`. Price in `{typography.stat-display}`, checkmarks in `{colors.orange-500}`.

**`pricing-card-featured`** — Discounted/featured tier, the page's primary conversion surface.
- Background `{colors.navy-900}`, text `{colors.on-dark}`, rounded `{rounded.lg}`, padding `{spacing.xxl}`, shadow level 4 (orange glow). Carries the `badge-orange` "SPECIAL OFFER — SAVE $1,400" ribbon and a `button-white-on-navy` CTA.

### Inputs & Forms

**`text-input`** — Standard field (Full Name, Email, Company Name).
- Background `{colors.canvas}`, text `{colors.ink}`, border `1px solid {colors.hairline}`, rounded `{rounded.md}`, padding `{spacing.sm} {spacing.md}`, height 44px.

**`text-input-focused`** — Activated state.
- Border switches to `2px solid {colors.primary}`.

**`text-area`** — "How Can We Help?" multi-line field.
- Background `{colors.canvas}`, text `{colors.ink}`, border `1px solid {colors.hairline}`, rounded `{rounded.md}`, padding `{spacing.md}`.

**`contact-form-panel`** — White card hosting the contact form, floating on the navy CTA band.
- Background `{colors.canvas}`, rounded `{rounded.xl}`, padding `{spacing.xxl}`, shadow level 1. Submit action is `button-primary`.

### Badges, Tags & Labels

**`badge-orange`** — "SPECIAL OFFER — SAVE $1,400" ribbon on the featured pricing card.
- Background `{colors.orange-500}`, text `{colors.on-primary}`, typography `{typography.caption-bold}`, rounded `{rounded.sm}`, padding `6px 12px`.

**`badge-neutral`** — "STANDARD" tier label.
- Background `{colors.surface-blue-soft}`, text `{colors.ink}`, typography `{typography.caption-bold}`, rounded `{rounded.sm}`, padding `6px 12px`.

**`tag-peach`** — "AFTER" role tag in career-growth cards.
- Background `{colors.peach-200}`, text `{colors.ink}`, typography `{typography.caption-bold}`, rounded `{rounded.sm}`, padding `4px 10px`.

**`tag-muted`** — "BEFORE" role tag, deliberately quieter than its AFTER counterpart.
- Background `{colors.surface-blue}`, text `{colors.steel}`, typography `{typography.caption-bold}`, rounded `{rounded.sm}`, padding `4px 10px`.

**`eyebrow-label`** — The small orange-square + label pattern that opens every section ("Overview", "Outcomes", "Curriculum", "Why choose us", "Testimonials", "Community", "Pricing", "Instructor").
- Bullet `{colors.orange-500}` (small filled square), label text `{colors.steel}` in `{typography.body-sm-medium}`. This is the page's most repeated structural signature — every major section is announced this way.

### Signature Components

**`hero-band-navy`** — Full-bleed hero.
- Background `{colors.navy-900}` washed with a faint navy wave/grid gradient mesh graphic (no photography).
- Layout: 4.8-star rating + review count, then the two-tone headline (`{typography.hero-display}`, "Agentic AI" in `{colors.on-dark}` / accent word in `{colors.sky-300}`), subtitle in `{colors.on-dark-muted}`, `button-white-on-navy` CTA, then an embedded video thumbnail below.

**`stat-cell-hero`** — Large numeral used for session counts, alumni counts and the headline price.
- Transparent background, `{typography.stat-display}` (Golos Text, 56px), color `{colors.on-dark}` on navy or `{colors.ink}` on light surfaces.

**`promo-banner-urgency`** — Persistent countdown strip pinned above the nav on every load.
- Background `{colors.peach-200}`, text `{colors.ink}`, typography `{typography.body-sm-medium}`, padding `{spacing.sm} {spacing.md}`. Carries a clock icon, "Save $X — ends in" copy, a live countdown, and a trailing chevron.

**`accordion-item`** — Curriculum phase row ("Phase 1: Foundation" … "Capstone: Demo Day").
- Background `{colors.canvas}`, rounded `{rounded.md}`, padding `{spacing.xl}`, border `1px solid {colors.hairline}`. Eyebrow ("Phase 1"), bold title, and a `+` expand affordance right-aligned.

**`footer-region`** — Navy footer beneath the contact CTA band.
- Background `{colors.navy-900}`, padding `{spacing.section} {spacing.xxl}`. Social icons (LinkedIn, YouTube, email) as outlined squares, platform badges (Substack, Maven), copyright line in `{typography.micro}` `{colors.on-dark-muted}`.

**`logo-wall-item`** — Alumni/partner company wordmark cell.
- Background transparent, text/mark rendered at native brand color, consistent height (~28–32px), evenly spaced in a horizontal row.

## Do's and Don'ts

### Do
- Reserve `{colors.orange-500}` for urgency and emphasis only — eyebrow bullets, pricing checkmarks, the "SPECIAL OFFER" ribbon
- Use `{colors.primary}` (cobalt blue) as the one true action color for every solid CTA, link and icon-chip
- Keep the icon-chip (blue square, white diagonal arrow) on every white "go somewhere" button — it's the system's recurring action affordance
- Alternate white and pale sky-tint (`{colors.surface-blue}` family) sections to create rhythm without borders
- Reserve the navy "featured" card treatment with orange-glow shadow for exactly one, highest-intent CTA per page
- Open every major section with the orange-square `eyebrow-label` pattern for scannability

### Don't
- Don't tint large surfaces with orange — it is an accent color, not a secondary brand color
- Don't apply the hero's two-tone gradient headline treatment anywhere outside the hero — it's a one-time signature move
- Don't drop the icon-chip from primary white buttons; a plain white pill with no chip reads as unstyled
- Don't add heavy shadows to standard cards — reserve elevation for avatars and the single featured pricing card
- Don't mix pill (`{rounded.full}`) and standard (`{rounded.md}`/`{rounded.lg}`) radii on the same component type — pills are for tags and the one secondary CTA only

## Responsive Behavior

### Breakpoints
| Name | Width | Key Changes |
|---|---|---|
| Mobile | < 480px | Single column throughout. Hero headline wraps to two lines (white line / accent line). Stat tiles and pricing cards stack 1-up. |
| Mobile (large) | 480 – 767px | Outcome cards remain single column; before/after cards scroll horizontally. |
| Tablet | 768 – 1023px | Outcome grid becomes 2-up. Overview stat row becomes 3-up. Comparison panels stack. |
| Desktop | 1024 – 1279px | Full multi-column layouts; pricing cards sit side by side. |
| Wide Desktop | ≥ 1280px | Full container width with maximum section padding. |

### Touch Targets
- Buttons render at ~44–48px effective height with generous horizontal padding
- Form inputs render at 44px height
- Icon-chip on white buttons stays a fixed ~30px square regardless of button length

### Collapsing Strategy
- **Promo banner** stays full-width and persists at every breakpoint, truncating countdown copy on the smallest screens
- **Nav** collapses to a hamburger menu below desktop width
- **Hero**: rating → two-tone headline → subtitle → CTA → video, all stacked at every breakpoint (already single-column on desktop)
- **Pricing tiers**: 2-column desktop → 1-column stacked mobile (standard tier first, featured tier second)
- **Stat row**: 3-column → stacked at narrow widths
- **Before/after cards**: horizontal scroll strip at all breakpoints rather than wrapping
- **Footer**: multi-column link/social layout collapses to a stacked single column on mobile

### Image Behavior
- Hero and featured-card backgrounds use a scalable vector wave/mesh graphic rather than a raster photo, so it stays crisp at any width
- Instructor and testimonial photos are circular and maintain aspect ratio across breakpoints
- Company logo wall wraps to additional rows on narrow viewports rather than shrinking below legibility

## Iteration Guide

1. Focus on ONE component at a time
2. Reference component names and tokens directly (`{colors.primary}`, `{component-name}-pressed`)
3. Run `npx @google/design.md lint DESIGN.md` after edits
4. Add new variants as separate `components:` entries
5. Default to `{typography.body-md}` for body and `{typography.subtitle}` for hero-adjacent emphasis. Hero headline uses `{typography.hero-display}` (Geist).
6. Keep `{colors.orange-500}` confined to eyebrow bullets, pricing checkmarks, and the "SPECIAL OFFER" ribbon — never a large surface
7. Cards use `{rounded.lg}` (12px), buttons use `{rounded.md}` (10px). Pills (`{rounded.full}`) reserved for tags and the one outline CTA.
8. Always pair a white "go somewhere" button with its icon-chip (`{colors.primary}` background, white arrow) — it's the page's recurring action affordance.

## Known Gaps

- Precise radius values were measured against a scaled Framer canvas and normalized visually against screenshots; treat the radius scale as accurate in proportion but approximate in raw pixels
- The pricing/comparison sections mount lazily on scroll, which limited direct DOM measurement for a few badge elements (`SPECIAL OFFER`, `STANDARD`); their colors and shape were confirmed visually via screenshot instead
- Hover and focus states were not observable through static inspection; disabled-state styling was not encountered anywhere on the page
- Dark-mode tokens are not applicable — the page has no light/dark toggle; navy is simply the brand's dominant surface
- Animation/transition timings were not extracted; the countdown timer, accordion expand, and section reveal-on-scroll all animate, but exact easing/duration were not measured — recommend 150–250ms ease as a starting point
- "Inter" and "General Sans" appear only in isolated instances (a handful of form labels/captions) and are treated as secondary, not primary, system fonts