# Two-anchor color theming — design philosophy & replication guide

This document describes how we themed BridgeFlow (and how agents can repeat the same approach on other sites) when **two colors** are provided: a **tint/wash** and an **ink/anchor**.

## Core idea

Treat the two user-provided colors as a **paired system**, not isolated picks:

1. **Tint / wash** — Usually the lighter, more chromatic color (e.g. `#c8aff0`). Used for atmosphere: page background, soft fills, gradients, and the “brand glow.”
2. **Ink / anchor** — Usually the darker, more saturated color (e.g. `#682760`). Used for **text emphasis**, primary actions when the canvas is the tint, borders that must read clearly, and depth.

Everything else is **derived**: mauve/lilac intermediates, desaturated neutrals that stay **in the same hue family** (avoid generic gray), and **semantic colors** (success/warning/error) shifted so they don’t fight the palette.

## Principles

- **Cohesion over novelty** — One conceptual family (lavender → plum → mauve), not unrelated accent colors.
- **Layered light UI** — Background is the wash; **cards/panels/chips** are **lighter or slightly different steps** so UI still has depth when the page is already colorful.
- **Contrast rules** — When the **page background equals the tint** (`#c8aff0`), **filled CTAs cannot use the same fill** as the page, or buttons disappear. **Flip**: use the **ink** color for filled buttons and light foreground text.
- **Borders as “half-steps”** — Dividers are **darker than the wash** but still in-family (lilac/plum-tinted), not neutral `#ccc`.
- **Shadows carry hue** — Use `rgba` of the **ink** RGB with modest alpha so shadows feel part of the theme, not default black.
- **Scope discipline** — **Colors only**; layout, spacing, and structure unchanged. Map UI to **semantic tokens**, not raw hex in components.

## Token model (implementation shape)

Define **`:root` CSS variables** first, then map them in **Tailwind v4 `@theme inline`** as `--color-*` so utilities like `bg-background`, `border-line`, `text-primary-darker` exist.

### Minimum semantic groups

| Role | Purpose |
|------|--------|
| `--background` | Page wash (often = brand tint) |
| `--foreground` | Primary body text (dark, often ink-tinted, not pure `#000`) |
| `--muted`, `--muted-foreground`, `--subtle` | Secondary copy; biased toward the same hue family |
| `--line`, `--line-2` | Borders/dividers; visible on `--background` |
| `--panel`, `--panel-2`, `--panel-3`, `--surface-inset` | Stacked surfaces; inset fields slightly different from panels |
| `--primary` … `--primary-deep` | Ramp between tint → ink for brand UI |
| `--accent*` | Optional second chromatic axis (e.g. mauve/rose) still related to the two anchors |
| `--cta`, `--cta-foreground`, `--cta-strong*` | **Primary actions**; when bg ≈ tint, **cta = ink** |
| `--success*`, `--warning*`, `--error*` | Harmonized, not default Material green/red |
| `--shadow*` | Tinted shadows using ink RGB |

## Derivation recipe for any two colors

Given **Tint `T`** and **Ink `I`**:

1. **Background** — Often `T` (or a slightly desaturated/lightened variant if `T` is too strong).
2. **Foreground** — Dark mix: start from `I`, optionally blend toward neutral for long-form reading; keep **warm/cool** consistent with the pair.
3. **Muted text** — Desaturate `I` or mix `I` with gray at **low** neutral share so it stays on-brand.
4. **Borders** — Interpolate between `T` and `I` (or darken `T`) until contrast is sufficient on `background`.
5. **Panels** — Lighter than `T` toward white, or toward a very pale tint of `T`, so blocks “float.”
6. **CTA** — If `background === T` (or very close), set **`cta = I`**, **`cta-foreground` = near-white or very light tint**.
7. **Gradients (decorative)** — Use `T`, a mid mix between `T` and `I`, and `I`; avoid unrelated hues unless they’re part of the brand story.

## Replication checklist for another codebase

1. Inventory hardcoded colors in **pages/components** (grep for `#` and `rgb`).
2. Replace with **semantic classes** (`border-line`, `bg-panel-2`, `text-muted-foreground`, etc.).
3. Keep **one** `:root` file as source of truth; avoid scattering hex in JSX.
4. After changing **`--background`**, **re-validate**: borders, muted text, and **button fill vs background** (visibility).
5. Run **contrast checks** on foreground vs background and on CTA text vs CTA fill.

## Pitfall to name explicitly

**“Brand color as background + same brand color as button”** — fails visually. Rule: **either** change the button to **Ink**, **or** use outline/ghost buttons with ink border/text.

## Reference in this repo

- Implementation lives in `src/app/globals.css` (`:root` + `@theme inline`).
- UI wired to tokens in `src/app/page.tsx` (semantic Tailwind classes, no layout changes for theming).
