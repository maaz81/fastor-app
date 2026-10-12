
const app = require("./app");
const env = require("./config/env");
const { pool, connectDatabase } = require("./config/database");

let server;

async function startServer() {
    await connectDatabase();

    server = app.listen(env.PORT, () => {
        console.log(`Fastor CRM API listening on port ${env.PORT}`);
    });
}

async function shutdown(signal) {
    console.log(`${signal} received. Shutting down...`);

    if (server) {
        server.close(async () => {
            try {
                await pool.end();
                process.exit(0);
            } catch (error) {
                console.error("Shutdown failed:", error.message);
                process.exit(1);
            }
        });
    } else {
        await pool.end();
        process.exit(0);
    }
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

startServer().catch(async (error) => {
    console.error("Failed to start server:", error.message);
    await pool.end().catch(() => { });
    process.exit(1);
});
