import tryCatch from '../utils/tryCatch.js';
import sendOTP from '../utils/sendOTP.js';
import { User } from '../models/user.js';
import { OTP } from '../models/otp.js';
import jwt from 'jsonwebtoken';

export const loginUser = tryCatch(async (req, res) => {
  const { email } = req.body;
  const subject = 'OTP for E-commerce';
  const otp = Math.floor(100000 + Math.random() * 900000); // Generate 6-digit OTP

  // Check for existing OTP and delete it
  const previousOTP = await OTP.findOne({ email });
  if (previousOTP) {
    await previousOTP.deleteOne();
  }

  // Send OTP to email
  await sendOTP(email, subject, otp);

  // Save OTP to database
  await OTP.create({ email, otp });

  res.status(200).json({ message: 'OTP sent to your mail' });
});

export const verifyUser = tryCatch(async (req, res) => {
  const { email, otp } = req.body;

  // Check if OTP exists
  const haveOTP = await OTP.findOne({ email, otp });
  if (!haveOTP) {
    return res.status(400).json({ message: 'Invalid OTP' });
  }

  // Find or create user
  let user = await User.findOne({ email });
  if (!user) {
    user = await User.create({ email });
  }

  // Generate JWT
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '15d' });

  // Delete OTP
  await haveOTP.deleteOne();

  res.status(200).json({ message: 'User logged in', token, user });
});