
import mongoose from "mongoose";

interface IStripeEvent {
    eventId: string;
    type: string;
    processedAt: Date;
}

const stripeEventSchema = new mongoose.Schema<IStripeEvent>(
    {
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
    },
    {
        timestamps: true
    }
);

const StripeEvent = mongoose.model<IStripeEvent>(
    "StripeEvent",
    stripeEventSchema
);

export default StripeEvent;