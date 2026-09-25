# Portfolio

Personal portfolio with a built-in admin for managing content. Built with Next.js 16 (App Router), Tailwind CSS v4, Drizzle ORM and Postgres, and made to deploy on Vercel.

## What you can manage at `/admin`

- **Profile**: name, hero copy, about text, photo, CV (PDF), contact links, footer and search description
- **Skills**: the skill group cards, their icons and items
- **Projects**: cards with category filter, tags, screenshot or built-in illustration, demo and GitHub links, visibility and order
- **Experience and education**: shown in the About section
- **Blog posts**: Markdown editor with preview and image uploads, cover images, tags, drafts and publishing
- **Account**: change your admin password

Anything left empty is hidden on the public site, and the dashboard lists what is still missing.

## Search and sharing

- `/sitemap.xml` lists the home page, blog and every published post, read live from the database.
- `/robots.txt` allows crawling of the public site and blocks `/admin` and `/api/`.
- `/rss.xml` is an RSS feed of published posts, linked from every page.
- Link previews use a generated card in the site's colours. A post uses its cover image when it has one.
- Pages include canonical URLs and structured data (Person on the home page, BlogPosting on posts).

Set `NEXT_PUBLIC_SITE_URL` to your real domain so these URLs are correct. On Vercel it falls back to the production domain.

## Security

- Admin pages and uploads require a signed session cookie.
- Sign-in is rate limited: 5 failures for one email from one address, or 20 from one address, block sign-in for 15 minutes.
- Admin passwords need at least 12 characters.
- Replacing or removing an image deletes the old file from storage. Images inserted inside a post body are kept.

## Local development

```bash
npm install
cp .env.example .env.local   # then fill in SESSION_SECRET, ADMIN_EMAIL, ADMIN_PASSWORD
npm run dev
```

Open http://localhost:3000 and sign in at http://localhost:3000/admin.

With `DATABASE_URL` empty, the app uses an embedded Postgres (PGlite) stored in `.data/`, and uploads are saved to `.data/uploads/`. No database server is needed. `npm run dev` applies migrations and seeds the starter content automatically on first run. PGlite allows one process at a time, so stop the dev server before running the `db:*` scripts.

To reset local data, stop the server and delete the `.data` folder.

Forgot the admin password? Put a new one in `ADMIN_PASSWORD` in `.env.local` and restart `npm run dev`. The seed that runs first resets the password to that value. `npm run admin:reset` does the same without starting the server.

Set `PGLITE_DIR` to use a different local database folder, for example a throwaway copy for testing.

## Deploy to Vercel

1. Push this folder to a GitHub repository and import it in Vercel.
2. In the project's **Storage** tab, add a **Neon** Postgres database. This sets `DATABASE_URL`.
3. In the same tab, add a **Blob** store. This sets `BLOB_READ_WRITE_TOKEN`.
4. In **Settings, Environment Variables**, add:
   - `SESSION_SECRET`: output of `openssl rand -base64 32`
   - `ADMIN_EMAIL` and `ADMIN_PASSWORD` (at least 10 characters)
   - `NEXT_PUBLIC_SITE_URL`: your production URL
5. Redeploy.

Each deploy runs `vercel-build`, which applies database migrations, creates the admin user or resets its password to `ADMIN_PASSWORD`, and loads the starter content only into an empty database. It never overwrites your content. Because the password is reset on every deploy, change it by updating `ADMIN_PASSWORD` in Vercel rather than on the Account page.

## Changing the database schema

Edit `src/db/schema.ts`, then run `npm run db:generate` and commit the new file in `drizzle/`. Migrations run automatically on the next `npm run dev` or deploy.

## Scripts

| Script | Does |
| --- | --- |
| `npm run dev` | Start the dev server (runs migrations and seed first) |
| `npm run build` | Production build |
| `npm run lint` / `npm run typecheck` | Checks |
| `npm run db:generate` | Create a migration from schema changes |
| `npm run db:migrate` | Apply migrations |
| `npm run db:seed` | Create the admin user and starter content if missing |
| `npm run admin:reset` | Set the admin login to `ADMIN_EMAIL` / `ADMIN_PASSWORD` (stop the dev server first) |

## Project layout

- `src/app/(site)` is the public site: home page and blog
- `src/app/admin` holds the admin pages and server actions
- `src/db` has the schema and database client
- `src/lib` has auth, uploads, data queries and validation
- `src/proxy.ts` guards `/admin` and `/api/admin`
