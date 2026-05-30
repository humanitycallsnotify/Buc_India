import { BrevoClient } from "@getbrevo/brevo";

const client = new BrevoClient({ apiKey: process.env.BREVO_API_KEY });

const LOGO_URL =
  "https://res.cloudinary.com/dhdxoawdk/image/upload/v1779437906/qszeyqwcg2qa9vfmpzjh.jpg";

export const sendOTP = async (email, otp, type) => {
  const subject =
    type === "signup"
      ? "Verify your BUC India Account"
      : "Reset your BUC India Password";
  const actionText =
    type === "signup" ? "signing up" : "resetting your password";

  try {
    await client.transactionalEmails.sendTransacEmail({
      subject,
      sender: {
        name: process.env.BREVO_SENDER_NAME,
        email: process.env.BREVO_SENDER_EMAIL,
      },
      to: [{ email }],
      htmlContent: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            .container { font-family: 'Inter', sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; }
            .header { text-align: center; margin-bottom: 30px; }
            .logo { width: 80px; height: 80px; border-radius: 50%; }
            .content { text-align: center; color: #1e293b; }
            .otp { font-size: 32px; font-weight: 800; color: #3b82f6; letter-spacing: 5px; margin: 24px 0; }
            .footer { text-align: center; font-size: 12px; color: #64748b; margin-top: 40px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <img src="${LOGO_URL}" alt="BUC India" class="logo" />
              <h1 style="font-size: 24px; margin-top: 10px;">Bikers Unity Calls</h1>
            </div>
            <div class="content">
              <h2>Verification Code</h2>
              <p>You are receiving this email because you are ${actionText} for BUC India.</p>
              <p>Please use the following One-Time Password (OTP) to complete the process:</p>
              <div class="otp">${otp}</div>
              <p>This code is valid for 10 minutes. Please do not share this code with anyone.</p>
            </div>
            <div class="footer">
              &copy; ${new Date().getFullYear()} Bikers Unity Calls. All rights reserved.<br/>
              Ride Together, Stand Together.
            </div>
          </div>
        </body>
        </html>
      `,
    });
    return true;
  } catch (error) {
    console.error("Error sending email via Brevo:", error);
    throw error;
  }
};

// Backward-compatible signature:
// - sendRegistrationConfirmation({ email, fullName, registrationType })
// - sendRegistrationConfirmation(email, { fullName, tshirtSize, bucId, clubName, registrationType })
export const sendRegistrationConfirmation = async (arg1, arg2) => {
  const normalized =
    typeof arg1 === "string"
      ? { email: arg1, ...(arg2 || {}) }
      : { ...(arg1 || {}) };

  const {
    email,
    fullName = "Rider",
    registrationType = "",
    tshirtSize = "",
    bucId = "",
    clubName = "",
  } = normalized;

  if (!email) return false;

  const hasBucIdTemplate = Boolean(bucId || tshirtSize || clubName);
  const subject = hasBucIdTemplate
    ? "Welcome to BUC India - Registration Successful!"
    : "BUC India Registration Confirmation";

  const htmlContent = hasBucIdTemplate
    ? `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          .container { font-family: 'Inter', sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; }
          .header { text-align: center; margin-bottom: 30px; }
          .logo { width: 80px; height: 80px; border-radius: 50%; }
          .content { color: #1e293b; line-height: 1.6; }
          .buc-id { font-size: 28px; font-weight: 800; color: #c19a6b; letter-spacing: 2px; margin: 20px 0; text-align: center; }
          .details-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 15px; margin: 20px 0; }
          .details-row { margin: 8px 0; }
          .details-label { font-weight: bold; color: #475569; width: 120px; display: inline-block; }
          .footer { text-align: center; font-size: 12px; color: #64748b; margin-top: 40px; border-top: 1px solid #e2e8f0; padding-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <img src="${LOGO_URL}" alt="BUC India" class="logo" />
            <h1 style="font-size: 24px; margin-top: 10px;">Bikers Unity Calls</h1>
          </div>
          <div class="content">
            <p>Hello <strong>${fullName}</strong>,</p>
            <p>Welcome to BUC India! Your registration has been successfully processed.</p>
            
            ${bucId ? `<div class="buc-id">${bucId}</div>` : ""}
            
            <div class="details-box">
              <div class="details-row"><span class="details-label">Name:</span> ${fullName}</div>
              ${tshirtSize ? `<div class="details-row"><span class="details-label">T-Shirt Size:</span> ${tshirtSize}</div>` : ""}
              ${clubName ? `<div class="details-row"><span class="details-label">Club:</span> ${clubName}</div>` : ""}
              ${registrationType ? `<div class="details-row"><span class="details-label">Type:</span> ${registrationType}</div>` : ""}
            </div>
            
            <p>Ride safe,<br/>BUC India Team</p>
          </div>
          <div class="footer">
            &copy; ${new Date().getFullYear()} Bikers Unity Calls. All rights reserved.<br/>
            Ride Together, Stand Together.
          </div>
        </div>
      </body>
      </html>
    `
    : `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; background: #f7f7f7; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 24px auto; background: #ffffff; border-radius: 10px; overflow: hidden; border: 1px solid #e8e8e8; }
          .header { background: #111111; color: #ffffff; padding: 20px; text-align: center; }
          .content { padding: 24px; color: #1d1d1d; line-height: 1.6; }
          .badge { display: inline-block; background: #f3e3cf; color: #7a4f20; padding: 6px 12px; border-radius: 999px; font-weight: 700; font-size: 12px; text-transform: uppercase; }
          .footer { padding: 16px 24px; background: #fafafa; border-top: 1px solid #eee; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2 style="margin:0;">Bikers Unity Calls - India</h2>
          </div>
          <div class="content">
            <p>Hi ${fullName},</p>
            <p>Thank you for registering with BUC India. Your registration has been received successfully.</p>
            ${registrationType ? `<p><span class="badge">${registrationType}</span></p>` : ""}
            <p>Our team will reach out if anything else is needed.</p>
            <p>Ride safe,<br/>BUC India Team</p>
          </div>
          <div class="footer">
            For support, contact the BUC India team.
          </div>
        </div>
      </body>
      </html>
    `;

  try {
    await client.transactionalEmails.sendTransacEmail({
      subject,
      sender: {
        name: process.env.BREVO_SENDER_NAME,
        email: process.env.BREVO_SENDER_EMAIL,
      },
      to: [{ email }],
      htmlContent,
    });
    return true;
  } catch (error) {
    console.error(
      "Registration confirmation email failed:",
      error?.message || error,
    );
    return false;
  }
};

