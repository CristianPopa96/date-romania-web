# Setting up

You can run the whole platform (database, storage, API and this site) on one computer.
No programming is needed for this part, only Docker.

## What you need

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (Windows, macOS) or
  Docker with Compose (Linux).
- [Git](https://git-scm.com/), to download the code.
- About 5 GB free disk space for the images and a small database; much more once data
  is collected (the contract exports alone are 1.6 GB).

## Run everything

Both repositories must sit side by side in the same folder:

```bash
git clone https://github.com/CristianPopa96/date-romania-api
git clone https://github.com/CristianPopa96/date-romania-web
cd date-romania-api
cp .env.example .env        # on Windows PowerShell: Copy-Item .env.example .env
```

Open `.env` in a text editor and change the two passwords (`POSTGRES_PASSWORD` and
`S3_SECRET_KEY`, and the password inside `DATABASE_URL` to match). Then:

```bash
docker compose up -d --build postgres s3 api web
```

This starts the database and the file storage, applies the database setup, then starts
the API and the site. The scheduler (which collects data every day) is left out on purpose:
see the note below.

Check that it works:

- http://localhost:3000: the site.
- http://localhost:8000/docs: the API, with every endpoint documented.
- `curl localhost:8000/v1/health` (on Windows `curl.exe 127.0.0.1:8000/v1/health`)
  answers `"status": "ok"`.

A fresh install has **no data**. The site opens, but its pages are empty until the
collectors fill the database. Collecting is described in the API wiki:
[Collecting data](https://github.com/CristianPopa96/date-romania-api/wiki/Collecting-Data).

> **About the scheduler.** `docker compose up -d` with no service names also starts
> `scheduler`, which collects every day missed so far. While the dataset is frozen,
> bring services up by name as above.

## Stop it

```bash
docker compose down        # stops everything, keeps the data
```

`docker compose down -v` also **deletes the database and every stored file**. Only use
it when you mean to start over.

## Run only the site

If the API already runs on port 8000 (from the stack above, or elsewhere), you can run
the site alone for development. You need [Node.js](https://nodejs.org/) 22 or later and
[pnpm](https://pnpm.io/):

```bash
cd date-romania-web
pnpm install
pnpm dev            # http://localhost:3000
```

| Setting   | Default                 | Meaning                                 |
| --------- | ----------------------- | --------------------------------------- |
| `API_URL` | `http://127.0.0.1:8000` | Where the site's server reaches the API |
| `PORT`    | `3000`                  | Port of the production server           |

## Share the local site

There is no domain yet. A free Cloudflare quick tunnel gives the local site a temporary
public address without opening ports on your computer:

```bash
cloudflared tunnel --url http://localhost:3000
```

## Windows notes

- Use `127.0.0.1` rather than `localhost` for the database and storage: Docker publishes
  ports on IPv4 only, and `localhost` tries IPv6 first and stalls.
- Use `curl.exe`, not the `curl` alias of PowerShell.
- Keep the files that run inside containers (`infra/crontab`, `Dockerfile`) with LF line
  endings: `git config core.autocrlf input`.
