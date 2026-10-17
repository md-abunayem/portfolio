# Md. Abu Nayem — Portfolio

> Full-Stack Developer building thoughtful, reliable web applications.

[![Live portfolio](https://img.shields.io/badge/Live%20portfolio-Visit-6d4aff?style=for-the-badge)](https://portfolio-swart-five-ib8p44o8f9.vercel.app/)

This repository contains my personal portfolio: a responsive website for sharing
my background, selected projects, experience, education, recognition, research,
and contact details. Its content is served by a separate API and can be managed
through a protected admin interface.

## Contents

- [About](#about)
- [Portfolio preview](#portfolio-preview)
- [Portfolio sections and features](#portfolio-sections-and-features)
- [Featured project](#featured-project)
- [Technology stack](#technology-stack)
- [Architecture](#architecture)
- [Run locally](#run-locally)
- [Environment variables](#environment-variables)
- [Deployment](#deployment)
- [Contact](#contact)
- [License](#license)

## About

I’m **Md. Abu Nayem**, a Computer Science and Engineering graduate and
Full-Stack Developer specializing in **Next.js, React, Node.js, Express.js**,
and modern web technologies. I’m interested in building useful products with
maintainable frontend and backend systems.

## Portfolio preview

[Open the live portfolio](https://portfolio-swart-five-ib8p44o8f9.vercel.app/).
The repository does not currently include screenshots; the live site is the
available preview.

## Portfolio sections and features

- Profile, biography, and resume link
- Experience, education, and grouped skills
- Published project cards and individual project pages
- Awards, certifications, and research collections with image detail pages
- Contact form backed by the public API
- Responsive layouts, dark/light theme support, and motion effects
- Protected admin sign-in and management of portfolio content and Cloudinary
  images

## Featured project

### [Streamly](https://streamly-jjg7.onrender.com)

A full-stack video platform for creators and viewers to upload, discover, and
manage content, with engagement features including comments, likes,
subscriptions, and playlists.

- [Source code](https://github.com/md-abunayem/Streamly-Video-Streaming-Platform)
- [Live application](https://streamly-jjg7.onrender.com)

## Technology stack

| Area | Technologies |
| --- | --- |
| Frontend | Next.js App Router, React, TypeScript, Tailwind CSS |
| UI and validation | Framer Motion, Lucide React, Zod |
| Backend | Node.js, Express, TypeScript, REST API |
| Database and ORM | PostgreSQL, Prisma, `pg` driver |
| Image storage | Cloudinary |
| Hosting | Vercel (frontend), Render (backend) |

## Architecture

```text
Browser
  └── Next.js frontend (Vercel)
        ├── Server-rendered portfolio pages ──> Express REST API (Render)
        └── /api requests ────────────────────> Express REST API (Render)
                                                    ├── PostgreSQL via Prisma
                                                    └── Cloudinary image storage
```

The frontend reads published portfolio content from the API and submits contact
messages through it. The Express service exposes public content endpoints and
protected admin endpoints. PostgreSQL stores portfolio records and image
metadata; uploaded image files are stored in Cloudinary.

## Run locally

Prerequisites: Node.js, npm, and a PostgreSQL database. Cloudinary credentials
are required for image uploads.

### 1. Start the backend

```powershell
cd server
npm ci
Copy-Item .env.example .env
```

Set `DATABASE_URL` in `server/.env` to your local PostgreSQL connection string,
then apply migrations and start the API:

```powershell
npm run db:deploy
npm run dev
```

The API defaults to `http://localhost:5000`.

To create or reset the admin account, set `ADMIN_EMAIL` and an
`ADMIN_PASSWORD` of at least 12 characters in `server/.env`, then run:

```powershell
npm run seed:admin
```

### 2. Start the frontend

In a second terminal:

```powershell
cd client
npm ci
Copy-Item .env.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The frontend's local API
default is `http://localhost:5000`; configure `API_BASE_URL` if the backend is
running elsewhere.

### Checks

Run from the relevant application directory:

```sh
# client/
npm run lint
npm run typecheck
npm run build

# server/
npm test
npm run build
```

## Environment variables

Use the example files as templates: [`client/.env.example`](client/.env.example)
and [`server/.env.example`](server/.env.example). Replace placeholders in your
local environment; never commit credentials.

| Variable | Application | Purpose / safe example |
| --- | --- | --- |
| `API_BASE_URL` | Client | Express origin; local example: `http://localhost:5000`. In production, use the Render service origin without `/api/v1`. |
| `NEXT_PUBLIC_API_BASE_URL` | Client (legacy) | Public API origin accepted for compatibility; `https://api.example.com` is a placeholder. Prefer `API_BASE_URL`. |
| `NEXT_PUBLIC_SITE_URL` | Client | Absolute site URL used to generate sitemap URLs; local example: `http://localhost:3000`. |
| `DATABASE_URL` | Server | PostgreSQL connection string; example: `postgresql://portfolio_user:replace-me@localhost:5432/portfolio?schema=public`. |
| `PORT` | Server | HTTP port; local default: `5000`. |
| `NODE_ENV` | Server | Runtime mode; local example: `development`. |
| `CLIENT_ORIGINS` | Server | Comma-separated allowed browser origins; local example: `http://localhost:3000`. |
| `COOKIE_SAME_SITE` | Server | Session cookie policy: `lax`, `strict`, or `none`. |
| `ADMIN_NAME` | Server seed | Optional display name; example: `Portfolio Admin`. |
| `ADMIN_EMAIL` | Server seed | Admin login email; use an address you control. |
| `ADMIN_PASSWORD` | Server seed | Admin password, at least 12 characters; provide a private unique value. |
| `CLOUDINARY_CLOUD_NAME` | Server | Cloudinary account cloud name; use a placeholder locally until configured. |
| `CLOUDINARY_API_KEY` | Server | Cloudinary API key; keep private. |
| `CLOUDINARY_API_SECRET` | Server | Cloudinary API secret; keep private and never expose it to the client. |

Do not put database credentials, admin passwords, or Cloudinary secrets in any
`NEXT_PUBLIC_` variable.

## Deployment

- **Frontend:** [Vercel](https://portfolio-swart-five-ib8p44o8f9.vercel.app/).
  Set `API_BASE_URL` to the Render backend origin for Production and any Preview
  environments, and set `NEXT_PUBLIC_SITE_URL` to the public site URL to
  generate sitemap entries. Redeploy after changing environment variables.
- **Backend:** [Render API health](https://portfolio-backend-caq7.onrender.com/api/health).
  Configure its PostgreSQL `DATABASE_URL`, Cloudinary credentials, and
  `CLIENT_ORIGINS` with the frontend's Vercel origin. Use `server/` as the
  service root, with `npm ci --include=dev && npm run build` as the build command
  and `npm start` as the start command. Apply database migrations with
  `npm run db:deploy` from `server/` when deploying schema changes.

## Contact

- [GitHub](https://github.com/md-abunayem)
- [LinkedIn](https://linkedin.com/in/md-abunayem)
- [Portfolio](https://portfolio-swart-five-ib8p44o8f9.vercel.app/)

## License

There is no repository-level `LICENSE` file, so reuse and distribution terms
are currently unspecified.
