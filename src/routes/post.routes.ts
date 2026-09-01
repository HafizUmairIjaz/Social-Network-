import express from "express";
import Post from "../models/Post.js";
import User from "../models/User.js";

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

    } catch (error) {

        res.status(500).json({
            message: "Failed to get post"
        });
    }
});


// CREATE POST

router.post("/", async (req, res) => {

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

        res.status(201).json(post);

    } catch (error) {

        res.status(500).json({
            message: "Failed to create post"
        });
    }
});


// UPDATE POST

router.put("/:id", async (req, res) => {

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

router.delete("/:id", async (req, res) => {

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