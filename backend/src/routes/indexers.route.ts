import { Router, Request, Response } from "express";
import { ProwlarrService } from "../services/prowlarr.service";
import { getLogger } from "../logger";

export function createIndexersRouter(prowlarr: ProwlarrService): Router {
  const router = Router();

  // GET /api/indexers
  router.get("/", async (_req: Request, res: Response) => {
    try {
      const indexers = await prowlarr.getIndexers();
      res.json(indexers);
    } catch (err) {
      getLogger().error("[Indexers] Error:", err);
      res.status(502).json({ error: "Failed to fetch indexers from Prowlarr" });
    }
  });

  return router;
}
