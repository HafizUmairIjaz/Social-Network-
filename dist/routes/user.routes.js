import express from "express";
import User from "../models/User.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import upload from "../middleware/upload.middleware.js";
import { saveAvatar } from "../utils/file.utils.js";
import crypto from "crypto";
import { getPagination } from "../utils/pagination.js";
const router = express.Router();
// image route 
router.put("/avatar", authMiddleware, upload.single("avatar"), async (req, res) => {
    console.log(" AVATAR ROUTE HIT");
    try {
        if (!req.file) {
            return res.status(400).json({
                message: "Avatar image is required"
            });
        }
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json({
                message: "Unauthorized"
            });
        }
        // if file = pic,jpg tu split "pic" , "jpg" then pop jpg
        const fileExtension = req.file.originalname
            .split(".")
            .pop();
        const fileName = `${userId}-${crypto.randomUUID()}.${fileExtension}`;
        //
        const avatarPath = await saveAvatar(req.file.buffer, fileName);
        const user = await User.findByIdAndUpdate(userId, {
            avatar: avatarPath
        }, { new: true });
        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }
        res.json({
            message: "Avatar uploaded successfully",
            avatar: user.avatar
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Failed to upload avatar"
        });
    }
});
// GET ALL USERS WITH PAGINATION
router.get("/", async (req, res) => {
    try {
        const pagination = getPagination(req.query);
        if (!pagination) {
            return res.status(400).json({
                message: "Page must be a positive integer and limit must be between 1 and 100"
            });
        }
        const { page, limit, skip } = pagination;
        const users = await User.find()
            .skip(skip)
            .limit(limit);
        const totalUsers = await User.countDocuments();
        res.json({
            page,
            limit,
            totalUsers,
            totalPages: Math.ceil(totalUsers / limit),
            users
        });
    }
    catch (error) {
        res.status(500).json({
            message: "Failed to get users"
        });
    }
});
// GET ONE USER
router.get("/:id", async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            res.status(404).json({
                message: "User not found"
            });
            return;
        }
        res.json(user);
    }
    catch (error) {
        res.status(500).json({
            message: "Failed to get user"
        });
    }
});
// CREATE USER
router.post("/", async (req, res) => {
    try {
        const user = await User.create({
            name: req.body.name,
            email: req.body.email,
            password: req.body.password,
            following: []
        });
        res.status(201).json(user);
    }
    catch (error) {
        res.status(500).json({
            message: "Failed to create user"
        });
    }
});
// UPDATE USER
router.put("/:id", authMiddleware, async (req, res) => {
    try {
        //const loggedInUserId = (req as any).user.userId;
        const loggedInUserId = req.user?.userId;
        if (loggedInUserId !== req.params.id) {
            res.status(403).json({
                message: "You can only update your own profile"
            });
            return;
        }
        const { name, email } = req.body;
        const user = await User.findByIdAndUpdate(req.params.id, {
            name,
            email
        }, {
            new: true,
            runValidators: true
        }).select("-password");
        if (!user) {
            res.status(404).json({
                message: "User not found"
            });
            return;
        }
        res.json(user);
    }
    catch (error) {
        res.status(500).json({
            message: "Failed to update user"
        });
    }
});
// DELETE USER
router.delete("/:id", authMiddleware, async (req, res) => {
    try {
        const loggedInUserId = req.user.userId;
        if (loggedInUserId !== req.params.id) {
            res.status(403).json({
                message: "You can only delete your own account"
            });
            return;
        }
        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) {
            res.status(404).json({
                message: "User not found"
            });
            return;
        }
        res.json({
            message: "User deleted successfully"
        });
    }
    catch (error) {
        res.status(500).json({
            message: "Failed to delete user"
        });
    }
});
// FOLLOW USER
router.post("/follow/:targetId", authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId);
        const targetUser = await User.findById(req.params.targetId);
        if (!user || !targetUser) {
            res.status(404).json({
                message: "User not found"
            });
            return;
        }
        // Prevent self-follow
        if (user._id.toString() === targetUser._id.toString()) {
            res.status(400).json({
                message: "You cannot follow yourself"
            });
            return;
        }
        if (user.following.includes(targetUser._id)) {
            res.status(400).json({
                message: "Already following this user"
            });
            return;
        }
        user.following.push(targetUser._id);
        await user.save();
        res.json({
            message: "User followed successfully",
            following: user.following
        });
    }
    catch (error) {
        res.status(500).json({
            message: "Failed to follow user"
        });
    }
});
// UNFOLLOW USER
router.post("/unfollow/:targetId", authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId);
        const targetUser = await User.findById(req.params.targetId);
        if (!user || !targetUser) {
            res.status(404).json({
                message: "User not found"
            });
            return;
        }
        if (!user.following.includes(targetUser._id)) {
            res.status(400).json({
                message: "You are not following this user"
            });
            return;
        }
        user.following = user.following.filter((id) => !id.equals(targetUser._id));
        await user.save();
        res.json({
            message: "User unfollowed successfully",
            following: user.following
        });
    }
    catch (error) {
        res.status(500).json({
            message: "Failed to unfollow user"
        });
    }
});
export default router;
