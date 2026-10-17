# Phase 1 — Backend audit

Audit basis: `server/prisma/schema.prisma` and the registered Express routes,
controllers, validation schemas, services, middleware, and configuration. No
environment files or credentials were read.

## Runtime and transport

- API prefix: `/api/v1`; liveness endpoint: `GET /api/health`.
- Configured backend default port: `5000` (`PORT` may override it). A live
  server-side request to `http://localhost:5000/api/health` returned HTTP 200
  with `{"statusCode":200,"success":true,"data":{"status":"ok"},"message":"Service is running."}`.
- CORS allows credentials and reflects only origins listed by
  `CLIENT_ORIGINS`; its source default is `http://localhost:5173`. Requests
  without an `Origin` are permitted by the callback. The app has Helmet,
  cookie-parser, JSON and URL-encoded body limits of 32 KB, and centralized
  error/not-found middleware.
- The browser now calls `/api/...` on the Next.js origin. A Next rewrite proxies
  that path to server-only `API_BASE_URL`, avoiding browser cross-site cookie
  handling. The backend still checks the browser `Origin`, so
  `CLIENT_ORIGINS` must include the actual Next.js origin (for local development,
  normally `http://localhost:3000`).

## Authentication and cookie

- Cookie name: `portfolio_session`.
- `HttpOnly`: yes. `SameSite`: `COOKIE_SAME_SITE`, default `lax`. `Secure`: true
  when `NODE_ENV=production` or SameSite is `none`; otherwise false.
- `Domain`: not specified (host-only cookie). `Path`: `/api/v1`.
- Cookie `Max-Age` and server session lifetime: seven days. Sessions store a
  SHA-256 hash of the token, not the bearer token. Invalid/expired sessions
  receive HTTP 401.
- Same-origin validation protects state-changing admin operations and login.
  Admin CRUD, inbox, profile, and upload routes are guarded by both
  same-origin and admin-session middleware at `/api/v1/admin`.

## Confirmed endpoints

All paths below include the `/api/v1` prefix unless shown as `/api/health`.
“Public” means no admin session is required. All `/admin/...` paths are protected
by the admin middleware registered in `server/src/app.ts`.

