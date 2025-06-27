import express from 'express';
import { addAddress, getAddress, getSingleAddress, deleteAddress } from '../controllers/address.js';
import { auth } from '../middlewares/auth.js';

const router = express.Router();

router.post('/address/new', auth, addAddress);
router.get('/address/all', auth, getAddress);
router.get('/address/:id', auth, getSingleAddress);
router.delete('/address/:id', auth, deleteAddress);

export default router;