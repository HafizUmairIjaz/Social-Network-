import express from "express";
import Post from "../models/Post.js";
import User from "../models/User.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { emitNewPost } from "../socket.js";


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

    } catch (error) {

        res.status(500).json({
            message: "Failed to get posts"
        });
    }
});

// GET SOCIAL FEED WITH PAGINATION

router.get("/feed", authMiddleware, async (req, res) => {

    try {

        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;

        const skip = (page - 1) * limit;
        const sortOrder = req.query.sort === "oldest" ? 1 : -1;

        const user = await User.findById((req as any).user.userId);

        if (!user) {
            res.status(404).json({
                message: "User not found"
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

    } catch (error) {

        res.status(500).json({
            message: "Failed to fetch feed"
        });
    }
});

// GET ONE POST

router.get("/:id",async (req, res) => {

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

    } catch (error) {

        res.status(500).json({
            message: "Failed to get post"
        });
    }
});


// CREATE POST

router.post("/", authMiddleware , async (req, res) => {

    try {

        const { content, author } = req.body;

        const user = await User.findById(author);

        if (!user) {
            res.status(404).json({
                message: "Author not found"
            });
            return;
        }

        const post = await Post.create({
            content,
            author
        });
        emitNewPost(post);
 

        res.status(201).json(post);

    } catch (error) {
        console.error("CREATE POST ERROR:", error);
        res.status(500).json({
            message: "Failed to create post"
        });
    }
});


// UPDATE POST

router.put("/:id",authMiddleware, async (req, res) => {

    try {

        const post = await Post.findByIdAndUpdate(
            req.params.id,
            {
                content: req.body.content
            },
            { new: true }
        );

        if (!post) {
            res.status(404).json({
                message: "Post not found"
            });
            return;
        }

        res.json(post);

    } catch (error) {

        res.status(500).json({
            message: "Failed to update post"
        });
    }
});


// DELETE POST

router.delete("/:id",authMiddleware, async (req, res) => {

    try {

        const post = await Post.findByIdAndDelete(req.params.id);

        if (!post) {
            res.status(404).json({
                message: "Post not found"
            });
            return;
        }

        res.json({
            message: "Post deleted successfully"
        });

    } catch (error) {

        res.status(500).json({
            message: "Failed to delete post"
        });
    }
});


export default router;