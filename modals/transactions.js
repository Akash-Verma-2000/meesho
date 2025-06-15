import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({

    userId: {
        type: String,
        required: [true, 'User ID is required'],
        trim: true,
        ref:'User'
    },

    type: {
        type: String,
        enum: ['recharge', 'withdraw'],
        required: [true, 'Transation type is required'],
    },

    transactionId: {
        type: String,
    },

    amount: {
        type: Number,
    },

    status: {
        type: String,
        enum: ['approved', 'pending', 'rejected'],
        default: 'pending'
    }

}, { timestamps: true });

export const TransactionNodal = mongoose.models.Transaction || mongoose.model('Transaction', transactionSchema); 
