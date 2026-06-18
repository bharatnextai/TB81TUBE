import type { Request } from "express";
import morgan from "morgan";

morgan.token("safe-url", (req) => {
  const request = req as Request;
  return request.originalUrl.split("?")[0];
});

export const requestLogger = morgan(":method :safe-url :status :response-time ms", {
  skip: (req) => (req as Request).path === "/health"
});
