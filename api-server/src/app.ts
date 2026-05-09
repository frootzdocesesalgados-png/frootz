import express, { type Express } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import session from "express-session";
import router from "./routes";
import { logger } from "./lib/logger";

const app: Express = express();

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);

const isProduction = process.env.NODE_ENV === "production";

// In production, FRONTEND_URL must be set to the Netlify domain.
// In development (Replit), allow all origins since the proxy handles routing.
const allowedOrigins = isProduction
  ? (process.env.FRONTEND_URL ?? "").split(",").map((s) => s.trim()).filter(Boolean)
  : true;

app.use(
  cors({
    origin: allowedOrigins.length === 0 ? true : allowedOrigins,
    credentials: true,
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  session({
    secret: process.env.SESSION_SECRET ?? "frootz-dev-secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      // In production cross-origin setup (Netlify frontend + Railway API),
      // the cookie must be SameSite=none + Secure to be sent cross-site.
      secure: isProduction,
      httpOnly: true,
      sameSite: isProduction ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    },
  }),
);

app.use("/api", router);

export default app;
