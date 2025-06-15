import { NextResponse } from "next/server";
import connectToDatabase from "../../../../../configurations/mongoose.config.js";
import { UserModal } from "../../../../../modals/users.js";
import { verifyToken } from "../../../../../middlewares/auth.js";

export async function GET(req) {
    const response = { status: "error", message: "Something went wrong", data: {}, error: "Something went wrong" };
    try {
        await connectToDatabase();

        let decodedToken;
        try {
            decodedToken = await verifyToken(req);
        } catch (err) {
            response.message = err.message;
            return NextResponse.json(response, { status: 401 });
        }

        const userId = decodedToken._id;
        const user = await UserModal.findById(userId).select('-password -paymentPassword'); // Exclude sensitive fields

        if (!user) {
            response.message = "User not found.";
            return NextResponse.json(response, { status: 404 });
        }

        response.status = "success";
        response.message = "User profile fetched successfully.";
        response.data = user;
        response.error = "";
        return NextResponse.json(response, { status: 200 });

    } catch (error) {
        console.error("Profile API error:", error);
        response.error = error.message;
        return NextResponse.json(response, { status: 500 });
    }
}
