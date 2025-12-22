import "dotenv/config";
import http from "http";
import { app } from "./app";
import { attachWebSocket } from "./realtime/wsServer";
import { initWorker } from "./worker/init";
import logger from "./utils/logger";

const PORT = process.env.PORT || 4000;

const server = http.createServer(app);

server.listen(PORT, () => {
  logger.info({ port: PORT }, "Backend running");
});

attachWebSocket(server);
initWorker();

process.on("uncaughtException", (err) => {
  logger.error({ err }, "💥 Uncaught Exception — backend crashed");
});

process.on("unhandledRejection", (reason) => {
  logger.error({ reason }, "⚠️ Unhandled Promise Rejection — backend");
});
