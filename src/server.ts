import app from "./app";
import connectDB from "./config/db";
import dotenv from "dotenv";
dotenv.config();

const PORT = process.env.PORT || 8080;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});

// ##################################### //
const calculatePNL = () => {
  const purchasePrice = 0.00001; // 0.0000183;
  const finalPrice111 = 0.00002; //0.0000239;1.596

  const pnlPercentage = ((finalPrice111 - purchasePrice) / purchasePrice) * 100;

  console.error({ pnlPercentage });
};

calculatePNL();
