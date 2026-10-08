import "dotenv/config";

import { Server } from "socket.io";
import http from "http";
import express from "express";
import mongoose from "mongoose";
import userRoutes from "./routes/user.routes.js";
import postRoutes from "./routes/post.routes.js";
import authRoutes from "./routes/auth.routes.js";
import { setupSocket } from "./socket.js";
import paymentRoutes from "./routes/payment.routes.js";
import moderatorRoutes from "./routes/moderator.routes.js";
import path from "path";

const app = express();
const httpServer = http.createServer(app);

export const io = new Server(httpServer, {
    cors: {
        origin: "*"
    }
});

setupSocket(io);

// Read JSON request body
app.use(express.json());

mongoose
    .connect(process.env.MONGODB_URI!)
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

app.use("/payment", paymentRoutes);

app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

app.use("/users", userRoutes);
app.use("/posts", postRoutes);
app.use("/auth", authRoutes);
app.use("/moderator", moderatorRoutes);

app.use(
    (err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
        console.error(err);

        res.status(400).json({
            message: err.message || "Something went wrong"
        });
    }
);

const PORT = Number(process.env.PORT) || 3000;

httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
});