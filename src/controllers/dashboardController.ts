import { Request, Response } from "express";
import {
  getUserByCredentialID,
  getUserByUsername,
} from "../services/userService";
import { getUserReferralEvents } from "../services/referralService";
import { getDaysSinceLastLogin } from "../services/loginEventService";

export const getDashboard = async (req: Request, res: Response) => {
  try {
    const { authId } = req.body;

    if (!authId) {
      return res.status(400).json({ error: "Authentication ID is required" });
    }

    const user = await getUserByCredentialID(authId);

    const referralEvents = await getUserReferralEvents(authId, 0);
    const count = referralEvents.length;

    const balance = 1 + 10 * count;
    const earned = 10 * count;

    const lastLoggedin = await getDaysSinceLastLogin(authId);

    let lastSeen;
    if (!lastLoggedin) {
      lastSeen = "Just Now.";
    } else {
      lastSeen = getLastSeen(lastLoggedin);
    }

    let activities;
    if (referralEvents.length >= 3) {
      activities = [
        ...referralEvents.slice(0, 3).map((event) => ({
          type: "Referral Commission",
          amount: "+$10.00",
          product: event.product,
          date: event.createdAt,
        })),
      ];
    } else {
      activities = [
        ...referralEvents.map((event) => ({
          type: "Referral commission",
          amount: "+$10.00",
          product: event.product,
          date: event.createdAt,
        })),
        {
          type: "Bonus commission",
          amount: "+$1.00",
          product: "Account creation",
          date: user?.createdAt,
        },
      ];
    }

    res.json({ balance, earned, lastSeen, referralEvents, activities });
  } catch (error) {
    res.status(500).json({
      error: "Failed to get dashboard data",
      details: error instanceof Error ? error.message : error,
    });
  }
};

const getLastSeen = (date: string | Date) => {
  const now = new Date();
  const last = typeof date === "string" ? new Date(date) : date;
  const diffMs = now.getTime() - last.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) {
    return "Just Now";
  }
  if (diffMins < 60) {
    return `${diffMins} min${diffMins === 1 ? "" : "s"} ago`;
  }
  if (diffHours < 24) {
    return `${diffHours} hour${diffHours === 1 ? "" : "s"} ago`;
  }

  return `${diffDays} day${diffDays === 1 ? "" : "s"} ago`;
};
