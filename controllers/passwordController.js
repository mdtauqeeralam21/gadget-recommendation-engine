import driver from "../db/connect.js";
import bcryptjs from "bcryptjs";
import { sendResetPasswordOTPEmail } from "./emailService.js";

const generateNumericOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const session = driver.session();

    const result = await session.run(
      "MATCH (u:User {email: $email}) RETURN u",
      { email }
    );

    const user = result.records[0]?.get("u");

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const otp = generateNumericOTP(); // Generate OTP
    const expirationTime = Date.now() + 600000; // 10 minutes expiration

    await session.run(
      "MATCH (u:User {email: $email}) SET u.resetPasswordToken = $otp, u.resetPasswordExpires = $expirationTime",
      { email, otp, expirationTime }
    );

    await sendResetPasswordOTPEmail(email, otp); // Send OTP via email
    session.close();
    return res
      .status(200)
      .json({ message: "Reset password OTP sent successfully" });
  } catch (error) {
    console.error("Error in forgot password:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

const verifyOTP = async (req, res) => {
  const { email, otp } = req.body;

  try {
    const session = driver.session();

    const result = await session.run(
      "MATCH (u:User {email: $email}) WHERE u.resetPasswordToken = $otp RETURN u",
      { email, otp }
    );

    session.close();

    const user = result.records[0]?.get("u");

    if (!user) {
      return res.status(400).json({ error: "User email not found" });
    }

    const expirationTime = user.properties.resetPasswordExpires;

    if (expirationTime < Date.now()) {
      return res.status(400).json({ error: "OTP has expired" });
    }

    return res.status(200).json({ message: "OTP verified successfully" });
  } catch (error) {
    console.error("Error in verifying OTP:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

const resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;

  try {
    const session = driver.session();

    const result = await session.run(
      "MATCH (u:User {email: $email, resetPasswordToken: $otp}) RETURN u",
      { email, otp }
    );

    const user = result.records[0]?.get("u");

    if (!user) {
      return res.status(400).json({ error: "Invalid OTP" });
    }

    const expirationTime = user.properties.resetPasswordExpires;

    if (expirationTime < Date.now()) {
      return res.status(400).json({ error: "OTP has expired" });
    }

    const salt = await bcryptjs.genSalt(10);
    const hashedPassword = await bcryptjs.hash(newPassword, salt);

    await session.run(
      "MATCH (u:User {email: $email, resetPasswordToken: $otp}) SET u.password = $hashedPassword, u.resetPasswordToken = NULL, u.resetPasswordExpires = NULL",
      { email, otp, hashedPassword }
    );

    session.close();

    return res.status(200).json({ message: "Password reset successfully" });
  } catch (error) {
    console.error("Error in resetting password:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export { forgotPassword, verifyOTP, resetPassword };
