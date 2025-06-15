import mongoose from 'mongoose';

const paymentSettingsSchema = new mongoose.Schema({
    qrCodeBase64: {
        type: String,
        default: null
    },
}, { timestamps: true });

export const PaymentSettingsModal = mongoose.models.PaymentSettings || mongoose.model('PaymentSettings', paymentSettingsSchema); 