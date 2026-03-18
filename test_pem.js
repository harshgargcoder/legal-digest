const crypto = require('crypto');

const { privateKey } = crypto.generateKeyPairSync('rsa', {
  modulusLength: 2048,
  publicKeyEncoding: {
    type: 'spki',
    format: 'pem'
  },
  privateKeyEncoding: {
    type: 'pkcs8',
    format: 'pem',
  }
});

function testParse(pem, desc) {
    try {
        crypto.createPrivateKey(pem);
        console.log(desc, "Success");
    } catch(e) {
        console.log(desc, "Error:", e.message);
    }
}

// 1. Success case
testParse(privateKey, "Original");

// 2. Trailing garbage - DOES THIS CAUSE THE ASN.1 error?
testParse(privateKey + "GARBAGE", "Trailing Garbage");

// 3. Test my normalize function on the original
function normalizeKey(configPrivateKey) {
        let rawKey = configPrivateKey
            .replace(/-----BEGIN PRIVATE KEY-----/g, "")
            .replace(/-----END PRIVATE KEY-----/g, "")
            .replace(/\\n/g, "")
            .replace(/\\r/g, "")
            .replace(/\s+/g, "") // Removes all spaces, actual newlines, tabs
            .replace(/['"]/g, ""); // Remove any stray quotes

          // Standard PEM format wraps at 64 characters
          const matched = rawKey.match(/.{1,64}/g);
          if (matched && rawKey.length > 100) {
            return [
              "-----BEGIN PRIVATE KEY-----",
              ...matched,
              "-----END PRIVATE KEY-----",
            ].join("\n") + "\n";
          }
          return configPrivateKey;
}

testParse(normalizeKey(privateKey), "Normalized Original");

// 4. Test missing character
testParse(normalizeKey(privateKey.replace('e', '')), "Missing a char");

// 5. Test extra character in middle
const modified = privateKey.slice(0, 100) + 'A' + privateKey.slice(100);
testParse(normalizeKey(modified), "Extra char in middle");

// 6. Test Base64 decoding fallback
// Simulate what the base64 route does
const b64 = Buffer.from(JSON.stringify({ private_key: privateKey })).toString('base64');
const decoded = Buffer.from(b64, 'base64').toString('utf-8');
const parsed = JSON.parse(decoded);
testParse(normalizeKey(parsed.private_key), "Base64 roundtrip");

// 7. Base64 fallback but the user copied it with quotes?
const b64WithQuotes = `"${b64}"`;
try {
  const d2 = Buffer.from(b64WithQuotes, 'base64').toString('utf-8');
  JSON.parse(d2);
  console.log("Base64 with quotes Success");
} catch(e) {
  console.log("Base64 with quotes Error:", e.message);
}
