import { NextResponse } from "next/server";
import connectToDatabase from "../../../../../configurations/mongoose.config.js";
import { CommissionModal } from "../../../../../modals/commissions.js";
import { TransactionNodal } from "../../../../../modals/transactions.js";
import { verifyToken } from "../../../../../middlewares/auth.js";
import mongoose from "mongoose";

export async function GET(req) {
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


        // Calculate today's earnings
        const totalEarnings = await CommissionModal.aggregate([
            {
                $match: {
                    userId: new mongoose.Types.ObjectId(decodedToken._id),
                }
            },
            {
                $group: {
                    _id: null,
                    total: { $sum: '$commission' }
                }
            }
        ]);

        const totalWithdrawals = await TransactionNodal.aggregate([
            {
                $match: {
                    userId: new mongoose.Types.ObjectId(decodedToken._id),
                    type: 'withdraw',
                    status: 'approved'
                }
            },
            {
                $group: {
                    _id: null,
                    total: { $sum: '$amount' }
                }
            }
        ]);

        const totalRecharge = await TransactionNodal.aggregate([
            {
                $match: {
                    userId: new mongoose.Types.ObjectId(decodedToken._id),
                    type: 'recharge',
                    status: 'approved'
                }
            },
            {
                $group: {
                    _id: null,
                    total: { $sum: '$amount' }
                }
            }
        ]);

        response.status = "success";
        response.message = "Dashboard data fetched successfully";
        response.error = "";
        response.data = {
            totalEarnings: totalEarnings[0]?.total || 0,
            totalWithdrawals: totalWithdrawals[0]?.total || 0,
            totalRecharge: totalRecharge[0]?.total || 0,
        };

        return NextResponse.json(response, { status: 200 });

    } catch (error) {
        console.error("Dashboard API error:", error);
        response.error = error.message;
        return NextResponse.json(response, { status: 500 });
    }
} 