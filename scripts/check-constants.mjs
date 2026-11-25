// Fails when the category/unit lists the client and the server each define have drifted apart.
// (They live in two packages, so they cannot be imported from one place. This keeps them honest.)
import { readFileSync } from "node:fs";

const read = (p) => readFileSync(new URL(`../${p}`, import.meta.url), "utf8");
const lists = (src) => {
  const out = {};
  for (const m of src.matchAll(/export const (\w+) = (\[[\s\S]*?\]);/g)) {
    try { out[m[1]] = JSON.parse(m[2].replace(/,\s*\]/g, "]")); } catch { /* not a plain list */ }
  }
  return out;
};

const server = lists(read("server/utils/constants.js"));
const client = lists(read("client/src/utils/constants.js"));
const shared = ["ACTIVITY_CATEGORIES", "WORKOUT_CATEGORIES", "GOAL_CATEGORIES", "GOAL_UNITS"];
let failed = false;
for (const name of shared) {
  const a = JSON.stringify(server[name]);
  const b = JSON.stringify(client[name]);
  if (!server[name] || !client[name] || a !== b) { failed = true; console.error(`MISMATCH ${name}\n  server: ${a}\n  client: ${b}`); }
  else console.log(`ok  ${name} (${server[name].length} values)`);
}
if (/ROUTINE_CATEGORIES = WORKOUT_CATEGORIES/.test(read("server/utils/constants.js")) !== /ROUTINE_CATEGORIES = WORKOUT_CATEGORIES/.test(read("client/src/utils/constants.js"))) {
  failed = true; console.error("MISMATCH ROUTINE_CATEGORIES definition");
} else console.log("ok  ROUTINE_CATEGORIES");
process.exit(failed ? 1 : 0);
