import User from "../models/User.js";
export const moderatorMiddleware = async (req, res, next) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            res.status(401).json({
                message: "Authentication required"
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
        if (user.role !== "moderator") {
            res.status(403).json({
                message: "Moderator access required"
            });
            return;
        }
        next();
    }
    catch (error) {
        res.status(500).json({
            message: "Failed to verify moderator"
        });
    }
};
