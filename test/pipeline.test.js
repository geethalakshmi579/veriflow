/* Unit tests for js/data.js and js/pipeline.js. Run: npm test */
"use strict";

const assert = require("node:assert/strict");
require("../js/data.js");
require("../js/pipeline.js");

const { buildSyntheticCustomers, SEED } = globalThis.VeriFlowData;
const P = globalThis.VeriFlowPipeline;

// --- dataset ---------------------------------------------------------------
const seed = buildSyntheticCustomers();
assert.equal(SEED, 42, "seed is 42");
assert.equal(seed.length, 8, "8 seeded rows");
assert.deepEqual(
  buildSyntheticCustomers().map((r) => r.id),
  seed.map((r) => r.id),
  "deterministic across builds"
);

// --- bronze ----------------------------------------------------------------
let bronze = P.toBronze(seed, null);
assert.equal(bronze.length, 8, "bronze without live record");
assert.ok(bronze.every((r) => r.layer === "bronze"));

// --- silver: normalization + dedupe ---------------------------------------
let silver = P.toSilver(bronze);
assert.equal(
  silver.duplicatesBlocked,
  1,
  "exactly one deliberate duplicate is blocked"
);
assert.equal(silver.rows.length, 7, "7 unique customers in silver");
const sofia = silver.rows.filter((r) => r.family_name === "Ramirez");
assert.equal(sofia.length, 1, "duplicate Sofia merged to one row");
assert.equal(
  sofia[0].given_name,
  "Sofia",
  "messy casing normalized to Title Case"
);
assert.ok(
  silver.rows.every((r) => r.email === r.email.trim().toLowerCase()),
  "all emails trimmed + lowercased"
);

// --- live record appends only when supplied ---------------------------------
const live = {
  id: "rec-live-1",
  given_name: "Jordan",
  family_name: "Ellis",
  birth_date: "1990-05-14",
  state: "NY",
  channel: "web",
  email: "jordan.ellis@example.com",
  verified_at: "2026-10-09T18:00:00Z",
  source: "wallet",
};
bronze = P.toBronze(seed, live);
assert.equal(bronze.length, 9, "live record appended to bronze");
assert.equal(bronze[8].isLive, true, "live record flagged");
silver = P.toSilver(bronze);
assert.equal(silver.rows.length, 8, "live record survives to silver");

// --- gold ------------------------------------------------------------------
let gold = P.toGold(silver, { given_name: "jordan", family_name: "ELLIS" });
assert.equal(gold.totalVerified, 8);
assert.equal(gold.duplicatesBlocked, 1);
assert.equal(gold.nameMatch, true, "applicant name matches verified ID");
gold = P.toGold(silver, { given_name: "Alex", family_name: "Rivera" });
assert.equal(gold.nameMatch, false, "mismatched name is flagged");
gold = P.toGold(P.toSilver(P.toBronze(seed, null)), null);
assert.equal(gold.nameMatch, null, "no live verification -> null");

const stateTotal = Object.values(gold.byState).reduce((a, b) => a + b, 0);
assert.equal(stateTotal, gold.totalVerified, "state breakdown sums to total");

console.log("All pipeline tests passed.");
