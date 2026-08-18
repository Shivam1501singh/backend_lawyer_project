import nodemailer from 'nodemailer';

const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT || '587', 10),
    secure: process.env.EMAIL_PORT === '465',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    }
  });
};

export const sendEmailOtp = async (to, otp) => {
  const transporter = createTransporter();
  
  const mailOptions = {
    from: `"Verification" <${process.env.EMAIL_USER}>`,
    to,
    subject: 'Your Verification OTP Code',
    text: `Your verification OTP code is: ${otp}. It is valid for 5 minutes. Do not share this with anyone.`,
    html: `<p>Your verification OTP code is: <strong>${otp}</strong>. It is valid for 5 minutes.</p><p>Do not share this code with anyone.</p>`
  };

  try {
    // For development, if transporter configuration is dummy, let's log the OTP to the console
    if (!process.env.EMAIL_USER || process.env.EMAIL_USER === 'your-email@gmail.com') {
      console.log(`[DEV EMAIL SERVICE] OTP to ${to}: ${otp}`);
      return true;
    }
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Failed to send email OTP:', error);
    throw new Error('Email sending failed. Please check credentials or try again.');
  }
};
