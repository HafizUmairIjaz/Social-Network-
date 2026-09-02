
import mongoose from "mongoose";

export interface IPost {
    content: string;
    author: mongoose.Types.ObjectId;
}

const postSchema = new mongoose.Schema<IPost>(
    {
        content: {
            type: String,
            required: true,
            trim: true
        },

        author: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        }
    },
    {
        timestamps: true
    }
);

const Post = mongoose.model<IPost>("Post", postSchema);

export default Post;