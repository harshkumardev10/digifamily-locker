// Vercel Serverless Function — Verify OTP
// Checks the OTP stored in Firestore against what user entered

const https = require("https");

async function getOtpFromFirestore(phone, projectId, apiKey) {
  const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/otps/${phone}?key=${apiKey}`;

  return new Promise((resolve, reject) => {
    https.get(url, res => {
      let data = "";
      res.on("data", c => data += c);
      res.on("end", () => {
        try {
          const parsed = JSON.parse(data);
          if (parsed.fields) {
            resolve({
              otp:       parsed.fields.otp?.stringValue,
              expiresAt: parseInt(parsed.fields.expiresAt?.integerValue || "0"),
              phone:     parsed.fields.phone?.stringValue
            });
          } else {
            resolve(null);
          }
        } catch { resolve(null); }
      });
    }).on("error", reject);
  });
}

async function deleteOtpFromFirestore(phone, projectId, apiKey) {
  const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/otps/${phone}?key=${apiKey}`;

  return new Promise((resolve) => {
    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      path:     urlObj.pathname + urlObj.search,
      method:   "DELETE"
    };
    const req = https.request(options, res => {
      res.on("data", () => {});
      res.on("end", () => resolve());
    });
    req.on("error", () => resolve());
    req.end();
  });
}

module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin",  "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST")   return res.status(405).json({ success: false, error: "Method not allowed" });

  const { phone, otp } = req.body || {};

  if (!phone || !otp) {
    return res.status(400).json({ success: false, error: "Phone and OTP required" });
  }

  const cleanPhone = phone.replace(/\D/g, "").slice(-10);
  const projectId  = process.env.FIREBASE_PROJECT_ID || "digifamily-29d1d";
  const fbApiKey   = process.env.FIREBASE_API_KEY    || "AIzaSyBEjVvv7xg_QNy9XY7QNr4azZME1ECWzWw";

  try {
    const stored = await getOtpFromFirestore(cleanPhone, projectId, fbApiKey);

    if (!stored) {
      return res.status(400).json({ success: false, error: "No OTP found. Please request a new OTP." });
    }

    if (Date.now() > stored.expiresAt) {
      await deleteOtpFromFirestore(cleanPhone, projectId, fbApiKey);
      return res.status(400).json({ success: false, error: "OTP expired. Please request a new one." });
    }

    if (stored.otp !== otp.trim()) {
      return res.status(400).json({ success: false, error: "Incorrect OTP. Please check and try again." });
    }

    // OTP correct — delete it (one-time use)
    await deleteOtpFromFirestore(cleanPhone, projectId, fbApiKey);
    console.log(`[OTP VERIFIED] +91${cleanPhone}`);

    return res.status(200).json({ success: true, message: "OTP verified successfully", phone: cleanPhone });
  } catch (err) {
    console.error("[verify-otp error]", err);
    return res.status(500).json({ success: false, error: err.message || "Internal error" });
  }
};

