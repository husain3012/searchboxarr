import { Request, Response, NextFunction } from "express";
import { AppConfig } from "../types/prowlarr";

export function createAuthMiddleware(config: AppConfig) {
  if (!config.auth.enabled) {
    return (_req: Request, _res: Response, next: NextFunction) => next();
  }

  return (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers["authorization"];

    if (!authHeader || !authHeader.startsWith("Basic ")) {
      res.setHeader("WWW-Authenticate", 'Basic realm="Searcharr"');
      res.status(401).json({ error: "Authentication required" });
      return;
    }

    const base64 = authHeader.slice("Basic ".length);
    const decoded = Buffer.from(base64, "base64").toString("utf-8");
    const [username, ...rest] = decoded.split(":");
    const password = rest.join(":");

    if (
      username === config.auth.username &&
      password === config.auth.password
    ) {
      next();
    } else {
      res.setHeader("WWW-Authenticate", 'Basic realm="Searcharr"');
      res.status(401).json({ error: "Invalid credentials" });
    }
  };
}
