import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
        unique: true
    },
    sponsorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    name: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    paymentPassword: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['player', 'admin'],
        default: 'player'
    },
    balance: {
        type: Number,
        default: 100
    },
    frozenBalance: {
        type: Number,
        default: 0
    },
    grabbedOrders: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order'
    }],
    lastOrderGrabbedAt: {
        type: Date,
    },
    isBlocked: {
        type: Boolean,
        default: false,
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

export const UserModal = mongoose.models.User || mongoose.model('User', userSchema); 