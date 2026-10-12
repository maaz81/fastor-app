
const { Pool } = require("pg");
const env = require("./env");

const pool = new Pool({
    connectionString: env.DATABASE_URL,
    max: 10,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 5_000,
});

pool.on("error", (error) => {
    console.error("Unexpected idle PostgreSQL client error:", error.message);
});

async function connectDatabase() {
    const client = await pool.connect();

    try {
        await client.query("SELECT 1");
        console.log("PostgreSQL connection verified");
    } finally {
        client.release();
    }
}

module.exports = { pool, connectDatabase };
