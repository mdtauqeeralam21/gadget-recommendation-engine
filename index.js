import express from "express";
const app = express();
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();
import morgan from "morgan";

// Routers
import authRouter from "./routes/authRoutes.js";
import passwordRouter from "./routes/passwordRoutes.js";
import gadgetRouter from "./routes/gadgetRoutes.js";
import authenticateUser from "./middleware/authenticate.js";

import notFoundMiddleware from "./middleware/not-found.js";
import errorHandlerMiddleware from "./middleware/error-handler.js";

import path from "path";
import { dirname } from "path";
import { fileURLToPath } from "url";

import helmet from "helmet";
import cookieParser from "cookie-parser";
import {
  fetchSearchHistory,
  searchHistory,
} from "./controllers/historyController.js";
import { getMobiles, getSingleProduct } from "./controllers/gadgetController.js";
import cartRoute from "./routes/cartRoutes.js";

if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev"));
}

const __dirname = dirname(fileURLToPath(import.meta.url));

app.use(express.static(path.resolve(__dirname, "./client/build")));

//app.use(cors());
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());
app.use(helmet());

app.get("/api/v1", (req, res) => {
  res.send("Hello");
});

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/password", passwordRouter);
app.use("/api/v1/products", gadgetRouter);
app.use("/api/v1/cart",cartRoute);

app.get("/api/v1/product/:category/:productName",getSingleProduct);

app.get("/api/v1/search", authenticateUser, searchHistory);
app.get("/api/v1/history", authenticateUser, fetchSearchHistory);



app.get("/api/v1/mobiles", getMobiles); //sample get request

app.get("*", function (request, response) {
  response.sendFile(path.resolve(__dirname, "./client/build", "index.html"));
});

app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

const port = process.env.PORT || 4000;

const start = async () => {
  try {
    app.listen(port, () => {
      console.log(`Server is listening on port ${port}...`);
    });
  } catch (error) {
    console.log(error);
  }
};

start();
