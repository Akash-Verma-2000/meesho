import { NextResponse } from "next/server";
import connectToDatabase from "../../../../../configurations/mongoose.config.js";
import { OrderModal } from "../../../../../modals/orders.js";
import { UserModal } from "../../../../../modals/users.js";
import { verifyToken } from "../../../../../middlewares/auth.js";
import { CommissionModal } from "../../../../../modals/commissions.js";

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
            console.log("Decoded Token:", decodedToken);
        } catch (err) {
            response.message = err.message;
            return NextResponse.json(response, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const page = parseInt(searchParams.get('page')) || 1;
        const limit = parseInt(searchParams.get('limit')) || 10;

        const skip = (page - 1) * limit;

        // Get user's grabbed orders
        const user = await UserModal.findById(decodedToken._id);
        console.log("Found User:", user);
        
        if (!user) {
            response.message = "User not found";
            return NextResponse.json(response, { status: 404 });
        }

        // Get total count of grabbed orders
        const totalOrders = user.grabbedOrders ? user.grabbedOrders.length : 0;
        console.log("Total Orders:", totalOrders);
        console.log("Grabbed Orders:", user.grabbedOrders);

        // Get paginated orders
        const orders = await OrderModal.find({
            _id: { $in: user.grabbedOrders || [] }
        })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);
        
        // For each order, fetch the commission record to get the grab time
        const ordersWithGrabbedAt = await Promise.all(orders.map(async (order) => {
            const commission = await CommissionModal.findOne({ userId: user._id, orderId: order._id });
            return {
                ...order.toObject(),
                grabbedAt: commission ? commission.createdAt : null
            };
        }));

        console.log("Found Orders:", ordersWithGrabbedAt);

        response.status = "success";
        response.message = "Orders fetched successfully";
        response.data = {
            orders: ordersWithGrabbedAt,
            currentPage: page,
            totalPages: Math.ceil(totalOrders / limit),
            totalOrders,
            ordersPerPage: limit
        };
        return NextResponse.json(response, { status: 200 });

    } catch (error) {
        console.error("User Orders API error (GET):", error);
        response.error = error.message;
        return NextResponse.json(response, { status: 500 });
    }
} 