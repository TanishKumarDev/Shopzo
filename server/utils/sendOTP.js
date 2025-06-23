import nodemailer from 'nodemailer';

const sendOTP = async (email, subject, otp) => {
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_PASS
    }
  });

  await transporter.sendMail({
    from: process.env.GMAIL_USER,
    to: email,
    subject: subject,
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2>OTP Verification</h2>
        <p>Your OTP for login is: <strong>${otp}</strong></p>
        <p>This OTP is valid for 5 minutes.</p>
      </div>
    `
  });
};

export default sendOTP;