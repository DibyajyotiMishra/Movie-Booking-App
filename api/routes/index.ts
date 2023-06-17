import { Router } from "express";
import {
  AuthenticationController,
  SystemStatusController,
} from "../controllers";

export default function registerRoutes(): Router {
  const router = Router();
  const systemStatusController: SystemStatusController =
    new SystemStatusController();
  const authenticationController: AuthenticationController =
    new AuthenticationController();

  router.use("/status", systemStatusController.register());
  router.use("/auth", authenticationController.register());
  return router;
}
