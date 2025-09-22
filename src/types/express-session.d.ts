import "express-session";

declare module "express-session" {
  interface SessionData {
    // Add app-specific keys here:
    authOptions?: unknown; // or a concrete type, e.g. PublicKeyCredentialRequestOptionsJSON
    regOptions?: unknown; // e.g. PublicKeyCredentialCreationOptionsJSON
  }
}

// Ensure TypeScript picks up the types folder (e.g., "typeRoots" or "include" in tsconfig).
