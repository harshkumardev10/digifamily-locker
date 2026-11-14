// Shared OTP Store with Firestore Cloud sync and local memory fallback
import https from "node:https";

const localMemoryOtpMap = new Map();

export async function storeOtp(phone, otp, projectId, apiKey) {
  const expiresAt = Date.now() + 5 * 60 * 1000; // 5 min
  localMemoryOtpMap.set(phone, { otp, expiresAt });

  try {
    const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/otps/${phone}?key=${apiKey}`;
    const body = JSON.stringify({
      fields: {
        otp:       { stringValue: otp },
        phone:     { stringValue: phone },
        expiresAt: { integerValue: expiresAt.toString() },
        createdAt: { integerValue: Date.now().toString() }
      }
    });

    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      path:     urlObj.pathname + urlObj.search,
      method:   "PATCH",
      headers:  { "Content-Type": "application/json", "Content-Length": Buffer.byteLength(body) }
    };

    await new Promise((resolve, reject) => {
      const req = https.request(options, res => {
        let data = "";
        res.on("data", c => data += c);
        res.on("end", resolve);
      });
      req.on("error", reject);
      req.setTimeout(3000, () => { req.destroy(); resolve(); });
      req.write(body);
      req.end();
    });
  } catch (err) {
    console.warn("[Firestore OTP store fallback to memory]:", err.message);
  }
}

export async function verifyAndConsumeOtp(phone, enteredOtp, projectId, apiKey) {
  let stored = null;

  // 1. Try Firestore
  try {
    const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/otps/${phone}?key=${apiKey}`;
    stored = await new Promise((resolve) => {
      const req = https.get(url, res => {
        let data = "";
        res.on("data", c => data += c);
        res.on("end", () => {
          try {
            const parsed = JSON.parse(data);
            if (parsed.fields) {
              resolve({
                otp:       parsed.fields.otp?.stringValue,
                expiresAt: parseInt(parsed.fields.expiresAt?.integerValue || "0")
              });
              return;
            }
          } catch (_) {}
          resolve(null);
        });
      });
      req.on("error", () => resolve(null));
      req.setTimeout(3000, () => { req.destroy(); resolve(null); });
    });
  } catch (_) {}

  // 2. Fallback to memory
  if (!stored && localMemoryOtpMap.has(phone)) {
    stored = localMemoryOtpMap.get(phone);
  }

  if (!stored) {
    return { valid: false, error: "No active OTP found. Please request a new OTP." };
  }

  if (Date.now() > stored.expiresAt) {
    localMemoryOtpMap.delete(phone);
    return { valid: false, error: "This OTP has expired. Please request a new code." };
  }

  if (stored.otp !== enteredOtp.trim()) {
    return { valid: false, error: "Incorrect OTP code. Please try again." };
  }

  // Valid — delete
  localMemoryOtpMap.delete(phone);
  try {
    const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/otps/${phone}?key=${apiKey}`;
    const urlObj = new URL(url);
    const req = https.request({ hostname: urlObj.hostname, path: urlObj.pathname + urlObj.search, method: "DELETE" });
    req.on("error", () => {});
    req.end();
  } catch (_) {}

  return { valid: true };
}

