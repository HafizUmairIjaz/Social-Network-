import User from "./models/User.js";
import jwt from "jsonwebtoken";
let socketIO;
export const setupSocket = (io) => {
    socketIO = io;
    io.use((socket, next) => {
        try {
            console.log("SOCKET HEADERS:", socket.handshake.headers);
            console.log("AUTH HEADER:", socket.handshake.headers.authorization);
            const authHeader = socket.handshake.headers.authorization;
            if (!authHeader) {
                return next(new Error("Authorization header required"));
            }
            const token = authHeader.startsWith("Bearer ")
                ? authHeader.split(" ")[1]
                : null;
            if (!token) {
                return next(new Error("Bearer token required"));
            }
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            socket.data.userId = decoded.userId;
            next();
        }
        catch (error) {
            console.error("SOCKET AUTH ERROR:", error);
            next(new Error("Invalid or expired token"));
        }
    });
    io.on("connection", (socket) => {
        console.log("User connected:", socket.id);
        const userId = socket.data.userId;
        // Automatically join user's own feed room
        socket.join(`feed:${userId}`);
        console.log("Joined feed:", userId);
        socket.on("disconnect", () => {
            console.log("User disconnected:", socket.id);
        });
    });
};
export const emitNewPost = async (post) => {
    console.log("NEW POST EVENT EMITTED:", post);
    const followers = await User.find({
        following: post.author
    });
    console.log("FOLLOWERS:", followers.map((follower) => follower._id.toString()));
    followers.forEach((follower) => {
        console.log("EMITTING TO:", `feed:${follower._id.toString()}`);
        socketIO
            .to(`feed:${follower._id.toString()}`)
            .emit("newPost", post);
    });
};
