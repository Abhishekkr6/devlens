import express from "express";
import cookieParser from "cookie-parser";
import cors, { CorsOptions } from "cors";
import helmet from "helmet";
import mongoose from "mongoose";
import logger from "./utils/logger";
import { requestLogger } from "./middlewares/requestLogger";
import { apiLimiter } from "./middlewares/rateLimit";
import { errorHandler } from "./middlewares/errorHandler";
import healthRoutes from "./routes/health.routes";


const app = express();

// Health check for Render (required to pass deployment health checks)
app.get("/", (req, res) => {
   res.status(200).send("TeamPulse Backend is running 🚀");
});

/* -----------------------------------------------------
   1) RAW BODY FOR GITHUB → MUST BE FIRST
------------------------------------------------------ */
app.use("/api/v1/webhooks/github", express.raw({ type: "application/json" }));

/* -----------------------------------------------------
   2) REGISTER WEBHOOK ROUTES IMMEDIATELY AFTER RAW
------------------------------------------------------ */
import webhookRoutes from "./routes/webhook.routes";
app.use("/api/v1/webhooks", webhookRoutes);

/* -----------------------------------------------------
   3) NORMAL PARSERS AFTER WEBHOOK ONLY
------------------------------------------------------ */
app.use(express.json());
app.use(cookieParser());
app.use(
   helmet({
      contentSecurityPolicy: false,
   })
);

const resolvedFrontend = (process.env.FRONTEND_URL || "").trim();
const allowedOrigins = [
   "http://localhost:3000",
   "https://teampulse18.vercel.app",
   "https://teampulse-production.up.railway.app",
];
if (resolvedFrontend && !allowedOrigins.includes(resolvedFrontend)) {
   allowedOrigins.push(resolvedFrontend);
}

const corsOptions: CorsOptions = {
   origin: (origin, callback) => {
      // Allow same-origin (no origin header) and known frontends
      if (!origin || allowedOrigins.includes(origin)) {
         callback(null, true);
      } else {
         callback(null, false);
      }
   },
   methods: ["GET", "POST", "PUT", "DELETE"],
   credentials: true,
};

app.use(cors(corsOptions));
app.use(requestLogger);
app.use("/api", apiLimiter);

/* -----------------------------------------------------
   4) OTHER ROUTES
------------------------------------------------------ */
import authRoutes from "./routes/auth.routes";
import meRoutes from "./routes/me.routes";
import orgRoutes from "./routes/org.routes";
import dashboardRoutes from "./routes/dashboard.routes";
import prRoutes from "./routes/pr.routes";
import developerRoutes from "./routes/developer.routes";
import notificationRoutes from "./routes/notification.routes";

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1", healthRoutes);
app.use("/api/v1", meRoutes);
app.use("/api/v1", orgRoutes);
app.use("/api/v1", dashboardRoutes);
app.use("/api/v1/pr", prRoutes);
app.use("/api/v1/developers", developerRoutes);
app.use("/api/v1/notifications", notificationRoutes);

app.use(errorHandler);

/* -----------------------------------------------------
   5) MONGO CONNECT
------------------------------------------------------ */
const mongoUrl = process.env.MONGO_URL;
if (!mongoUrl) {
   logger.error("MONGO_URL environment variable is not set");
   process.exit(1);
}

// Database name - use environment variable or default to 'teampulse'
// If you want to use 'admin' database, set MONGO_DB_NAME=admin in your .env file
const dbName = process.env.MONGO_DB_NAME || "teampulse";

// Ensure database name is in connection string
// MongoDB URL format: mongodb://[username:password@]host[:port]/[database][?options]
let finalMongoUrl = mongoUrl;

// Check if URL has a database name after the last slash (before query params)
const urlWithoutQuery = mongoUrl.split("?")[0];
const urlParts = urlWithoutQuery.split("/");
const lastPart = urlParts[urlParts.length - 1];

// If last part is empty or looks like a host/port (contains : or is empty), add database name
if (!lastPart || lastPart.includes(":") || lastPart === "") {
   // No database name found, add it
   const queryString = mongoUrl.includes("?") ? mongoUrl.substring(mongoUrl.indexOf("?")) : "";
   const baseUrl = urlWithoutQuery.endsWith("/") ? urlWithoutQuery.slice(0, -1) : urlWithoutQuery;
   finalMongoUrl = `${baseUrl}/${dbName}${queryString}`;
   logger.info({
      original: mongoUrl,
      updated: finalMongoUrl,
      database: dbName
   }, "MongoDB URL updated with database name");
} else {
   logger.info({ database: lastPart }, "MongoDB URL already contains database name");
}

mongoose
   .connect(finalMongoUrl)
   .then(() => {
      const connectedDbName = mongoose.connection.db?.databaseName || dbName;
      logger.info({ database: connectedDbName }, "MongoDB connected successfully");
   })
   .catch((err) => {
      logger.error({ err }, "MongoDB connection error");
      process.exit(1);
   });

export { app };
