import express from "express";
const router = express.Router();

import {
  register,
  login,
  updateUser,
  getCurrentUser,
  logout,
} from "../controllers/authController.js";

import authenticateUser from "../middleware/authenticate.js";

router.route("/register").post(register);
router.route("/login").post(login);
router.get("/logout", logout);

router.route("/updateUser").put(authenticateUser, updateUser);
router.route("/getCurrentUser").get(authenticateUser, getCurrentUser);

export default router;
