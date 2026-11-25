#!/usr/bin/env bash
# Creates a readable commit history (27 commits) from the project files, in dependency order.
# Run it once, from anywhere, in a folder that is not yet a Git repository (or has no commits):
#     bash scripts/create-commits.sh
# Commits use YOUR Git identity (git config user.name / user.email). It does not push; see the end of the output.
set -euo pipefail
cd "$(dirname "$0")/.."

[ -n "$(git config user.name || true)" ] && [ -n "$(git config user.email || true)" ] || {
  echo "Set your identity first:"; echo '  git config --global user.name "Your Name"'; echo '  git config --global user.email "you@example.com"'; exit 1; }
if git rev-parse HEAD >/dev/null 2>&1; then echo "This folder already has commits. Run the script in a fresh copy."; exit 1; fi
[ -d .git ] || git init -q -b main
git checkout -q -B main

n=0
c() { # c "message" path...
  local msg="$1"; shift
  git add -- "$@"
  n=$((n + 1))
  git commit -q -m "$msg"
  printf '%2d  %s\n' "$n" "$msg"
}

c "chore: add project scaffolding and root scripts" .gitignore package.json
c "feat(server): add package manifest, environment template and config loading" server/package.json server/.env.example server/config
c "feat(server): add shared constants, error class, dates, CSV and query helpers" server/utils
c "feat(server): add error handling, validation and rate limiting middleware" server/middleware/errorHandler.js server/middleware/validate.js server/middleware/rateLimiter.js
c "feat(server): add Mongoose models with shared session fields" server/models
c "feat(server): add authentication with cookie sessions and password reset" server/validators/auth.validator.js server/middleware/auth.js server/services/notification.service.js server/services/auth.service.js server/controllers/auth.controller.js server/routes/auth.routes.js
c "feat(server): add generic CRUD factory, query validation and record schemas" server/controllers/crud.factory.js server/routes/crud.router.js server/validators/common.validator.js server/validators/resource.validator.js
c "feat(server): add activities API with search, filters and CSV export" server/controllers/activity.controller.js server/routes/activity.routes.js
c "feat(server): add workouts API" server/controllers/workout.controller.js server/routes/workout.routes.js
c "feat(server): add routines API with log-as-workout" server/controllers/routine.controller.js server/routes/routine.routes.js
c "feat(server): add goals API with automatic completion" server/controllers/goal.controller.js server/routes/goal.routes.js
c "feat(server): add analytics service and endpoints" server/services/analytics.service.js server/controllers/analytics.controller.js server/routes/analytics.routes.js
c "feat(server): add notifications and profile APIs" server/controllers/notification.controller.js server/routes/notification.routes.js server/controllers/profile.controller.js server/routes/profile.routes.js server/validators/profile.validator.js
c "feat(server): add app entry, health check and demo seed script" server/app.js server/server.js server/scripts
c "feat(client): set up Vite, Tailwind and design tokens" client/package.json client/.env.example client/vite.config.js client/postcss.config.js client/tailwind.config.js client/index.html client/public client/src/index.css client/src/main.jsx
c "feat(client): add utilities, validation schemas and API services" client/src/utils client/src/validations client/src/services
c "feat(client): add shared hooks and app contexts" client/src/hooks client/src/context
c "feat(client): add reusable UI components and charts" client/src/components/ui client/src/components/charts
c "feat(client): add app shell, layouts and protected routing" client/src/components/layout client/src/components/ProtectedRoute.jsx client/src/layouts client/src/App.jsx client/src/pages/NotFound.jsx
c "feat(client): add sign in, registration and password reset pages" client/src/pages/Login.jsx client/src/pages/Register.jsx client/src/pages/ForgotPassword.jsx client/src/pages/ResetPassword.jsx
c "feat(client): add dashboard and analytics pages" client/src/pages/Dashboard.jsx client/src/pages/Analytics.jsx
c "feat(client): add shared records screen for activities and workouts" client/src/components/records client/src/pages/Activities.jsx client/src/pages/Workouts.jsx
c "feat(client): add routines and goals pages" client/src/pages/Routines.jsx client/src/pages/Goals.jsx
c "feat(client): add notifications, profile and settings pages" client/src/pages/Notifications.jsx client/src/pages/Profile.jsx client/src/pages/Settings.jsx
c "docs: add process flow diagrams and traces" docs/diagrams docs/PROCESS-FLOWS.md scripts/render-diagrams.sh
c "chore: add consistency checks, generated API docs and commit script" scripts/check-constants.mjs scripts/check-contrast.mjs scripts/generate-route-docs.mjs scripts/create-commits.sh docs/API-ROUTES.md
c "docs: add README and improvements report" README.md docs/IMPROVEMENTS.md

if [ -n "$(git status --porcelain)" ]; then echo; echo "Warning: files not committed:"; git status --short; exit 1; fi
echo; echo "Done: $n commits on branch main."
echo "Push with:"
echo "  git remote add origin https://github.com/Marciankyle776/Personal-Fitness-and-Activity-Monitoring-System.git"
echo "  git push -u origin main"
