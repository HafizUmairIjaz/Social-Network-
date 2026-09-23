import mongoose from "mongoose";
import User from "./models/User.js";
await mongoose.connect("mongodb://127.0.0.1:27017/social-network");
const user = await User.findOneAndUpdate({ email: "hassan@gmail.com" }, { role: "moderator" }, { new: true });
console.log(user);
await mongoose.disconnect();
