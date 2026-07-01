/**
 * SMTP diagnostic — run ON THE LIVE SERVER to find WHERE email breaks.
 *
 *   node scripts/mail-doctor.mjs            # verify connection + auth
 *   node scripts/mail-doctor.mjs you@x.com  # also send a real test email
 *
 * It checks each boundary in order and prints the exact error:
 *   1. env vars present in the process   (Hostinger env -> Node)
 *   2. TCP + TLS + login                 (transporter.verify)
 *   3. sender policy + delivery          (test send from MAIL_FROM)
 *
 * Run from the project root. If your env lives in a .env file (not Hostinger's
 * env UI), it's loaded via dotenv when available; otherwise process.env is used.
 */
import nodemailer from "nodemailer";

// Optional: load a .env file if dotenv happens to be installed. Hostinger's
// env-var UI already populates process.env, so this is a best-effort no-op then.
try {
  await import("dotenv/config");
} catch {
  // dotenv not installed — rely on process.env (Hostinger env UI / shell export)
}

const host = process.env.MAIL_HOST;
const port = Number(process.env.MAIL_PORT ?? 587);
const user = process.env.MAIL_USER;
const pass = process.env.MAIL_PASS;
const from = process.env.MAIL_FROM || "JCI Beauty <no-reply@jcibeauty.com>";

console.log("=== 1. Env vars visible to this process ===");
console.log("MAIL_HOST:", host || "(UNSET)");
console.log("MAIL_PORT:", port);
console.log("MAIL_USER:", user || "(UNSET)");
console.log("MAIL_PASS:", pass ? `(set, ${pass.length} chars)` : "(UNSET)");
console.log("MAIL_FROM:", from);

if (!host || !user || !pass) {
  console.error(
    "\nFAIL @ boundary 1: env vars missing in the process.\n" +
      "The app was likely NOT restarted after you set them. Restart the Node app.",
  );
  process.exit(1);
}

const transporter = nodemailer.createTransport({
  host,
  port,
  secure: port === 465,
  auth: { user, pass },
});

console.log("\n=== 2. Verify connection + login (transporter.verify) ===");
try {
  await transporter.verify();
  console.log("OK: connected and authenticated.");
} catch (e) {
  console.error("FAIL @ boundary 2 (connection/auth):");
  console.error(e);
  process.exit(1);
}

const to = process.argv[2];
if (!to) {
  console.log("\nSkipping test send (pass a recipient to try one).");
  process.exit(0);
}

console.log(`\n=== 3. Test send  ${from}  ->  ${to} ===`);
try {
  const info = await transporter.sendMail({
    from,
    to,
    subject: "JCI Beauty mail-doctor test",
    text: "If you can read this, SMTP delivery works.",
  });
  console.log("OK: accepted:", info.accepted, "| response:", info.response);
} catch (e) {
  console.error("FAIL @ boundary 3 (sender policy / delivery):");
  console.error(e);
  console.error(
    "\nIf this says the sender is rejected/not allowed, MAIL_FROM " +
      "(no-reply@jcibeauty.com) is not a real mailbox on Hostinger while you " +
      "auth as " + user + ". Fix: create that mailbox, OR set MAIL_FROM to use " +
      user + ".",
  );
  process.exit(1);
}
