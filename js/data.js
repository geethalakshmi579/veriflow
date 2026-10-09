/* ============================================================================
 * data.js — Seeded SYNTHETIC customer dataset for the VeriFlow demo.
 *
 * Every record here is fictional and generated deterministically from a fixed
 * seed so the demo is reproducible. No real people, no real PII.
 * The UI footer labels this dataset as synthetic.
 * ========================================================================== */
(function (global) {
  "use strict";

  var SEED = 42;

  // Deterministic PRNG (mulberry32) — same output on every page load.
  function mulberry32(seed) {
    var a = seed >>> 0;
    return function () {
      a |= 0;
      a = (a + 0x6d2b79f5) | 0;
      var t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  var FIRST = [
    "Ava", "Liam", "Sofia", "Noah", "Maya", "Ethan", "Priya", "Lucas",
  ];
  var LAST = [
    "Martinez", "Chen", "Ramirez", "Okafor", "Patel", "Novak", "Kim", "Garcia",
  ];
  var STATES = ["NY", "CA", "TX", "FL", "IL", "WA", "CO", "VA"];
  var CHANNELS = ["web", "branch", "kiosk"];

  function pad(n) {
    return (n < 10 ? "0" : "") + n;
  }

  // Builds 8 fictional customers. Two deliberate data-quality cases are baked
  // in so the silver layer has something to show:
  //   - rec-004 is a near-duplicate of rec-003 (same person, messy casing and
  //     a trailing space in the email) -> deduped in silver.
  //   - rec-007 has a padded email with whitespace -> normalized in silver.
  function buildSyntheticCustomers() {
    var rand = mulberry32(SEED);
    var customers = [];
    for (var i = 0; i < 8; i++) {
      var fn = FIRST[i];
      var ln = LAST[i];
      var year = 1978 + Math.floor(rand() * 30);
      var month = 1 + Math.floor(rand() * 12);
      var day = 1 + Math.floor(rand() * 28);
      customers.push({
        id: "rec-00" + (i + 1),
        given_name: fn,
        family_name: ln,
        birth_date: year + "-" + pad(month) + "-" + pad(day),
        state: STATES[Math.floor(rand() * STATES.length)],
        channel: CHANNELS[Math.floor(rand() * CHANNELS.length)],
        email:
          fn.toLowerCase() + "." + ln.toLowerCase() + "@example.com",
        verified_at: "2026-10-0" + (1 + (i % 8)) + "T14:0" + (i % 6) + ":00Z",
        source: "wallet",
      });
    }
    // Deliberate duplicate: same person as rec-003, messy casing/whitespace.
    customers[3] = {
      id: "rec-004",
      given_name: "  sofia ",
      family_name: "RAMIREZ",
      birth_date: customers[2].birth_date,
      state: customers[2].state,
      channel: "kiosk",
      email: "SOFIA.RAMIREZ@example.com ",
      verified_at: "2026-10-08T16:22:00Z",
      source: "wallet",
    };
    // Deliberate whitespace case.
    customers[6].email = "  " + customers[6].email + " ";
    return customers;
  }

  global.VeriFlowData = {
    SEED: SEED,
    buildSyntheticCustomers: buildSyntheticCustomers,
  };
})(typeof window !== "undefined" ? window : globalThis);
