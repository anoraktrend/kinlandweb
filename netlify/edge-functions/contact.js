export default async function handler(request, context) {
  if (request.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  let data;
  try {
    data = await request.json();
  } catch (e) {
    return new Response("Invalid JSON", { status: 400 });
  }

  const { name, email, message } = data;

  if (!name || !email || !message) {
    return new Response("Missing required fields", { status: 400 });
  }

  if (!context.env.NETLIFY_EMAILS_PROVIDER || !context.env.NETLIFY_EMAILS_PROVIDER_API_KEY || !context.env.NETLIFY_EMAILS_SECRET || !context.env.CONTACT_EMAIL) {
    console.error("Missing Netlify Email Integration configuration");
    return new Response(JSON.stringify({ error: "Email service not configured" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    await fetch(`${context.env.URL}/.netlify/functions/emails/contact`, {
      headers: { "netlify-emails-secret": context.env.NETLIFY_EMAILS_SECRET },
      method: "POST",
      body: JSON.stringify({
        from: email,
        to: context.env.CONTACT_EMAIL,
        subject: `New Contact Form Submission from ${name}`,
        parameters: { name, email, message },
      }),
    });

    return new Response(JSON.stringify({ message: "Email sent successfully" }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Email sending error:", error);
    return new Response(JSON.stringify({ error: "Failed to send email" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}