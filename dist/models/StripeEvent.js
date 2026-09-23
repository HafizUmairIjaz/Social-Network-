import mongoose from "mongoose";
const stripeEventSchema = new mongoose.Schema({
    eventId: {
        type: String,
        required: true,
        unique: true
    },
    type: {
        type: String,
        required: true
    },
    processedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});
const StripeEvent = mongoose.model("StripeEvent", stripeEventSchema);
export default StripeEvent;
