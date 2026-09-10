import { Server } from "socket.io";
import User from "./models/User.js";
import { IPost } from "./models/Post.js";
let socketIO: Server;

export const setupSocket = (io: Server) => {
    socketIO = io;

    io.on("connection", (socket) => {
        console.log("User connected:", socket.id);

        socket.on("joinFeed", (userId: string) => {
            socket.join(`feed:${userId}`);
            console.log("Joined feed:", userId);
        });

        socket.on("disconnect", () => {
            console.log("User disconnected:", socket.id);
        });
    });
};

export const emitNewPost = async (post: IPost) => {
    console.log("NEW POST EVENT EMITTED:", post);

    const followers = await User.find({
        following: post.author
    });

    console.log(
        "FOLLOWERS:",
        followers.map((follower) => follower._id.toString())
    );

    followers.forEach((follower) => {
        console.log("EMITTING TO:", `feed:${follower._id.toString()}`);

        socketIO
            .to(`feed:${follower._id.toString()}`)
            .emit("newPost", post);
    });
};