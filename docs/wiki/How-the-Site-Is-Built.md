# How the site is built

## The platform in three parts

```
 Public sources ──► Collectors (Python) ──► PostgreSQL + raw file store
                                                   │
                                                   ▼
                                      API (FastAPI, read-only JSON)
                                                   │  server to server
                                                   ▼
                                  Site (TanStack Start, this repository) ──► reader's browser
```

- **date-romania-api** collects and links the data, owns the database, and serves a
  public JSON API. See its [wiki](https://github.com/CristianPopa96/date-romania-api/wiki).
- **date-romania-web** (this repository) renders the pages. It never talks to the
  database: everything it shows comes from the API.

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
3. Each query calls a server function (`createServerFn`) in `src/lib/api.ts` (and its
   companions `api-contracts.ts`, `api-patterns.ts`, `api-programme.ts`,
   `api-reports.ts`). These run **on the server**, call the API at `API_URL`, and return
   the answer. Its shape is a type generated from the API's own schema
   (`src/lib/api-schema.gen.ts`, from `openapi.json`), never one written by hand.
4. The component reads it with `useSuspenseQuery`.

Because the API is called only from the server, the browser never needs to reach it,
there is no CORS to configure, and the API address stays internal. The CSV exports
(`/contracte.csv`, `/tipare.csv`) work the same way: a server route fetches the file
from the API and passes it on.

The error report form posts through a server function too; it forwards the reader's
address to the API in `X-Forwarded-For`, which the API turns into a keyed hash for its
rate limit.

## Routes

| File in `src/routes/`                      | Address                                           |
| ------------------------------------------ | ------------------------------------------------- |
| `index.tsx`                                | `/`                                               |
| `cautare.tsx`                              | `/cautare?q=`                                     |
| `institutii.$cui.tsx`                      | `/institutii/{cui}`                               |
| `furnizori.$cui.tsx`                       | `/furnizori/{cui}`                                |
| `contracte.$id.tsx`                        | `/contracte/{id}`                                 |
| `achizitii-directe.$id.tsx`                | `/achizitii-directe/{id}`                         |
| `clasamente.tsx`                           | `/clasamente?clasament=&castigate=&cpv=&ue=`      |
| `programe.index.tsx`                       | `/programe` (redirects to the one programme held) |
| `programe.anghel-saligny.index.tsx`        | `/programe/anghel-saligny`                        |
| `programe.anghel-saligny.proiecte.$id.tsx` | `/programe/anghel-saligny/proiecte/{id}`          |
| `surse.tsx`                                | `/surse?fila=&despre=`                            |
| `contracte[.]csv.ts`                       | `/contracte.csv`                                  |
| `tipare[.]csv.ts`                          | `/tipare.csv`                                     |
| `__root.tsx`                               | The shell: theme, top bar, footer                 |

`src/routeTree.gen.ts` is generated by the dev server or `pnpm generate-routes`, and
`src/lib/api-schema.gen.ts` by `pnpm generate-api-types`. Never edit either by hand.
The institution and supplier pages share one route factory, `src/lib/entity-route.tsx`.

Search parameters (page, sort, tab, filters) are parsed and validated in
`src/lib/urls.ts`, so a shared address always means the same view.

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
```

Keep logic out of components and in `src/lib/`, where it is unit tested. Modules,
components and routes stay under about 300 lines; tests, generated files and the i18n
dictionaries are exempt.

## Text and languages

- All interface text lives in `src/i18n/ro.ts` (with `ro-programme.ts`,
  `ro-rankings.ts`). Components read it with `useI18n()` and never hold text themselves.
- A second language is a file with the same shape (`Messages`) and an entry in
  `src/i18n/index.ts`; a missing or extra message fails the type check.
- Numbers, amounts and dates are formatted by `f` from `useI18n()`
  (`Intl.NumberFormat('ro-RO')`, `dd.mm.yyyy`), never typed into a message.
- Route paths stay Romanian in every language, and data (names, titles, CPV names) is
  never translated.
- The writing rules: plain Romanian, second person singular, sentence case, no
  exclamation marks, no emoji; facts, never accusations.

## Design

The site follows the Date România design system, built on Radix Themes. The theme is
set once, in `src/routes/__root.tsx`:

```tsx
<Theme appearance="dark" accentColor="indigo" grayColor="slate"
       radius="medium" scaling="100%" panelBackground="solid">
```

- Dark theme only, no switch. Use Radix tokens, never hard-coded colours.
- Indigo marks the one main action, links and selected states.
- Green, amber and red carry states only (link confidence, process state).
- Patterns built as our own components: ConfidenceBadge (match badges), MoneyFigure
  (`Figure`), SourceLink (`SourceLine` with its panel), GapPanel, DataState (the two
  kinds of missing), TraceChain, BarList, TopBar.
- Each page is built from its screen in the design system, not from memory.
