import { env } from "../config/env.js";

// Development without SMTP: prints the email to the server console.
// Production without SMTP: refuses to send, so tokens never leak into logs.
export const sendEmail = async ({ to, subject, text, html }) => {
  if (!env.smtp.host) {
    if (env.isProduction) throw new Error("SMTP is not configured; cannot send email.");
    console.log(`\n[mail:dev] To: ${to}\n[mail:dev] Subject: ${subject}\n${text}\n`);
    return { delivered: false };
  }

  const { default: nodemailer } = await import("nodemailer");
  const transporter = nodemailer.createTransport({
    host: env.smtp.host,
    port: env.smtp.port,
    secure: env.smtp.port === 465,
    auth: env.smtp.user ? { user: env.smtp.user, pass: env.smtp.pass } : undefined,
  });
  await transporter.sendMail({ from: env.smtp.from, to, subject, text, html });
  return { delivered: true };
};
