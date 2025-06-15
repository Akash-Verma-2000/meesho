import { NextResponse } from "next/server";
import connectToDatabase from "../../../../../configurations/mongoose.config.js";
import { OrderModal } from "../../../../../modals/orders.js";
import { UserModal } from "../../../../../modals/users.js";
import { TransactionNodal } from "../../../../../modals/transactions.js";
import { verifyToken } from "../../../../../middlewares/auth.js";

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

        if (decodedToken.type !== 'admin') {
            response.message = "Unauthorized access. Only admins can view dashboard.";
            return NextResponse.json(response, { status: 403 });
        }

        // Get total number of users
        const totalUsers = await UserModal.countDocuments({ type: 'player' });
        console.log("Total Users Query:", { type: 'player' });
        console.log("Total Users Count:", totalUsers);

        // Get all users for debugging
        const allUsers = await UserModal.find({});
        console.log("All Users:", allUsers.map(user => ({
            id: user._id,
            type: user.type,
            email: user.email
        })));

        // Get total number of orders
        const totalOrders = await OrderModal.countDocuments();

        // Get total number of grabbed orders
        const grabbedOrders = await UserModal.aggregate([
            { $unwind: "$grabbedOrders" },
            { $group: { _id: null, count: { $sum: 1 } } }
        ]);

        // Get total commission distributed
        const totalCommission = await UserModal.aggregate([
            { $group: { _id: null, total: { $sum: "$balance" } } }
        ]);

        // Get recent transactions
        const recentTransactions = await TransactionNodal.find()
            .sort({ createdAt: -1 })
            .limit(5)
            .populate('userId', 'name email');

        // Get recent orders
        const recentOrders = await OrderModal.find()
            .sort({ createdAt: -1 })
            .limit(5);

        // Get pending transactions
        const pendingTransactions = await TransactionNodal.countDocuments({ status: 'pending' });

        response.status = "success";
        response.message = "Dashboard data fetched successfully";
        response.data = {
            totalUsers,
            totalOrders,
            totalGrabbedOrders: grabbedOrders[0]?.count || 0,
            totalCommissionDistributed: totalCommission[0]?.total || 0,
            pendingTransactions,
            recentTransactions,
            recentOrders
        };
        return NextResponse.json(response, { status: 200 });

    } catch (error) {
        console.error("Admin Dashboard API error:", error);
        response.error = error.message;
        return NextResponse.json(response, { status: 500 });
    }
} 