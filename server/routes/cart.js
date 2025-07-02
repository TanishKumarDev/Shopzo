import express from 'express';
import { addToCart, removeFromCart, updateCart, fetchCart } from '../controllers/cart.js';
import { auth } from '../middlewares/auth.js';

const router = express.Router();

router.post('/cart/add', auth, addToCart);
router.get('/cart/remove/:id', auth, removeFromCart);
router.post('/cart/update', auth, updateCart);
router.get('/cart/all', auth, fetchCart);
router.get('/cart/test', (req, res) => {
  res.json({ message: "Cart route is working!" });
});

export default router;