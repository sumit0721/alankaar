const sendEmail = async ({ to, subject, html }) => {
  const apiKey = process.env.BREVO_API_KEY;

  if (!apiKey) {
    console.warn("BREVO_API_KEY not set — skipping email send.");
    return;
  }

  const response = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "api-key": apiKey,
    },
    body: JSON.stringify({
      sender: {
        name: "ALANKAAR",
        email: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      },
      to: [{ email: to }],
      subject,
      htmlContent: html,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    console.error("Brevo email error:", error);
    throw new Error(error.message || "Failed to send email via Brevo.");
  }
};

export default sendEmail;
