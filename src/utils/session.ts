import type { Request } from "express";
import "express-session"; // ensures req.session type is available

export function setSessionValue(req: Request, key: string, value: T): void {
  // express-session supports arbitrary keys on SessionData
  (req.session as any)[key] = value;
}

export function getSessionValue(req: Request, key: string): T | undefined {
  return (req.session as any)[key] as T | undefined;
}

export function saveSession(req: Request): Promise<void> {
  return new Promise((resolve, reject) => {
    req.session.save((err) => (err ? reject(err) : resolve()));
  });
}

export function destroySession(req: Request): Promise<void> {
  return new Promise((resolve, reject) => {
    req.session.destroy((err) => (err ? reject(err) : resolve()));
  });
}
