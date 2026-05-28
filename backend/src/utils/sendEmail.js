/**
 * sendEmail.js — Brevo HTTP Transactional Email API
 *
 * WHY HTTP instead of SMTP?
 * Cloud platforms like Render block outbound SMTP ports (587, 465) to prevent
 * spam. The Brevo HTTP API uses HTTPS (port 443), which is never blocked.
 *
 * Required env vars:
 *   BREVO_API_KEY  — your Brevo v3 API key (starts with "xkeysib-")
 *   EMAIL_USER     — the verified sender email on Brevo (e.g. sumitandjha1217@gmail.com)
 */

const sendEmail = async ({ to, subject, html }) => {
  const apiKey = process.env.BREVO_API_KEY;
  const senderEmail = process.env.EMAIL_USER;

  // ---------- Development fallback when credentials are missing ----------
  const isMissing = (val) => {
    if (!val) return true;
    const lower = val.toLowerCase();
    return (
      lower.includes("your-") ||
      lower.includes("your_") ||
      lower.includes("replace_with_") ||
      lower.startsWith("your_") ||
      lower.startsWith("your-")
    );
  };

  if (isMissing(apiKey) || isMissing(senderEmail)) {
    console.log(`\n📧 ======================================================`);
    console.log(`[DEV FALLBACK] Email credentials not configured.`);
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`------------------------------------------------------`);
    const linkMatch = html.match(/href="([^"]+)"/);
    if (linkMatch && linkMatch[1]) {
      console.log(`🔑 RESET LINK: ${linkMatch[1]}`);
    }
    console.log(`======================================================\n`);
    return;
  }

  // ---------- Send via Brevo HTTP API (works on Render, Vercel, etc.) ----------
  try {
    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        accept: "application/json",
        "content-type": "application/json",
        "api-key": apiKey,
      },
      body: JSON.stringify({
        sender: { name: "ALANKAAR", email: senderEmail },
        to: [{ email: to }],
        subject,
        htmlContent: html,
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(
        `Brevo API ${response.status}: ${errorBody}`
      );
    }

    const result = await response.json();
    console.log(`✅ Email sent via Brevo HTTP API. MessageId: ${result.messageId}`);
  } catch (error) {
    console.error(`❌ Brevo HTTP API Error: ${error.message}`);
    throw error; // Let the controller handle the error and return 500 to the client
  }
};

export default sendEmail;