| Method | Path | Access | Contract notes |
|---|---|---|---|
| GET | `/api/health` | Public | Liveness; no database readiness guarantee. |
| GET | `/api/health/ready` | Public | Readiness check. |
| POST | `/auth/login` | Public + same-origin + login limiter | Email/password; issues the HttpOnly session cookie. |
| POST | `/auth/logout` | Admin + same-origin | Revokes the current session and clears cookie. |
| POST | `/auth/logout-all` | Admin + same-origin | Revokes all administrator sessions. |
| GET | `/auth/me` | Admin | Returns `{id,name,email}`. |
| PATCH | `/auth/password` | Admin + same-origin | Current password and new password; new password length 12–256. |
| GET | `/projects` | Public | Published projects; query options below. |
| GET | `/projects/featured` | Public | Published featured projects. |
| GET | `/projects/:slug` | Public | Published project by slug; 404 if absent/unpublished. |
| GET | `/skills` | Public | Skills. |
| GET | `/experiences` | Public | Experiences. |
| GET | `/education` | Public | Education records. |
| GET | `/achievements` | Public | Achievements. |
| GET | `/research` | Public | Research records. |
| GET | `/certifications` | Public | Certifications. |
| GET | `/profile` | Public | Public profile projection. |
| GET | `/public/portfolio` | Public | Aggregate profile and all public collections. |
| POST | `/contact` | Public + contact limiter | Contact submission. |
| POST | `/public/messages` | Public + contact limiter | Same submission handler as `/contact`. |
| GET | `/admin/projects` | Admin | Paginated CRUD collection. |
| GET | `/admin/projects/:id` | Admin | CRUD record detail. |
| POST | `/admin/projects` | Admin + same-origin | Create project. |
| PATCH | `/admin/projects/:id` | Admin + same-origin | Partial update. |
| DELETE | `/admin/projects/:id` | Admin + same-origin | Deletes project; owned technologies cascade. |
| GET/POST | `/admin/skills` | Admin / Admin + same-origin for write | List and create. |
| GET/PATCH/DELETE | `/admin/skills/:id` | Admin / Admin + same-origin for write | Detail, update, delete. |
| GET/POST | `/admin/experiences` | Admin / Admin + same-origin for write | List and create. |
| GET/PATCH/DELETE | `/admin/experiences/:id` | Admin / Admin + same-origin for write | Detail, update, delete. |
| GET/POST | `/admin/education` | Admin / Admin + same-origin for write | List and create. |
| GET/PATCH/DELETE | `/admin/education/:id` | Admin / Admin + same-origin for write | Detail, update, delete. |
| GET/POST | `/admin/achievements` | Admin / Admin + same-origin for write | List and create. |
| GET/PATCH/DELETE | `/admin/achievements/:id` | Admin / Admin + same-origin for write | Detail, update, delete. |
| GET/POST | `/admin/research` | Admin / Admin + same-origin for write | List and create. |
| GET/PATCH/DELETE | `/admin/research/:id` | Admin / Admin + same-origin for write | Detail, update, delete. |
| GET/POST | `/admin/certifications` | Admin / Admin + same-origin for write | List and create. |
| GET/PATCH/DELETE | `/admin/certifications/:id` | Admin / Admin + same-origin for write | Detail, update, delete. |
| GET/PATCH | `/admin/profile` | Admin / Admin + same-origin for write | Profile read/update. |
| GET | `/admin/messages` | Admin | Paginated inbox; optional status filter. |
| GET | `/admin/messages/:id` | Admin | Message detail. |
| PATCH | `/admin/messages/:id/status` | Admin + same-origin | Updates status enum. |
| PATCH | `/admin/messages/:id` | Admin + same-origin | Alias for status update. |
| DELETE | `/admin/messages/:id` | Admin + same-origin | Delete message; 204 on success. |
| POST | `/admin/uploads/image` | Admin + same-origin + upload limiter | Multipart field `image`; single image upload. |
| POST | `/admin/uploads/images` | Admin + same-origin + upload limiter | Multipart field `images`; up to 10 images. |
| DELETE | `/admin/uploads/image` | Admin + same-origin | JSON `{publicId}`; refuses referenced assets. |
| POST | `/admin/uploads/cleanup/retry` | Admin + same-origin | Retry managed asset cleanup. |

## Prisma models and fields

- `Admin`: `id`, `name`, `email`, `passwordHash` (mapped to database column
  `password`), `createdAt`, `updatedAt`; relation `sessions`.
- `Session`: `id`, `tokenHash`, `adminId`, `expiresAt`, `createdAt`; admin
  relation, indexed by `adminId` and `expiresAt`.
- `Project`: `id`, `title` (mapped to `name`), `slug`, `description`, `image`,
  `imagePublicId`, `githubUrl`, `liveUrl`, `featured`, `status`, `createdAt`,
  `updatedAt`; relation `technologies`.
- `ProjectTechnology`: `id`, `name`, `projectId`; unique per project/name;
  cascade delete with project.
- `Skill`: `id`, `name`, `category`, `level`, `icon`, `imageUrl`,
  `imagePublicId`, `createdAt`, `updatedAt`.
- `Experience`: `id`, `company`, `position`, `location`, `description`,
  `startDate`, `endDate`, `current`, `companyLogoUrl`, `companyLogoPublicId`,
  `createdAt`, `updatedAt`.
- `Education`: `id`, `institution`, `degree`, `field`, `description`,
  `startDate`, `endDate`, `grade`, `institutionLogoUrl`,
  `institutionLogoPublicId`, `createdAt`, `updatedAt`.
- `Achievement`: `id`, `title`, `organization`, `description`, `date`, `link`,
  `imageUrl`, `imagePublicId`, `createdAt`, `updatedAt`.
- `Research`: `id`, `title`, `description`, `authors`, `publication`, `link`,
  `publishedAt`, `imageUrl`, `imagePublicId`, `createdAt`, `updatedAt`.
- `Certification`: `id`, `title`, `issuer`, `description`, `issueDate`,
  `expiryDate`, `credentialId`, `credentialUrl`, `imageUrl`, `imagePublicId`,
  `createdAt`, `updatedAt`.
