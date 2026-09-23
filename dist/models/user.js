//MongoDB data structure/schema define 
import mongoose from "mongoose";
// MongoDB document structure
const userSchema = new mongoose.Schema({
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
        type: String,
        default: null
    }
}, {
    timestamps: true
});
const User = mongoose.model("User", userSchema);
export default User;
