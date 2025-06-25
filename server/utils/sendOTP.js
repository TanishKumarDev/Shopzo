import nodemailer from 'nodemailer';

const sendOTP = async (email, subject = "Your OTP for Shopzo Login", otp) => {
  if (!email || !otp || !subject) {
    throw new Error("Email, subject, and OTP are required.");
  }

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
    from: `"Shopzo" <${process.env.GMAIL_USER}>`,
    to: email,
    subject,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd;">
        <h2 style="color: #333;">Your OTP for Shopzo</h2>
        <p style="font-size: 16px; color: #555;">Dear User,</p>
        <p style="font-size: 16px; color: #555;">Your One-Time Password (OTP) is:</p>
        <h3 style="font-size: 24px; color: #007bff;">${otp}</h3>
        <p style="font-size: 16px; color: #555;">This OTP is valid for 5 minutes. Please do not share it with anyone.</p>
        <p style="font-size: 16px; color: #555;">Thank you for using our service!</p>
      </div>
    `
  });

  if (process.env.NODE_ENV !== 'production') {
    console.log(`✅ OTP email sent to ${email}`);
  }
};

export default sendOTP;
