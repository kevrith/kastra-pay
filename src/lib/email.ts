import { Resend } from "resend";

// Lazy-init to avoid throwing during build when env var is missing
let _resend: Resend | null = null;
function getResend(): Resend | null {
  if (!process.env.RESEND_API_KEY) return null;
  if (!_resend) _resend = new Resend(process.env.RESEND_API_KEY);
  return _resend;
}

const FROM_EMAIL = process.env.FROM_EMAIL || "Kastra Pay <noreply@kastrapay.com>";

export async function sendPasswordResetEmail(
  to: string,
  token: string
): Promise<boolean> {
  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
  const resetUrl = `${baseUrl}/reset-password?token=${token}`;

  try {
    const resend = getResend();
    if (!resend) {
      console.warn("RESEND_API_KEY not set, skipping email");
      return false;
    }

    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: "Reset Your Password - Kastra Pay",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="text-align: center; padding: 20px 0;">
            <h1 style="color: #1a1a1a; font-size: 24px;">Kastra Pay</h1>
          </div>
          <div style="padding: 20px; background: #f9fafb; border-radius: 8px;">
            <h2 style="color: #1a1a1a; font-size: 20px; margin-top: 0;">Reset Your Password</h2>
            <p style="color: #4b5563; font-size: 14px; line-height: 1.6;">
              We received a request to reset your password. Click the button below to choose a new password.
            </p>
            <div style="text-align: center; margin: 24px 0;">
              <a href="${resetUrl}" style="display: inline-block; padding: 12px 32px; background-color: #0f172a; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 14px;">
                Reset Password
              </a>
            </div>
            <p style="color: #6b7280; font-size: 12px; line-height: 1.6;">
              This link expires in 1 hour. If you didn't request a password reset, you can safely ignore this email.
            </p>
            <p style="color: #6b7280; font-size: 12px; line-height: 1.6;">
              If the button doesn't work, copy and paste this URL into your browser:<br/>
              <a href="${resetUrl}" style="color: #3b82f6; word-break: break-all;">${resetUrl}</a>
            </p>
          </div>
          <div style="text-align: center; padding: 20px 0;">
            <p style="color: #9ca3af; font-size: 11px;">Kastra Pay - Multi-merchant payment platform</p>
          </div>
        </div>
      `,
    });

    if (error) {
      console.error("Failed to send password reset email:", error);
      return false;
    }

    return true;
  } catch (err) {
    console.error("Email send error:", err);
    return false;
  }
}

export async function sendPaymentReceiptEmail(
  to: string,
  receipt: {
    merchantName: string;
    amount: number;
    currency: string;
    paymentMethod: string;
    transactionId: string;
    receiptNumber?: string;
    description?: string;
    date: string;
  }
): Promise<boolean> {
  try {
    const resend = getResend();
    if (!resend) {
      console.warn("RESEND_API_KEY not set, skipping email");
      return false;
    }

    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: `Payment Receipt - ${receipt.merchantName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="text-align: center; padding: 20px 0;">
            <h1 style="color: #1a1a1a; font-size: 24px;">Kastra Pay</h1>
          </div>
          <div style="padding: 20px; background: #f9fafb; border-radius: 8px;">
            <h2 style="color: #1a1a1a; font-size: 20px; margin-top: 0;">Payment Successful</h2>
            <p style="color: #4b5563; font-size: 14px;">Your payment has been processed successfully.</p>

            <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
              <tr>
                <td style="padding: 8px 0; color: #6b7280; font-size: 13px; border-bottom: 1px solid #e5e7eb;">Merchant</td>
                <td style="padding: 8px 0; color: #1a1a1a; font-size: 13px; text-align: right; font-weight: 600; border-bottom: 1px solid #e5e7eb;">${receipt.merchantName}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280; font-size: 13px; border-bottom: 1px solid #e5e7eb;">Amount</td>
                <td style="padding: 8px 0; color: #1a1a1a; font-size: 13px; text-align: right; font-weight: 600; border-bottom: 1px solid #e5e7eb;">${receipt.currency} ${receipt.amount.toLocaleString()}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280; font-size: 13px; border-bottom: 1px solid #e5e7eb;">Payment Method</td>
                <td style="padding: 8px 0; color: #1a1a1a; font-size: 13px; text-align: right; border-bottom: 1px solid #e5e7eb;">${receipt.paymentMethod}</td>
              </tr>
              ${receipt.receiptNumber ? `
              <tr>
                <td style="padding: 8px 0; color: #6b7280; font-size: 13px; border-bottom: 1px solid #e5e7eb;">Receipt No.</td>
                <td style="padding: 8px 0; color: #1a1a1a; font-size: 13px; text-align: right; font-family: monospace; border-bottom: 1px solid #e5e7eb;">${receipt.receiptNumber}</td>
              </tr>
              ` : ""}
              ${receipt.description ? `
              <tr>
                <td style="padding: 8px 0; color: #6b7280; font-size: 13px; border-bottom: 1px solid #e5e7eb;">Description</td>
                <td style="padding: 8px 0; color: #1a1a1a; font-size: 13px; text-align: right; border-bottom: 1px solid #e5e7eb;">${receipt.description}</td>
              </tr>
              ` : ""}
              <tr>
                <td style="padding: 8px 0; color: #6b7280; font-size: 13px; border-bottom: 1px solid #e5e7eb;">Transaction ID</td>
                <td style="padding: 8px 0; color: #1a1a1a; font-size: 11px; text-align: right; font-family: monospace; border-bottom: 1px solid #e5e7eb;">${receipt.transactionId}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280; font-size: 13px;">Date</td>
                <td style="padding: 8px 0; color: #1a1a1a; font-size: 13px; text-align: right;">${receipt.date}</td>
              </tr>
            </table>
          </div>
          <div style="text-align: center; padding: 20px 0;">
            <p style="color: #9ca3af; font-size: 11px;">Kastra Pay - Multi-merchant payment platform</p>
          </div>
        </div>
      `,
    });

    if (error) {
      console.error("Failed to send receipt email:", error);
      return false;
    }

    return true;
  } catch (err) {
    console.error("Email send error:", err);
    return false;
  }
}
