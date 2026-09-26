import nodemailer from "nodemailer";
import { requireEnv } from "../utils/require-env.js";

const transport = nodemailer.createTransport({
  host: requireEnv("SMTP_HOST"),
  port: requireEnv("SMTP_PORT"),
  auth: {
    user: requireEnv("SMTP_USER"),
    pass: requireEnv("SMTP_PASS"),
  },
});

async function sendMail(
  to: string,
  subject: string,
  text: string,
  html: string,
) {
  try {
    return await transport.sendMail({
      from: requireEnv("SMTP_FROM_EMAIL"),
      to,
      subject,
      html,
      text,
    });
  } catch (err) {
    console.error(`Failed to send mail to ${to} : ${err}`);
    throw err;
  }
}

export const sendVerificationMail = async (email: string, token: string) => {
  // Email(Input email) -> To
  const URL = `${requireEnv("CLIENT_URL")}/verify-email/${token}`;
  const subject = "Verify your email";

  const html = `
    <h2>Welcome!</h2>
    <p>Thank you for registering.</p>
    <p>Please click the button below to verify your email.</p>
    <a href="${URL}">Verify email</a>
  `;

  const text = `Welcome! Verify your email using this link: ${URL}`;

  await sendMail(email, subject, text, html);
};
