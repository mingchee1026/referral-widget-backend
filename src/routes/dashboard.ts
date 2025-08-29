import { Router } from "express";
import * as DashboardController from "../controllers/dashboardController";

const router = Router();

router.post("/", DashboardController.getDashboard);

export default router;
