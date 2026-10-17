# Portfolio website

The client is a strict TypeScript Next.js App Router application. The public home
page reads portfolio content from the Express API and submits contact messages
through the verified public API route.

## Local development

1. Install dependencies with `npm install`.
2. Copy `.env.example` to `.env.local` if the API is not running at its default
   local address.
3. Start the client with `npm run dev`.

The default API base URL is `http://localhost:5000/api/v1`, matching the
backend's configured default port and versioned API prefix. If the client uses a
different API origin, set `NEXT_PUBLIC_API_BASE_URL` to its non-secret base URL
ending in `/api/v1`. The backend must allow the client origin through its
`CLIENT_ORIGINS` configuration.

`NEXT_PUBLIC_SITE_URL` is optional and is used only to publish an absolute
sitemap URL. Do not place credentials, Cloudinary secrets, or session tokens in
client environment variables.

## Validation

Run these commands from `client/` after a frontend phase:

```sh
npm run lint
npx tsc --noEmit
npm run build
```
