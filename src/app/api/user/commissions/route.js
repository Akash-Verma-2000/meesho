import { NextResponse } from "next/server";
import connectToDatabase from "../../../../../configurations/mongoose.config.js";
import { CommissionModal } from "../../../../../modals/commissions.js";
import { OrderModal } from "../../../../../modals/orders.js";
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

        console.log("Decoded token:", decodedToken);

        // Get pagination parameters from URL
        const { searchParams } = new URL(req.url);
        const page = parseInt(searchParams.get('page')) || 1;
        const limit = parseInt(searchParams.get('limit')) || 10;
        const skip = (page - 1) * limit;

        // Get total count of commissions
        const totalCommissions = await CommissionModal.countDocuments({ userId: decodedToken._id });
        console.log("Total commissions count:", totalCommissions);

        // Get paginated commissions with order details
        const commissions = await CommissionModal.find({ userId: decodedToken._id })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate('orderId', 'orderId price comission');

        console.log("Found commissions:", commissions);

        // Calculate total commission earned
        const totalCommission = await CommissionModal.aggregate([
            { 
                $match: { 
                    userId: new mongoose.Types.ObjectId(decodedToken._id)
                }
            },
            { 
                $group: { 
                    _id: null, 
                    total: { $sum: '$commission' } 
                }
            }
        ]);

        console.log("Total commission aggregation result:", totalCommission);

        response.status = "success";
        response.message = "Commissions fetched successfully";
        response.data = {
            commissions: commissions.map(commission => ({
                id: commission._id,
                orderId: commission.orderId.orderId,
                price: commission.orderId.price,
                commissionPercentage: commission.orderId.comission,
                commissionAmount: commission.commission,
                date: commission.createdAt
            })),
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(totalCommissions / limit),
                totalCommissions,
                totalCommission: totalCommission[0]?.total || 0
            }
        };

        console.log("Final response data:", response.data);

        return NextResponse.json(response, { status: 200 });

    } catch (error) {
        console.error("Commissions API error:", error);
        response.error = error.message;
        return NextResponse.json(response, { status: 500 });
    }
} 