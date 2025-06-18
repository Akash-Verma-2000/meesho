import mongoose, { Mongoose } from 'mongoose';

const bankSchema = new mongoose.Schema({

    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: [true, 'User ID is required'],
        trim: true,
    },

    accountHolderName: {
        type: String,
        required: [true, 'Account holder name is required'],
        trim: true,
    },
    bankName: {
        type: String,
        required: [true, 'Bank name is required'],
        trim: true,
    },
    branchName: {
        type: String,
        required: [true, 'Bank name is required'],
        trim: true,
    },
    accountNumber: {
        type: String,
        required: [true, 'Account number is required'],
        trim: true,
        match: [/^\d{9,18}$/, 'Please enter a valid account number']
    },
    ifscCode: {
        type: String,
        required: [true, 'IFSC code is required'],
        trim: true,
        uppercase: true,
        match: [/^[A-Z]{4}0[A-Z0-9]{6}$/, 'Please enter a valid IFSC code']
    },

    type: {
        type: String,
        enum: ['savings', 'current'],
        required: [true, 'Bank account type is required'],
        default: 'savings'
    },

}, { timestamps: true });

export const BankModal = mongoose.models.Bank || mongoose.model('Bank', bankSchema); 