- `PortfolioProfile`: `id` (default `"default"`), `name`, `headline`,
  `shortBio`, `about`, `profileImageUrl`, `profileImagePublicId`, `heroImageUrl`,
  `heroImagePublicId`, `resumeUrl`, `updatedAt`.
- `MediaAsset`: `id`, `publicId`, `url`, `folder`, `createdAt`,
  `deleteRequestedAt`.
- `Message`: `id`, `name`, `email`, `subject`, `message`, `status`, `createdAt`,
  `updatedAt`.
- Enums: `ProjectStatus = DRAFT | PUBLISHED`;
  `MessageStatus = UNREAD | READ | REPLIED`.
- `passwordHash` and `tokenHash` are backend-only and are not public API fields.

## Response and validation behavior

- Success envelope: `{statusCode, success: true, data, message}`.
- Error envelope: `{statusCode, success: false, data: null, message, errors}`.
  Zod errors use `errors: [{path,message}]`; other errors can use different
  shapes (including field names or an empty array), so clients must keep
  `errors` typed as unknown and branch on `statusCode`.
- CRUD collection reads return `data: {items,page,pageSize,total}` with default
  `page=1`, `pageSize=25` (maximum 100).
- Public project listing accepts `page` (default 1), `limit` (default 9,
  maximum 100), `search` (maximum 200), `featured=true|false`, and
  `technology` (1–60 characters). It sorts featured first, then newest.
- Inbox listing accepts `page` (default 1), `pageSize` (default 25, maximum
  100), and `status=UNREAD|READ|REPLIED`; it sorts newest first.
- Public list endpoints for skills, experience, education, achievements,
  research, certifications, featured projects and aggregate content use
  server-defined sorting/limits (normally up to 100) and expose no query
  pagination.
- Contact input: name 1–120; valid email max 254; optional subject max 200;
  message 1–5000. Rate limit: 5 submissions/hour.
- Project create requires title (1–160), lowercase hyphenated slug (1–180),
  description (1–10000); optional URLs max 2048, at most 30 unique technologies
  max 60 characters; status defaults to `DRAFT`.
- Uploads use in-memory Multer storage, accept JPEG/PNG/WebP/AVIF after content
  signature validation, cap each file at 5 MB and batch size at 10. Cloudinary
  credentials are required at runtime; absent configuration returns HTTP 503.
  Cloudinary API secret is backend-only.
- Delete endpoints may return 204 with no envelope; image cleanup may return
  202 while queued.

## Gaps and risks

1. The source default `CLIENT_ORIGINS` is Vite's `http://localhost:5173`; the
   Next development origin needs to be allowed in the actual backend runtime
   configuration. That configuration was not changed in this phase.
2. Port 5000 is the configured default and responds locally, but deployments
   can override `PORT`; set the client's server-only `API_BASE_URL` to the
   correct backend origin.
3. `GET /api/health` proves process liveness only. Use `/api/health/ready` for
   database/service readiness.
4. Session storage has a seven-day expiry, but the cookie has no explicit
   `Expires` or `Domain`; it is host-only. Production must use HTTPS and a
   compatible SameSite policy.
5. Upload routes are registered, but usable uploads depend on Cloudinary
   credentials and database registration of uploaded assets. The browser must
   not receive the Cloudinary API secret.
6. CRUD PATCH validation is partial-input validation; cross-field date checks
   may need complete existing values for reliable UI validation. Backend remains
   authoritative.
7. The `portfolioProfile` aggregate shape is verified from the service, but no
   social-link fields or user-managed site-wide SEO fields exist in the model.
8. No certifications, profile, or upload endpoint gaps remain: all are
   implemented in this server source.
9. During validation, `GET /api/v1/public/portfolio` returned HTTP 500 while
   `GET /api/health` returned HTTP 200. The client preserves an unavailable
   content state; this backend response was not changed in this phase.

## Phase 1 client decisions

- Existing `client/` was already a Next.js App Router application; it did not
  need to be bootstrapped again with `create-next-app`.
- Browser requests use same-origin `/api/...` rewrites; `API_BASE_URL` is
  server-only. `NEXT_PUBLIC_API_URL` is intentionally omitted.
- `NEXT_PUBLIC_SITE_URL` is used for absolute sitemap metadata when configured.
