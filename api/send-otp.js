// Vercel Serverless Function — Send OTP via Fast2SMS
// Environment variable needed: FAST2SMS_API_KEY
// Set it in Vercel Dashboard → Project → Settings → Environment Variables

const https = require("https");

function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Simple in-memory OTP store (works per function instance; for multi-instance use Firestore)
// We'll store in Firestore via REST API for reliability
async function storeOtpInFirestore(phone, otp, projectId, apiKey) {
  const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes
  const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/otps/${phone}?key=${apiKey}`;

  const body = JSON.stringify({
    fields: {
      otp:       { stringValue: otp },
      phone:     { stringValue: phone },
      expiresAt: { integerValue: expiresAt.toString() },
      createdAt: { integerValue: Date.now().toString() }
    }
  });

  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      path:     urlObj.pathname + urlObj.search,
      method:   "PATCH",
      headers:  { "Content-Type": "application/json", "Content-Length": Buffer.byteLength(body) }
    };
    const req = https.request(options, res => {
      let data = "";
      res.on("data", c => data += c);
      res.on("end", () => resolve({ status: res.statusCode, body: data }));
    });
    req.on("error", reject);
    req.write(body);
    req.end();
  });
}

async function sendFast2SMS(apiKey, phone, otp) {
  // Fast2SMS OTP route
  const url = `https://www.fast2sms.com/dev/bulkV2?authorization=${apiKey}&variables_values=${otp}&route=otp&numbers=${phone}`;

  return new Promise((resolve, reject) => {
    https.get(url, res => {
      let data = "";
      res.on("data", c => data += c);
      res.on("end", () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(data) }); }
        catch { resolve({ status: res.statusCode, body: data }); }
      });
    }).on("error", reject);
  });
}

module.exports = async function handler(req, res) {
  // CORS headers
  res.setHeader("Access-Control-Allow-Origin",  "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST")   return res.status(405).json({ success: false, error: "Method not allowed" });

  const { phone } = req.body || {};

  if (!phone || phone.replace(/\D/g, "").length < 10) {
    return res.status(400).json({ success: false, error: "Invalid phone number" });
  }

  const cleanPhone = phone.replace(/\D/g, "").slice(-10);
  const apiKey     = process.env.FAST2SMS_API_KEY;
  const projectId  = process.env.FIREBASE_PROJECT_ID || "digifamily-29d1d";
  const fbApiKey   = process.env.FIREBASE_API_KEY    || "AIzaSyBEjVvv7xg_QNy9XY7QNr4azZME1ECWzWw";

  if (!apiKey) {
    return res.status(500).json({ success: false, error: "SMS service not configured. Add FAST2SMS_API_KEY in Vercel environment variables." });
  }

  const otp = generateOtp();

  try {
    // Store OTP in Firestore
    await storeOtpInFirestore(cleanPhone, otp, projectId, fbApiKey);

    // Send SMS via Fast2SMS
    const smsResult = await sendFast2SMS(apiKey, cleanPhone, otp);

    if (smsResult.body && smsResult.body.return === true) {
      console.log(`[OTP SENT] +91${cleanPhone}`);
      return res.status(200).json({ success: true, message: "OTP sent successfully" });
    } else {
      console.error("[Fast2SMS Error]", smsResult.body);
      return res.status(500).json({ success: false, error: "SMS delivery failed: " + JSON.stringify(smsResult.body) });
    }
  } catch (err) {
    console.error("[send-otp error]", err);
    return res.status(500).json({ success: false, error: err.message || "Internal error" });
  }
};

