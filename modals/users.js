import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
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
    type: {
        type: String,
        enum: ['player', 'admin'],
        default: 'player'
    },
    balance: {
        type: Number,
        default: 0
    },
    grabbedOrders: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order'
    }],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

export const UserModal = mongoose.models.User || mongoose.model('User', userSchema); 