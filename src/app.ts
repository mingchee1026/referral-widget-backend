import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Route imports
import authRoutes from './routes/auth';
import walletRoutes from './routes/wallet';
import referralRoutes from './routes/referral';
import dashboardRoutes from './routes/dashboard';
import productRoutes from './routes/product';

app.use('/api/auth', authRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/referral', referralRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/products', productRoutes);

export default app;
