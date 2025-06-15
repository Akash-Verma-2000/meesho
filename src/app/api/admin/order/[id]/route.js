import { NextResponse } from "next/server";
import connectToDatabase from "../../../../../../configurations/mongoose.config.js";
import { OrderModal } from "../../../../../../modals/orders.js";
import { verifyToken } from "../../../../../../middlewares/auth.js";

export async function GET(req, { params }) {
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
            response.message = "Unauthorized access. Only admins can view orders.";
            return NextResponse.json(response, { status: 403 });
        }

        const { id } = params;

        if (!id) {
            response.message = "Order ID is required.";
            return NextResponse.json(response, { status: 400 });
        }

        const order = await OrderModal.findById(id);

        if (!order) {
            response.message = "Order not found.";
            return NextResponse.json(response, { status: 404 });
        }

        response.status = "success";
        response.message = "Order fetched successfully.";
        response.error = "";
        response.data = order;
        return NextResponse.json(response, { status: 200 });

    } catch (error) {
        console.error("Admin Order API error (GET single):", error);
        response.error = error.message;
        return NextResponse.json(response, { status: 500 });
    }
} 