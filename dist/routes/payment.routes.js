import express from "express";
import stripe from "../config/stripe.js";
import User from "../models/User.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import StripeEvent from "../models/StripeEvent.js";
const router = express.Router();
router.post("/checkout", authMiddleware, async (req, res) => {
    try {
        const session = await stripe.checkout.sessions.create({
            mode: "payment",
            line_items: [
                {
                    price_data: {
                        currency: "usd",
                        product_data: {
                            name: "Social Network Premium",
                        },
                        unit_amount: 1000,
                    },
                    quantity: 1,
                },
            ],
            success_url: "http://localhost:3000/payment/success",
            cancel_url: "http://localhost:3000/payment/cancel",
            metadata: {
                userId: req.user?.userId ?? "",
            },
        });
        res.json({
            url: session.url,
        });
    }
    catch (error) {
        console.error("STRIPE CHECKOUT ERROR:", error);
        res.status(500).json({
            message: "Failed to create checkout session",
        });
    }
});
router.post("/webhook", express.raw({ type: "application/json" }), async (req, res) => {
    const sig = req.headers["stripe-signature"];
    try {
        const event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
        console.log("STRIPE EVENT:", event.type);
        // Check if this event was already processed
        const existingEvent = await StripeEvent.findOne({
            eventId: event.id
        });
        if (existingEvent) {
            console.log("Event already processed:", event.id);
            res.json({
                received: true
            });
            return;
        }
        if (event.type === "checkout.session.completed") {
            const session = event.data.object;
            const userId = session.metadata?.userId;
            if (userId) {
                await User.findByIdAndUpdate(userId, {
                    isPaid: true
                });
                console.log("User marked as paid:", userId);
            }
        }
        // Save event after successful processing
        await StripeEvent.create({
            eventId: event.id,
            type: event.type
        });
        console.log("Stripe event saved:", event.id);
        res.json({
            received: true
        });
    }
    catch (error) {
        console.error("Webhook error:", error);
        res.status(400).send("Webhook Error");
    }
});
export default router;
