import express from "express";
const gadgetRouter = express.Router();

import {
  getMobiles,
  getProducts,
  gadgets,
  getProductsByCategory,
} from "../controllers/gadgetController.js";

import {
  recommendations,
  recordInteraction,
  similarProducts,
} from "../controllers/recommendController.js";
import authenticateUser from "../middleware/authenticate.js";

gadgetRouter.route("/interacts").post(authenticateUser,recordInteraction);
gadgetRouter.route("/recommendations").post(authenticateUser,recommendations);
gadgetRouter.get("/similarproducts",authenticateUser, similarProducts);

gadgetRouter.route("/getMobiles").get(getMobiles);
gadgetRouter.route("/gadgets").get(gadgets);
gadgetRouter.route("/:category").get(getProductsByCategory);

gadgetRouter.route("/:category/:brand").get(getProducts);

export default gadgetRouter;
