# Portfolio API

Express 5, TypeScript, PostgreSQL, and Prisma 7 API for the portfolio and its administrator dashboard.

## Local setup

1. Copy `.env.example` to `.env` and set `DATABASE_URL` to a PostgreSQL database URL.
2. Set `CLIENT_ORIGINS` to the exact comma-separated browser origins allowed to call the API.
3. Set `ADMIN_EMAIL` and a unique `ADMIN_PASSWORD` of at least 12 characters. `ADMIN_NAME` is optional and defaults to `Portfolio Admin` when creating the account.
4. Set `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, and `CLOUDINARY_API_SECRET` to enable image uploads.
5. Install dependencies with `npm install`.
6. Apply committed migrations with `npm run db:deploy`.
7. Create or update the configured administrator with `npm run seed:admin`. Rerunning this command resets that account's password from `.env` and revokes its existing sessions.
8. Start the development API with `npm run dev`; it listens on port `5000` unless `PORT` is set.

`PORT` defaults to `5000`, `NODE_ENV` defaults to `development`, `CLIENT_ORIGINS` defaults to `http://localhost:3000,http://localhost:5173`, and `COOKIE_SAME_SITE` defaults to `lax`. `DATABASE_URL` is required. In production, set `NODE_ENV=production`, configure the real frontend origin(s), and serve the API over HTTPS. Use `COOKIE_SAME_SITE=none` only when the frontend and API are cross-site; it also requires HTTPS.

The administrator session lasts seven days. Its random token is sent only in an HTTP-only cookie; the database stores only its SHA-256 hash. State-changing authenticated requests and login/logout requests require an allowed `Origin` header as a CSRF defense. CORS is not treated as the only CSRF defense.

The login and contact-form rate limits use the built-in in-memory store from `express-rate-limit`. They are per-process and reset on restart, so multi-instance deployments should configure a shared rate-limit store. Behind a reverse proxy, configure Express proxy trust only for the actual trusted proxy addresses so client IP-based limits remain meaningful.

## API

JSON responses use the shared `ApiResponse` utility. Errors are normalized by the shared error middleware. All versioned API routes use `/api/v1`.

| Route | Access | Behavior |
|---|---|---|
| `GET /api/health` | Public | Process liveness |
| `GET /api/health/ready` | Public | Database readiness check |
| `POST /api/v1/auth/login` | Public, origin-checked and rate-limited | Starts an administrator session |
| `POST /api/v1/auth/logout` | Administrator, origin-checked | Revokes the current session and clears its cookie |
| `POST /api/v1/auth/logout-all` | Administrator, origin-checked | Revokes all administrator sessions |
| `GET /api/v1/auth/me` | Administrator | Returns safe administrator fields |
| `PATCH /api/v1/auth/password` | Administrator, origin-checked | Changes password and replaces all sessions |
| `GET /api/v1/projects` | Public | Published projects; supports `page`, `limit` (max 100), `search`, `featured`, and `technology` |
| `GET /api/v1/projects/featured` | Public | Published featured projects |
| `GET /api/v1/projects/:slug` | Public | Published project detail |
| `GET /api/v1/skills` | Public | Skills |
| `GET /api/v1/experiences` | Public | Experience |
| `GET /api/v1/education` | Public | Education |
| `GET /api/v1/achievements` | Public | Achievements |
| `GET /api/v1/research` | Public | Research |
| `GET /api/v1/certifications` | Public | Certifications |
| `GET /api/v1/profile` | Public | Portfolio profile content |
| `POST /api/v1/contact` | Public, rate-limited | Submits a contact message |
| `/api/v1/admin/projects` | Administrator | Project CRUD, including technology labels |
| `/api/v1/admin/skills` | Administrator | Skill CRUD |
| `/api/v1/admin/experiences` | Administrator | Experience CRUD |
| `/api/v1/admin/education` | Administrator | Education CRUD |
| `/api/v1/admin/achievements` | Administrator | Achievement CRUD |
| `/api/v1/admin/research` | Administrator | Research CRUD |
| `/api/v1/admin/certifications` | Administrator | Certification CRUD |
| `GET /api/v1/admin/profile` | Administrator | Editable profile content |
| `PATCH /api/v1/admin/profile` | Administrator | Update profile and hero content |
| `POST /api/v1/admin/uploads/image` | Administrator | Upload one JPEG, PNG, WebP, or AVIF image (max 5 MB) |
| `POST /api/v1/admin/uploads/images` | Administrator | Upload up to 10 images (max 5 MB each) |
| `DELETE /api/v1/admin/uploads/image` | Administrator | Delete an unreferenced managed image by `publicId` |
| `POST /api/v1/admin/uploads/cleanup/retry` | Administrator | Retry failed deletions and clean uploads unused for at least 24 hours |
| `/api/v1/admin/messages` | Administrator | Inbox listing, detail, status updates, and deletion |

Admin collection GET endpoints accept `page` and `pageSize` (maximum 100). Message listing also accepts `status=UNREAD|READ|REPLIED`; status updates are available at `PATCH /api/v1/admin/messages/:id/status`. The former `PATCH /api/v1/admin/messages/:id` path remains as a compatibility alias. `/api/v1/public/portfolio` is also retained for clients using the earlier aggregate public-content endpoint.

Image uploads use `multipart/form-data`, with `image` for a single upload or `images` for multiple uploads. An optional `folder` form field may select one of the predefined `portfolio/*` folders. Upload responses contain a secure Cloudinary URL and public ID; submit that pair to the relevant admin CRUD endpoint to associate an image. Database rows store only image metadata, not file contents. Replaced and deleted assets are removed only after database changes succeed and only when no portfolio record references them. Failed deletions remain registered and can be retried through the cleanup endpoint.

Certification image uploads store certificate media only; they do not verify the credential or issuer.

Each resource has its own route, controller, service, and validation module under `src/routes`, `src/controllers`, `src/services`, and `src/validations`. The shared CRUD route/controller helpers only remove repeated HTTP plumbing; resource queries and schemas remain resource-specific. The global admin mount in `src/app.ts` authenticates and origin-checks every `/api/v1/admin/*` request before the dedicated resource routes execute.

## Verification

Run `npm run build` to type-check and compile the TypeScript backend, and `npm test` to run request-validation tests. With the API and PostgreSQL running and `ADMIN_EMAIL`/`ADMIN_PASSWORD` configured, run `npm run test:api` to check readiness, browser-origin CORS, public endpoints, administrator CRUD, contact inbox flows, authentication, and safe upload validation. The API tests use temporary records, which they remove afterward; upload cleanup and logout-all are not invoked because they can affect existing assets or sessions.
