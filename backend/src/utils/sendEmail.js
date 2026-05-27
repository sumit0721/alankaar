import nodemailer from "nodemailer";

const sendEmail = async ({ to, subject, html }) => {
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;

  const isPlaceholder = (val) => {
    if (!val) return true;
    const lower = val.toLowerCase();
    return (
      lower.includes("your-gmail") ||
      lower.includes("your_gmail") ||
      lower.includes("your-gmail-app-password") ||
      lower.includes("your-email") ||
      lower.includes("your_email") ||
      lower.includes("replace_with_") ||
      lower.startsWith("your_") ||
      lower.startsWith("your-")
    );
  };

  // Development SMTP fallback when credentials are missing or placeholders
  if (isPlaceholder(user) || isPlaceholder(pass)) {
    console.log(`\n📧 ======================================================`);
    console.log(`[DEVELOPMENT SMTP FALLBACK] Password Reset Link`);
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`------------------------------------------------------`);
    // Extract reset link from html using simple regex match
    const linkMatch = html.match(/href="([^"]+)"/);
    if (linkMatch && linkMatch[1]) {
      console.log(`🔑 RESET LINK: ${linkMatch[1]}`);
    }
    console.log(`======================================================\n`);
    return;
  }

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user,
        pass,
      },
    });

    await transporter.sendMail({
      from: `"ALANKAAR" <${user}>`,
      to,
      subject,
      html,
    });
  } catch (error) {
    // If SMTP fails in local development, fall back to console logging rather than crashing the client
    if (process.env.NODE_ENV !== "production") {
      console.log(`\n📧 ======================================================`);
      console.log(`[DEVELOPMENT SMTP ERROR FALLBACK] Nodemailer failed: ${error.message}`);
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
    // Re-throw if in production
    throw error;
  }
};

export default sendEmail;
