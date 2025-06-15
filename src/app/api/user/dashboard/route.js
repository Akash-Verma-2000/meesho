import { NextResponse } from "next/server";
import connectToDatabase from "../../../../../configurations/mongoose.config.js";
import { CommissionModal } from "../../../../../modals/commissions.js";
import { TransactionModal } from "../../../../../modals/transactions.js";
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

        // Get today's date at midnight
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Get yesterday's date at midnight
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        // Get tomorrow's date at midnight (for date range queries)
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const dayBeforeYesterday = new Date(yesterday);
        dayBeforeYesterday.setDate(dayBeforeYesterday.getDate() - 1);

        // Calculate today's earnings
        const todayEarnings = await CommissionModal.aggregate([
            {
                $match: {
                    userId: new mongoose.Types.ObjectId(decodedToken._id),
                    createdAt: {
                        $gte: today,
                        $lt: tomorrow
                    }
                }
            },
            {
                $group: {
                    _id: null,
                    total: { $sum: '$commission' }
                }
            }
        ]);

        // Calculate yesterday's earnings
        const yesterdayEarnings = await CommissionModal.aggregate([
            {
                $match: {
                    userId: new mongoose.Types.ObjectId(decodedToken._id),
                    createdAt: {
                        $gte: yesterday,
                        $lt: today
                    }
                }
            },
            {
                $group: {
                    _id: null,
                    total: { $sum: '$commission' }
                }
            }
        ]);

        // Calculate today's withdrawals
        const todayWithdrawals = await TransactionModal.aggregate([
            {
                $match: {
                    userId: new mongoose.Types.ObjectId(decodedToken._id),
                    type: 'withdraw',
                    createdAt: {
                        $gte: today,
                        $lt: tomorrow
                    }
                }
            },
            {
                $group: {
                    _id: null,
                    total: { $sum: '$amount' }
                }
            }
        ]);

        // Calculate yesterday's withdrawals
        const yesterdayWithdrawals = await TransactionModal.aggregate([
            {
                $match: {
                    userId: new mongoose.Types.ObjectId(decodedToken._id),
                    type: 'withdraw',
                    createdAt: {
                        $gte: yesterday,
                        $lt: today
                    }
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
        response.data = {
            todayEarnings: todayEarnings[0]?.total || 0,
            yesterdayEarnings: yesterdayEarnings[0]?.total || 0,
            todayWithdrawals: todayWithdrawals[0]?.total || 0,
            yesterdayWithdrawals: yesterdayWithdrawals[0]?.total || 0
        };

        return NextResponse.json(response, { status: 200 });

    } catch (error) {
        console.error("Dashboard API error:", error);
        response.error = error.message;
        return NextResponse.json(response, { status: 500 });
    }
} 