import express, { Application } from "express";
import dotenv from "dotenv";
import authRouter from "./routes/auth";
import mongoose from "mongoose";

dotenv.config();
const app: Application = express();
const PORT = process.env.PORT || 4000;

app.use(express.json());
app.use("/auth", authRouter);

app.get("/", (req, res) => {
  res.json({
    msg: "This is the default route",
  });
});

const StartDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI!);
    console.log("Connected to the database");
  } catch (e) {
    console.log(e);
  }
};

const StartServer = () => {
  StartDB().then(() => {
    app.listen(PORT, () => {
      console.log(`Server is started on http://localhost:${PORT}`);
    });
  });
};

StartServer();