import { Router } from "express";
import * as ReferralController from "../controllers/referralController";

const router = Router();

router.get("/link", ReferralController.getReferralLink);
router.post("/event", ReferralController.logReferralEvent);
router.post("/check", ReferralController.checkReferralRegistered);
router.get("/user/:authId", ReferralController.getUserReferrals);

export default router;
