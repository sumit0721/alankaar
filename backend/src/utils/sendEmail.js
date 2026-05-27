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
    const host = process.env.EMAIL_HOST || "smtp.gmail.com";
    const port = Number(process.env.EMAIL_PORT) || 465;
    const secure = port === 465;

    const transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: {
        user,
        pass,
      },
      connectionTimeout: 10000, // 10 seconds timeout
      socketTimeout: 10000,
    });

    await transporter.sendMail({
      from: `"ALANKAAR" <${user}>`,
      to,
      subject,
      html,
    });
  } catch (error) {
    // Log the SMTP error so the developer can see the cause in Render dashboard logs
    console.error(`❌ Nodemailer SMTP Error: ${error.message}`);

    // Fail-safe fallback: print the link to the console logs and return successfully
    console.log(`\n📧 ======================================================`);
    console.log(`[SMTP FAIL-SAFE FALLBACK] Nodemailer connection failed. Reset link generated:`);
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
};

export default sendEmail;
