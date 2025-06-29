import express from 'express';
import { newOrderCOD, getAllOrders, getAllOrdersAdmin, getMyOrder, updateStatus, getStats } from '../controllers/order.js';
import { auth } from '../middlewares/auth.js';
const router = express.Router();

router.post('/order/new/cod', auth, newOrderCOD);
router.get('/order/all', auth, getAllOrders);
router.get('/order/all/admin', auth, getAllOrdersAdmin);
router.get('/order/:id', auth, getMyOrder);
router.post('/order/:id', auth, updateStatus);
router.get('/stats', auth, getStats);

export default router;