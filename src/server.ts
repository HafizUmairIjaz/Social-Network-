import "dotenv/config";


import express from "express";
import mongoose from "mongoose";
import userRoutes from "./routes/user.routes.js";
import postRoutes from "./routes/post.routes.js";
import authRoutes from "./routes/auth.routes.js";
import "dotenv/config";

const app = express();
// json request body read 
app.use(express.json());

mongoose
    .connect("mongodb://127.0.0.1:27017/social-network")
    .then(() => {
        console.log("MongoDB connected");
    })
    .catch((error) => {
        console.error("MongoDB connection failed:", error);
    });

app.get("/", (req, res) => {
    res.json({
        message: "Social Network API is running"
    });
});
app.use("/users", userRoutes);
app.use("/posts", postRoutes);
app.use("/auth", authRoutes);
app.listen(3000, () => {
    console.log("Server running on port 3000");
});
