import nodemailer from "nodemailer";

const host = process.env.EMAIL_SERVER_HOST;
const port = process.env.EMAIL_SERVER_PORT;
const user = process.env.EMAIL_SERVER_USER;
const pass = process.env.EMAIL_SERVER_PASSWORD;
const from = process.env.EMAIL_FROM;

function createTransporter() {
  if (!host || !port || !user || !pass || !from) {
    throw new Error("Email server env vars are not configured.");
  }

  return nodemailer.createTransport({
    host,
    port: Number(port),
    auth: { user, pass },
    connectionTimeout: 8000,
    greetingTimeout: 8000,
    socketTimeout: 10000,
  });
}

export async function sendVerificationEmail(email: string, token: string) {
  const transporter = createTransporter();

  const appUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
  const verifyUrl = `${appUrl}/verify-email?token=${token}`;

  await transporter.sendMail({
    from,
    to: email,
    subject: "Verify your email",
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.5;">
        <h2>Verify your email</h2>
        <p>Thanks for signing up. Click the button below to verify your email.</p>
        <p><a href="${verifyUrl}" style="background:#0f172a;color:white;padding:10px 16px;border-radius:6px;text-decoration:none;display:inline-block;">Verify Email</a></p>
        <p>If the button doesn't work, copy and paste this link:</p>
        <p>${verifyUrl}</p>
      </div>
    `,
  });
}

export async function sendOrderStatusEmail(
  email: string,
  name: string,
  status: "PENDING" | "ACCEPTED" | "COMPLETED"
) {
  const transporter = createTransporter();
  const label =
    status === "PENDING"
      ? "Pending"
      : status === "ACCEPTED"
      ? "Accepted"
      : "Completed";

  await transporter.sendMail({
    from,
    to: email,
    subject: `Order status updated: ${label}`,
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.5;">
        <h2>Order status update</h2>
        <p>Hello ${name || "there"},</p>
        <p>Your order status is now <strong>${label}</strong>.</p>
        <p>Thank you for choosing NiceKom Oils.</p>
      </div>
    `,
  });
}
