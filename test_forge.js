const forge = require('node-forge');
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

function testForge(pem, desc) {
    try {
        forge.pki.privateKeyFromPem(pem);
        console.log(desc, "Success");
    } catch(e) {
        console.log(desc, "Error:", e.message);
    }
}

// 1. Success case
testForge(privateKey, "Original");

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

testForge(normalizeKey(privateKey), "Normalized Original");

// WHAT CAUSES UNPARSED DER BYTES?
// Let's try trailing garbage
testForge(privateKey + "GARBAGE", "Trailing Garbage outside PEM");

// What if there is trailing garbage inside the base64, but it's valid base64?
// Let's take the base64, add valid base64 padding or chars.
const base64Only = privateKey.replace(/-----BEGIN PRIVATE KEY-----/g, "").replace(/-----END PRIVATE KEY-----/g, "").replace(/\s+/g, "");

// Add a valid base64 character 'A' at the end (before any =)
testForge([
  "-----BEGIN PRIVATE KEY-----",
  base64Only + "A",
  "-----END PRIVATE KEY-----"
].join("\n"), "Extra base-64 char at end");

testForge([
  "-----BEGIN PRIVATE KEY-----",
  base64Only + "AAAA",
  "-----END PRIVATE KEY-----"
].join("\n"), "Extra base-64 block at end");

// What if the \n replacement logic in firebase-admin actually broke it because the original key ALREADY HAD \n but I removed it?
// Wait, my normalizeKey removes ALL newlines and replaces them. That works for `privateKey`.
// What if the original userkey was NOT a pkcs8 key, but an RSA key?
testForge(`-----BEGIN RSA PRIVATE KEY-----
MIIEpQIBAAKCAQEA...
-----END RSA PRIVATE KEY-----`, "Wrong header");

