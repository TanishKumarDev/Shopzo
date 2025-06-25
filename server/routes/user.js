import express from 'express';
import { loginUser, verifyUser, myProfile } from "../controllers/user.js";
import { auth } from '../middlewares/auth.js';

const router = express.Router();

router.post('/user/login', loginUser);
router.post('/user/verify', verifyUser);
router.get('/user/my-profile', auth, myProfile);

export default router;