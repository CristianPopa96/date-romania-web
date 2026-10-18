# Date România: web

The public site of Date România, a tracker of where Romanian public money goes.
Built with [TanStack Start](https://tanstack.com/start) (server rendering, Router,
Query) and [Radix Themes](https://www.radix-ui.com/themes) in a dark theme with an
indigo accent, following the Date România design system.

What the platform does and how to read it, for anyone, is in the
[wiki](https://github.com/CristianPopa96/date-romania-web/wiki). This README is for
running and changing the code.

## How it fits together

```
 Public sources ──► Collectors (Python) ──► PostgreSQL + raw file store
                                                   │
                                                   ▼
                                      API (FastAPI, read-only JSON)
                                                   │  server to server
                                                   ▼
                                  Site (TanStack Start, this repository) ──► reader's browser
```

- [date-romania-api](https://github.com/CristianPopa96/date-romania-api) collects and
  links the data, owns the database and serves a public JSON API.
- This repository renders the pages. It never talks to the database: everything it shows
  comes from the API. Calls to the API run on the server (`src/lib/api.ts`), so the API
  address stays internal.

## Run it

### The whole stack

You need [Docker Desktop](https://www.docker.com/products/docker-desktop/) (or Docker
with Compose on Linux), [Git](https://git-scm.com/), and about 5 GB of disk (much more
once data is collected: the contract exports alone are 1.6 GB). Both repositories must
sit side by side in the same folder:

```bash
git clone https://github.com/CristianPopa96/date-romania-api
git clone https://github.com/CristianPopa96/date-romania-web
cd date-romania-api
cp .env.example .env        # on Windows PowerShell: Copy-Item .env.example .env
```

Change the two passwords in `.env` (`POSTGRES_PASSWORD` and `S3_SECRET_KEY`, and the
password inside `DATABASE_URL` to match). Then:

```bash
docker compose up -d --build postgres s3 api web
```

This starts the database and the file storage, applies the migrations, then the API and
the site. Check it:

- http://localhost:3000: the site.
- http://localhost:8000/docs: the API, with every endpoint documented.
- `curl localhost:8000/v1/health` (on Windows `curl.exe 127.0.0.1:8000/v1/health`)
  answers `"status": "ok"`.

A fresh install has **no data**: pages are empty until the collectors fill the database
(see the API README).

> **About the scheduler.** `docker compose up -d` with no service names also starts
> `scheduler`, which collects every day missed so far. While the dataset is frozen,
> bring services up by name as above.

`docker compose down` stops everything and keeps the data; `docker compose down -v` also
**deletes the database and every stored file**.

### The site alone

With the API running on port 8000, and [Node.js](https://nodejs.org/) 22+ and
[pnpm](https://pnpm.io/):

```bash
pnpm install
pnpm dev          # http://localhost:3000, API_URL defaults to http://127.0.0.1:8000
```

### Share the local site

There is no domain yet. A free Cloudflare quick tunnel gives the local site a temporary
public address without opening ports:

```bash
cloudflared tunnel --url http://localhost:3000
```

### Windows notes

- Use `127.0.0.1` rather than `localhost` for the database and storage: Docker publishes
  ports on IPv4 only, and `localhost` tries IPv6 first and stalls.
- Use `curl.exe`, not the `curl` alias of PowerShell.
- Keep files that run inside containers (`infra/crontab`, `Dockerfile`) with LF line
  endings: `git config core.autocrlf input`.

## Configuration

| Variable  | Default                 | Meaning                          |
| --------- | ----------------------- | -------------------------------- |
| `API_URL` | `http://127.0.0.1:8000` | Where the server reaches the API |
| `PORT`    | `3000`                  | Port of the production server    |

## Technology

| Piece         | Choice                                                     | Why                                                                                                                          |
| ------------- | ---------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| Framework     | [TanStack Start](https://tanstack.com/start) (React, Vite) | Pages are rendered on the server, so they open fast on a phone, show a preview when shared and are indexed by search engines |
| Routing       | TanStack Router, file-based                                | Typed routes and typed search parameters: filters live in the address, so every view can be shared                           |
| Data fetching | TanStack Query                                             | Route loaders prefetch on the server, so pages arrive filled in                                                              |
| Components    | [Radix Themes](https://www.radix-ui.com/themes) 3          | The design system is defined on Radix Themes one to one                                                                      |
| Icons         | `@radix-ui/react-icons`                                    | Always paired with a text label                                                                                              |
| Charts        | Plain SVG and CSS on Radix tokens                          | No chart library needed yet                                                                                                  |
| Language      | TypeScript, strict                                         |                                                                                                                              |

## How a page gets its data

1. A route file in `src/routes/` declares a `loader`.
2. The loader calls `context.queryClient.ensureQueryData(...)` with query options from
   `src/lib/queries.ts`.
3. Each query calls a server function (`createServerFn`) in `src/lib/api.ts` or its
   companions (`api-budget.ts`, `api-contracts.ts`, `api-patterns.ts`, `api-places.ts`,
   `api-programme.ts`, `api-reports.ts`). These run **on the server**, call the API at
   `API_URL` and return the answer, typed from the API's own schema
   (`src/lib/api-schema.gen.ts`).
4. The component reads it with `useSuspenseQuery`.

The browser never reaches the API, so there is no CORS to configure. The CSV exports
(`/contracte.csv`, `/tipare.csv`) work the same way: a server route fetches the file
from the API and passes it on. The error report form posts through a server function
that forwards the reader's address in `X-Forwarded-For`, which the API turns into a
keyed hash for its rate limit.

## Routes

| File in `src/routes/`                      | Address                                                                |
| ------------------------------------------ | ---------------------------------------------------------------------- |
| `index.tsx`                                | `/`                                                                    |
| `cautare.tsx`                              | `/cautare?q=`                                                          |
| `institutii.$cui.tsx`                      | `/institutii/{cui}`                                                    |
| `furnizori.$cui.tsx`                       | `/furnizori/{cui}`                                                     |
| `contracte.$id.tsx`                        | `/contracte/{id}`                                                      |
| `achizitii-directe.$id.tsx`                | `/achizitii-directe/{id}`                                              |
| `clasamente.tsx`                           | `/clasamente?clasament=&castigate=&cpv=&ue=`                           |
| `programe.index.tsx`                       | `/programe` (redirects to the one programme held)                      |
| `programe.anghel-saligny.index.tsx`        | `/programe/anghel-saligny`                                             |
| `programe.anghel-saligny.proiecte.$id.tsx` | `/programe/anghel-saligny/proiecte/{id}`                               |
| `localitati.index.tsx`                     | `/localitati`: the 42 counties                                         |
| `localitati.$judet.index.tsx`              | `/localitati/{judet}`, e.g. `/localitati/alba`                         |
| `localitati.$judet.$uat.tsx`               | `/localitati/{judet}/{uat}?sat=`, e.g. `/localitati/alba/comuna-albac` |
| `surse.tsx`                                | `/surse?fila=&despre=`                                                 |
| `contracte[.]csv.ts`                       | `/contracte.csv` (`?institutie=` or `?furnizor=` for one CUI)          |
| `tipare[.]csv.ts`                          | `/tipare.csv`                                                          |
| `__root.tsx`                               | The shell: theme, top bar, footer                                      |

Paging, sorting, tabs and filters are typed search parameters parsed in
`src/lib/urls.ts` (`?lista=achizitii&pagina=2&ordine=valoare`), so a shared address
always means the same view. The institution and supplier pages share one route factory,
`src/lib/entity-route.tsx`. `src/routeTree.gen.ts` (from the dev server or
`pnpm generate-routes`) and `src/lib/api-schema.gen.ts` (from `pnpm generate-api-types`)
are generated: never edit them by hand.

## Code layout

```
src/
  routes/       one file per page or file download
  components/   the pieces pages are built from (EntityView, NoticeView, TraceChain,
                GapPanel, SourceLine, Rankings, Patterns, ReportForm…)
  lib/          logic with unit tests: API calls, queries, formats, URLs, money and
                programme rules as the site needs them
  i18n/         every piece of interface text
  styles.css
e2e/            browser tests and the stub API they run against
docs/wiki/      the wiki pages, published by the Wiki workflow
```

Keep logic out of components and in `src/lib/`, where it is unit tested. Modules,
components and routes stay under about 300 lines; tests, generated files and the i18n
dictionaries are exempt.

## Scripts

| Command                   | What it does                                                |
| ------------------------- | ----------------------------------------------------------- |
| `pnpm install`            | Install dependencies                                        |
| `pnpm dev`                | Development server with hot reload on http://localhost:3000 |
| `pnpm build`              | Production build into `.output/`                            |
| `pnpm start`              | Run the production build                                    |
| `pnpm typecheck`          | TypeScript check                                            |
| `pnpm lint`               | ESLint                                                      |
| `pnpm check`              | Prettier check (also covers the wiki's Markdown)            |
| `pnpm test`               | Unit tests (vitest)                                         |
| `pnpm e2e`                | Browser tests (Playwright), on the built site               |
| `pnpm format`             | Prettier and ESLint fixes                                   |
| `pnpm generate-routes`    | Regenerate `src/routeTree.gen.ts`                           |
| `pnpm generate-api-types` | Regenerate `src/lib/api-schema.gen.ts` from `openapi.json`  |

CI runs `typecheck`, `lint`, `check`, `test` and `build`, then the browser tests. Run the
same before calling work done.

## Tests

- **Unit tests** (`pnpm test`): vitest, next to the code as `src/**/*.test.ts`, for the
  logic in `src/lib/` and `src/i18n/`.
- **Browser tests** (`pnpm build`, then `pnpm e2e`): Playwright opens the built site in
  Chromium. The first time, run `pnpm exec playwright install chromium`.

The site fetches from the server, so the browser tests cannot mock requests in the page.
They start a small stub API (`e2e/stub/server.mjs`) and point the site at it. The stub's
answers (`e2e/stub/answers.json`) are not written by hand: they are a copy of
`tests/fixtures/site_stub.json` in date-romania-api, which a test there keeps equal to
what the API answers (regenerate it there with
`WRITE_SITE_STUB=1 uv run pytest tests/test_api_data.py`). When that file changes, copy
it here and run the browser tests. A call with no saved answer gets a 501, so a page that
starts asking for something new fails instead of showing an empty state.

The types of the API's answers are not written by hand either. `openapi.json` is a copy
of `tests/fixtures/openapi.json` in date-romania-api, also kept equal to the API by a
test there; `pnpm generate-api-types` turns it into `src/lib/api-schema.gen.ts`, and
`src/lib/api*.ts` name the shapes they use from it. When the API's schema changes, copy
the file here and regenerate: a field renamed or removed is then a type error, not a
blank on a page. CI fails if the generated file does not match the copy.

## Conventions

- Interface text is Romanian, plain and in the second person singular, sentence case, no
  exclamation marks or emoji; facts, never accusations. All of it lives in
  `src/i18n/ro.ts` and its companions (`ro-budget.ts`, `ro-places.ts`,
  `ro-programme.ts`, `ro-rankings.ts`); components read it with `useI18n()` and never
  hold text themselves. A second language is a file of the same shape (`Messages`) and
  an entry in `src/i18n/index.ts`; a missing or extra message fails the type check.
  Route paths stay Romanian in every language, and data is never translated.
- Numbers use Romanian format (`Intl.NumberFormat("ro-RO")`), dates `dd.mm.yyyy`. They are
  formatted by `f` from `useI18n()`, never typed into a message.
- Text used on more than one page (site name, tagline, `pageTitle()`) lives in
  `src/lib/copy.ts`.
- Every figure shows its source. Gaps are shown in the two states of DataState,
  "Nepublicat" and "Încă necolectat", never as a dash, a zero or "necunoscut".
- Imports use the `#/` alias for `src/`. Prettier: no semicolons, single quotes, trailing
  commas.
- Server calls are in `src/lib/api.ts`, their query options in `src/lib/queries.ts`,
  number and date formats in `src/lib/format.ts`, shared pieces in `src/components/`.

## Design

The site follows the Date România design system, built on Radix Themes. The theme is set
once, in `src/routes/__root.tsx`:

```tsx
<Theme appearance="dark" accentColor="indigo" grayColor="slate"
       radius="medium" scaling="100%" panelBackground="solid">
```

- Dark theme only, no switch. Use Radix tokens, never hard-coded colours.
- Indigo marks the one main action, links and selected states.
- Green, amber and red carry states only (link confidence, process state).
- Patterns built as our own components: ConfidenceBadge, MoneyFigure (`Figure`),
  SourceLink (`SourceLine` with its panel), GapPanel, DataState, TraceChain, BarList,
  TopBar.
- Each page is built from its screen in the design system, not from memory.

## Git and pull requests

- Every push to `main` runs CI and publishes the `latest` image to GitHub Container
  Registry (`ghcr.io/cristianpopa96/date-romania-web`). Work on a branch and open a pull
  request.
- A change that spans both repositories (a new endpoint and the page that uses it) is
  two pull requests, API first, each mentioning the other.
- Comments written by tools on pull requests go through the `pr-comment` workflow, so
  they appear as `github-actions[bot]`.

## The wiki

The wiki is written for readers who are not developers: what the platform is, what it
can answer and how to read its figures. Technical material belongs in this README. Its
pages live under `docs/wiki/`; the **Wiki** workflow (`.github/workflows/wiki.yml`)
copies them to the GitHub wiki on every push to `main` that changes them, and deletes
pages removed here. Edit the files in `docs/wiki/`, not the wiki itself: a direct wiki
edit is overwritten by the next publish.

## Licence

Code under [AGPL-3.0](LICENSE). Data served by the API is under CC BY 4.0.
