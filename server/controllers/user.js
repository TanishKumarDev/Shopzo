import tryCatch  from '../utils/tryCatch.js';
import { User } from '../models/user.js';
import { OTP } from '../models/otp.js';
import sendOTP from '../utils/sendOTP.js';
import jwt from 'jsonwebtoken';

export const loginUser = tryCatch(async (req, res) => {
  const { email } = req.body;
  const subject = 'OTP for E-commerce Login';
  const otp = Math.floor(100000 + Math.random() * 900000); // 6-digit OTP

  const previousOTP = await OTP.findOne({ email });
  if (previousOTP) {
    await previousOTP.deleteOne();
  }

  await sendOTP(email, subject, otp);

  await OTP.create({ email, otp });

  res.status(200).json({ message: 'OTP sent to your mail' });
});

export const verifyUser = tryCatch(async (req, res) => {
  const { email, otp } = req.body;

  const haveOTP = await OTP.findOne({ email, otp });
  if (!haveOTP) {
    return res.status(400).json({ message: 'Invalid OTP' });
  }

  let user = await User.findOne({ email });
  if (user) {
    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, { expiresIn: '15d' });
    await haveOTP.deleteOne();
    return res.status(200).json({ message: 'User logged in', token, user });
  } else {
    user = await User.create({ email });
    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, { expiresIn: '15d' });
    await haveOTP.deleteOne();
    return res.status(200).json({ message: 'User logged in', token, user });
  }
});