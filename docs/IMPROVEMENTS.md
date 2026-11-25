# Improvement review

Scope: user interface and experience, workflows and diagrams, data freshness, redundancy. Findings come from reading the code in
this repository. Nothing here was run in a browser (see "Not verified").

## 1. Findings from the review

| Area | Finding |
|---|---|
| Redundancy | The same form logic (react-hook-form setup, form error state, mapping server errors to fields, error banner markup) was copied into 11 forms. |
| Redundancy | The status/filter button row was copied 3 times, the "open the form when `?new=1`" effect 3 times, the confirm-and-delete flow 3 times, and list state with page clamping 4 times. |
| Redundancy | Activity and Workout repeated four model fields, their indexes and four validation rules. `RecordsPage` chose a noun with `plural === "Activities"`. |
| Contrast | White text on emerald-600 measured 3.77:1, secondary text in slate-400 2.56:1, input borders 1.48:1 and the focus ring 2.54:1 (text needs 4.5:1, borders and focus 3:1). |
| Accessibility | Dialogs did not keep keyboard focus inside; dropdowns did not return focus on Escape; filter buttons used `role="tab"` without the matching panel and keyboard behaviour; error text was not linked to its field; charts had no text alternative; pages had no titles and focus was not moved after navigation; icon buttons were 36 px; inputs under 16 px make iOS Safari zoom the page. |
| Data consistency | A record dated in the future counted in totals but never appeared in charts (windows end today), so figures contradicted each other. |
| Data freshness | Dashboard and analytics loaded once per visit and not when the tab came back; a failed refresh left old numbers on screen without saying so; the analytics date range was lost on refresh. |
| Predictability | An end date before the start date in the record filters silently returned nothing. |
| Workflow clarity | Activities and Workouts looked interchangeable. Adding something meant navigating to the right page first. |
| Documentation | Only one overview flowchart existed and the API list in the README was maintained by hand. |

## 2. What changed

**Shared code.** `useApiForm`, `useResourceList`, `useDeleteFlow`, `useOpenOnNewParam`, `usePageTitle`, `FormError`, `FilterTabs`,
`DataStatus`. All forms, the three list pages and Notifications now use them. On the server, `models/fragments.js` holds the fields and indexes
shared by Activity and Workout, and the validators share one set of session fields.

**Interface and flow.** A persistent **Add** menu in the top bar (activity, workout, routine, goal). Required fields marked and announced;
validation when a field is left; submit buttons show progress and ignore a second submit. Result counts and "Updating results" are announced.
Overdue goals are labelled. Page descriptions explain Activities versus Workouts. Failed refreshes show a warning with Retry.

**Accessibility.** Dialog focus trap, labelled dialogs, focus return, Escape handling in dropdowns, field-linked errors, text summaries for charts,
page titles, focus moved to the content after navigation, 44 px touch targets on small screens, 16 px inputs on small screens, visible focus ring
(5.48:1), colours raised to meet the contrast minimums, and the existing reduced-motion rule retained.

**Dynamic behaviour.** Dashboard, analytics and notifications reload when the tab regains focus after 30 seconds or more (notifications: every time).
After any create, edit or delete the list, statistics and notification badge reload together. The analytics range lives in the URL.
Date ranges auto-correct instead of returning nothing.

**Process documentation.** Eight diagrams with editable Graphviz sources, a layer-by-layer trace for each, and a generated route reference
with a check that fails when it is out of date.

## 3. API and behaviour changes

| Change | Effect |
|---|---|
| Activity, workout and routine-log dates more than one day ahead are rejected with 400 "Date cannot be in the future". | Clients that post future dates now receive an error. Everything else about these endpoints is unchanged. |
| List endpoints reject `from` later than `to` with 400. | Previously returned an empty list. |
| `GET /api/health` returns 503 with `database: "disconnected"` when MongoDB is down. | Previously always 200. Update any monitor that treats non-200 as an outage. |
| Everything else | Unchanged: paths, methods, response shapes, cookie behaviour. |

## 4. Data and migration

No migration. Collections, field names, types, indexes and stored values are unchanged; the model refactor produces the same schema.
Existing records dated in the future remain readable and are still counted in totals. Editing one of them requires moving its date to today
or earlier. Nothing was merged, altered or deleted.

## 5. Checks performed

| Check | Result |
|---|---|
| `node --check` on every server file | Passed |
| Every relative import in `server/` and `client/src/` resolves to a file | Passed |
| `npm run check:constants` (client and server category lists identical) | Passed |
| `npm run check:contrast` (36 text pairs, 4 non-text pairs, computed from Tailwind palette values) | Passed after two fixes |
| `npm run docs:check` (API-ROUTES.md matches the route files; 42 routes) | Passed |
| Diagrams rendered with Graphviz; two reviewed visually | Done |

## 6. Not verified

- The client was **not compiled or run**. The environment has no network, so dependencies were not installed and Vite did not build the JSX.
  Expect to run `npm install` and `npm run dev` and fix any typo that appears.
- The server was not started against MongoDB, and no API request was sent. The model and validator refactor is checked for syntax only.
- No browser, keyboard-only or screen-reader testing. The accessibility changes follow WCAG practice but compliance with any standard is **not** claimed.
- The contrast check covers the listed colour pairs only, not every combination on every screen.
- There is no automated test suite for the application itself.
- `FitTrack_Project_Documentation.docx` (the course document) was not regenerated. Its single overview flowchart is still accurate, but screenshots will
  look slightly different after these changes and should be retaken.

## 7. Recommended next steps

1. Run the app and click through each flow in `PROCESS-FLOWS.md` once.
2. Add automated tests for the validators and the goal completion hook, and a smoke test that starts the API against a test database.
3. Require the current password when the email address changes.
4. If the client and API are ever hosted on different sites, add CSRF protection together with `SameSite=None`.
5. Move the category lists into one shared package if the project grows; until then `npm run check:constants` guards against drift.
