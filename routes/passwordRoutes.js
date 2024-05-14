import express from "express";
const passwordRouter = express.Router();

import {
  forgotPassword,
  resetPassword,
  verifyOTP,
} from "../controllers/passwordController.js";

passwordRouter.route("/forgotpassword").post(forgotPassword);
passwordRouter.route("/verifyotp").post(verifyOTP);
passwordRouter.route("/resetpassword").post(resetPassword);

export default passwordRouter;
