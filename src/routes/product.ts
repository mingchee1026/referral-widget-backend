import { Router } from 'express';
import { getProducts, getProduct } from '../controllers/productController';

const router = Router();

// GET /products - get all products
router.get('/', getProducts);

// GET /products/:id - get product by id
router.get('/:id', getProduct);

export default router;
