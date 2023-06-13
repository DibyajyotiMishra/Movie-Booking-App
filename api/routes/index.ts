import { Router } from "express";
import SystemStatusController from "../controllers/system-status";

export default function registerRoutes(): Router {
  const router = Router();
  const systemStatusController: SystemStatusController =
    new SystemStatusController();
  router.use("/status", systemStatusController.register());

  return router;
}
