import { Router } from 'express';
import * as WalletController from '../controllers/walletController';

const router = Router();

router.get('/balance', WalletController.getBalance);
router.post('/create', WalletController.createWallet);

export default router;
