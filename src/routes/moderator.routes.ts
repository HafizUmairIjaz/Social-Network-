
import express from "express";
import Post from "../models/Post.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { moderatorMiddleware } from "../middleware/moderator.middleware.js";

const router = express.Router();

// MODERATOR: UPDATE ANY POST

router.put("/posts/:id", authMiddleware, moderatorMiddleware, async (req, res) => {
    try {
        const post = await Post.findByIdAndUpdate(
            req.params.id,
            {
                content: req.body.content
            },
            {
                new: true,
                runValidators: true
            }
        ).select("-author");

        if (!post) {
            res.status(404).json({
                message: "Post not found"
            });
            return;
        }

        res.json({
            message: "Post updated by moderator",
            post
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to update post"
        });
    }
});


// MODERATOR: DELETE ANY POST

router.delete("/posts/:id", authMiddleware, moderatorMiddleware, async (req, res) => {
    try {
        const post = await Post.findByIdAndDelete(req.params.id);

        if (!post) {
            res.status(404).json({
                message: "Post not found"
            });
            return;
        }

        res.json({
            message: "Post deleted by moderator"
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to delete post"
        });
    }
});

export default router;