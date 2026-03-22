import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import nodemailer from "nodemailer";
import crypto from "crypto";

const app = express();
const PORT = 3000;

app.use(express.json());

// In-memory store for OTPs (In production, use a database like Firestore)
const otpStore: Record<string, { otp: string; expires: number }> = {};

// Mock email transporter (Logs to console)
const transporter = nodemailer.createTransport({
  jsonTransport: true,
});

// API Routes
app.post("/api/auth/send-otp", async (req, res) => {
  const { email, phone } = req.body;
  const target = email || phone;

  if (!target) {
    return res.status(400).json({ error: "Email or phone is required" });
  }

  // Generate a 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expires = Date.now() + 5 * 60 * 1000; // 5 minutes expiry

  otpStore[target] = { otp, expires };

  // Log the OTP to the console for the user to see in the logs
  console.log(`\n--- [OTP SENT] ---`);
  console.log(`Target: ${target}`);
  console.log(`OTP: ${otp}`);
  console.log(`------------------\n`);

  // Simulate sending email
  if (email) {
    try {
      await transporter.sendMail({
        from: '"M3ALLEM Auth" <auth@m3allem.ma>',
        to: email,
        subject: "Your Verification Code",
        text: `Your verification code is: ${otp}. It expires in 5 minutes.`,
      });
    } catch (err) {
      console.error("Failed to send mock email:", err);
    }
  }

  res.json({ message: "OTP sent successfully" });
});

app.post("/api/auth/verify-otp", (req, res) => {
  const { target, otp } = req.body;

  if (!target || !otp) {
    return res.status(400).json({ error: "Target and OTP are required" });
  }

  const stored = otpStore[target];

  if (!stored) {
    return res.status(400).json({ error: "No OTP found for this target" });
  }

  if (Date.now() > stored.expires) {
    delete otpStore[target];
    return res.status(400).json({ error: "OTP has expired" });
  }

  if (stored.otp !== otp) {
    return res.status(400).json({ error: "Invalid OTP" });
  }

  // Success!
  delete otpStore[target];
  res.json({ success: true, message: "OTP verified successfully" });
});

async function startServer() {
  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
