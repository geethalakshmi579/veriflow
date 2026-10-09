/**
 * build.js — copies vendored third-party browser files from node_modules.
 *
 * We install the REAL @credenceid/online-verifier package from npm and ship
 * its prebuilt browser bundle (dist/index.global.js) so the static site has
 * zero build step and works on plain GitHub Pages hosting.
 */
const fs = require("fs");
const path = require("path");

const root = __dirname;
const vendorDir = path.join(root, "vendor");
fs.mkdirSync(vendorDir, { recursive: true });

const copies = [
  [
    "node_modules/@credenceid/online-verifier/dist/index.global.js",
    "vendor/online-verifier.global.js",
  ],
  ["node_modules/qrcode-generator/qrcode.js", "vendor/qrcode.js"],
];

for (const [src, dest] of copies) {
  const from = path.join(root, src);
  const to = path.join(root, dest);
  if (!fs.existsSync(from)) {
    console.error(`MISSING: ${src} — run "npm install" first.`);
    process.exit(1);
  }
  fs.copyFileSync(from, to);
  console.log(`copied ${src} -> ${dest}`);
}

console.log("build complete: vendor/ is ready.");
