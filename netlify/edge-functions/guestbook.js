import {neon} from "@neondatabase/serverless";

const createTableQuery = `
CREATE TABLE IF NOT EXISTS guestbook (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
`;

export default async function handler(request, context) {
  if (!context.env.NEON_DATABASE_URL) {
    return new Response(JSON.stringify({error: "Database connection not configured"}), {
      status: 500,
      headers: {"Content-Type": "application/json"},
    });
  }

  const sql = neon(context.env.NEON_DATABASE_URL);

  // Ensure the table exists
  await sql(createTableQuery);

  if (request.method === "GET") {
    try {
      const entries = await sql`SELECT name, message, created_at FROM guestbook ORDER BY created_at DESC LIMIT 100`;
      return new Response(JSON.stringify(entries), {
        status: 200,
        headers: {"Content-Type": "application/json"},
      });
    } catch (error) {
      console.error("Error fetching entries:", error);
      return new Response(JSON.stringify({error: "Failed to fetch entries"}), {
        status: 500,
        headers: {"Content-Type": "application/json"},
      });
    }
  }

  if (request.method === "POST") {
    try {
      const {name, message} = await request.json();
      if (!name || !message) {
        return new Response("Name and message are required.", {status: 400});
      }

      await sql`INSERT INTO guestbook (name, message) VALUES (${name}, ${message})`;

      return new Response(JSON.stringify({message: "Entry added successfully."}), {
        status: 201,
        headers: {"Content-Type": "application/json"},
      });
    } catch (error) {
      console.error("Error adding entry:", error);
      return new Response(JSON.stringify({error: "Failed to add entry"}), {
        status: 500,
        headers: {"Content-Type": "application/json"},
      });
    }
  }

  return new Response("Method Not Allowed", {status: 405});
}
