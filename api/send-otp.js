// Vercel Serverless Function — Send OTP via Fast2SMS
import https from "node:https";
import { storeOtp } from "./otp-store.js";

function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

async function sendFast2SMS(apiKey, phone, otp) {
  const url = `https://www.fast2sms.com/dev/bulkV2?authorization=${apiKey}&variables_values=${otp}&route=otp&numbers=${phone}`;

  return new Promise((resolve, reject) => {
    const req = https.get(url, res => {
      let data = "";
      res.on("data", c => data += c);
      res.on("end", () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(data) }); }
        catch { resolve({ status: res.statusCode, body: data }); }
      });
    });
    req.on("error", reject);
    req.setTimeout(8000, () => { req.destroy(new Error("SMS gateway timeout")); });
  });
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST")   return res.status(405).json({ success: false, error: "Method not allowed" });

  const body = req.body || {};
  const phone = body.phone;

  if (!phone || phone.replace(/\D/g, "").length < 10) {
    return res.status(400).json({ success: false, error: "Please enter a valid 10-digit mobile number." });
  }

  const cleanPhone = phone.replace(/\D/g, "").slice(-10);
  const apiKey     = process.env.FAST2SMS_API_KEY;
  const projectId  = process.env.FIREBASE_PROJECT_ID || "digifamily-29d1d";
  const fbApiKey   = process.env.FIREBASE_API_KEY    || "AIzaSyBEjVvv7xg_QNy9XY7QNr4azZME1ECWzWw";

  const otp = generateOtp();

  try {
    // 1. Store OTP securely in Firestore (or local memory fallback)
    await storeOtp(cleanPhone, otp, projectId, fbApiKey);

    // 2. If Fast2SMS key is present, attempt live SMS
    if (apiKey) {
      try {
        const smsResult = await sendFast2SMS(apiKey, cleanPhone, otp);
        if (smsResult.body && smsResult.body.return === true) {
          console.log(`[Fast2SMS Live SMS ✓] Dispatched to +91${cleanPhone}`);
          return res.status(200).json({ 
            success: true, 
            message: "Live SMS sent to +91 " + cleanPhone 
          });
        } else {
          const rawMsg = smsResult.body?.message;
          const errMsg = Array.isArray(rawMsg) ? rawMsg.join(", ") : (typeof rawMsg === "string" ? rawMsg : JSON.stringify(smsResult.body));
          console.warn("[Fast2SMS Gateway Notice]:", errMsg);

          // Non-blocking fallback: Return OTP with warning so user can still log in while completing KYC/verification
          return res.status(200).json({ 
            success: true, 
            devMode: true,
            devOtp: otp,
            warning: "Fast2SMS verification needed: " + errMsg,
            message: `Fast2SMS verification pending. Temporary Login OTP: ${otp}`
          });
        }
      } catch (smsNetErr) {
        console.warn("[Fast2SMS Network Error]:", smsNetErr.message);
        return res.status(200).json({ 
          success: true, 
          devMode: true,
          devOtp: otp,
          warning: "SMS Gateway unreachable (" + smsNetErr.message + ")",
          message: `Temporary Login OTP: ${otp}`
        });
      }
    }

    // 3. Fallback when running without FAST2SMS_API_KEY (e.g. localhost testing)
    console.log(`[Dev Mode OTP] +91${cleanPhone} => ${otp}`);
    return res.status(200).json({
      success: true,
      devMode: true,
      devOtp: otp,
      message: `Fast2SMS key not set. Testing code: ${otp}`
    });

  } catch (err) {
    console.error("[send-otp error]", err);
    return res.status(500).json({ success: false, error: err.message || "Failed to process OTP request" });
  }
}
