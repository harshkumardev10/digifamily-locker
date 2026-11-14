// Vercel Serverless Function — Verify OTP
import { verifyAndConsumeOtp } from "./otp-store.js";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin",  "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST")   return res.status(405).json({ success: false, error: "Method not allowed" });

  const body = req.body || {};
  const { phone, otp } = body;

  if (!phone || !otp) {
    return res.status(400).json({ success: false, error: "Phone number and 6-digit OTP code are required." });
  }

  const cleanPhone = phone.replace(/\D/g, "").slice(-10);
  const projectId  = process.env.FIREBASE_PROJECT_ID || "digifamily-29d1d";
  const fbApiKey   = process.env.FIREBASE_API_KEY    || "AIzaSyBEjVvv7xg_QNy9XY7QNr4azZME1ECWzWw";

  try {
    const result = await verifyAndConsumeOtp(cleanPhone, otp, projectId, fbApiKey);

    if (!result.valid) {
      return res.status(400).json({ success: false, error: result.error });
    }

    console.log(`[OTP Verified ✓] +91${cleanPhone}`);
    return res.status(200).json({ 
      success: true, 
      message: "OTP successfully verified.", 
      phone: cleanPhone 
    });
  } catch (err) {
    console.error("[verify-otp error]", err);
    return res.status(500).json({ success: false, error: err.message || "Failed to verify OTP" });
  }
}
