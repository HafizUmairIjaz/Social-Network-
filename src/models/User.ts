//MongoDB data structure/schema define 
import mongoose from "mongoose";

export interface IUser {
    name: string;
    email: string;
    password: string;
    following: mongoose.Types.ObjectId[];
    isPaid: boolean;
    role: "user" | "moderator",
    avatar : "string";
}

// MongoDB document structure
const userSchema = new mongoose.Schema<IUser>(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },

        email: {
            type: String,
            required: true,
            unique: true,
            trim: true
        },

        password: {
            type: String,
            required: true
        },

        following: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User"
            }
        ],

        isPaid: {
            type: Boolean,
            default: false
        },

        role: {
            type: String,
            enum: ["user", "moderator"],
            default: "user"
        },
        avatar: { 
            type : String, 
            default : null
        } 
    },
    {
        timestamps: true
    }
);

const User = mongoose.model<IUser>("User", userSchema);

export default User;