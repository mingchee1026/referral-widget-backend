import { Request, Response } from "express";
import crypto from "crypto";
import {
  generateRegistrationOptions,
  PublicKeyCredentialCreationOptionsJSON,
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  PublicKeyCredentialRequestOptionsJSON,
  verifyAuthenticationResponse,
} from "@simplewebauthn/server";
import { isoBase64URL } from "@simplewebauthn/server/helpers";
import { randomBytes } from "node:crypto";
import {
  isUserRegistered,
  registerUser,
  getUserByCredentialID,
} from "../services/userService";
import {
  getUserPasskeys,
  getUserPasskeyByCredID,
  registerPasskey,
  updatePasskeyCounter,
} from "../services/passkeyService";
import { addLoginEvent } from "../services/loginEventService";
import {
  subscribeCliEventService,
  TransactionType,
} from "../common/background/subscribeCliEventService";
import {
  getSessionValue,
  setSessionValue,
  saveSession,
} from "../utils/session";

// In-memory challenge store for demo (username -> options)
const registrationOptions: Record<
  string,
  PublicKeyCredentialCreationOptionsJSON
> = {};
const authenticationOptions: Record<
  string,
  PublicKeyCredentialRequestOptionsJSON
> = {};

export const checkUser = async (req: Request, res: Response) => {
  try {
    const { authId } = req.body;

    if (!authId) {
      return res.status(400).json({ error: "Authentication ID is required" });
    }

    const registered = await isUserRegistered(authId);

    // if (!registered) {
    //   await registerUser(username);
    // }

    return res.json({ registered });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// Passkey (WebAuthn) registration
export const generateRegistration = async (req: Request, res: Response) => {
  try {
    // const { username } = req.body;
    // const userHandle = randomBytes(32);
    // const userId = base64urlEncode(userHandle);

    /*
    if (!username) {
      return res.status(400).json({ error: "username are required" });
    }
    
    // Find user
    let user = await registerUser(username);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Find user's existing credentials
    const userPasskeys = await getUserPasskeys(username);
*/
    const options = await generateRegistrationOptions({
      rpName: process.env.RP_NAME || "Referral Widget App",
      rpID: process.env.RP_ID || "localhost",
      // userID: base64urlToBuffer(userId.slice(0, 6)),
      userName: "referral-widget-id", // user.username,
      userDisplayName: "referral-widget-id", // 111
      // Don't prompt users for additional information about the authenticator
      // (Recommended for smoother UX)
      attestationType: "none",
      // Prevent users from re-registering existing authenticators
      // excludeCredentials: userPasskeys.map((passkey) => ({
      //   id: passkey.credentialID,
      //   type: "public-key",
      //   transports: passkey.transports,
      // })),
      excludeCredentials: [],
      authenticatorSelection: {
        authenticatorAttachment: "platform",
        // residentKey: "preferred",
        // userVerification: "preferred",
        residentKey: "required", // 111
        userVerification: "required", // 111
      },
      preferredAuthenticatorType: "localDevice", // 111
    });

    // registrationOptions[username] = options;
    setSessionValue(req, "regOptions", options);
    await saveSession(req);

    return res.json(options);
  } catch (error) {
    return res
      .status(500)
      .json({ error: "Failed to generate registration options" });
  }
};

export const verifyRegistration = async (req: Request, res: Response) => {
  try {
    // const { username, attestationResponse } = req.body;
    const { attestationResponse } = req.body;
    // const username = "123456789";

    /*
    if (!username || !attestationResponse) {
      return res
        .status(400)
        .json({ error: "username and attestationResponse are required" });
    }

    
    // Find user
    const user = await getUserByUsername(username);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
*/
    const currentOptions = getSessionValue(req, "regOptions");
    const challenge = currentOptions.challenge;
    if (!challenge) {
      return res.status(400).json({ error: "No challenge found for user" });
    }

    const verification = await verifyRegistrationResponse({
      response: attestationResponse,
      expectedChallenge: challenge,
      expectedOrigin: process.env.ORIGIN || "http://localhost:3000",
      expectedRPID: process.env.RP_ID || "localhost",
      requireUserVerification: true, // false, // 111
    });

    if (
      verification &&
      verification.verified &&
      verification.registrationInfo
    ) {
      const { registrationInfo } = verification;
      const { credential, credentialDeviceType, credentialBackedUp } =
        registrationInfo;

      const params = {
        // username: currentOptions.user.name,
        // A unique identifier for the credential
        credentialID: credential.id,
        // The public key bytes, used for subsequent authentication signature verification
        credentialPublicKey: isoBase64URL.fromBuffer(credential.publicKey), // Buffer.from(credential.publicKey),
        // Created by `generateRegistrationOptions()` in Step 1
        webAuthnUserID: currentOptions.user.id,
        // The number of times the authenticator has been used on this site so far
        counter: credential.counter,
        // How the browser can talk with this credential's authenticator
        transports: credential.transports,
        // Whether the passkey is single-device or multi-device
        deviceType: credentialDeviceType,
        // Whether the passkey has been backed up in some way
        backedUpStatus: credentialBackedUp,
      };

      // Store new user
      const user = await registerUser(credential.id);

      // Store credential
      await registerPasskey(params);

      // Execute add_whitelist txn
      subscribeCliEventService.getEventEmitter().emit("executeActivityTxn", {
        type: TransactionType.REGISTER,
        isNew: true,
        custodialAddress: user?.walletAddress,
        custodialSecretKey: "",
        custodialChainObjectId: "",
        referrerAddress: "",
        referrerChainObjectId: "",
      });

      return res.json({
        verified: true,
        user: {
          authId: user?.credentialID,
          walletAddress: user?.walletAddress,
          referralCode: user?.referralCode,
        },
      });
    } else {
      return res
        .status(400)
        .json({ success: false, error: "Registration verification failed" });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to verify registration" });
  }
};

// Passkey (WebAuthn) authentication
export const generateAuthentication = async (req: Request, res: Response) => {
  try {
    const { authId } = req.body;

    if (!authId) {
      return res.status(400).json({ error: "Authentication ID is required" });
    }

    const user = await getUserByCredentialID(authId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Find user's existing credentials
    const userPasskeys = await getUserPasskeys(authId);

    const options = await generateAuthenticationOptions({
      rpID: process.env.RP_ID || "localhost",
      allowCredentials: userPasskeys.map((passkey) => ({
        id: passkey.credentialID,
        type: "public-key",
        transports: passkey.transports,
      })),
      // allowCredentials: [],
      // userVerification: "preferred",
      userVerification: "required", // 111
    });

    setSessionValue(req, "authOptions", options);

    await saveSession(req);

    return res.json(options);
  } catch (error) {
    return res
      .status(500)
      .json({ error: "Failed to generate authentication options" });
  }
};

export const verifyAuthentication = async (req: Request, res: Response) => {
  try {
    const { attestationResponse } = req.body;

    if (!attestationResponse) {
      return res
        .status(400)
        .json({ error: "username and attestationResponse are required" });
    }

    const currentOptions = getSessionValue(req, "authOptions");

    const challenge = currentOptions.challenge;
    if (!challenge) {
      return res.status(400).json({ error: "No challenge found for user" });
    }

    const credentialID = attestationResponse.id;

    const user = await getUserByCredentialID(credentialID);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Find credential
    const passkey = await getUserPasskeyByCredID(credentialID);

    if (!passkey) {
      return res.status(404).json({ error: "Credential not found" });
    }

    const verification = await verifyAuthenticationResponse({
      response: attestationResponse,
      expectedChallenge: challenge,
      expectedOrigin: process.env.ORIGIN || "http://localhost:3000",
      expectedRPID: process.env.RP_ID || "localhost",
      credential: {
        id: passkey.credentialID,
        publicKey: isoBase64URL.toBuffer(passkey.credentialPublicKey), // new Uint8Array(passkey.credentialPublicKey),
        counter: passkey.counter,
        transports: passkey.transports,
      },
      requireUserVerification: true, // false, // 111
    });

    if (verification && verification.verified) {
      // Update counter
      const newCounter = verification.authenticationInfo.newCounter;

      await updatePasskeyCounter(credentialID, newCounter);

      // Add login event
      await addLoginEvent(user.walletAddress);

      // Execute log_user_activity txn
      subscribeCliEventService.getEventEmitter().emit("executeActivityTxn", {
        type: TransactionType.LOGIN,
        isNew: false,
        custodialAddress: user.walletAddress,
        custodialSecretKey: user.secretKey,
        custodialChainObjectId: user.chainObjectId,
        referrerAddress: "",
        referrerChainObjectId: "",
      });

      return res.json({
        verified: true,
        user: {
          username: user.walletAddress,
          walletAddress: user.walletAddress,
          referralCode: user.referralCode,
        },
      });
    } else {
      return res
        .status(400)
        .json({ success: false, error: "Authentication verification failed" });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to verify authentication" });
  }
};

const generateUniqueUserId = () => {
  return crypto.randomUUID();
};

export function base64urlToBuffer(b64url: string): Uint8Array {
  const pad =
    b64url.length % 4 === 0 ? "" : "=".repeat(4 - (b64url.length % 4));
  const b64 = b64url.replace(/-/g, "+").replace(/_/g, "/") + pad;
  return new Uint8Array(Buffer.from(b64, "base64"));
}

export function base64urlEncode(buffer: ArrayBuffer | Uint8Array): string {
  const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
  let str = Buffer.from(bytes).toString("base64");
  return str.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}
