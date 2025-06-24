import { NextResponse } from "next/server";
import connectToDatabase from "../../../../../configurations/mongoose.config.js";
import { OrderModal } from "../../../../../modals/orders.js";
import { UserModal } from "../../../../../modals/users.js";
import { CommissionModal } from "../../../../../modals/commissions.js";
import { verifyToken } from "../../../../../middlewares/auth.js";
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';

export async function POST(req) {
    const response = {
        status: "error",
        message: "Something went wrong",
        data: {},
        error: "Something went wrong"
    };

    try {
        await connectToDatabase();

        let decodedToken;
        try {
            decodedToken = await verifyToken(req);
        } catch (err) {
            response.message = err.message;
            return NextResponse.json(response, { status: 401 });
        }

        const { orderId } = await req.json();

        if (!orderId) {
            response.message = "Order ID is required";
            return NextResponse.json(response, { status: 400 });
        }

        // Check if order exists and hasn't been grabbed by this user
        const order = await OrderModal.findById(orderId);
        if (!order) {
            response.message = "Order not found";
            return NextResponse.json(response, { status: 404 });
        }

        // Check if user has already grabbed this order
        if (decodedToken.grabbedOrders && decodedToken.grabbedOrders.includes(orderId)) {
            response.message = "You have already grabbed this order";
            return NextResponse.json(response, { status: 400 });
        }

        // Update user's balance and grabbed orders
        const user = await UserModal.findById(decodedToken._id);
        if (!user) {
            response.message = "User not found";
            return NextResponse.json(response, { status: 404 });
        }

        // Check if user has sufficient balance
        if (user.balance < order.price) {
            response.message = `Insufficient balance please add ₹${order.price - user.balance} in your balace.`;
            return NextResponse.json(response, { status: 400 });
        }

        // Calculate commission amount
        const commissionAmount = (order.price * order.comission) / 100;

        // Convert orderId to ObjectId
        const orderObjectId = new mongoose.Types.ObjectId(orderId);

        // Update user's balance and grabbed orders
        user.balance = (user.balance || 0) + commissionAmount;
        user.grabbedOrders = [...(user.grabbedOrders || []), orderObjectId];

        // Update lastOrderGrabbedAt to current date and time
        user.lastOrderGrabbedAt = new Date();

        // If user has grabbed more than 4 orders, freeze their balance
        if (user.grabbedOrders.length > 3) {
            user.frozenBalance = user.balance;
            user.balance = 0;
        }

        await user.save();

        // Record the commission transaction
        const commissionRecord = new CommissionModal({
            userId: user._id,
            orderId: orderObjectId,
            commission: commissionAmount
        });
        await commissionRecord.save();

        // Generate new token with updated grabbedOrders
        const newToken = jwt.sign(
            {
                _id: user._id,
                email: user.email,
                type: user.type,
                grabbedOrders: user.grabbedOrders.map(id => id.toString())
            },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        response.status = "success";
        response.message = `Successfully grabbed order! Commission of ₹${commissionAmount.toFixed(2)} added to your balance.`;

        response.notice = "";
        if (user?.grabbedOrders?.length % 4 == 0) {
            response.notice = `Congratulations you have cleared level ${user?.grabbedOrders?.length / 4}`;
        }

        response.data = {
            newBalance: user.balance,
            commissionAmount,
            token: newToken
        };
        return NextResponse.json(response, { status: 200 });

    } catch (error) {
        console.error("Orders API error (POST grab):", error);
        response.error = error.message;
        return NextResponse.json(response, { status: 500 });
    }
} 