const {neon} = require("@neondatabase/serverless");

const createTableQuery = `
CREATE TABLE IF NOT EXISTS guestbook (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
`;

exports.handler = async(event) => {
  const sql = neon(process.env.NEON_DATABASE_URL);

  // Ensure the table exists
  await sql(createTableQuery);

  if (event.httpMethod === "GET") {
    try {
      const entries = await sql`SELECT name, message, created_at FROM guestbook ORDER BY created_at DESC LIMIT 100`;
      return {
        statusCode: 200,
        body: JSON.stringify(entries),
      };
    } catch (error) {
      console.error("Error fetching entries:", error);
      return {statusCode: 500, body: JSON.stringify({error: "Failed to fetch entries"})};
    }
  }

  if (event.httpMethod === "POST") {
    try {
      const {name, message} = JSON.parse(event.body);
      if (!name || !message) {
        return {statusCode: 400, body: "Name and message are required."};
      }

      await sql`INSERT INTO guestbook (name, message) VALUES (${name}, ${message})`;

      return {
        statusCode: 201,
        body: JSON.stringify({message: "Entry added successfully."}),
      };
    } catch (error) {
      console.error("Error adding entry:", error);
      return {statusCode: 500, body: JSON.stringify({error: "Failed to add entry"})};
    }
  }

  return {
    statusCode: 405,
    body: "Method Not Allowed",
  };
};
