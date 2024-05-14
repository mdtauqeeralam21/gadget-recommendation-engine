import express from "express";
const cartRoute = express.Router();
import authenticateUser from "../middleware/authenticate.js";
import { addToCart, removeFromCart, viewCart } from "../controllers/cartController.js";

cartRoute.route('/view').get(authenticateUser,viewCart);
cartRoute.route('/add').post(authenticateUser,addToCart);
cartRoute.route('/remove').post(authenticateUser,removeFromCart);

export default cartRoute;
