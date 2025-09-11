import express from "express";
import session from "express-session";
import cors from "cors";
import dotenv from "dotenv";

// Route imports
import authRoutes from "./routes/auth";
import walletRoutes from "./routes/wallet";
import referralRoutes from "./routes/referral";
import dashboardRoutes from "./routes/dashboard";
import productRoutes from "./routes/product";

dotenv.config();

const app = express();

app.use(cors({ origin: "http://localhost:3000", credentials: true }));
app.use(
  session({
    name: "sid",
    secret: process.env.SESSION_SECRET || "dev-secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      //   httpOnly: true,
      //   sameSite: "none",
      //   secure: false, //process.env.NODE_ENV === "production",
      //   maxAge: 1000 * 60 * 15, // 15 minutes
    },
  })
);
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/wallet", walletRoutes);
app.use("/api/referral", referralRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/products", productRoutes);

export default app;
