import express from 'express';
import { createProduct, getAllProducts, getSingleProduct, updateProduct, updateProductImages} from '../controllers/product.js';
import { auth } from '../middlewares/auth.js';
import uploadFiles from '../utils/multer.js';

const router = express.Router();

router.post('/product/new', auth, uploadFiles, createProduct);
router.get('/product/all', getAllProducts);
router.get('/product/:id', getSingleProduct);
router.put('/product/:id', auth, updateProduct);
router.post('/product/images/:id', auth, uploadFiles, updateProductImages);
export default router;