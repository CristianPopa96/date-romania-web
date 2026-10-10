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
pnpm dev          # http://localhost:3000, API_URL defaults to http://localhost:8000
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
| `pnpm format`    | Prettier and ESLint fixes          |

## Configuration

| Variable  | Default                 | Meaning                          |
| --------- | ----------------------- | -------------------------------- |
| `API_URL` | `http://localhost:8000` | Where the server reaches the API |
| `PORT`    | `3000`                  | Port of the production server    |

## Conventions

- Interface text is Romanian, plain and in the second person singular.
- Numbers use Romanian format (`Intl.NumberFormat("ro-RO")`), dates `dd.mm.yyyy`.
- Every figure shows its source. Gaps in public data are shown, not hidden.
- Theme settings live in one place, `src/routes/__root.tsx`.
- Server calls are in `src/lib/api.ts`, their query options in `src/lib/queries.ts`,
  number and date formats in `src/lib/format.ts`, shared pieces in `src/components/`.

## Licence

Code under [AGPL-3.0](LICENSE). Data served by the API is under CC BY 4.0.
