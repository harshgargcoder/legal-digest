const crypto = require('crypto');
const forge = require('node-forge');

const userKeyEnvLocal = `-----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC7CaGn3Ll+wYwp
QcXffdksX4S1uK2cNA3b6NEnVpSXXFHASH75Dz44WXFBKlqtn1WHWFAk70otU+W1
I/R+ATImBtmtbfgiyRB1O2+Wu1ph0D+fKGl8e1w9OC2e0OKxDAu+ZbNoHYQFILRy
GefMAVTH3HCn6hKXUBZYdgC5gHo/A0FzJVE6unjGx8dp4jwRuiv5Wg3gG0SveCUJ
Af1M9wO/PJsJ3txKPNIA+obaINqQcEDtKInDOyFgjIeTcT/e+TpRFB9EkepvkXTu
2NqO6m/vEqgjsO4aciH+F+BncWVhsP82UhFSW5IkB+6VH5gCC24H0hL8+jMQXAdR
JH701Jc7AgMBAAECggEATKKPImzdcjLSf4sMDN0PMU+33A9dzw1DCnJT1Fb0zinM
80ihAeJ9f3AiZ+13NwF8dVa5i9Ch532jNnuTb1eFGTCgWx+eVn5kqGwgdjWwvDgs
AUX5JsCS1CCjDJoQ8DL70tjvz/6b+8/hL4kuwRdgif1oCVzuniH57ef3twoNzKgQ
MEOgM4NeroKVF22X2l8IDgmG1+gHUrSqwxTJc2QKfSvPB0ebIP2LsGqNQ/eOQ+Vh
fnSAPRsNe0SuQ10iBw6xkzHSRtA6cFuUHqsPtgtqZENmEQhOjjhL56bwK2JT9KTa
O5CoOhGBc62x1dvkI7zZY6hPpDZrek6ZHDcohaHBgQKBgQDw9mPSJv0Q/gkfDKFk
IZ8Wz5+wvL4ld5a5KJQMy7TKwLVv6ue2dtgwdaufPB/thSO91cYH/ad7OvlmThri
qLy4NbAjgppQ+DGsc0cIumdO0MX9TNNqyA0m0hW5QkMo8GEtOLLOLqfcKslERB2f
v+HmJkw56gSy8jfhxFRezU24uwKBgQDGtb1eYpxAJkapmoEyeA41UuXcoZDFyVWP
nP6QDdymn4cH0i5R8XGmdiSHcmKIWr+xM53WpqzHRzENEWpuULQF5ozJ4nNpcxlrT
bfzBBrXCCdZysSqAG9l+kF/eme27yZbzjLUod5hapSSfzh+/c5ReERHP5dTO3ODj
X+XXPmPzgQKBgGa3kYvHJP+2WusKdk356xhNP3SWsLPGC9E4VAw0VghMJ8vipg3p
EXVu488IUU/t/nNxCm7jmR514FTVHK7cYT5hXIl2phO4CWzK40/8LgeyBYRZ2JHf
X4PZ8Hq9nWV5OuONFOPBjbrT3mIka0BrCoASeVICySgDCwFJsPGMsQH7AoGAIR/4
wnwzyenXi7xq3yvuSmtYUDBKvv3yGmAkikNaGVdkCs0d4qFRJebPU0PKeXe4L5XC
IpecRXoEmKd2Gfxqq4lOB5c2O5MBXw+Nu+vPbtpO+m2YRSTfW977bbHNCkzRmypDh
Pi65ohq3gUBOQI8W45t62apZkGZ3ws+gtAH9jYECgYEA02ze2OLz2tKEKi5iaRNy
hhY3b+YQ7GAF+nnnfhnj7LVwAsm4T0BHlY3PQBibbsVgTtv+HH1ynQO6jU4HIla8
SOXCad+xuZZtGRHekoRH21pFbD2rqGPjrocsRwGxGzOOrSvAf/Oc+dXpsVXMNmLK
FTw1LLApQPpzyJylK7/eEgg=
-----END PRIVATE KEY-----`;

function checkKey(keyStr) {
    let rawKey = keyStr
        .replace(/-----BEGIN PRIVATE KEY-----/g, "")
        .replace(/-----END PRIVATE KEY-----/g, "")
        .replace(/\\n/g, "")
        .replace(/\\r/g, "")
        .replace(/\s+/g, "")
        .replace(/['"]/g, "");

      const matched = rawKey.match(/.{1,64}/g);
      const pem = [
          "-----BEGIN PRIVATE KEY-----",
          ...matched,
          "-----END PRIVATE KEY-----",
        ].join("\n") + "\n";
        
    try {
      forge.pki.privateKeyFromPem(pem);
      return true;
    } catch(e) {
      return false;
    }
}

// Let's identify the extra chars by brute force removal
let rawBase64 = userKeyEnvLocal
    .replace(/-----BEGIN PRIVATE KEY-----/g, "")
    .replace(/-----END PRIVATE KEY-----/g, "")
    .replace(/\\n/g, "")
    .replace(/\\r/g, "")
    .replace(/\s+/g, "")
    .replace(/['"]/g, "");

console.log("Original Length:", rawBase64.length); // 1625

// If we remove exactly 1 character from line 16 and line 22, it's 1623 chars. Does base64 need padding?
// A base64 string length MUST be a multiple of 4.
// 1625 is 1 extra char over 1624.
// If it's 1624, we only need to remove 1 character TOTAL.
// So either line 16 or line 22 has 1 extra char, but wait! If BOTH are 65, and all others are 64, the length should be (24*64) + 65 + 65 + 24 = 65+65 = 130 + 1536 + 24 = 1690.
// Let's print out lines and their lengths for userKeyEnvLocal.
const lines = userKeyEnvLocal.split('\n').filter(l => !l.includes('PRIVATE KEY') && l.trim().length > 0);
let total = 0;
lines.forEach((l, i) => {
    total += l.length;
});
console.log("Total chars from lines:", total); // 1626 chars if two lines are 65 and one is 24. (1536-128) + 130 + 24 = 1408 + 130 + 24 = 1562?? Wait.
// Let's just find which single or double character removal makes it parse successfully!

let successFound = false;
for (let i = 0; i < rawBase64.length; i++) {
    const candidate1 = rawBase64.substring(0, i) + rawBase64.substring(i + 1);
    if (checkKey(candidate1)) {
        console.log(`Success removing char at index ${i}: '${rawBase64[i]}'`);
        successFound = true;
    }
    // Also try removing 2 chars if lengths are really off
    for (let j = i; j < rawBase64.length; j++) {
       const candidate2 = rawBase64.substring(0, i) + rawBase64.substring(i + 1, j) + rawBase64.substring(j + 1);
       if (checkKey(candidate2)) {
          // console.log(`Success removing chars at ${i} ('${rawBase64[i]}') and ${j} ('${rawBase64[j]}')`);
          successFound = true;
       }
    }
}

if (!successFound) {
    console.log("Could not fix it by removing 1 or 2 characters.");
}
