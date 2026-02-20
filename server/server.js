import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import chatRoute from "./routes/chat.js";
import imageRoute from "./routes/image.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/chat", chatRoute);
app.use("/api/image", imageRoute);

app.listen(5000, () => {
  console.log("Server running on port 5000");
});
