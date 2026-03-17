exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  let data;
  try {
    data = JSON.parse(event.body);
  } catch (e) {
    return { statusCode: 400, body: "Invalid JSON" };
  }

  const { name, email, message } = data;

  if (!name || !email || !message) {
    return { statusCode: 400, body: "Missing required fields" };
  }

  if (!process.env.NETLIFY_EMAILS_PROVIDER || !process.env.NETLIFY_EMAILS_PROVIDER_API_KEY || !process.env.NETLIFY_EMAILS_SECRET || !process.env.CONTACT_EMAIL) {
    console.error("Missing Netlify Email Integration configuration");
    return { statusCode: 500, body: "Internal Server Error: Missing Configuration" };
  }

  try {
    await fetch(`${process.env.URL}/.netlify/functions/emails/contact`, {
      headers: { "netlify-emails-secret": process.env.NETLIFY_EMAILS_SECRET },
      method: "POST",
      body: JSON.stringify({
        from: email,
        to: process.env.CONTACT_EMAIL,
        subject: `New Contact Form Submission from ${name}`,
        parameters: { name, email, message },
      }),
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Email sent successfully" }),
    };
  } catch (error) {
    console.error("Email sending error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to send email" }),
    };
  }
};
