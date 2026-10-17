# Date România: web

The public site of Date România, a tracker of where Romanian public money goes.
Built with [TanStack Start](https://tanstack.com/start) (server rendering, Router,
Query) and [Radix Themes](https://www.radix-ui.com/themes) in a dark theme with an
indigo accent, following the Date România design system.

The site reads all its data from the
[date-romania-api](https://github.com/CristianPopa96/date-romania-api) back end.
Calls to the API run on the server (`src/lib/api.ts`), so the API address stays
internal.

## Run it

The easiest way is the full stack from the API repository, which starts the database,
storage, API and this site together:

```bash
git clone https://github.com/CristianPopa96/date-romania-api
git clone https://github.com/CristianPopa96/date-romania-web
cd date-romania-api
cp .env.example .env
docker compose up -d --build
```

Then open http://localhost:3000.

To work on the site alone, with the API running on port 8000:

```bash
pnpm install
pnpm dev          # http://localhost:3000, API_URL defaults to http://127.0.0.1:8000
```

## Pages

| Address             | What it shows                                                           |
| ------------------- | ----------------------------------------------------------------------- |
| `/`                 | Search box and the headline figures for direct purchases                |
| `/cautare?q=`       | Institutions and companies found by name or CUI                         |
| `/institutii/{cui}` | An institution as a buyer: totals, its suppliers, its purchases         |
| `/furnizori/{cui}`  | A company as a supplier: totals, the institutions it sold to, its sales |
| `/clasamente`       | The largest suppliers and institutions by accepted value                |

Paging and sorting live in the address (`?pagina=2&ordine=valoare`), so any view can be
shared as a link.

## Scripts

| Command          | What it does                       |
| ---------------- | ---------------------------------- |
| `pnpm dev`       | Development server with hot reload |
| `pnpm build`     | Production build into `.output/`   |
| `pnpm start`     | Run the production build           |
| `pnpm typecheck` | TypeScript check                   |
| `pnpm lint`      | ESLint                             |
| `pnpm test`      | Unit tests (vitest)                |
| `pnpm e2e`       | Browser tests (Playwright)         |
| `pnpm format`    | Prettier and ESLint fixes          |

## Tests

- **Unit tests** (`pnpm test`): vitest, next to the code as `src/**/*.test.ts`, for the
  logic in `src/lib/`.
- **Browser tests** (`pnpm build`, then `pnpm e2e`): Playwright opens the built site in
  Chromium. The first time, run `pnpm exec playwright install chromium`.

The site fetches from the server, so the browser tests cannot mock requests in the page.
They start a small stub API (`e2e/stub/server.mjs`) and point the site at it. The stub's
answers (`e2e/stub/answers.json`) are not written by hand: they are a copy of
`tests/fixtures/site_stub.json` in date-romania-api, which a test there keeps equal to
what the API answers. When that file changes, copy it here and run the browser tests. A
call with no saved answer gets a 501, so a page that starts asking for something new fails
instead of showing an empty state.

The types of the API's answers are not written by hand either. `openapi.json` is a copy
of `tests/fixtures/openapi.json` in date-romania-api, also kept equal to the API by a
test there; `pnpm generate-api-types` turns it into `src/lib/api-schema.gen.ts`, and
`src/lib/api*.ts` name the shapes they use from it. When the API's schema changes, copy
the file here and regenerate: a field renamed or removed is then a type error, not a
blank on a page. CI fails if the generated file does not match the copy.

## Configuration

| Variable  | Default                 | Meaning                          |
| --------- | ----------------------- | -------------------------------- |
| `API_URL` | `http://127.0.0.1:8000` | Where the server reaches the API |
| `PORT`    | `3000`                  | Port of the production server    |

## Conventions

- Interface text is Romanian, plain and in the second person singular. All of it lives in
  `src/i18n/ro.ts`; components read it with `useI18n()` and never hold text themselves.
  A second language is a file of the same shape and an entry in `src/i18n/index.ts`.
  Route paths stay Romanian in every language, and data is never translated.
- Numbers use Romanian format (`Intl.NumberFormat("ro-RO")`), dates `dd.mm.yyyy`. They are
  formatted by `f` from `useI18n()`, never typed into a message.
- Every figure shows its source. Gaps in public data are shown, not hidden.
- Theme settings live in one place, `src/routes/__root.tsx`.
- Server calls are in `src/lib/api.ts`, their query options in `src/lib/queries.ts`,
  number and date formats in `src/lib/format.ts`, shared pieces in `src/components/`.

## Licence

Code under [AGPL-3.0](LICENSE). Data served by the API is under CC BY 4.0.
