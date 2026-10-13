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
  licenseKey: "CS_5006900575684ee8bfaa33d7e19d829b",
  profileId: " "Age Check Profile 2.0": "1289dbb9-4d60-11f1-bf44-023b9538e812" ",

  // Optional: override the Online Verifier backend. Leave commented out to use
  // the backend baked into the published @credenceid/online-verifier package
  // (currently https://credenceid.com/cloudsdk/playground/).
  // apiBaseUrl: "https://credenceid.com/cloudsdk/playground/",
};
