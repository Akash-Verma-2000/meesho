import mongoose from 'mongoose';

const schema = new mongoose.Schema({

    img: {
        type: String,
        default: null
    },
    title: {
        type: String,

    },
    description: {
        type: String,
    },
    price: {
        type: Number,
    },
    comission: {
        type: Number,
    }

}, { timestamps: true });

export const OrderModal = mongoose.models.Order || mongoose.model('Order', schema); 
