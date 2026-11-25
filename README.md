# FitTrack - Personal Fitness and Activity Monitoring System

React (Vite) + Express + MongoDB. Secure cookie-based authentication, activities, workouts, routines, goals,
analytics, notifications and profile settings.

```
personal-fitness-monitoring-system/
├── client/   React 18, Vite, Tailwind CSS 3, React Router, Axios, Recharts, React Hook Form, Zod
└── server/   Express 4, Mongoose, JWT in HTTP-only cookies, bcrypt, Zod validation, rate limiting
```

## Documentation

| File | Contents |
|---|---|
| [docs/PROCESS-FLOWS.md](docs/PROCESS-FLOWS.md) | Eight process diagrams (account access, password reset, records, routines, goals, analytics, notifications, sign-out) with a screen, API, validation, logic and database trace for each |
| [docs/API-ROUTES.md](docs/API-ROUTES.md) | Every route, generated from the code |
| [docs/IMPROVEMENTS.md](docs/IMPROVEMENTS.md) | Review findings, what changed, API effects, migration notes, checks run and what was not verified |
| `docs/diagrams/src/*.dot` | Editable diagram sources (Graphviz); rendered images are in `docs/diagrams/rendered/` |

## 1. Prerequisites

1. **Node.js 20 LTS or newer** from https://nodejs.org. Verify: `node -v` and `npm -v`.
2. **MongoDB Community Server 7+** from https://www.mongodb.com/try/download/community.
   On Windows install it as a service and tick **MongoDB Compass**. On macOS: `brew tap mongodb/brew && brew install mongodb-community && brew services start mongodb-community`.
   Alternative: a free **MongoDB Atlas** cluster; paste its connection string into `MONGO_URI`.
3. **VS Code** with the extensions ESLint, Prettier, Tailwind CSS IntelliSense and MongoDB for VS Code.
4. **Git** and **Postman** (optional but recommended).

Check that MongoDB is running: open Compass and connect to `mongodb://127.0.0.1:27017`.

## 2. Install

