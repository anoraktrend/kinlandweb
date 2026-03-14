const formData = require("form-data");
const Mailgun = require("mailgun.js");

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

  if (!process.env.MAILGUN_API_KEY || !process.env.MAILGUN_DOMAIN || !process.env.CONTACT_EMAIL) {
    console.error("Missing Mailgun configuration");
    return { statusCode: 500, body: "Internal Server Error: Missing Configuration" };
  }

  const mailgun = new Mailgun(formData);
  const mg = mailgun.client({
    username: "api",
    key: process.env.MAILGUN_API_KEY,
  });

  const domain = process.env.MAILGUN_DOMAIN;
  const contactEmail = process.env.CONTACT_EMAIL;

  try {
    await mg.messages.create(domain, {
      from: `${name} <${email}>`,
      to: [contactEmail],
      subject: `New Contact Form Submission from ${name}`,
      text: message,
      html: `
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Message:</strong></p>
        <p>${message}</p>
      `,
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Email sent successfully" }),
    };
  } catch (error) {
    console.error("Mailgun error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to send email" }),
    };
  }
};
