import express from "express";
import Post from "../models/Post.js";
import User from "../models/User.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { emitNewPost } from "../socket.js";
import { getPagination } from "../utils/pagination.js";
const router = express.Router();
// GET ALL POSTS WITH PAGINATION
router.get("/", async (req, res) => {
    try {
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const posts = await Post.find()
            .populate("author", "name email")
            .skip(skip)
            .limit(limit);
        const totalPosts = await Post.countDocuments();
        res.json({
            page,
            limit,
            totalPosts,
            totalPages: Math.ceil(totalPosts / limit),
            posts
        });
    }
    catch (error) {
        res.status(500).json({
            message: "Failed to get posts"
        });
    }
});
// GET SOCIAL FEED WITH PAGINATION
router.get("/feed", authMiddleware, async (req, res) => {
    try {
        const pagination = getPagination(req.query);
        if (!pagination) {
            res.status(400).json({
                message: "Page must be a positive integer and limit must be between 1 and 100"
            });
            return;
        }
        const { page, limit, skip } = pagination;
        const sortOrder = req.query.sort === "oldest" ? 1 : -1;
        const userId = req.user?.userId;
        if (!userId) {
            res.status(401).json({
                message: "User not authenticated"
            });
            return;
        }
        const user = await User.findById(userId);
        if (!user) {
            res.status(404).json({
                message: "User not found"
            });
            return;
        }
        if (!user.isPaid) {
            res.status(403).json({
                message: "Premium subscription required to access the feed"
            });
            return;
        }
        const totalPosts = await Post.countDocuments({
            author: { $in: user.following }
        });
        const posts = await Post.find({
            author: { $in: user.following }
        })
            .populate("author", "name email")
            .sort({ createdAt: sortOrder })
            .skip(skip)
            .limit(limit);
        res.json({
            page,
            limit,
            totalPosts,
            totalPages: Math.ceil(totalPosts / limit),
            posts
        });
    }
    catch (error) {
        res.status(500).json({
            message: "Failed to fetch feed"
        });
    }
});
// GET ONE POST
router.get("/:id", async (req, res) => {
    try {
        const post = await Post.findById(req.params.id)
            .populate("author", "name email");
        if (!post) {
            res.status(404).json({
                message: "Post not found"
            });
            return;
        }
        res.json(post);
    }
    catch (error) {
        res.status(500).json({
            message: "Failed to get post"
        });
    }
});
// CREATE POST
router.post("/", authMiddleware, async (req, res) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            res.status(401).json({
                message: "User not authenticated"
            });
            return;
        }
        const { content } = req.body;
        if (!content || !content.trim()) {
            res.status(400).json({
                message: "Content is required"
            });
            return;
        }
        const user = await User.findById(userId);
        if (!user) {
            res.status(404).json({
                message: "User not found"
            });
            return;
        }
        const post = await Post.create({
            content,
            author: userId
        });
        await emitNewPost(post);
        res.status(201).json(post);
    }
    catch (error) {
        console.error("CREATE POST ERROR:", error);
        res.status(500).json({
            message: "Failed to create post"
        });
    }
});
// UPDATE POST
router.put("/:id", authMiddleware, async (req, res) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            res.status(401).json({
                message: "User not authenticated"
            });
            return;
        }
        const post = await Post.findById(req.params.id);
        if (!post) {
            res.status(404).json({
                message: "Post not found"
            });
            return;
        }
        // Check if this post belongs to logged-in user
        if (post.author.toString() !== userId) {
            res.status(403).json({
                message: "You can only update your own post"
            });
            return;
        }
        const { content } = req.body;
        if (!content) {
            res.status(400).json({
                message: "Content is required"
            });
            return;
        }
        post.content = content;
        await post.save();
        res.json({
            message: "Post updated successfully",
            post
        });
    }
    catch (error) {
        console.error("UPDATE POST ERROR:", error);
        res.status(500).json({
            message: "Failed to update post"
        });
    }
});
// DELETE POST
router.delete("/:id", authMiddleware, async (req, res) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            res.status(401).json({
                message: "User not authenticated"
            });
            return;
        }
        const post = await Post.findById(req.params.id);
        if (!post) {
            res.status(404).json({
                message: "Post not found"
            });
            return;
        }
        // Check if this post belongs to logged-in user
        if (post.author.toString() !== userId) {
            res.status(403).json({
                message: "You can only delete your own post"
            });
            return;
        }
        await Post.findByIdAndDelete(req.params.id);
        res.json({
            message: "Post deleted successfully"
        });
    }
    catch (error) {
        res.status(500).json({
            message: "Failed to delete post"
        });
    }
});
export default router;
