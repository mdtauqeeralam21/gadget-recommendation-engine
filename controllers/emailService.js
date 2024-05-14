import nodemailer from "nodemailer";

const sendResetPasswordOTPEmail = async (email, otp) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.PASSWORD,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Password Reset OTP",
    text: `Your password reset OTP is: ${otp}`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("Reset password OTP email sent successfully");
  } catch (error) {
    console.error("Error sending reset password OTP email:", error);
    throw error;
  }
};

export { sendResetPasswordOTPEmail };
