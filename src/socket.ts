
import { Server } from "socket.io";
let socketIO: Server;

export const setupSocket = (io: Server) => {
    socketIO = io;

    io.on("connection", (socket) => {

        console.log("User connected:", socket.id);
        socket.on("joinFeed", (userId: string) => {
        socket.join(`feed:${userId}`);
    });

        socket.on("disconnect", () => {
            console.log("User disconnected:", socket.id);
        });

    });

}; 
export const emitNewPost = (post: any) => {
    console.log("NEW POST EVENT EMITTED:", post);

    socketIO
        .to(`feed:${post.author.toString()}`)
        .emit("newPost", post);
};
