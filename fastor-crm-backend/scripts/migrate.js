const fs = require("node:fs/promises");
const path = require("node:path");
const { pool } = require("../src/config/database");

async function migrate() {
    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        await client.query(`
            CREATE TABLE IF NOT EXISTS schema_migrations (
                filename TEXT PRIMARY KEY,
                applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
            )
        `);

        const directory = path.join(
            __dirname,
            "../database/migrations"
        );

        const files = (await fs.readdir(directory))
            .filter((file) => file.endsWith(".sql"))
            .sort();

        for (const filename of files) {
            const existing = await client.query(
                "SELECT 1 FROM schema_migrations WHERE filename = $1",
                [filename]
            );

            if (existing.rowCount > 0) {
                console.log(`Already applied: ${filename}`);
                continue;
            }

            const sql = await fs.readFile(
                path.join(directory, filename),
                "utf8"
            );

            await client.query(sql);

            await client.query(
                "INSERT INTO schema_migrations (filename) VALUES ($1)",
                [filename]
            );

            console.log(`Applied: ${filename}`);
        }

        await client.query("COMMIT");
        console.log("Database migrations completed.");
    } catch (error) {
        await client.query("ROLLBACK");
        throw error;
    } finally {
        client.release();
        await pool.end();
    }
}

migrate().catch((error) => {
    console.error("Migration failed:", error.message);
    process.exitCode = 1;
});