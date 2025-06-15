import { NextResponse } from "next/server";
import connectToDatabase from "../../../../../configurations/mongoose.config.js";
import { OrderModal } from "../../../../../modals/orders.js";
import { verifyToken } from "../../../../../middlewares/auth.js";

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

        if (decodedToken.type !== 'admin') {
            response.message = "Unauthorized access. Only admins can manage orders.";
            return NextResponse.json(response, { status: 403 });
        }

        const { _id, img, title, description, price, comission } = await req.json();

        if (!img || !title || !description || !price || !comission) {
            response.message = "All fields (image, title, description, price, commission) are required.";
            return NextResponse.json(response, { status: 400 });
        }

        if (price <= 0) {
            response.message = "Price must be a positive number.";
            return NextResponse.json(response, { status: 400 });
        }

        if (comission < 0) {
            response.message = "Commission must be a non-negative number.";
            return NextResponse.json(response, { status: 400 });
        }

        let order;
        if (_id) {
            // Update existing order
            order = await OrderModal.findById(_id);
            if (!order) {
                response.message = "Order not found.";
                return NextResponse.json(response, { status: 404 });
            }
            order.img = img;
            order.title = title;
            order.description = description;
            order.price = price;
            order.comission = comission;
            await order.save();
            response.message = "Order updated successfully.";
        } else {
            // Create new order
            order = new OrderModal({
                img,
                title,
                description,
                price,
                comission,
            });
            await order.save();
            response.message = "Order created successfully.";
        }

        response.status = "success";
        response.error = "";
        response.data = order;
        return NextResponse.json(response, { status: 200 });

    } catch (error) {
        console.error("Admin Order API error (POST):", error);
        response.error = error.message;
        if (error.name === 'ValidationError') {
            response.message = error.message;
            return NextResponse.json(response, { status: 400 });
        }
        return NextResponse.json(response, { status: 500 });
    }
}

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
            response.message = "Unauthorized access. Only admins can view orders.";
            return NextResponse.json(response, { status: 403 });
        }

        const { searchParams } = new URL(req.url);
        const page = parseInt(searchParams.get('page')) || 1;
        const limit = parseInt(searchParams.get('limit')) || 10;

        const skip = (page - 1) * limit;

        const totalOrders = await OrderModal.countDocuments({});
        const orders = await OrderModal.find({})
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        response.status = "success";
        response.message = "Orders fetched successfully.";
        response.error = "";
        response.data = {
            orders: orders,
            currentPage: page,
            totalPages: Math.ceil(totalOrders / limit),
            totalOrders: totalOrders,
        };
        return NextResponse.json(response, { status: 200 });

    } catch (error) {
        console.error("Admin Order API error (GET):", error);
        response.error = error.message;
        return NextResponse.json(response, { status: 500 });
    }
}

export async function DELETE(req) {
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
            response.message = "Unauthorized access. Only admins can delete orders.";
            return NextResponse.json(response, { status: 403 });
        }

        const { id } = await req.json();

        if (!id) {
            response.message = "Order ID is required to delete an order.";
            return NextResponse.json(response, { status: 400 });
        }

        const deletedOrder = await OrderModal.findByIdAndDelete(id);

        if (!deletedOrder) {
            response.message = "Order not found.";
            return NextResponse.json(response, { status: 404 });
        }

        response.status = "success";
        response.message = "Order deleted successfully.";
        response.error = "";
        response.data = deletedOrder;
        return NextResponse.json(response, { status: 200 });

    } catch (error) {
        console.error("Admin Order API error (DELETE):", error);
        response.error = error.message;
        return NextResponse.json(response, { status: 500 });
    }
}
