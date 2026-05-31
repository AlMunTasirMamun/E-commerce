// Email utility for sending emails from almuntasirmamun2000@gmail.com
import nodemailer from "nodemailer";

export const sendResetCode = async (to, code) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    port: 587,
    secure: false,
    auth: {
      user: "almuntasirmamun2000@gmail.com",
      pass: process.env.ALMUNTASIRMAMUN2000_GMAIL_PASS,
    },
  });

  const mailOptions = {
    from: 'almuntasirmamun2000@gmail.com',
    to,
    subject: 'Password Reset Code',
    text: `Your password reset code is: ${code}`,
  };
  await transporter.sendMail(mailOptions);
};
