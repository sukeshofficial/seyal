import nodemailer from "nodemailer";
// import dotenv from "dotenv";

// dotenv.config();

// Validate required env variables
const requiredEnvVars = [
  "EMAIL_HOST",
  "EMAIL_PORT",
  "EMAIL_USER",
  "EMAIL_PASS",
];

requiredEnvVars.forEach((envVar) => {
  if (!process.env[envVar]) {
    throw new Error(`Missing required env variable: ${envVar}`);
  }
});

const emailPort = Number(process.env.EMAIL_PORT);

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: emailPort,
  secure: emailPort === 465,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Verify SMTP connection
transporter.verify((error) => {
  if (error) {
    console.error("Mail Server Error ❌", error.message);
  } else {
    console.log("Mail Server Connected ✅");
  }
});

export default transporter;
