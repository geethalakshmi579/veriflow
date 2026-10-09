/* ============================================================================
 * pipeline.js — bronze -> silver -> gold transforms for the VeriFlow demo.
 *
 * Pure functions, no DOM. Covered by test/pipeline.test.js (run: npm test).
 *
 * Bronze: raw ingested records, exactly as received (seeded synthetic rows
 *         plus one live record appended after a real wallet verification).
 * Silver: cleaned + deduplicated. Rules:
 *           - trim whitespace, title-case names, lowercase emails
 *           - dedupe on (given_name, family_name, birth_date); keep the most
 *             recent verified_at; count the rest as duplicates blocked
 * Gold:   business-ready aggregates for the dashboard.
 * ========================================================================== */
(function (global) {
  "use strict";

  function titleCase(s) {
    return String(s || "")
      .trim()
      .toLowerCase()
      .replace(/\b\w/g, function (c) {
        return c.toUpperCase();
      });
  }

  function normalizeEmail(s) {
    return String(s || "").trim().toLowerCase();
  }

  function dedupeKey(r) {
    return (
      titleCase(r.given_name) +
      "|" +
      titleCase(r.family_name) +
      "|" +
      String(r.birth_date || "").trim()
    );
  }

  // Bronze: raw records in arrival order. liveRecord is appended only after a
  // genuine successful wallet verification (never synthesized).
  function toBronze(seedRows, liveRecord) {
    var rows = seedRows.map(function (r) {
      return Object.assign({ layer: "bronze" }, r);
    });
    if (liveRecord) {
      rows.push(Object.assign({ layer: "bronze", isLive: true }, liveRecord));
    }
    return rows;
  }

  // Silver: normalize + dedupe. Returns { rows, duplicatesBlocked }.
  function toSilver(bronzeRows) {
    var seen = {};
    var rows = [];
    var duplicatesBlocked = 0;

    // Sort newest-first so the newest duplicate wins.
    var ordered = bronzeRows.slice().sort(function (a, b) {
      return String(a.verified_at) > String(b.verified_at) ? -1 : 1;
    });

    ordered.forEach(function (r) {
      var clean = {
        id: r.id,
        given_name: titleCase(r.given_name),
        family_name: titleCase(r.family_name),
        birth_date: String(r.birth_date || "").trim(),
        state: String(r.state || "").trim().toUpperCase(),
        channel: String(r.channel || "").trim().toLowerCase(),
        email: normalizeEmail(r.email),
        verified_at: r.verified_at,
        source: r.source,
        isLive: !!r.isLive,
        layer: "silver",
      };
      var key = dedupeKey(clean);
      if (seen[key]) {
        duplicatesBlocked += 1; // keep the newer record, drop this one
      } else {
        seen[key] = true;
        rows.push(clean);
      }
    });

    return { rows: rows, duplicatesBlocked: duplicatesBlocked };
  }

  // Gold: aggregates. applicantName is {given_name, family_name} typed into
  // the application form; used for the name-match quality check.
  function toGold(silver, applicantName) {
    var byState = {};
    var byChannel = {};
    silver.rows.forEach(function (r) {
      byState[r.state] = (byState[r.state] || 0) + 1;
      byChannel[r.channel] = (byChannel[r.channel] || 0) + 1;
    });

    var nameMatch = null;
    if (applicantName && applicantName.given_name) {
      var live = silver.rows.filter(function (r) {
        return r.isLive;
      })[0];
      if (live) {
        nameMatch =
          titleCase(applicantName.given_name) === live.given_name &&
          titleCase(applicantName.family_name) === live.family_name;
      }
    }

    return {
      totalVerified: silver.rows.length,
      duplicatesBlocked: silver.duplicatesBlocked,
      byState: byState,
      byChannel: byChannel,
      nameMatch: nameMatch, // true / false / null (no live verification yet)
    };
  }

  global.VeriFlowPipeline = {
    titleCase: titleCase,
    normalizeEmail: normalizeEmail,
    toBronze: toBronze,
    toSilver: toSilver,
    toGold: toGold,
  };
})(typeof window !== "undefined" ? window : globalThis);
