/* ============================================================================
 * VeriFlow demo configuration
 * ----------------------------------------------------------------------------
 * 1. Register (free, self-service) at https://verify.credenceid.com
 * 2. Go to Account Settings -> SDK Key Management -> Generate Key
 * 3. Paste your key and profile ID below.
 * 4. IMPORTANT: register this site's exact public domain
 *    (e.g. https://geethalakshmi579.github.io) in your verification profile
 *    in the portal. VerifierSDK.init() validates the calling domain with
 *    Credence's backend and rejects unregistered domains.
 * ========================================================================== */
window.VERIFLOW_CONFIG = {
  licenseKey: "PASTE_YOUR_LICENSE_KEY_HERE",
  profileId: "PASTE_YOUR_PROFILE_ID_HERE",

  // Optional: override the Online Verifier backend. Leave commented out to use
  // the backend baked into the published @credenceid/online-verifier package
  // (currently https://credenceid.com/cloudsdk/playground/).
  // apiBaseUrl: "https://credenceid.com/cloudsdk/playground/",
};
