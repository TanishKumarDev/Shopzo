import express from 'express';
import { createProduct, getAllProducts } from '../controllers/product.js';
import { auth } from '../middlewares/auth.js';
import uploadFiles from '../utils/multer.js';

const router = express.Router();

router.post('/product/new', auth, uploadFiles, createProduct);
router.get('/product/all', getAllProducts);

export default router;