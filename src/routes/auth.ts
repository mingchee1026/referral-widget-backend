import { Router } from "express";
import * as AuthController from "../controllers/authController";

const router = Router();

router.post("/check-user", AuthController.checkUser);

// Passkey (WebAuthn) registration
router.post(
  "/generate-registration-options",
  AuthController.generateRegistration
);
router.post("/verify-registration", AuthController.verifyRegistration);

// Passkey (WebAuthn) authentication
router.post(
  "/generate-authentication-options",
  AuthController.generateAuthentication
);
router.post("/verify-authentication", AuthController.verifyAuthentication);

export default router;
