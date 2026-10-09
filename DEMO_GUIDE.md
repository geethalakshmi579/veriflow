# VeriFlow — Demo Guide (for Geetha)

Your slides and narration must be **your own words** — this guide gives you
structure and timing only, not copy. Write every slide yourself.

## The product story (one line)

"VeriFlow verifies a customer's mobile ID and lands trusted identity data
straight into your pipeline — verified identity in, trusted customer data out."

## Deck outline (suggested, 8–9 slides)

1. **Title** — product name, one-line promise, your name.
2. **The problem** — make it feel real: fake signups, slow painful KYC,
   dirty identity data polluting downstream analytics. One concrete pain beats
   three vague ones.
3. **The product** — what VeriFlow is and who it's for, in one or two
   sentences. (Fictional customer in the demo: "Northgate Bank" onboarding.)
4. **Live demo** — this is the heart. Screenshots or a live walkthrough:
   apply → scan QR → verified claims → bronze → silver → gold.
5. **How it works** — simple architecture: Tap2iD Cloud SDK (QR / OpenID4VP) →
   verified claims → pipeline. No jargon; a fresher should follow it.
6. **Why I built it this way** — be ready to defend: real SDK integration
   (nothing faked), verification results only from genuine SDK events,
   all demo data synthetic (seed 42, labeled in the UI).
7. **AI disclosure** — they explicitly ask: say what AI helped build
   (the demo code), and that the slides and pitch are your own.
8. **Try it yourself** — live link + repo link. Invite them to scan the QR
   with their own wallet.
9. **Close** — one takeaway line. End on the product, not on process.

## 5-minute video flow

- **0:00–0:30** — face to camera: the problem, the product promise.
- **0:30–3:30** — screen share: run the flow live. Apply → generate QR →
  scan with wallet → verified result → watch the record land in bronze,
  get cleaned in silver, roll into gold.
- **3:30–4:30** — architecture + why you built it this way (brief).
- **4:30–5:00** — face to camera: close + invite them to try the live link.

## Recording tips

- **Rehearse the QR timing.** A session expires after ~2 minutes — have the
  wallet app open and ready *before* you generate the QR. If it expires,
  click again; it's built to restart cleanly.
- **Be honest on camera.** If the trust check doesn't pass with a test
  wallet, say so plainly ("this test credential completes the flow; only a
  real issued ID earns the verified badge") — then point them at the live
  link to try it themselves. Customers notice honesty.
- **Show your face** at the start and the close, minimum.
- **Test the video link in an incognito window** — it must open with no login.

## Submission checklist

- [ ] Slide deck (PDF or link)
- [ ] Video link (≤ 5 min, opens without login — incognito-tested)
- [ ] Code link (GitHub repo) + working prototype link (live site)
- [ ] Email to **bella@credenceid.com**
- [ ] Subject exactly: `Solution Engineer Assignment - Venkata Geetha Lakshmi Gunda`
- [ ] Send by **Thursday Oct 15 morning ET** — deadline is 1:00 PM Pacific
      (4:00 PM ET) and does not move. Don't flirt with it.

## Setup you still need to do (10 min, after the site is live)

1. Register at https://verify.credenceid.com → Account Settings → SDK Key
   Management → Generate Key.
2. Paste `licenseKey` + `profileId` into `js/config.js`, commit, push.
3. Register the exact public domain (`https://geethalakshmi579.github.io`)
   in your verification profile in the portal — the SDK rejects
   unregistered domains.
4. Send Bella the test-credential email (draft already with you).
