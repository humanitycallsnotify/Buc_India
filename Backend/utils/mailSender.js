import { BrevoClient } from "@getbrevo/brevo";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const client = new BrevoClient({ apiKey: process.env.BREVO_API_KEY });

export const sendOTP = async (email, otp, type) => {
  let subject = "Reset your BUC India Password";
  let actionText = "resetting your password";

  if (type === "signup" || type === "talent_signup" || type === "club_signup") {
    subject = "Verify your BUC India Account";
    actionText = "signing up";
  } else if (type === "registration") {
    subject = "Verify your Email for BUC India Registration";
    actionText = "registering for an event";
  }

  const logoUrl = "https://res.cloudinary.com/dhdxoawdk/image/upload/v1779437906/qszeyqwcg2qa9vfmpzjh.jpg";

  try {
    await client.transactionalEmails.sendTransacEmail({
      subject: subject,
      sender: {
        name: process.env.BREVO_SENDER_NAME,
        email: process.env.BREVO_SENDER_EMAIL,
      },
      to: [{ email: email }],
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
          <img src="${logoUrl}" alt="BUC India" class="logo" />
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

export const sendRegistrationConfirmation = async (email, details) => {
  const { fullName, tshirtSize, bucId, clubName } = details;
  const logoUrl = "https://res.cloudinary.com/dhdxoawdk/image/upload/v1779437906/qszeyqwcg2qa9vfmpzjh.jpg";

  try {
    await client.transactionalEmails.sendTransacEmail({
      subject: "Welcome to BUC India - Registration Successful!",
      sender: {
        name: process.env.BREVO_SENDER_NAME,
        email: process.env.BREVO_SENDER_EMAIL,
      },
      to: [{ email: email }],
      htmlContent: `
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
          <img src="${logoUrl}" alt="BUC India" class="logo" />
          <h1 style="font-size: 24px; margin-top: 10px;">Bikers Unity Calls</h1>
        </div>
        <div class="content">
          <p>Hello <strong>${fullName}</strong>,</p>
          <p>Welcome to BUC India! Your registration has been successfully processed.</p>
          
          <div class="buc-id">${bucId}</div>
          
          <div class="details-box">
            <div class="details-row"><span class="details-label">Name:</span> ${fullName}</div>
            ${tshirtSize ? `<div class="details-row"><span class="details-label">T-Shirt Size:</span> ${tshirtSize}</div>` : ''}
            ${clubName ? `<div class="details-row"><span class="details-label">Club:</span> ${clubName}</div>` : ''}
          </div>
          
          <p>We are thrilled to have you with us. Keep this BUC ID safe as you will need it for future interactions and events.</p>
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
    console.error("Error sending welcome email via Brevo:", error);
    throw error;
  }
};
