import { NextResponse } from "next/server";
import connectToDatabase from "../../../../../configurations/mongoose.config.js";
import { UserModal } from "../../../../../modals/users.js";
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

        // Ensure only admin users can access this API
        if (decodedToken.type !== 'admin') {
            response.message = "Unauthorized access. Only admins can view user reports.";
            return NextResponse.json(response, { status: 403 });
        }

        const { searchParams } = new URL(req.url);
        const page = parseInt(searchParams.get('page')) || 1;
        const limit = parseInt(searchParams.get('limit')) || 10;

        const skip = (page - 1) * limit;

        const totalUsers = await UserModal.countDocuments({ type: 'player' }); // Only count player users for reports
        const users = await UserModal.find({ type: 'player' })
            .select('-password -paymentPassword') // Exclude sensitive information
            .populate('sponsorId', 'userId') // Populate sponsorId and select only the 'userId' field
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        response.status = "success";
        response.message = "User reports fetched successfully.";
        response.error = "";
        response.data = {
            users: users,
            currentPage: page,
            totalPages: Math.ceil(totalUsers / limit),
            totalUsers: totalUsers,
        };
        return NextResponse.json(response, { status: 200 });

    } catch (error) {
        console.error("User Report API error:", error);
        response.error = error.message;
        return NextResponse.json(response, { status: 500 });
    }
}

export async function PUT(req) {
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

        // Ensure only admin users can access this API
        if (decodedToken.type !== 'admin') {
            response.message = "Unauthorized access. Only admins can toggle user block status.";
            return NextResponse.json(response, { status: 403 });
        }

        const { userId, isBlocked } = await req.json();

        if (!userId || typeof isBlocked !== 'boolean') {
            response.message = "User ID and block status are required.";
            return NextResponse.json(response, { status: 400 });
        }

        const user = await UserModal.findById(userId);

        if (!user) {
            response.message = "User not found.";
            return NextResponse.json(response, { status: 404 });
        }

        user.isBlocked = isBlocked;
        await user.save();

        response.status = "success";
        response.message = `User ${isBlocked ? 'blocked' : 'unblocked'} successfully.`;
        response.error = "";
        response.data = { userId: user._id, isBlocked: user.isBlocked };
        return NextResponse.json(response, { status: 200 });

    } catch (error) {
        console.error("Toggle User Block Status API error:", error);
        response.error = error.message;
        return NextResponse.json(response, { status: 500 });
    }
} 