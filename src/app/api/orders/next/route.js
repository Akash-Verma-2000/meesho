import { NextResponse } from "next/server";
import connectToDatabase from "../../../../../configurations/mongoose.config.js";
import { OrderModal } from "../../../../../modals/orders.js";
import { verifyToken } from "../../../../../middlewares/auth.js";
import { UserModal } from "../../../../../modals/users.js";

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

        // Fetch the user to get lastOrderGrabbedAt
        const user = await UserModal.findById(decodedToken._id);

        // Find an order that hasn't been grabbed by this user
        const order = await OrderModal.findOne({
            _id: { $nin: decodedToken.grabbedOrders || [] }
        }).sort({  });

        // Calculate orderFrozen
        let orderFrozen = false;
        if (user && user.lastOrderGrabbedAt) {
            const grabbedAt = new Date(user.lastOrderGrabbedAt);
            const now = new Date();
            const diffMs = now - grabbedAt;
            orderFrozen = diffMs > 60 * 60 * 1000;
        }

        if (!order) {
            response.status = "success";
            response.message = "No orders available";
            response.data = null;
            response.orderFrozen = orderFrozen;
            return NextResponse.json(response, { status: 200 });
        }

        response.status = "success";
        response.message = "Order fetched successfully";
        response.data = order;
        response.orderFrozen = orderFrozen;
        return NextResponse.json(response, { status: 200 });

    } catch (error) {
        console.error("Orders API error (GET next):", error);
        response.error = error.message;
        return NextResponse.json(response, { status: 500 });
    }
} 