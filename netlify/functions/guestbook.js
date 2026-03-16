const { neon } = require("@neondatabase/serverless");

// The table schema
const createTableQuery = `
CREATE TABLE IF NOT EXISTS guestbook (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255),
  message TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
`;

exports.handler = async () => {
  try {
    const sql = neon(process.env.NEON_DATABASE_URL);

    // Create the table if it doesn't exist
    await sql(createTableQuery);

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Guestbook table created or already exists." }),
    };
  } catch (error) {
    console.error("Error connecting to database or creating table:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Internal Server Error" }),
    };
  }
};
