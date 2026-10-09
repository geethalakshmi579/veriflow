# VeriFlow — Verified identity in, trusted customer data out

A customer-onboarding demo built for a **Solutions Engineer take-home
assignment (Credence ID)**. A fictional business ("Northgate Bank") verifies a
new customer's mobile ID (driver's license in Apple / Google / Samsung Wallet,
or a state wallet app) with Credence ID's **Tap2iD Cloud SDK**, and the
verified identity attributes flow straight into a trusted data pipeline
(bronze → silver → gold).

**Live demo:** https://geethalakshmi579.github.io/veriflow/

## The flow

1. **Apply** — start a fictional new-account application.
2. **Verify ID** — the real `@credenceid/online-verifier` web component
   (`<ov-w3c-btn>`) opens a W3C OpenID4VP session, shows a QR code, and polls
   for the wallet's response. The backend cryptographically validates the
   credential; only a genuine `ov-success` event adds a record.
3. **Trust the data** — the verified record lands in a bronze table, gets
   cleaned/deduped in silver, and rolls into gold aggregates (verified counts,
   duplicates blocked, application-name-vs-ID match check).

All demo customer data is **synthetic** (deterministic seed 42, labeled in the
UI). No real identities are used, shown, or stored. Verification results come
only from live SDK events — nothing is faked.

## Setup (to run the live verification)

1. Register (free, self-service) at **https://verify.credenceid.com** and
   generate an SDK key under Account Settings → SDK Key Management.
2. Paste your `licenseKey` and `profileId` into `js/config.js`.
3. **Register this site's exact public domain** (e.g.
   `https://geethalakshmi579.github.io`) in your verification profile in the
   portal. `VerifierSDK.init()` validates the calling domain with Credence's
   backend and rejects unregistered domains (localhost will fail).
4. Open `index.html` via the public URL — the page enables the Verify button
   once `VerifierSDK.init()` succeeds.

Without credentials the page degrades gracefully: step 2 shows exactly what to
paste and where, and you can still preview the pipeline on synthetic data.

## Local development

```bash
npm install     # installs @credenceid/online-verifier + qrcode-generator
npm run build   # copies vendor browser bundles from node_modules
npm test        # pipeline unit tests (bronze/silver/gold, seeded data)
```

Serve the folder with any static server (e.g. `python3 -m http.server`) — but
note live verification requires the public domain registered in the portal
(see above).

## Notes & known SDK behavior

- The published npm package (v0.2.0) points at Credence's playground backend
  (`https://credenceid.com/cloudsdk/playground/`) by default; override with
  `apiBaseUrl` in `js/config.js` if your profile uses another environment.
- The QR session polls ~1/sec and expires after ~2 minutes — click the button
  again to restart a session.
- A successful `ov-success` requires a genuinely issued mobile credential;
  test wallets complete the protocol but fail backend trust checks, and the
  demo surfaces that honestly instead of adding the record.

## License

Demo code: MIT. Credence ID SDK: ISC (see `vendor/README.md`).
