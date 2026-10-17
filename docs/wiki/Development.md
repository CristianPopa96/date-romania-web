# Development

## Commands

| Command                   | What it does                                                |
| ------------------------- | ----------------------------------------------------------- |
| `pnpm install`            | Install dependencies                                        |
| `pnpm dev`                | Development server with hot reload on http://localhost:3000 |
| `pnpm build`              | Production build into `.output/`                            |
| `pnpm start`              | Run the production build                                    |
| `pnpm typecheck`          | TypeScript check                                            |
| `pnpm lint`               | ESLint                                                      |
| `pnpm check`              | Prettier check                                              |
| `pnpm test`               | Unit tests (vitest)                                         |
| `pnpm e2e`                | Browser tests (Playwright), on the built site               |
| `pnpm format`             | Prettier and ESLint fixes                                   |
| `pnpm generate-routes`    | Regenerate `src/routeTree.gen.ts`                           |
| `pnpm generate-api-types` | Regenerate `src/lib/api-schema.gen.ts` from `openapi.json`  |

CI runs `typecheck`, `lint`, `check`, `test` and `build`, then the browser tests. Run
the same before calling work done.

## Tests

- **Unit tests**: vitest files next to the code, `src/**/*.test.ts`, for the logic in
  `src/lib/` and `src/i18n/`.
- **Browser tests**: `e2e/smoke.spec.ts`. Build first (`pnpm build`), then `pnpm e2e`.
  The first time, run `pnpm exec playwright install chromium`.

The site fetches on the server, so the browser tests cannot mock requests in the page.
They start a small stub API (`e2e/stub/server.mjs`) that serves `e2e/stub/answers.json`.
That file is never written by hand: it is a byte-for-byte copy of
`tests/fixtures/site_stub.json` in date-romania-api, which a test there keeps equal to
what the API really answers. A call with no saved answer gets a 501, so a page that
starts asking for something new fails instead of showing an empty state.

When the API's answers change on purpose, regenerate the file in the API repository
(`WRITE_SITE_STUB=1 uv run pytest tests/test_api_data.py`) and copy it here in the
site's pull request.

## Conventions

- Imports use the `#/` alias for `src/`.
- Prettier: no semicolons, single quotes, trailing commas.
- Filters and search terms are typed URL search parameters, parsed in `src/lib/urls.ts`.
- Text used on more than one page (site name, tagline, `pageTitle()`) lives in
  `src/lib/copy.ts`.
- Every figure shows its source. Gaps are shown in the two states of DataState,
  "Nepublicat" and "Încă necolectat", never as a dash, a zero or "necunoscut".

## Git and pull requests

- Every push to `main` runs CI and publishes the `latest` image to GitHub Container
  Registry (`ghcr.io/cristianpopa96/date-romania-web`). Work on a branch and open a
  pull request.
- A change that spans both repositories (a new endpoint and the page that uses it) is
  two pull requests, API first, each mentioning the other.
- Comments written by tools on pull requests go through the `pr-comment` workflow, so
  they appear as `github-actions[bot]`.

## This wiki

The pages of this wiki live in the repository under `docs/wiki/`. The **Wiki** workflow
(`.github/workflows/wiki.yml`) copies them to the GitHub wiki on every push to `main`
that changes them, so documentation is reviewed in pull requests like code. Edit the
files in `docs/wiki/`, not the wiki itself: a direct wiki edit is overwritten by the
next publish.
