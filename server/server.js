import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import chatRoute from "./routes/chat.js";
import imageRoute from "./routes/image.js";
import subscriptionRoute from "./routes/subscription.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/chat", chatRoute);
app.use("/api/image", imageRoute);
app.use("/api/subscription", subscriptionRoute);

app.listen(process.env.PORT || 5000, () => {
  console.log("Server running...");
});
