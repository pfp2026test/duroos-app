# Duroos App — Starter Scaffold

Four parts:

- **backend/** — Node/Express API + Prisma/Postgres schema
- **admin/** — Next.js admin panel (upload, review queue, resource approval)
- **mobile/** — Expo/React Native app (iOS + Android from one codebase)
- **website/** — plain HTML/CSS/JS public site: a landing page, sign up/log in, and a gated library + lesson pages. Deployable straight to Cloudflare Pages with no build step.

## Deploying the website to Cloudflare Pages

1. Go to dash.cloudflare.com, sign up free, and open the **Workers & Pages** section.
2. Click **Create** → **Pages** → **Upload assets**.
3. Give the project a name (e.g. `duroos`), then drag the entire `website/` folder in — Cloudflare treats `index.html` as the homepage automatically. No build command needed since it's plain HTML/CSS/JS.
4. Click **Deploy**. You'll get a free `*.pages.dev` address in under a minute.
5. **Before deploying**, open `website/js/api.js` and change the `API_BASE` constant from `http://localhost:4000/api` to your backend's real address (the `.replit.dev` URL, or your production API domain once you have one) — otherwise the site will load but show no lessons.
6. Any time you change a file in `website/`, re-drag the folder into a new Cloudflare Pages deployment (or connect a GitHub repo instead of manual upload, for automatic redeploys on every save — worth doing once you're comfortable with Git).

## What's wired up

- Full data model: `Admin`, `Speaker`, `Book`, `Playlist`, `Duroos`, `Caption`,
  `Resource`, `Citation`, `User`, `Comment` (see `backend/prisma/schema.prisma`)
- Duroos lifecycle: `DRAFT → PROCESSING → IN_REVIEW → PUBLISHED` (or `REJECTED`)
- AI resources are only ever created when an admin explicitly calls
  `POST /resources/duroos/:id/generate` — nothing generates automatically —
  and stay invisible to users until an admin calls `/resources/:id/approve`
  (status `NOT_REQUESTED → GENERATING → PENDING_APPROVAL → VERIFIED`)
- Playlists group multiple duroos under an admin-chosen name, ordered via
  `orderInPlaylist`
- Comment moderation via a `hidden` flag, toggled by admins
- Role-gated admin routes (`SUPER_ADMIN`, `CONTENT_ADMIN`, `REVIEWER`)

## What's stubbed and needs real implementation

- **AI translation/captioning job** (`POST /duroos/:id/request-translation`) —
  currently just flips status to `PROCESSING`. Wire this to your Baian-AI-based
  pipeline: pull audio/transcript, translate, generate WebVTT captions, save
  to the `Caption` model, optionally produce a dubbed `voiceoverUrl`, then set
  status to `IN_REVIEW`.
- **AI resource generation** (`POST /resources/duroos/:id/generate`) — same
  pattern: enqueue a job that drafts `Resource.content` and populates
  `Citation` rows from shamela.ws, then flips status to `PENDING_APPROVAL`.
- **Admin account creation** — there's deliberately no self-signup route for
  admins. Create the first one by hand via Prisma Studio: add a row to
  `Admin`, and set `passwordHash` using a one-off script that calls
  `bcrypt.hashSync("yourpassword", 10)`.
- **User authentication** is now real (`/api/users/signup`, `/login`, `/me`,
  backed by `User.passwordHash`) and both the website and mobile app should
  use it — the mobile app's comment flow still needs to be wired up to call
  these endpoints and store the returned token (currently it has no
  sign-in screen at all).
- **YouTube metadata fetch** — the upload form only parses the video ID from
  the URL; call the YouTube Data API server-side to auto-fill thumbnail,
  duration, and title suggestions.
- **File/queue infrastructure** — background jobs (translation, resource
  generation) should run in a queue (e.g. BullMQ + Redis) rather than inline
  in the request handler, since translation/dubbing will take longer than an
  HTTP timeout allows.

## Running locally

```bash
# Backend
cd backend
cp .env.example .env   # set DATABASE_URL and JWT_SECRET
npm install
npx prisma migrate dev
npm run dev             # http://localhost:4000

# Admin panel
cd admin
npm install
npm run dev              # http://localhost:3000

# Mobile
cd mobile
npm install
npx expo start
```

## Things to resolve before launch (see earlier discussion)

- YouTube ToS: confirm whether audio extraction for dubbing is permitted, or
  whether you need direct speaker permission for that step.
- Shamela.ws terms for automated quotation pulls at scale.
- Human review step for AI translations of religious content, beyond the
  automated "verified" flag — consider a qualified reviewer role.
