/* ============================================================================
 * app.js — VeriFlow demo flow.
 *
 * Step 1: application form (fictional business context)
 * Step 2: live mobile-ID verification via the REAL @credenceid/online-verifier
 *         SDK (W3C cross-device QR flow). Results come ONLY from genuine
 *         SDK events — nothing is ever faked or hardcoded.
 * Step 3: verified record lands in the bronze -> silver -> gold pipeline.
 * ========================================================================== */
(function () {
  "use strict";

  var PLACEHOLDER = /PASTE/i;

  function getConfig() {
    return window.VERIFLOW_CONFIG || {};
  }

  function hasCredentials() {
    var c = getConfig();
    return !!(
      c.licenseKey &&
      c.profileId &&
      !PLACEHOLDER.test(c.licenseKey) &&
      !PLACEHOLDER.test(c.profileId)
    );
  }

  // -- tiny DOM helpers ------------------------------------------------------
  function $(sel) {
    return document.querySelector(sel);
  }
  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }
  function esc(s) {
    return String(s == null ? "" : s);
  }

  // -- step navigation ---------------------------------------------------------
  var currentStep = 1;
  function goToStep(n) {
    currentStep = n;
    document.querySelectorAll(".step-panel").forEach(function (p) {
      p.classList.toggle("active", p.dataset.step === String(n));
    });
    document.querySelectorAll(".stepper li").forEach(function (li) {
      var s = parseInt(li.dataset.step, 10);
      li.classList.toggle("done", s < n);
      li.classList.toggle("current", s === n);
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // -- state -------------------------------------------------------------------
  var applicant = null; // {given_name, family_name, email}
  var liveRecord = null; // appended to bronze only after genuine ov-success
  var sdkReady = false;

  // -- step 1: application form --------------------------------------------------
  function wireForm() {
    var form = $("#apply-form");
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      applicant = {
        given_name: $("#first-name").value.trim(),
        family_name: $("#last-name").value.trim(),
        email: $("#email").value.trim(),
      };
      if (!applicant.given_name || !applicant.family_name) return;
      $("#applicant-summary").textContent =
        applicant.given_name + " " + applicant.family_name;
      goToStep(2);
      initVerification();
    });
  }

  // -- step 2: verification ------------------------------------------------------
  function initVerification() {
    var live = $("#verify-live");
    var placeholder = $("#verify-placeholder");
    if (!hasCredentials()) {
      live.style.display = "none";
      placeholder.style.display = "block";
      return;
    }
    placeholder.style.display = "none";
    live.style.display = "block";
    if (sdkReady) return;

    var cfg = getConfig();
    var initCfg = { licenseKey: cfg.licenseKey, profileId: cfg.profileId };
    if (cfg.apiBaseUrl) initCfg.baseUrl = cfg.apiBaseUrl;

    setVerifyStatus("Connecting to Credence ID…", "busy");
    window.VerifierSDK.init(initCfg)
      .then(function () {
        sdkReady = true;
        setVerifyStatus(
          "Ready. Click below, then scan the QR code with your phone's wallet app.",
          "ok"
        );
        wireVerifyButton();
      })
      .catch(function (err) {
        setVerifyStatus(
          "Verification is not available: " +
            (err && err.message ? err.message : err),
          "error"
        );
        $("#verify-hint").style.display = "block";
      });
  }

  function setVerifyStatus(msg, kind) {
    var s = $("#verify-status");
    s.textContent = msg;
    s.className = "status " + (kind || "");
  }

  function wireVerifyButton() {
    var btn = document.querySelector("ov-w3c-btn");
    if (!btn || btn.dataset.wired) return;
    btn.dataset.wired = "1";

    btn.addEventListener("ov-uri-ready", function (e) {
      var uri = e.detail && e.detail.uri;
      if (!uri) return;
      renderQr(uri);
      $("#qr-card").style.display = "block";
      setVerifyStatus("Waiting for your wallet… (session expires in ~2 min)", "busy");
    });

    btn.addEventListener("ov-success", function (e) {
      handleSuccess(e.detail);
    });

    btn.addEventListener("ov-error", function (e) {
      var msg =
        e.detail && e.detail.message ? e.detail.message : "Verification failed.";
      $("#qr-card").style.display = "none";
      setVerifyStatus(msg + " You can try again.", "error");
    });
  }

  function renderQr(uri) {
    try {
      var qr = qrcode(0, "M");
      qr.addData(uri);
      qr.make();
      var box = $("#qr-code");
      box.innerHTML = qr.createSvgTag({ scalable: true });
      // The deep link is also rendered by the SDK button itself; the QR is
      // the primary cross-device path for a desktop demo.
    } catch (err) {
      $("#qr-code").textContent = "Could not render QR code.";
    }
  }

  // Runs ONLY on a genuine SDK success event. Never called with made-up data.
  function handleSuccess(result) {
    if (!result || result.success !== true) {
      var detail =
        result && result.authStatus
          ? " Trust details: " + JSON.stringify(result.authStatus)
          : "";
      setVerifyStatus(
        "Verification completed, but the credential did not pass trust checks. No record was added to the pipeline." +
          detail,
        "error"
      );
      $("#qr-card").style.display = "none";
      return;
    }

    var claims = result.claims || {};
    liveRecord = {
      id: "rec-live-" + Date.now().toString(36),
      given_name: claims.given_name || "—",
      family_name: claims.family_name || "—",
      birth_date: claims.birth_date || "",
      state: claims.state || claims.region || "—",
      channel: "live-demo",
      email: applicant ? applicant.email : "",
      verified_at: new Date().toISOString(),
      source: "wallet",
    };

    setVerifyStatus("Identity verified.", "ok");
    $("#qr-card").style.display = "none";
    renderVerifiedCard(result);
    renderPipeline();
    goToStep(3);
  }

  function renderVerifiedCard(result) {
    var claims = result.claims || {};
    var card = $("#verified-card");
    card.innerHTML = "";
    var badge = el("div", "verified-badge", "✓ Verified by Credence ID");
    card.appendChild(badge);

    if (result.portrait) {
      var img = el("img", "portrait");
      img.src = result.portrait;
      img.alt = "Verified portrait from credential";
      card.appendChild(img);
    }

    var rows = [
      ["Name", esc(claims.given_name) + " " + esc(claims.family_name)],
      ["Birth year", esc(String(claims.birth_date || "").slice(0, 4)) || "—"],
    ];
    var dl = el("dl", "claims");
    rows.forEach(function (r) {
      dl.appendChild(el("dt", null, r[0]));
      var dd = el("dd");
      dd.textContent = r[1];
      dl.appendChild(dd);
    });
    card.appendChild(dl);

    var note = el(
      "p",
      "fineprint",
      "Shown: name and birth year from the genuine verification result. " +
        "Full claims are available to the business via the SDK response."
    );
    card.appendChild(note);
  }

  // -- step 3: pipeline ----------------------------------------------------------
  function renderPipeline() {
    var seedRows = window.VeriFlowData.buildSyntheticCustomers();
    var bronze = window.VeriFlowPipeline.toBronze(seedRows, liveRecord);
    var silver = window.VeriFlowPipeline.toSilver(bronze);
    var gold = window.VeriFlowPipeline.toGold(silver, applicant);

    renderTable($("#bronze-table"), bronze, true);
    renderTable($("#silver-table"), silver.rows, false);
    renderGold(gold);

    $("#pipeline-note").textContent = liveRecord
      ? "Live verified record appended to bronze just now — watch it flow through."
      : "Previewing the pipeline on synthetic seed data. A live verified record will appear here after a real wallet verification.";
  }

  function renderTable(tbody, rows, showRaw) {
    tbody.innerHTML = "";
    rows.forEach(function (r) {
      var tr = document.createElement("tr");
      if (r.isLive) tr.className = "live-row";
      [
        r.id,
        r.given_name + " " + r.family_name,
        r.birth_date || "—",
        r.state,
        r.channel,
        r.isLive ? "NEW ✓" : "seed",
      ].forEach(function (v) {
        var td = document.createElement("td");
        td.textContent = v;
        tr.appendChild(td);
      });
      tbody.appendChild(tr);
    });
  }

  function renderGold(gold) {
    var cards = $("#gold-cards");
    cards.innerHTML = "";
    var items = [
      [String(gold.totalVerified), "verified customers"],
      [String(gold.duplicatesBlocked), "duplicate signups blocked"],
      [
        gold.nameMatch === null
          ? "—"
          : gold.nameMatch
            ? "Match ✓"
            : "Mismatch ⚠",
        "application name vs verified ID",
      ],
    ];
    items.forEach(function (it) {
      var c = el("div", "kpi");
      c.appendChild(el("div", "kpi-value", it[0]));
      c.appendChild(el("div", "kpi-label", it[1]));
      cards.appendChild(c);
    });

    var states = Object.keys(gold.byState).sort();
    $("#gold-by-state").textContent = states
      .map(function (s) {
        return s + ": " + gold.byState[s];
      })
      .join(" · ");
  }

  // -- preview (synthetic only, no fake verification) ------------------------------
  function wirePreview() {
    var btn = $("#preview-pipeline");
    if (!btn) return;
    btn.addEventListener("click", function () {
      goToStep(3);
      renderPipeline();
    });
  }

  // -- boot ------------------------------------------------------------------------
  document.addEventListener("DOMContentLoaded", function () {
    wireForm();
    wirePreview();
    goToStep(1);
  });
})();