Open the project folder in VS Code (`File > Open Folder`), then open the terminal (`Ctrl+``):

```bash
npm run install:all          # installs server and client dependencies
```

Or manually: `cd server && npm install`, then `cd ../client && npm install`.

## 3. Configure environment variables

```bash
# macOS / Linux / Git Bash
cp server/.env.example server/.env
cp client/.env.example client/.env
# Windows PowerShell
Copy-Item server/.env.example server/.env
Copy-Item client/.env.example client/.env
```

Edit `server/.env` and set `JWT_SECRET` to a long random value. Generate one with:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

`MONGO_URI` defaults to `mongodb://127.0.0.1:27017/fitness_monitor` (the database is created automatically).
Never commit `.env` files (they are in `.gitignore`).

## 4. Run

Use two terminals.

```bash
# Terminal 1 - API on http://localhost:5000
cd server
npm run dev
# expect: "MongoDB connected: ..." and "Server running ... on http://localhost:5000"

# Terminal 2 - React app on http://localhost:5173
cd client
npm run dev
```

Optional demo data (account `demo@example.com` / `Demo1234x`, ~8 weeks of records):

```bash
cd server && npm run seed
```

## 5. Test the API in Postman

Postman stores cookies automatically. Base URL: `http://localhost:5000/api`.

| # | Request | Body | Expected |
|---|---------|------|----------|
| 1 | `GET /health` | | 200 |
| 2 | `POST /auth/register` | `{"fullName":"Test User","email":"test@example.com","password":"Passw0rdOK","confirmPassword":"Passw0rdOK","acceptTerms":true}` | 201 + `token` cookie |
| 3 | Repeat #2 | | 409 duplicate email |
| 4 | `POST /auth/login` | `{"email":"test@example.com","password":"Passw0rdOK","rememberMe":true}` | 200 |
| 5 | `POST /auth/login` wrong password | | 401 |
| 6 | `GET /auth/me` | | 200 |
| 7 | `POST /activities` | `{"title":"Morning walk","category":"Walking","date":"2026-11-20","duration":30,"notes":"","tags":["morning"]}` | 201 |
| 8 | `GET /activities?search=walk&category=Walking&sort=-duration&page=1&limit=10` | | 200 with `items` and `pagination` |
| 9 | `PUT /activities/:id` (full body) | | 200 |
| 10 | `DELETE /activities/:id` | | 200; a second delete returns 404 |
| 11 | `GET /activities/export` | | CSV file |
| 12 | `POST /workouts`, `POST /routines`, `POST /goals` | see schemas in `server/validators/resource.validator.js` | 201 |
| 13 | `POST /routines/:id/log` | `{}` | 201, creates a workout |
| 14 | `GET /analytics/dashboard?today=2026-11-23` | | 200 |
| 15 | `GET /notifications`, `PUT /notifications/read-all` | | 200 |
| 16 | `PUT /profile/change-password` | `{"currentPassword":"Passw0rdOK","newPassword":"NewPassw0rd1","confirmPassword":"NewPassw0rd1"}` | 200 |
| 17 | `POST /auth/logout`, then `GET /auth/me` | | 200, then 401 |

Goal example: `{"title":"30 sessions","category":"Sessions","targetValue":30,"unit":"sessions","progressValue":0,"startDate":"2026-11-01","targetDate":"2026-12-31","status":"active"}`.

## 6. API reference

| Area | Endpoints |
|------|-----------|
| Auth | `POST /auth/register`, `/auth/login`, `/auth/logout`, `/auth/forgot-password`, `/auth/reset-password`; `GET /auth/me` |
| Activities | `GET/POST /activities`; `GET/PUT/DELETE /activities/:id`; `GET /activities/export`; `GET /activities/stats` |
| Workouts | `GET/POST /workouts`; `GET/PUT/DELETE /workouts/:id`; `GET /workouts/stats` |
| Routines | `GET/POST /routines`; `GET/PUT/DELETE /routines/:id`; `POST /routines/:id/log` |
| Goals | `GET/POST /goals`; `GET/PUT/DELETE /goals/:id` |
| Analytics | `GET /analytics/dashboard`, `/weekly`, `/monthly`, `/activity-distribution`, `/overview` |
| Notifications | `GET /notifications`; `PUT /notifications/:id/read`; `PUT /notifications/read-all` |
| Profile | `GET/PUT /profile`; `PUT /profile/change-password` |

List endpoints accept `page`, `limit`, `search`, `category`, `status` (goals), `from`, `to`, `sort`.
Analytics endpoints accept `today=YYYY-MM-DD` so date windows follow the user's local day.

## 6a. Quality checks

```bash
npm run check            # constants match, colour contrast, API route docs up to date
npm run docs:routes      # regenerate docs/API-ROUTES.md after changing routes
npm run docs:diagrams    # re-render the diagrams (needs Graphviz: dot -V)
```
These checks need only Node.js. They do not replace running the app or testing with assistive technology.

Records describe things that already happened, so activity, workout and routine-log dates cannot be more than one day ahead
(the extra day covers time zones). `GET /api/health` returns 503 when the database is not connected.

## 7. Security notes

- Passwords hashed with bcrypt (cost 12); never returned by the API.
- JWT in an HTTP-only, `SameSite=Lax` cookie (`Secure` in production). Nothing is stored in LocalStorage.
- Password changes and resets invalidate older sessions.
- Zod validation on every request body and query; Mongo operator sanitization; Helmet; CORS limited to `CLIENT_URL`.
- Rate limits on auth routes and on the whole API (relaxed 10x outside production).
- Every query is scoped to the authenticated user, so one user can never read or change another user's data.
- CSV export neutralizes spreadsheet formula injection.
- If you deploy the client and API on different sites, set `COOKIE_SAMESITE=none` (HTTPS required) and add CSRF protection.

## 8. Password reset

Without SMTP configured, the reset link is printed in the server console and shown on the "Forgot password" page
(development only). For real emails set `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` and `MAIL_FROM` in `server/.env`.

## 9. Troubleshooting

| Problem | Fix |
|---------|-----|
| `MongoDB connection failed` / `ECONNREFUSED` | Start MongoDB (Windows: Services > MongoDB Server; macOS: `brew services start mongodb-community`). Check `MONGO_URI`. |
| `Missing required environment variables` | Create `server/.env` from `.env.example`. |
| CORS error in the browser | `CLIENT_URL` must exactly match the address in the browser (`http://localhost:5173`, not `127.0.0.1`). Restart the server after editing `.env`. |
| Login works but you are sent back to the login page | The cookie is blocked. Use `localhost` for both apps, keep `COOKIE_SAMESITE=lax`, and keep `NODE_ENV=development` locally. |
| `Cannot reach the server` toast | The API is not running or `VITE_API_URL` is wrong. Restart Vite after editing `client/.env`. |
| `EADDRINUSE: port 5000` | Another process uses the port. Change `PORT` in `server/.env` and `VITE_API_URL` in `client/.env`. |
| `bcrypt` install error | Use Node 20 or 22 LTS; delete `node_modules` and reinstall. |
| 429 Too many requests | You hit a rate limit. Wait, or restart the server in development. |
| "Date cannot be in the future" | Records must be dated today or earlier. Check the date field. |
| Dates look off by one day | Dates are stored as calendar days. Clear the browser cache after upgrading and report it if it persists. |

## 10. Project layout

**server/** `config/` env and DB; `models/` six Mongoose models; `validators/` Zod schemas; `middleware/` auth, validation, rate limits, errors;
`controllers/` HTTP handlers (`crud.factory.js` builds the shared CRUD handlers); `services/` auth, analytics, notifications; `routes/`; `scripts/seed.js`.

**client/src/** `pages/` one file per screen; `hooks/` shared behaviour (`useApiForm`, `useResourceList`, `useDeleteFlow`, `useFetch`); `components/ui` reusable UI (modals, forms, tables, skeletons, empty and error states);
`components/charts` Recharts wrappers; `components/records` shared Activities/Workouts screen; `context/` auth, toast, notifications;
`services/` Axios API layer; `validations/` Zod form schemas; `layouts/` app and auth shells.

## 11. Production build

```bash
cd client && npm run build      # outputs client/dist
cd server && NODE_ENV=production npm start
```
Set `CLIENT_URL` to your deployed client origin, use a 32+ character `JWT_SECRET`, serve over HTTPS, and configure SMTP.
