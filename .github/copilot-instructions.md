# Copilot Instructions

## Product Intent
- The public API is the main product.
- The web frontend is a showcase and consumption layer for the API.
- Prioritize API reliability, consistency, and documentation quality over visual extras.

## Current Technology Stack
- API: Python 3.12+, FastAPI, Pydantic v2, Uvicorn.
- Astrology and geo stack: pyswisseph, geopy (Nominatim), timezonefinder.
- Web: SolidJS, Vite, TypeScript, Bun, Three.js.
- Runtime and delivery: Docker Compose, API container, static web container (Nginx).

## Architecture Pattern (Current)
- Monorepo with separate roots: api and web.
- Backend organized in simple layered modules:
  - routes for HTTP interface
  - schemas for request/response contracts
  - services for business logic (geocoding, timezone, astrology)
  - core for config and middleware
  - utils for shared helpers
- Keep modules cohesive and explicit. Avoid premature abstraction.

## Visual Pattern (Current)
- Cosmic procedural background with subtle motion and depth.
- Central glass card with strong readability and contrast.
- Elegant, minimal, modern UI, responsive first.
- Motion and effects must support content, never distract from data.

## Delivery Philosophy
- Keep it simple.
- Grow incrementally.
- Evolve in an organized, organic way.
- Preserve clean boundaries, explicit contracts, and maintainability.
- Prefer pragmatic decisions that deliver value quickly while keeping technical debt controlled.

## Performance and Security Priorities
- Validate all inputs strictly.
- Keep API payloads stable and predictable.
- Prefer low-overhead solutions before introducing heavy infra.
- Use timeouts and defensive error handling on external calls.
- Keep CORS, rate limiting, and environment-based config explicit and reviewable.

## Usage Limits and Free-Tier Constraints
- This is a free product and a public repository.
- Respect limits of public upstream providers (especially geocoding).
- Respect free-tier hosting limits (including Vercel) and avoid wasteful usage patterns.
- Always design with quota awareness:
  - limit request rates
  - reduce redundant calls
  - fail clearly when quotas are exceeded
  - preserve useful fallback paths (manual lat/lng/timezone)

## Implementation Guidelines for Future Changes
- API-first: add or evolve API contracts before frontend refinements.
- Keep backward compatibility whenever possible.
- Document important decisions in README and related docs when behavior changes.
- Add or update tests for every non-trivial behavior change.
- Do not introduce database, auth, billing, or complex infra unless explicitly requested.
