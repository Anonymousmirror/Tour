# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A Chinese-language travel survey web app (Typeform-style immersive step-by-step questionnaire) built as a Next.js single-page application. Users answer 8 steps of travel preference questions, and the app generates a structured LLM prompt for AI travel planning.

## Commands

- `npm run dev` — Start dev server (localhost:3000)
- `npm run build` — Production build (may fail offline due to Google Fonts fetch)
- `npx tsc --noEmit` — Type-check without building (use this to verify code correctness when build fails due to network)

No test framework is configured. No linter is configured beyond `next lint`.

## Architecture

**Stack**: Next.js 16 App Router, TypeScript, Tailwind CSS v4, Framer Motion, Zustand, Lucide icons

**Key architectural decisions**:

- **Tailwind CSS v4** uses `@import "tailwindcss"` in globals.css and `@tailwindcss/postcss` plugin (not the legacy tailwind.config.js approach)
- **All components are client-side** ("use client") — this is a single-page app with no server-side data fetching
- **Dark glass-morphism theme** — all UI uses dark backgrounds (bg-white/5, border-white/10, text-white/80 etc.). Never use light theme colors
- **Chinese UI** — all user-facing text is in Chinese. Font stack: LXGW WenKai + Inter
- **Framer Motion typing**: use `ease: "easeOut" as const` to satisfy the `Easing` type

**State management** (`lib/store.ts`): Single Zustand store holds all survey data and navigation state. Steps 1-8 are survey pages, step 9 is the result page. The `toggleTag` helper manages multi-select tag arrays across different data sections using dynamic field access.

**Data flow**:
1. `lib/types.ts` — TypeScript interfaces for all survey data
2. `lib/survey-config.ts` — All option arrays and step config constants
3. `lib/store.ts` — Zustand store with actions for each data section
4. `components/survey/SurveyWizard.tsx` — Main orchestrator with AnimatePresence transitions, validation, and navigation
5. `components/survey/Step*.tsx` — Individual step components (8 total)
6. `lib/prompt-generator.ts` — Converts structured survey data into LLM prompt text
7. `components/result/ResultPage.tsx` — Displays generated prompt with copy functionality

**Reusable UI patterns**:
- `components/ui/TagSelector.tsx` — Core capsule tag component with spring animations, supports single/multi-select
- `components/ui/OtherNoteInput.tsx` — "Other" text input that persists to `data.otherNotes[key]` in the store
- The "其他（备注）" pattern: add "其他" to option arrays, show OtherNoteInput when selected, store notes via `setOtherNote(key, value)`

**Companion mutual exclusion** (`StepCompanion.tsx`): "一人" (solo) is exclusive — selecting it disables all other options and vice versa. Other companion types can be freely combined.

**Required field validation** (`SurveyWizard.tsx`): Steps 1 (basic info) and 2 (companion) have required fields. Validation runs on both "next" and "skip" actions.

## Path Aliases

`@/*` maps to project root (e.g., `@/lib/store`, `@/components/ui/TagSelector`)
