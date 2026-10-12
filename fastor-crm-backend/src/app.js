const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

const env = require("./config/env");
const apiRoutes = require("./routes");
const notFound = require("./utils/not-found");
const errorHandler = require("./utils/error-handler");

const app = express();

app.disable("x-powered-by");
app.use(helmet());

const allowedOrigins = [
    env.CLIENT_URL,
    "https://fastor-app-tau.vercel.app",
    "http://localhost:5173",
    "http://localhost:5174",
];

app.use(
    cors({
        origin: (origin, callback) => {
            if (!origin) return callback(null, true);
            if (
                allowedOrigins.includes(origin) ||
                origin.endsWith(".vercel.app")
            ) {
                return callback(null, true);
            }
            return callback(null, true);
        },
        credentials: true,
    })
);

app.use(express.json({ limit: "100kb" }));

app.use(
    rateLimit({
        windowMs: 15 * 60 * 1000,
        limit: 200,
        standardHeaders: "draft-8",
        legacyHeaders: false,
    })
);

app.use("/", apiRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
