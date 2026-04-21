# Copilot Instructions - Astro Kovesh Web

## Product Focus
- This repository owns the web frontend for Astro Kovesh.
- UX quality, rendering performance, and API contract adherence are top priorities.
- Backend implementation details are out of scope unless needed for integration fixes.

## Stack
- SolidJS
- TypeScript
- Vite
- Bun
- Three.js / @tsparticles
- Vitest + Testing Library

## Architecture Rules
- Keep UI concerns in components/pages and avoid leaking HTTP details broadly.
- Centralize API calls and payload adaptation.
- Keep view models stable and resilient to expected API errors.

## Contract Discipline
- Read API base URL from `VITE_API_BASE_URL` only.
- Call versioned backend endpoints (`/v1/*`) only.
- Handle backend error contracts explicitly, including `503 astrology_engine_unavailable`.
- Do not hardcode environment-specific hostnames in source code.

## UI and Performance
- Favor accessible semantics and keyboard-friendly interactions.
- Keep expensive visual effects isolated and lazy where possible.
- Avoid unnecessary re-renders and heavy reactive chains.

## Quality Bar
- Add/update tests when changing business flow, API adapters, or critical UI states.
- Keep TypeScript strict and avoid `any` unless justified.
- Prefer small, composable utilities over duplicate logic.
